"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  const handleUpload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/analyze-file`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      router.push(
        `/results?data=${encodeURIComponent(JSON.stringify(data))}&file=${encodeURIComponent(
          file.name
        )}`
      );
    } catch (e) {
      console.error(e);
      alert("Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleSample = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/analyze-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "The temple festival saw peaceful gatherings but protests erupted nearby.",
        }),
      });
      const data = await res.json();
      router.push(
        `/results?data=${encodeURIComponent(JSON.stringify(data))}&file=${encodeURIComponent(
          "sample.txt"
        )}`
      );
    } catch (e) {
      console.error(e);
      alert("Sample failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl rounded-3xl p-10 border border-gray-700 transition-all duration-500 hover:shadow-blue-500/20">
        <h1 className="text-3xl font-extrabold mb-4 text-center text-white tracking-wide">
          Upload Your Article
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Upload a <span className="font-medium text-gray-200">.txt, .docx, or .pdf</span> file for
          analysis, or try our sample.
        </p>

        {/* Drag & Drop Zone */}
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer bg-gray-800/60 hover:bg-gray-700/80 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 mb-6">
          <div className="flex flex-col items-center space-y-3">
            <UploadCloud className="h-12 w-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-gray-400">
              {file ? (
                <span className="flex items-center gap-2 text-blue-400 font-medium">
                  <FileText className="w-4 h-4" /> {file.name}
                </span>
              ) : (
                "Click or drag file here"
              )}
            </span>
          </div>
          <input
            type="file"
            accept=".txt,.docx,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleUpload}
            disabled={!file || busy}
            className="w-40 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-blue-500/30 transition-all duration-300"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </span>
            ) : (
              "Analyze File"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSample}
            disabled={busy}
            className="w-40 border-gray-600 text-gray-200 hover:bg-gray-800 hover:border-blue-400 transition-all duration-300"
          >
            Try Sample
          </Button>
        </div>
      </div>
    </div>
  );
}
