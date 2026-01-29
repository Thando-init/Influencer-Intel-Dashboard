"use client";

import { Radio } from "lucide-react";

type LiveStream = {
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  isLive?: boolean;
};

type LiveMetrics = {
  mean_views?: number;
  median_views?: number;
  engagement_rate?: number;
  like_rate?: number;
  comment_rate?: number;
  total_streams?: number;
};

type Props = {
  liveStreams: LiveStream[];
  liveMetrics?: LiveMetrics;
};

export default function LiveStreamPerformance({ liveStreams, liveMetrics }: Props) {
  if (!liveStreams || liveStreams.length === 0) {
    return null;
  }

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "—";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatPercent = (num?: number) => {
    if (num === undefined || num === null) return "—";
    return `${num.toFixed(2)}%`;
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        border: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--muted) 30%, transparent)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2 rounded-lg"
          style={{
            background: "color-mix(in srgb, #ef4444 20%, transparent)",
          }}
        >
          <Radio size={20} style={{ color: "#ef4444" }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Live Stream Performance</h3>
          <p className="text-sm opacity-70">
            Analysis of {liveMetrics?.total_streams || liveStreams.length} live stream
            {(liveMetrics?.total_streams || liveStreams.length) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      {liveMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div
            className="rounded-xl p-4"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 20%, transparent)",
            }}
          >
            <div className="text-xs opacity-70 mb-1">Total Streams</div>
            <div className="text-xl font-semibold">
              {liveMetrics.total_streams || liveStreams.length}
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 20%, transparent)",
            }}
          >
            <div className="text-xs opacity-70 mb-1">Avg Views</div>
            <div className="text-xl font-semibold">
              {formatNumber(liveMetrics.mean_views)}
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 20%, transparent)",
            }}
          >
            <div className="text-xs opacity-70 mb-1">Median Views</div>
            <div className="text-xl font-semibold">
              {formatNumber(liveMetrics.median_views)}
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 20%, transparent)",
            }}
          >
            <div className="text-xs opacity-70 mb-1">Engagement Rate</div>
            <div className="text-xl font-semibold">
              {formatPercent(liveMetrics.engagement_rate)}
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 20%, transparent)",
            }}
          >
            <div className="text-xs opacity-70 mb-1">Like Rate</div>
            <div className="text-xl font-semibold">
              {formatPercent(liveMetrics.like_rate)}
            </div>
          </div>
        </div>
      )}

      {/* Recent Live Streams Table */}
      <div>
        <h4 className="text-sm font-medium opacity-80 mb-3">Recent Live Streams</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <th className="text-left py-2 px-3 font-medium opacity-70">Title</th>
                <th className="text-right py-2 px-3 font-medium opacity-70">Views</th>
                <th className="text-right py-2 px-3 font-medium opacity-70">Likes</th>
                <th className="text-right py-2 px-3 font-medium opacity-70">Comments</th>
                <th className="text-right py-2 px-3 font-medium opacity-70">
                  Engagement
                </th>
                <th className="text-right py-2 px-3 font-medium opacity-70">Date</th>
              </tr>
            </thead>
            <tbody>
              {liveStreams.slice(0, 10).map((stream, idx) => {
                const engagement =
                  stream.views > 0
                    ? (((stream.likes + stream.comments) / stream.views) * 100).toFixed(2)
                    : "0.00";

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom:
                        idx < liveStreams.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                    className="hover:bg-[var(--muted)] transition"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {stream.isLive && (
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              background: "#ef4444",
                              color: "white",
                            }}
                          >
                            LIVE
                          </span>
                        )}
                        <span className="truncate max-w-xs">{stream.title}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3">{formatNumber(stream.views)}</td>
                    <td className="text-right py-3 px-3">{formatNumber(stream.likes)}</td>
                    <td className="text-right py-3 px-3">
                      {formatNumber(stream.comments)}
                    </td>
                    <td className="text-right py-3 px-3">{engagement}%</td>
                    <td className="text-right py-3 px-3 opacity-70">
                      {new Date(stream.publishedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Note */}
      <div
        className="mt-4 rounded-lg p-3 text-xs"
        style={{
          background: "color-mix(in srgb, var(--primary) 10%, transparent)",
          border: "1px solid var(--primary)",
        }}
      >
        <strong>Note:</strong> Live stream metrics may differ from regular video performance
        due to longer watch times and real-time engagement patterns.
      </div>
    </div>
  );
}
