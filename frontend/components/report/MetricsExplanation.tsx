"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function MetricsExplanation() {
  const [isOpen, setIsOpen] = useState(false);

  const metrics = [
    {
      name: "Median Views",
      description:
        "The middle value when all video views are sorted. Less affected by viral outliers, making it a safer metric for brands to base decisions on.",
      whyItMatters: "More reliable for predicting typical performance.",
    },
    {
      name: "Average Views",
      description:
        "The mean of all video views. Can be inflated by one or two viral videos, making it less reliable for consistent performance estimation.",
      whyItMatters: "Useful for understanding overall reach, but can be misleading.",
    },
    {
      name: "Engagement Rate",
      description:
        "Percentage of viewers who liked or commented. Calculated as (Likes + Comments) / Views × 100.",
      whyItMatters:
        "Shows how actively the audience interacts. Higher engagement = more valuable audience.",
    },
    {
      name: "Like Rate",
      description: "Percentage of viewers who liked the video. Calculated as Likes / Views × 100.",
      whyItMatters: "Indicates content quality and audience satisfaction.",
    },
    {
      name: "Comment Rate",
      description:
        "Percentage of viewers who commented. Calculated as Comments / Views × 100.",
      whyItMatters:
        "Shows conversation and community strength. Comments are more valuable than passive views.",
    },
    {
      name: "Volatility Ratio",
      description:
        "Average views divided by median views. Shows how consistent the creator's performance is.",
      whyItMatters:
        "Low ratio (close to 1.0) = consistent. High ratio (>1.5) = reliant on viral hits.",
    },
    {
      name: "Risk Level",
      description:
        "Classification based on volatility ratio. Low = consistent, Moderate = somewhat variable, High = viral-dependent.",
      whyItMatters:
        "Helps brands understand the reliability of expected performance. Low risk = safer investment.",
    },
    {
      name: "CPM (Cost Per Mille)",
      description:
        "Cost per 1,000 views. Calculated as Fee / (Views / 1000). Standard metric for comparing influencer pricing.",
      whyItMatters:
        "Industry benchmark for pricing. Typical CPM ranges from $10-$100 depending on niche and audience quality.",
    },
    {
      name: "CPV (Cost Per View)",
      description: "Cost per single view. Calculated as Fee / Views.",
      whyItMatters: "Granular cost metric. Useful for precise budget planning.",
    },
    {
      name: "CPE (Cost Per Engagement)",
      description:
        "Cost per engagement (like or comment). Calculated as Fee / (Likes + Comments).",
      whyItMatters:
        "Shows value for money when engagement is the goal. Lower CPE = better value for interactive campaigns.",
    },
    {
      name: "Talent Payout",
      description:
        "Amount paid to the creator after agency margin. Calculated as Fee × (1 - Margin %).",
      whyItMatters: "What the creator actually receives. Important for negotiation transparency.",
    },
    {
      name: "Agency Margin",
      description: "Percentage or value kept by the agency. Calculated as Fee - Talent Payout.",
      whyItMatters: "Agency's revenue from the deal. Typical margins range from 15-30%.",
    },
    {
      name: "Fee at Target CPM",
      description:
        "What the fee should be to hit a specific CPM goal. Calculated as Target CPM × (Views / 1000).",
      whyItMatters:
        "Helps brands negotiate fair pricing based on industry benchmarks or internal targets.",
    },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--muted) 20%, transparent)",
      }}
    >
      {/* Header (Clickable) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-[var(--muted)] transition"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              background: "color-mix(in srgb, var(--primary) 20%, transparent)",
            }}
          >
            <HelpCircle size={20} style={{ color: "var(--primary)" }} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold">Understanding the Metrics</h3>
            <p className="text-sm opacity-70">
              Click to learn what each number means and why it matters
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={24} className="opacity-70" />
        ) : (
          <ChevronDown size={24} className="opacity-70" />
        )}
      </button>

      {/* Content (Collapsible) */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-4">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="rounded-xl p-4"
              style={{
                border: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--muted) 30%, transparent)",
              }}
            >
              <h4 className="font-semibold mb-2">{metric.name}</h4>
              <p className="text-sm opacity-80 mb-2">{metric.description}</p>
              <div
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                  border: "1px solid var(--primary)",
                }}
              >
                <strong>Why it matters:</strong> {metric.whyItMatters}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
