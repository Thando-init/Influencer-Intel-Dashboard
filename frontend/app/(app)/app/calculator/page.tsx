"use client";

import { useState, useEffect } from "react";
import { useAnalysis } from "@/context/AnalysisContext";
import { Calculator as CalcIcon, User, TrendingUp } from "lucide-react";

export default function CalculatorPage() {
  const { getActive } = useAnalysis();
  const activeAnalysis = getActive();

  // Mode selection
  const [mode, setMode] = useState<"manual" | "analysis">(
    activeAnalysis ? "analysis" : "manual"
  );

  // Mode 1: Manual inputs
  const [manualViews, setManualViews] = useState<string>("");
  const [manualEngagementRate, setManualEngagementRate] = useState<string>("");
  const [manualFee, setManualFee] = useState<string>("");
  const [manualMargin, setManualMargin] = useState<number>(30);
  const [manualTargetCpm, setManualTargetCpm] = useState<string>("");
  const [manualCurrency, setManualCurrency] = useState("ZAR");

  // Mode 2: Analysis-based inputs
  const [viewsBasis, setViewsBasis] = useState<"median" | "average">("median");
  const [analysisFee, setAnalysisFee] = useState<string>("");
  const [analysisMargin, setAnalysisMargin] = useState<number>(30);
  const [analysisTargetCpm, setAnalysisTargetCpm] = useState<string>("");

  // Update mode when active analysis changes
  useEffect(() => {
    if (activeAnalysis && mode === "manual") {
      setMode("analysis");
    }
  }, [activeAnalysis]);

  // Calculations for Mode 1
  const calculateManual = () => {
    const views = parseFloat(manualViews) || 0;
    const fee = parseFloat(manualFee) || 0;
    const engagementRate = parseFloat(manualEngagementRate) || 0;
    const targetCpm = parseFloat(manualTargetCpm) || 0;

    if (views === 0 || fee === 0) {
      return null;
    }

    const cpm = (fee / (views / 1000)).toFixed(2);
    const cpv = (fee / views).toFixed(4);
    const engagements = Math.round((views * engagementRate) / 100);
    const cpe = engagements > 0 ? (fee / engagements).toFixed(4) : "N/A";
    const talentPayout = (fee * (1 - manualMargin / 100)).toFixed(2);
    const marginValue = (fee - parseFloat(talentPayout)).toFixed(2);
    const feeAtTargetCpm = targetCpm > 0 ? (targetCpm * (views / 1000)).toFixed(2) : "N/A";

    return {
      cpm,
      cpv,
      cpe,
      talentPayout,
      marginValue,
      feeAtTargetCpm,
      engagements: engagements > 0 ? engagements : null,
    };
  };

  // Calculations for Mode 2
  const calculateAnalysis = () => {
    if (!activeAnalysis) return null;

    const views =
      viewsBasis === "median"
        ? activeAnalysis.medianViews || 0
        : activeAnalysis.averageViews || 0;
    const fee = parseFloat(analysisFee) || 0;
    const targetCpm = parseFloat(analysisTargetCpm) || 0;

    if (views === 0 || fee === 0) {
      return null;
    }

    const cpm = (fee / (views / 1000)).toFixed(2);
    const cpv = (fee / views).toFixed(4);
    
    // Get engagement rate from context (would need to be added to AnalysisContext)
    // For now, calculate estimated engagements if we have the data
    const engagements = Math.round(views * 0.03); // Placeholder: 3% engagement
    const cpe = engagements > 0 ? (fee / engagements).toFixed(4) : "N/A";
    
    const talentPayout = (fee * (1 - analysisMargin / 100)).toFixed(2);
    const marginValue = (fee - parseFloat(talentPayout)).toFixed(2);
    const feeAtTargetCpm = targetCpm > 0 ? (targetCpm * (views / 1000)).toFixed(2) : "N/A";

    return {
      cpm,
      cpv,
      cpe,
      talentPayout,
      marginValue,
      feeAtTargetCpm,
      engagements,
      views,
    };
  };

  const manualResults = mode === "manual" ? calculateManual() : null;
  const analysisResults = mode === "analysis" ? calculateAnalysis() : null;

  const formatNumber = (num: number | string) => {
    if (typeof num === "string") return num;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="mx-auto max-w-5xl pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="text-2xl font-semibold">Calculator</div>
        <div className="mt-1 text-sm opacity-70">
          Calculate campaign costs, CPM, margins, and pricing benchmarks
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 rounded-xl px-6 py-4 text-left transition ${
            mode === "manual" ? "ring-2" : ""
          }`}
          style={{
            border: "1px solid var(--border)",
            background:
              mode === "manual"
                ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                : "color-mix(in srgb, var(--muted) 30%, transparent)",
            ringColor: "var(--primary)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <CalcIcon size={20} />
            <span className="font-semibold">Mode 1: Manual Calculator</span>
          </div>
          <p className="text-xs opacity-70">
            Quick calculations without creator data
          </p>
        </button>

        <button
          onClick={() => activeAnalysis && setMode("analysis")}
          disabled={!activeAnalysis}
          className={`flex-1 rounded-xl px-6 py-4 text-left transition ${
            mode === "analysis" ? "ring-2" : ""
          } ${!activeAnalysis ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{
            border: "1px solid var(--border)",
            background:
              mode === "analysis"
                ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                : "color-mix(in srgb, var(--muted) 30%, transparent)",
            ringColor: "var(--primary)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <User size={20} />
            <span className="font-semibold">Mode 2: From Analysis</span>
          </div>
          <p className="text-xs opacity-70">
            {activeAnalysis
              ? `Using: ${activeAnalysis.channelName}`
              : "Run an analysis first"}
          </p>
        </button>
      </div>

      {/* Mode 1: Manual Calculator */}
      {mode === "manual" && (
        <div className="space-y-6">
          {/* Inputs */}
          <div
            className="rounded-2xl p-6"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 30%, transparent)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4">Inputs</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Expected Views *
                </label>
                <input
                  type="number"
                  value={manualViews}
                  onChange={(e) => setManualViews(e.target.value)}
                  placeholder="100000"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fee ({manualCurrency}) *
                </label>
                <input
                  type="number"
                  value={manualFee}
                  onChange={(e) => setManualFee(e.target.value)}
                  placeholder="10000"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Engagement Rate (%) - Optional
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={manualEngagementRate}
                  onChange={(e) => setManualEngagementRate(e.target.value)}
                  placeholder="3.5"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Agency Margin (%)
                </label>
                <input
                  type="number"
                  value={manualMargin}
                  onChange={(e) => setManualMargin(Number(e.target.value))}
                  placeholder="30"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Target CPM - Optional
                </label>
                <input
                  type="number"
                  value={manualTargetCpm}
                  onChange={(e) => setManualTargetCpm(e.target.value)}
                  placeholder="50"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <input
                  type="text"
                  value={manualCurrency}
                  onChange={(e) => setManualCurrency(e.target.value.toUpperCase())}
                  placeholder="ZAR"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          {manualResults && (
            <div
              className="rounded-2xl p-6"
              style={{
                border: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Results
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ResultCard
                  label="CPM"
                  value={`${manualCurrency} ${manualResults.cpm}`}
                  description="Cost per 1,000 views"
                />
                <ResultCard
                  label="CPV"
                  value={`${manualCurrency} ${manualResults.cpv}`}
                  description="Cost per view"
                />
                {manualResults.cpe !== "N/A" && (
                  <ResultCard
                    label="CPE"
                    value={`${manualCurrency} ${manualResults.cpe}`}
                    description="Cost per engagement"
                  />
                )}
                <ResultCard
                  label="Talent Payout"
                  value={`${manualCurrency} ${formatNumber(parseFloat(manualResults.talentPayout))}`}
                  description="Creator receives"
                />
                <ResultCard
                  label="Agency Margin"
                  value={`${manualCurrency} ${formatNumber(parseFloat(manualResults.marginValue))}`}
                  description="Agency keeps"
                />
                {manualResults.feeAtTargetCpm !== "N/A" && (
                  <ResultCard
                    label="Fee at Target CPM"
                    value={`${manualCurrency} ${formatNumber(parseFloat(manualResults.feeAtTargetCpm))}`}
                    description="To hit target CPM"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: From Analysis */}
      {mode === "analysis" && activeAnalysis && (
        <div className="space-y-6">
          {/* Creator Info */}
          <div
            className="rounded-2xl p-6"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 30%, transparent)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4">Creator</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs opacity-70">Channel</div>
                <div className="font-medium">{activeAnalysis.channelName}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Subscribers</div>
                <div className="font-medium">
                  {formatNumber(activeAnalysis.subscribers)}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-70">Region</div>
                <div className="font-medium">{activeAnalysis.region || "Global"}</div>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div
            className="rounded-2xl p-6"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 30%, transparent)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4">Campaign Inputs</h3>
            
            {/* Views Basis Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Views Basis</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewsBasis("median")}
                  className="rounded-lg px-4 py-2 text-sm transition"
                  style={{
                    background:
                      viewsBasis === "median" ? "var(--primary)" : "transparent",
                    color: viewsBasis === "median" ? "#0E1114" : "inherit",
                    border:
                      viewsBasis === "median" ? "none" : "1px solid var(--border)",
                  }}
                >
                  Median ({formatNumber(activeAnalysis.medianViews || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setViewsBasis("average")}
                  className="rounded-lg px-4 py-2 text-sm transition"
                  style={{
                    background:
                      viewsBasis === "average" ? "var(--primary)" : "transparent",
                    color: viewsBasis === "average" ? "#0E1114" : "inherit",
                    border:
                      viewsBasis === "average" ? "none" : "1px solid var(--border)",
                  }}
                >
                  Average ({formatNumber(activeAnalysis.averageViews || 0)})
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fee ({activeAnalysis.clientCurrency || "ZAR"}) *
                </label>
                <input
                  type="number"
                  value={analysisFee}
                  onChange={(e) => setAnalysisFee(e.target.value)}
                  placeholder="10000"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Agency Margin (%)
                </label>
                <input
                  type="number"
                  value={analysisMargin}
                  onChange={(e) => setAnalysisMargin(Number(e.target.value))}
                  placeholder="30"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Target CPM - Optional
                </label>
                <input
                  type="number"
                  value={analysisTargetCpm}
                  onChange={(e) => setAnalysisTargetCpm(e.target.value)}
                  placeholder="50"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          {analysisResults && (
            <div
              className="rounded-2xl p-6"
              style={{
                border: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Results
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ResultCard
                  label="CPM"
                  value={`${activeAnalysis.clientCurrency || "ZAR"} ${analysisResults.cpm}`}
                  description="Cost per 1,000 views"
                />
                <ResultCard
                  label="CPV"
                  value={`${activeAnalysis.clientCurrency || "ZAR"} ${analysisResults.cpv}`}
                  description="Cost per view"
                />
                <ResultCard
                  label="CPE"
                  value={`${activeAnalysis.clientCurrency || "ZAR"} ${analysisResults.cpe}`}
                  description="Cost per engagement"
                />
                <ResultCard
                  label="Talent Payout"
                  value={`${activeAnalysis.clientCurrency || "ZAR"} ${formatNumber(parseFloat(analysisResults.talentPayout))}`}
                  description="Creator receives"
                />
                <ResultCard
                  label="Agency Margin"
                  value={`${activeAnalysis.clientCurrency || "ZAR"} ${formatNumber(parseFloat(analysisResults.marginValue))}`}
                  description="Agency keeps"
                />
                {analysisResults.feeAtTargetCpm !== "N/A" && (
                  <ResultCard
                    label="Fee at Target CPM"
                    value={`${activeAnalysis.clientCurrency || "ZAR"} ${formatNumber(parseFloat(analysisResults.feeAtTargetCpm))}`}
                    description="To hit target CPM"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--muted) 20%, transparent)",
      }}
    >
      <div className="text-xs opacity-70 mb-1">{label}</div>
      <div className="text-xl font-semibold mb-1">{value}</div>
      <div className="text-xs opacity-60">{description}</div>
    </div>
  );
}
