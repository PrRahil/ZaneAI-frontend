"use client";

import React, { useState, useEffect } from "react";
import { Database, GitBranch, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    title: (
      <>
        One Platform to Streamline
        <br />
        All Database Analytics
      </>
    ),
    description:
      "Your database will not be quietly affected overnight. Your revenue is increased by real-time truth of your campaign basis.",
    features: [
      {
        icon: Database,
        title: "Impact Analysis",
        desc: "Automatically detect downstream impacts of schema and code changes.",
      },
      {
        icon: GitBranch,
        title: "Data Lineage",
        desc: "Visualize data flow and dependencies across your entire system.",
      },
      {
        icon: Zap,
        title: "Regression Detection",
        desc: "Generate reports for queries that may fail after changes.",
      },
    ],
  },
  {
    id: 2,
    title: (
      <>
        Visualize Your Entire
        <br />
        Data Ecosystem
      </>
    ),
    description:
      "Understand the complex web of dependencies in your data warehouse. Navigate through lineage with ease and confidence.",
    features: [
      {
        icon: GitBranch,
        title: "Column-Level Lineage",
        desc: "Trace data from source to destination at the column level.",
      },
      {
        icon: Shield,
        title: "Dependency Graph",
        desc: "Interactive visualization of table and view relationships.",
      },
      {
        icon: Database,
        title: "Asset Catalog",
        desc: "Comprehensive inventory of all your data assets.",
      },
    ],
  },
  {
    id: 3,
    title: (
      <>
        Prevent Breaking Changes
        <br />
        Before They Happen
      </>
    ),
    description:
      "Catch regressions early in the development cycle. Ensure your data pipelines remain robust and reliable.",
    features: [
      {
        icon: Zap,
        title: "Proactive Alerts",
        desc: "Get notified of potential issues before deploying code.",
      },
      {
        icon: Shield,
        title: "Quality Gates",
        desc: "Enforce data quality standards across your organization.",
      },
      {
        icon: GitBranch,
        title: "CI/CD Integration",
        desc: "Seamlessly integrate with your existing deployment workflows.",
      },
    ],
  },
];

export default function AuthLeftPanel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-center relative overflow-hidden">
      <div className="max-w-md w-full z-10">
        <div className="flex items-center mb-12">
          <div className="h-12 w-12 bg-primary-foreground rounded-xl flex items-center justify-center mr-4">
            <img
              src="/zane-logo.png"
              alt="Zane AI Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="text-primary-foreground/80">Zane</span>.AI
          </h2>
        </div>

        <div className="min-h-[500px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-0 w-full"
            >
              <h1 className="text-3xl font-bold mb-4 leading-tight">
                {slides[currentSlide].title}
              </h1>

              <p className="text-primary-foreground/80 mb-8 text-base leading-relaxed">
                {slides[currentSlide].description}
              </p>

              <div className="space-y-6">
                {slides[currentSlide].features.map((feature, idx) => (
                  <Feature
                    key={idx}
                    icon={
                      <feature.icon className="h-5 w-5 text-primary-foreground mt-1 mr-3 flex-shrink-0" />
                    }
                    title={feature.title}
                    description={feature.desc}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex space-x-2 mt-8 absolute bottom-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx
                  ? "w-6 bg-primary-foreground"
                  : "w-1.5 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start">
      {icon}
      <div>
        <h3 className="font-semibold mb-1 text-base">{title}</h3>
        <p className="text-primary-foreground/70 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
