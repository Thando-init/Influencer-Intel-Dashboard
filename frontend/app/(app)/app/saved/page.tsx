"use client";

import { useAnalysis } from "@/context/AnalysisContext";
import { Bookmark, Trash2, ExternalLink, AlertCircle } from "lucide-react";

export default function SavedPage() {
  const { analyses, setActive, deleteAnalysis, getActive } = useAnalysis();
  const activeAnalysis = getActive();

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "—";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "#10b981"; // green
      case "moderate":
      case "medium":
        return "#f59e0b"; // orange
      case "high":
        return "#ef4444"; // red
      default:
        return "var(--primary)";
    }
  };

  return (
    <div className="mx-auto max-w-7xl pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="text-2xl font-semibold">Saved Analyses</div>
        <div className="mt-1 text-sm opacity-70">
          Your library of creator performance reports. Click to set as active for Calculator.
        </div>
      </div>

      {/* Empty State */}
      {analyses.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            border: "1px solid var(--border)",
            background: "color-mix(in srgb, var(--muted) 30%, transparent)",
          }}
        >
          <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No Saved Analyses Yet</h3>
          <p className="text-sm opacity-70 mb-4">
            Run an analysis from the Analyse page to see it here.
          </p>
          <a
            href="/app/analyse"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition"
            style={{
              background: "var(--primary)",
              color: "#0E1114",
            }}
          >
            Go to Analyse
            <ExternalLink size={16} />
          </a>
        </div>
      )}

      {/* Analysis Cards */}
      {analyses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {analyses.map((analysis) => {
            const isActive = activeAnalysis?.id === analysis.id;

            return (
              <div
                key={analysis.id}
                className={`rounded-2xl p-6 transition cursor-pointer ${
                  isActive ? "ring-2" : ""
                }`}
                style={{
                  border: "1px solid var(--border)",
                  background: isActive
                    ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                    : "color-mix(in srgb, var(--muted) 30%, transparent)",
                  ringColor: "var(--primary)",
                }}
                onClick={() => setActive(analysis.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      {analysis.channelName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs opacity-70">
                      <span>{analysis.region || "Global"}</span>
                      <span>•</span>
                      <span>{formatDate(analysis.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <div
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: "var(--primary)",
                          color: "#0E1114",
                        }}
                      >
                        Active
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `Delete analysis for ${analysis.channelName}?`
                          )
                        ) {
                          deleteAnalysis(analysis.id);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-[var(--muted)] transition"
                      title="Delete"
                    >
                      <Trash2 size={16} className="opacity-70" />
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    className="rounded-xl p-3"
                    style={{
                      border: "1px solid var(--border)",
                      background: "color-mix(in srgb, var(--muted) 20%, transparent)",
                    }}
                  >
                    <div className="text-xs opacity-70 mb-1">Subscribers</div>
                    <div className="text-lg font-semibold">
                      {formatNumber(analysis.subscribers)}
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-3"
                    style={{
                      border: "1px solid var(--border)",
                      background: "color-mix(in srgb, var(--muted) 20%, transparent)",
                    }}
                  >
                    <div className="text-xs opacity-70 mb-1">Median Views</div>
                    <div className="text-lg font-semibold">
                      {formatNumber(analysis.medianViews)}
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-3"
                    style={{
                      border: "1px solid var(--border)",
                      background: "color-mix(in srgb, var(--muted) 20%, transparent)",
                    }}
                  >
                    <div className="text-xs opacity-70 mb-1">Average Views</div>
                    <div className="text-lg font-semibold">
                      {formatNumber(analysis.averageViews)}
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-3"
                    style={{
                      border: "1px solid var(--border)",
                      background: "color-mix(in srgb, var(--muted) 20%, transparent)",
                    }}
                  >
                    <div className="text-xs opacity-70 mb-1">Risk Level</div>
                    <div
                      className="text-sm font-semibold inline-flex items-center gap-1"
                      style={{
                        color: getRiskColor(analysis.riskLevel),
                      }}
                    >
                      <AlertCircle size={14} />
                      {analysis.riskLevel || "Unknown"}
                    </div>
                  </div>
                </div>

                {/* Channel Link */}
                {analysis.channelUrl && (
                  <a
                    href={analysis.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition"
                  >
                    <ExternalLink size={14} />
                    View Channel
                  </a>
                )}

                {/* Click hint */}
                {!isActive && (
                  <div
                    className="mt-4 text-xs text-center py-2 rounded-lg"
                    style={{
                      background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                      border: "1px solid var(--primary)",
                    }}
                  >
                    Click to set as active for Calculator
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Note */}
      {analyses.length > 0 && (
        <div
          className="mt-6 rounded-xl p-4 text-sm"
          style={{
            border: "1px solid var(--border)",
            background: "color-mix(in srgb, var(--muted) 20%, transparent)",
          }}
        >
          <strong>Note:</strong> Analyses are stored locally in your browser for this MVP.
          Future versions will sync to your account across devices.
        </div>
      )}
    </div>
  );
}
