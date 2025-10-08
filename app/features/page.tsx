"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Upload, Brain, BarChart3, FileDown } from "lucide-react";

const features = [
  {
    title: "Easy Upload",
    icon: <Upload className="w-8 h-8 text-white" />,
    points: [
      "Supports .txt, .pdf, and .docx files.",
      "Drag-and-drop or quick upload for news articles.",
    ],
  },
  {
    title: "AI-Powered Bias Analysis",
    icon: <Brain className="w-8 h-8 text-white" />,
    points: [
      "Detects bias and sentiment across religious groups.",
      "Shows percentage of positive, negative, and neutral tones.",
    ],
  },
  {
    title: "Visual Insights",
    icon: <BarChart3 className="w-8 h-8 text-white" />,
    points: [
      "Interactive charts and graphs show bias trends.",
      "Easy interpretation of article leanings.",
    ],
  },
  {
    title: "PDF Export",
    icon: <FileDown className="w-8 h-8 text-white" />,
    points: ["Generate detailed PDF reports of bias analysis."],
  },
];

export default function FeaturesTimelineStepScroll() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.1", "end 0.9"],
  });

  return (
    <div
      ref={ref}
      className="relative bg-gradient-to-b from-[#0B2545] to-[#030712] py-20"
    >
      <div className="max-w-6xl mx-auto px-6 relative">
        <h2 className="text-4xl font-bold text-center text-[#2DD4BF] mb-24 drop-shadow-lg">
          Powerful Features
        </h2>

        {/* Timeline center line */}
        <div className="absolute left-1/2 top-32 h-[calc(100%-8rem)] w-1 -translate-x-1/2 bg-[#2DD4BF]/30 rounded-full overflow-hidden">
          <motion.div
            style={{ scaleY: scrollYProgress }}
            className="origin-top bg-[#2DD4BF] w-full h-full"
          />
        </div>

        {/* Features */}
        <div className="relative space-y-32">
          {features.map((feature, idx) => {
            // Define each feature's "unlock" range
            const start = idx / features.length;
            const end = (idx + 1) / features.length;

            const opacity = useTransform(
              scrollYProgress,
              [start, end],
              [0, 1]
            );
            const y = useTransform(
              scrollYProgress,
              [start, end],
              [50, 0]
            );

            return (
              <motion.div
                key={idx}
                className={`flex w-full items-center ${
                  idx % 2 === 0 ? "justify-start" : "justify-end"
                }`}
                style={{ opacity, y }}
              >
                {/* Feature Box */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#0F172A] shadow-lg rounded-2xl p-6 w-[45%] relative group hover:shadow-[0_0_25px_#2DD4BF]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/50">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-[#E2E8F0]">
                      {feature.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 text-[#C7CCD1]">
                    {feature.points.map((p, i) => (
                      <li key={i} className="leading-relaxed">
                        • {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
