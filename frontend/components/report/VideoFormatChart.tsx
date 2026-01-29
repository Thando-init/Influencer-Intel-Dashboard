"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Video } from "lucide-react";

type VideoData = {
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
};

type Props = {
  videos: VideoData[];
};

export default function VideoFormatChart({ videos }: Props) {
  // Parse ISO 8601 duration to seconds
  const parseDuration = (isoDuration: string): number => {
    try {
      const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return 0;
      const hours = parseInt(match[1] || "0");
      const minutes = parseInt(match[2] || "0");
      const seconds = parseInt(match[3] || "0");
      return hours * 3600 + minutes * 60 + seconds;
    } catch {
      return 0;
    }
  };

  // Categorize videos
  const shortVideos = videos.filter((v) => parseDuration(v.duration) < 420); // < 7 minutes
  const longVideos = videos.filter((v) => parseDuration(v.duration) >= 420); // >= 7 minutes

  const shortCount = shortVideos.length;
  const longCount = longVideos.length;
  const total = shortCount + longCount;

  if (total === 0) return null;

  const shortAvgViews = shortCount > 0
    ? Math.round(shortVideos.reduce((sum, v) => sum + v.views, 0) / shortCount)
    : 0;

  const longAvgViews = longCount > 0
    ? Math.round(longVideos.reduce((sum, v) => sum + v.views, 0) / longCount)
    : 0;

  const chartData = [
    {
      name: "Short-form (<7 min)",
      value: shortCount,
      avgViews: shortAvgViews,
      percentage: ((shortCount / total) * 100).toFixed(1),
    },
    {
      name: "Long-form (≥7 min)",
      value: longCount,
      avgViews: longAvgViews,
      percentage: ((longCount / total) * 100).toFixed(1),
    },
  ].filter((item) => item.value > 0);

  const COLORS = ["#3b82f6", "#8b5cf6"]; // Blue for short, Purple for long

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
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
            background: "color-mix(in srgb, var(--primary) 20%, transparent)",
          }}
        >
          <Video size={20} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Video Format Distribution</h3>
          <p className="text-sm opacity-70">
            Comparing short-form and long-form content performance
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value: any, name: string, props: any) => [
                  `${value} videos`,
                  props.payload.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          {/* Short-form Card */}
          {shortCount > 0 && (
            <div
              className="rounded-xl p-4"
              style={{
                border: "1px solid var(--border)",
                background: "color-mix(in srgb, #3b82f6 10%, transparent)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium opacity-80">Short-form (<7 min)</div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: COLORS[0] }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs opacity-70">Count</div>
                  <div className="text-lg font-semibold">{shortCount}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">Avg Views</div>
                  <div className="text-lg font-semibold">{formatNumber(shortAvgViews)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Long-form Card */}
          {longCount > 0 && (
            <div
              className="rounded-xl p-4"
              style={{
                border: "1px solid var(--border)",
                background: "color-mix(in srgb, #8b5cf6 10%, transparent)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium opacity-80">Long-form (≥7 min)</div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: COLORS[1] }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs opacity-70">Count</div>
                  <div className="text-lg font-semibold">{longCount}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">Avg Views</div>
                  <div className="text-lg font-semibold">{formatNumber(longAvgViews)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Insight */}
          <div
            className="rounded-lg p-3 text-xs"
            style={{
              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              border: "1px solid var(--primary)",
            }}
          >
            <strong>Insight:</strong>{" "}
            {shortAvgViews > longAvgViews
              ? "Short-form content performs better on average for this creator."
              : longAvgViews > shortAvgViews
              ? "Long-form content performs better on average for this creator."
              : "Both formats perform similarly for this creator."}
          </div>
        </div>
      </div>
    </div>
  );
}
