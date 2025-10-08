import time
import re
import string
from io import BytesIO
from typing import List, Dict, Any

import joblib
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from docx import Document
from PyPDF2 import PdfReader

# -------------------------------
# Load models & vectorizer
# -------------------------------
sentiment_model = joblib.load("sentiment_model.pkl")          # trained on Positive/Negative/Neutral
religion_model = joblib.load("religion_model.pkl")            # trained on your 'subreddit' labels
vectorizer = joblib.load("sentiment_vectorizer.pkl")          # TF-IDF (same used for both models)

# -------------------------------
# SOLUTION: Define actual religious categories
# -------------------------------
RELIGIOUS_CATEGORIES = {
    'christianity', 'islam', 'hinduism', 'buddhism', 'judaism', 
    'sikhism', 'jainism', 'zoroastrianism', 'bahai', 'shinto',
    'taoism', 'confucianism', 'paganism', 'wicca', 'atheism',
    'agnosticism', 'spirituality', 'catholic', 'protestant',
    'orthodox', 'sunni', 'shia', 'sufi', 'zen', 'theravada',
    'mahayana', 'vajrayana', 'reform', 'conservative', 'orthodox judaism'
}

# If your model uses specific subreddit names, map them to religions
SUBREDDIT_TO_RELIGION_MAP = {
    'christianity': 'Christianity',
    'islam': 'Islam',
    'hinduism': 'Hinduism',
    'buddhism': 'Buddhism',
    'judaism': 'Judaism',
    'catholic': 'Christianity',
    'atheism': 'Atheism',
    # Add more mappings as needed
}

# -------------------------------
# FastAPI app + CORS
# -------------------------------
app = FastAPI(title="Religious Bias Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Helpers
# -------------------------------
def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\d+", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_text_from_upload(file: UploadFile) -> str | None:
    name = (file.filename or "").lower()
    raw = file.file.read()
    file.file.seek(0)
    if name.endswith(".txt"):
        try:
            return raw.decode("utf-8", errors="ignore")
        except Exception:
            return raw.decode("latin-1", errors="ignore")
    if name.endswith(".docx"):
        doc = Document(BytesIO(raw))
        return " ".join(p.text for p in doc.paragraphs)
    if name.endswith(".pdf"):
        reader = PdfReader(BytesIO(raw))
        return " ".join(page.extract_text() or "" for page in reader.pages)
    return None

def top_tfidf_terms(text: str, top_k: int = 6) -> List[str]:
    X = vectorizer.transform([text])
    feature_names = np.array(vectorizer.get_feature_names_out())
    data = X.toarray().ravel()
    if data.sum() == 0:
        return []
    idx = np.argsort(-data)[:top_k]
    terms = feature_names[idx]
    return [t for t in terms if t.strip()]

def to_percentage_map(classes: List[str], probs: np.ndarray) -> Dict[str, float]:
    return {c.lower(): round(float(p) * 100, 2) for c, p in zip(classes, probs)}

def is_religious_category(category: str) -> bool:
    """Check if a category is religion-related"""
    cat_lower = category.lower().strip()
    
    # Check if it's in our religious categories set
    if cat_lower in RELIGIOUS_CATEGORIES:
        return True
    
    # Check if it contains religious keywords
    religious_keywords = ['relig', 'christ', 'islam', 'hindu', 'buddh', 'jew', 'sikh', 
                          'jain', 'zoroast', 'bahai', 'shinto', 'tao', 'confuc', 
                          'pagan', 'wicca', 'athei', 'agnost', 'spirit', 'faith',
                          'god', 'divine', 'sacred', 'holy', 'temple', 'church', 'mosque']
    
    for keyword in religious_keywords:
        if keyword in cat_lower:
            return True
    
    return False

def filter_religious_classes(classes: List[str], probs: np.ndarray) -> tuple:
    """Filter out non-religious categories and renormalize probabilities"""
    religious_indices = []
    religious_classes = []
    
    for i, cls in enumerate(classes):
        if is_religious_category(cls):
            religious_indices.append(i)
            religious_classes.append(cls)
    
    if not religious_indices:
        # If no religious categories found, return original
        return classes, probs
    
    # Extract only religious probabilities and renormalize
    religious_probs = probs[religious_indices]
    religious_probs = religious_probs / religious_probs.sum()
    
    return religious_classes, religious_probs

def analyze_religion_mentions(text: str, rel_classes: List[str]) -> List[Dict[str, Any]]:
    sentences = re.split(r"[.!?]", text)  # basic sentence split
    results = []
    
    # Filter to only religious categories
    religious_only = [r for r in rel_classes if is_religious_category(r)]

    for religion in religious_only:
        mentions = [s for s in sentences if religion.lower() in s.lower()]
        if not mentions:
            continue

        probs_list = []
        for m in mentions:
            cleaned_snip = clean_text(m)
            if not cleaned_snip:
                continue
            X = vectorizer.transform([cleaned_snip])
            if hasattr(sentiment_model, "predict_proba"):
                probs = sentiment_model.predict_proba(X)[0]
                probs_list.append(probs)

        if not probs_list:
            continue

        avg_probs = np.mean(probs_list, axis=0)
        sentiment_pct = to_percentage_map(sentiment_model.classes_, avg_probs)

        results.append({
            "religion": religion,
            "negativity": sentiment_pct.get("negative", 0.0),
            "positivity": sentiment_pct.get("positive", 0.0),
            "neutral":   sentiment_pct.get("neutral", 0.0),
            "totalMentions": len(mentions),
            "examples": mentions[:3]
        })

    return results

def build_analysis_payload(source_name: str, text: str) -> Dict[str, Any]:
    t0 = time.time()
    cleaned = clean_text(text)
    total_words = len(cleaned.split())
    X = vectorizer.transform([cleaned])

    # Overall Sentiment
    sent_pred = sentiment_model.predict(X)[0]
    sent_classes = list(getattr(sentiment_model, "classes_", ["negative", "neutral", "positive"]))
    sent_proba = getattr(sentiment_model, "predict_proba", None)
    if sent_proba:
        s_probs = sent_proba(X)[0]
    else:
        s_idx = sent_classes.index(sent_pred)
        s_probs = np.eye(1, len(sent_classes), s_idx).ravel()
    sentiment_pct = to_percentage_map(sent_classes, s_probs)

    overall = str(sent_pred).lower()
    if overall not in {"positive", "negative", "neutral"}:
        overall = sent_classes[int(np.argmax(s_probs))].lower()

    # Religion Prediction - with filtering
    rel_pred = religion_model.predict(X)[0]
    rel_classes = list(getattr(religion_model, "classes_", []))
    
    if hasattr(religion_model, "predict_proba"):
        r_probs = religion_model.predict_proba(X)[0]
    else:
        r_idx = rel_classes.index(rel_pred)
        r_probs = np.eye(1, len(rel_classes), r_idx).ravel()
    
    # SOLUTION: Filter out non-religious categories
    filtered_classes, filtered_probs = filter_religious_classes(rel_classes, r_probs)
    religion_pct = to_percentage_map(filtered_classes, filtered_probs)
    
    # Update predicted religion to the highest religious category
    if filtered_classes and is_religious_category(rel_pred):
        predictedReligion = str(rel_pred)
    elif filtered_classes:
        # If predicted category is not religious, use highest religious probability
        max_idx = np.argmax(filtered_probs)
        predictedReligion = filtered_classes[max_idx]
    else:
        predictedReligion = "None detected"

    # Per-religion sentiment analysis (already filtered)
    per_religion_results = analyze_religion_mentions(text, rel_classes)
    
    # Count religions detected (only religious ones)
    religions_detected = len([r for r in per_religion_results if r['totalMentions'] > 0])

    payload = {
        "filename": source_name,
        "uploadTime": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "totalWords": total_words,
        "analysisTime": round(time.time() - t0, 3),
        "overallSentiment": overall,
        "predictedReligion": predictedReligion,
        "religionsDetected": religions_detected,  # Add this for the UI
        "religionProbabilities": religion_pct,  # Now only contains religious categories
        "sentimentProbabilities": sentiment_pct,
        "results": per_religion_results,  # Now only contains religious categories
    }
    return payload

# -------------------------------
# Schemas
# -------------------------------
class TextRequest(BaseModel):
    text: str

# -------------------------------
# Endpoints
# -------------------------------
@app.post("/analyze-text")
def analyze_text(body: TextRequest):
    if not body.text or not body.text.strip():
        return {"error": "No text provided"}
    return build_analysis_payload("inline-text", body.text)

@app.post("/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    raw = extract_text_from_upload(file)
    if raw is None:
        return {"error": "Unsupported file. Use .txt, .docx or .pdf"}
    return build_analysis_payload(file.filename, raw)

# Health
@app.get("/health")
def health():
    return {"status": "ok"}

# Debug endpoint to see what categories your model has
@app.get("/debug/categories")
def debug_categories():
    """Endpoint to check what categories your model was trained on"""
    rel_classes = list(getattr(religion_model, "classes_", []))
    religious = [c for c in rel_classes if is_religious_category(c)]
    non_religious = [c for c in rel_classes if not is_religious_category(c)]
    
    return {
        "all_categories": rel_classes,
        "religious_categories": religious,
        "non_religious_categories": non_religious,
        "total": len(rel_classes),
        "religious_count": len(religious),
        "non_religious_count": len(non_religious)
    }