"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, BarChart3, Shield, ArrowDown, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Religious Bias Detector
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Analyze news articles for religious bias using advanced AI. Upload your documents and get detailed insights
            into potential bias patterns across different religious groups.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Start Analysis
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
              <Link href="/features">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Features
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Box 1 - Easy Upload */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0, duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <Card className="text-center transition-transform transform hover:scale-105 hover:shadow-2xl bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Upload className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle>Easy Upload</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Support for .txt, .pdf, and .docx files with drag-and-drop functionality
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Box 2 - Visual Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <Card className="text-center transition-transform transform hover:scale-105 hover:shadow-2xl bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <BarChart3 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle>Visual Analysis</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Interactive charts and cards showing bias percentages across religions
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Box 3 - Reliable */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <Card className="text-center transition-transform transform hover:scale-105 hover:shadow-2xl bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Reliable</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Backed by rigorous testing to ensure accurate and trustworthy results every time
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* How It Works Vertical Timeline */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">How It Works</h2>
          <div className="flex flex-col items-center relative">
            {[
              { num: "1", color: "bg-blue-600", title: "Upload Article", desc: "Upload your news article in supported formats" },
              { num: "2", color: "bg-green-600", title: "AI Analysis", desc: "Our AI analyzes the content for religious bias patterns" },
              { num: "3", color: "bg-purple-600", title: "View Results", desc: "Get detailed insights with visual representations" },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center relative">
                {/* Step Number */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: false, amount: 0.3 }}
                  className={`${step.color} w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-lg`}
                >
                  {step.num}
                </motion.div>

                {/* Step Text */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  viewport={{ once: false, amount: 0.3 }}
                  className="mt-4 mb-8 text-center"
                >
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
                </motion.div>

                {/* Connector with Arrow */}
                {i < 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{ height: 60, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="border-l-2 border-dashed border-gray-400 h-12"></div>
                    <ArrowDown className="w-6 h-6 text-gray-500" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
