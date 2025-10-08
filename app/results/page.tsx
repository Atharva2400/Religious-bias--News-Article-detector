"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, AlertTriangle, ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BiasResult {
  religion: string;
  negativity: number;
  positivity: number;
  neutral: number;
  totalMentions: number;
  examples: string[];
}

interface AnalysisResult {
  filename: string;
  uploadTime: string;
  totalWords: number;
  analysisTime: number;
  results: BiasResult[];
  overallSentiment: "positive" | "negative" | "neutral";
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const filenameQP = searchParams.get("file") || "Unknown File";
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSpeedBooster, setShowSpeedBooster] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setShowSpeedBooster(false), 4000);

    try {
      const raw = searchParams.get("data");
      if (!raw) {
        setLoading(false);
        return;
      }
      const api = JSON.parse(raw);

      const mapped: AnalysisResult = {
        filename: api.filename || filenameQP,
        uploadTime: api.uploadTime,
        totalWords: api.totalWords || 0,
        analysisTime: api.analysisTime || 0,
        overallSentiment: (api.overallSentiment || "neutral") as
          | "positive"
          | "negative"
          | "neutral",
        results: (api.results || [])
          .map((r: any) => ({
            religion: r.religion,
            negativity: Math.round(r.negativity ?? 0),
            positivity: Math.round(r.positivity ?? 0),
            neutral: Math.round(r.neutral ?? 0),
            totalMentions: r.totalMentions ?? 1,
            examples: Array.isArray(r.examples) ? r.examples : [],
          }))
          .sort((a: BiasResult, b: BiasResult) => b.negativity - a.negativity),
      };

      setAnalysisResult(mapped);
    } catch (e) {
      console.error("Results parse error:", e);
    } finally {
      setLoading(false);
    }
  }, [searchParams, filenameQP]);

  // -------------------------------
  // PDF Generation using jsPDF + autoTable
  // -------------------------------
  const handleSavePDF = () => {
    if (!analysisResult) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Title
    pdf.setFontSize(18);
    pdf.text("Religious Bias Analysis Report", pageWidth / 2, 15, {
      align: "center",
    });

    pdf.setFontSize(12);
    pdf.text(`File: ${analysisResult.filename}`, 14, 25);
    pdf.text(`Upload Time: ${analysisResult.uploadTime}`, 14, 32);
    pdf.text(`Total Words: ${analysisResult.totalWords}`, 14, 39);
    pdf.text(`Overall Sentiment: ${analysisResult.overallSentiment}`, 14, 46);

    // Summary of high bias religions
    const highBias = analysisResult.results.filter((r) => r.negativity > 50);
    pdf.text(`High Bias Religions: ${highBias.length}`, 14, 55);

    // Table of results
    const tableData = analysisResult.results.map((r) => [
      r.religion,
      r.positivity + "%",
      r.neutral + "%",
      r.negativity + "%",
      r.examples.slice(0, 3).join(", "),
    ]);

    autoTable(pdf, {
      startY: 65,
      head: [["Religion", "Positive", "Neutral", "Negative", "Key Phrases"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52, 152, 219] },
      columnStyles: {
        0: { cellWidth: 35 },
        4: { cellWidth: 70 },
      },
    });

    const pdfFileName = `${analysisResult.filename.replace(
      /\.[^/.]+$/,
      ""
    )}-analysis.pdf`;
    pdf.save(pdfFileName);

    alert("PDF generated successfully!");
  };

  // -------------------------------
  // Animated Bar Component
  // -------------------------------
  const AnimatedBar = ({
    value,
    color,
  }: {
    value: number;
    color: string;
  }) => (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-2 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );

  // -------------------------------
  // Speed Booster Animation
  // -------------------------------
  if (showSpeedBooster) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative overflow-hidden">
        <div className="flex gap-12">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: [300, 0, -300], opacity: [0, 1, 1] }}
              transition={{
                delay: i * 0.3,
                duration: 4,
                times: [0, 0.75, 1],
                ease: "easeInOut",
              }}
            >
              <Rocket className="w-16 h-16 text-blue-400 drop-shadow-lg" />
            </motion.div>
          ))}
        </div>
        <motion.h2
          className="mt-10 text-xl font-bold text-blue-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          Speed Booster Ignited 🚀
        </motion.h2>
        <motion.p
          className="text-gray-400 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          Launching turbo analysis...
        </motion.p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-center text-xl font-semibold">
          Analyzing Article...
        </h2>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-4">Unable to load analysis results</p>
          <Button asChild>
            <Link href="/upload">Try Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  const highBiasResults = analysisResult.results.filter(
    (r) => r.negativity > 50
  );

  // -------------------------------
  // Main Results Page JSX
  // -------------------------------
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto" id="analysis-section">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Analysis Results</h1>
            <p className="text-gray-600">
              Religious bias analysis for "{analysisResult.filename}"
            </p>
          </div>
          <Button onClick={handleSavePDF}>Save as PDF</Button>
        </div>

        {/* Alerts */}
        {highBiasResults.length > 0 && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>High bias detected:</strong> {highBiasResults.length}{" "}
              religion(s) show negativity above 50% threshold.
            </AlertDescription>
          </Alert>
        )}

        {/* Results Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {analysisResult.results.map((result) => (
            <Card key={result.religion}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {result.religion}
                    {result.negativity > 50 && (
                      <Badge variant="destructive">High Bias</Badge>
                    )}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {result.negativity}%
                    </div>
                    <div className="text-sm text-gray-500">negativity</div>
                  </div>
                </div>
                <CardDescription>
                  {result.totalMentions} mentions found
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Positive: {result.positivity}%
                  </p>
                  <AnimatedBar value={result.positivity} color="#16a34a" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Neutral: {result.neutral}%
                  </p>
                  <AnimatedBar value={result.neutral} color="#6b7280" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Negative: {result.negativity}%
                  </p>
                  <AnimatedBar value={result.negativity} color="#dc2626" />
                </div>

                {result.examples.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Key Phrases:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {result.examples.slice(0, 3).map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bias Overview (Negative % Only)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisResult.results.map((result) => (
              <div key={result.religion} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{result.religion}</div>
                <div className="flex-1">
                  <AnimatedBar
                    value={result.negativity}
                    color={result.negativity > 50 ? "#dc2626" : "#3b82f6"}
                  />
                </div>
                <div className="w-16 text-right text-sm font-medium">
                  {result.negativity}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
