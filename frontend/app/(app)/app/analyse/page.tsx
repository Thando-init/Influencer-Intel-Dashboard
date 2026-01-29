"use client";

import { useMemo, useState } from "react";
import { useAnalysis } from "@/context/AnalysisContext";
import ChannelCard from "@/components/report/ChannelCard";
import ViewsChart from "@/components/report/ViewsChart";
import EngagementChart from "@/components/report/EngagementChart";
import VideoTable from "@/components/report/VideoTable";
import MetricsSummary from "@/components/report/MetricsSummary";
import LiveStreamPerformance from "@/components/report/LiveStreamPerformance";
import VideoFormatChart from "@/components/report/VideoFormatChart";
import MetricsExplanation from "@/components/report/MetricsExplanation";
import { FileText } from "lucide-react";

type ApiChannel = {
  channel_id: string;
  channel_name: string;
  subscribers: number;
  region?: string;
  channel_url?: string;
};

type ApiVideo = {
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

type ApiMetrics = {
  mean_views?: number;
  median_views?: number;
  engagement_rate?: number;
  like_rate?: number;
  comment_rate?: number;
  volatility_ratio?: number;
  risk_level?: string;
};

type ApiResponse = {
  channel: ApiChannel;
  videos?: ApiVideo[];
  metrics?: ApiMetrics;
  live_streams?: ApiVideo[];
  live_metrics?: LiveMetrics;
};

function safeNum(x: unknown): number | undefined {
  return typeof x === "number" && Number.isFinite(x) ? x : undefined;
}

export default function AnalysePage() {
  const { upsertAnalysis, getActive } = useAnalysis();
  const active = getActive();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoCount, setVideoCount] = useState(8);

  // Pricing inputs
  const [clientCurrency, setClientCurrency] = useState("ZAR");
  const [creatorCurrency, setCreatorCurrency] = useState("ZAR");
  const [quotedFeeClient, setQuotedFeeClient] = useState<string>("");
  const [targetMarginPct, setTargetMarginPct] = useState<number>(30);
  const [targetCpm, setTargetCpm] = useState<string>("");

  // NEW: Expected views basis state
  const [expectedViewsBasis, setExpectedViewsBasis] = useState<
    "median" | "average"
  >("median");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [showReport, setShowReport] = useState(false);

  const apiBase = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  }, []);

  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setData(null);
    setShowReport(false);

    try {
      const res = await fetch(`${apiBase}/api/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtube_url: youtubeUrl.trim(),
          video_count: videoCount,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `API error (${res.status}). ${text || "Check backend logs."}`,
        );
      }

      const json = (await res.json()) as ApiResponse;
      setData(json);
      setShowReport(true);

      const createdAt = new Date().toISOString();
      const id = `${Date.now()}`;

      const medianViews = safeNum(json.metrics?.median_views);
      const averageViews = safeNum(json.metrics?.mean_views);

      const feeNum =
        quotedFeeClient.trim() === "" ? undefined : Number(quotedFeeClient);
      const fee = Number.isFinite(feeNum as number) ? feeNum : undefined;

      const tCpmNum = targetCpm.trim() === "" ? undefined : Number(targetCpm);
      const tCpm = Number.isFinite(tCpmNum as number) ? tCpmNum : undefined;

      upsertAnalysis({
        id,
        channelId: json.channel.channel_id,
        channelName: json.channel.channel_name,
        channelUrl: json.channel.channel_url,
        region: json.channel.region,
        subscribers: json.channel.subscribers,
        medianViews,
        averageViews,
        createdAt,

        // Pricing inputs persisted for calculator + later
        clientCurrency,
        creatorCurrency,
        quotedFeeClient: fee,
        targetMarginPct,
        targetCpm: tCpm,
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="mb-6">
        <div className="text-2xl font-semibold">Analyse</div>
        <div className="mt-1 text-sm opacity-70">
          Paste a YouTube channel or video link. We'll analyse performance and
          save it to your recent list.
        </div>
      </div>

      <form
        onSubmit={runAnalysis}
        className="rounded-2xl p-5"
        style={{
          border: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--muted) 45%, transparent)",
          backdropFilter: "blur(10px)",
        }}
      >
        <label className="block text-sm font-medium">
          YouTube Channel / Video
        </label>
        <div className="mt-2 flex gap-3">
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/channel/UCF210wfiA4jvfCxW4sSXaQ"
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              border: "1px solid var(--border )",
              background: "transparent",
            }}
          />
          <div className="w-32">
            <input
              type="number"
              min={1}
              max={25}
              value={videoCount}
              onChange={(e) => setVideoCount(Number(e.target.value))}
              placeholder="8"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none text-center"
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
              }}
              title="Recent videos to analyse"
            />
            <div className="text-xs opacity-60 text-center mt-1">videos</div>
          </div>
        </div>

        {/* Brand Inputs */}
        <div className="mt-4">
          <div className="text-xs font-medium opacity-80 mb-2">
            Brand inputs (optional)
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs opacity-70">Creator region</label>
              <input
                value={clientCurrency}
                onChange={(e) =>
                  setClientCurrency(e.target.value.toUpperCase())
                }
                placeholder="South Africa"
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "transparent",
                }}
              />
            </div>

            <div>
              <label className="block text-xs opacity-70">
                Client currency
              </label>
              <input
                value={clientCurrency}
                onChange={(e) =>
                  setClientCurrency(e.target.value.toUpperCase())
                }
                placeholder="ZAR"
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "transparent",
                }}
              />
            </div>

            <div>
              <label className="block text-xs opacity-70">
                Creator currency
              </label>
              <input
                value={creatorCurrency}
                onChange={(e) =>
                  setCreatorCurrency(e.target.value.toUpperCase())
                }
                placeholder="ZAR"
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "transparent",
                }}
              />
            </div>

            <div>
              <label className="block text-xs opacity-70">
                Quoted fee (client)
              </label>
              <input
                inputMode="decimal"
                value={quotedFeeClient}
                onChange={(e) => setQuotedFeeClient(e.target.value)}
                placeholder="10000"
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "transparent",
                }}
              />
            </div>

            <div>
              <label className="block text-xs opacity-70">
                Agency margin %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={targetMarginPct}
                onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                placeholder="0"
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "transparent",
                }}
              />
            </div>

            <div>
              <label className="block text-xs opacity-70">Target CPM</label>
              <input
                inputMode="decimal"
                value={targetCpm}
                onChange={(e) => setTargetCpm(e.target.value)}
                placeholder="111"
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "transparent",
                }}
              />
            </div>
          </div>
        </div>

        {/* Expected views basis - FIXED */}
        <div className="mt-4">
          <label className="block text-xs font-medium opacity-80 mb-2">
            Expected views basis
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExpectedViewsBasis("median")}
              className="rounded-lg px-4 py-2 text-sm transition hover:opacity-90"
              style={{
                background:
                  expectedViewsBasis === "median"
                    ? "var(--primary)"
                    : "transparent",
                color: expectedViewsBasis === "median" ? "#0E1114" : "inherit",
                border:
                  expectedViewsBasis === "median"
                    ? "none"
                    : "1px solid var(--border)",
              }}
            >
              Median views
            </button>
            <button
              type="button"
              onClick={() => setExpectedViewsBasis("average")}
              className="rounded-lg px-4 py-2 text-sm transition hover:opacity-90"
              style={{
                background:
                  expectedViewsBasis === "average"
                    ? "var(--primary)"
                    : "transparent",
                color: expectedViewsBasis === "average" ? "#0E1114" : "inherit",
                border:
                  expectedViewsBasis === "average"
                    ? "none"
                    : "1px solid var(--border)",
              }}
            >
              Average views
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || !youtubeUrl.trim()}
            className="rounded-xl px-6 py-2.5 text-sm font-medium transition disabled:opacity-60 flex items-center gap-2"
            style={{ background: "var(--primary)", color: "#0E1114" }}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Running...
              </>
            ) : (
              "Run analysis"
            )}
          </button>

          <div className="text-xs opacity-70">
            YouTube uploads playlist fetches up to 25.
          </div>
        </div>

        {error && (
          <div
            className="mt-4 rounded-xl p-3 text-sm"
            style={{
              border: "1px solid #ef4444",
              background: "color-mix(in srgb, #ef4444 15%, transparent)",
            }}
          >
            <div className="font-medium">Error</div>
            <div className="mt-1 opacity-80">{error}</div>
          </div>
        )}
      </form>

      {/* Report Section */}
      {showReport && data && (
        <div className="mt-8 space-y-6">
          {/* Report Header */}
          <div
            className="rounded-2xl p-6"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <FileText size={24} style={{ color: "var(--primary)" }} />
              <div>
                <h2 className="text-xl font-semibold">Analysis Report</h2>
                <p className="text-sm opacity-70 mt-1">
                  Generated on {new Date().toLocaleDateString()} at{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Channel Card */}
          <ChannelCard
            channelName={data.channel.channel_name}
            channelUrl={data.channel.channel_url}
            subscribers={data.channel.subscribers}
            region={data.channel.region}
            medianViews={data.metrics?.median_views}
            averageViews={data.metrics?.mean_views}
            engagementRate={data.metrics?.engagement_rate}
            riskLevel={data.metrics?.risk_level}
          />

          {/* Metrics Summary */}
          <MetricsSummary
            medianViews={data.metrics?.median_views}
            averageViews={data.metrics?.mean_views}
            engagementRate={data.metrics?.engagement_rate}
            likeRate={data.metrics?.like_rate}
            commentRate={data.metrics?.comment_rate}
            volatilityRatio={data.metrics?.volatility_ratio}
            riskLevel={data.metrics?.risk_level}
            quotedFeeClient={
              quotedFeeClient ? Number(quotedFeeClient) : undefined
            }
            targetCpm={targetCpm ? Number(targetCpm) : undefined}
            clientCurrency={clientCurrency}
          />

          {/* Charts */}
          {data.videos && data.videos.length > 0 && (
            <>
              <ViewsChart
                videos={data.videos}
                medianViews={data.metrics?.median_views}
                averageViews={data.metrics?.mean_views}
              />

              <EngagementChart videos={data.videos} />

              <VideoFormatChart videos={data.videos} />

              <VideoTable videos={data.videos} />
            </>
          )}

          {/* Live Stream Performance */}
          {data.live_streams && data.live_streams.length > 0 && (
            <LiveStreamPerformance
              liveStreams={data.live_streams}
              liveMetrics={data.live_metrics}
            />
          )}

          {/* Metrics Explanation */}
          <MetricsExplanation />
        </div>
      )}
    </div>
  );
}

// "use client";

// import { useMemo, useState } from "react";
// import { useAnalysis } from "@/context/AnalysisContext";
// import ChannelCard from "@/components/report/ChannelCard";
// import ViewsChart from "@/components/report/ViewsChart";
// import EngagementChart from "@/components/report/EngagementChart";
// import VideoTable from "@/components/report/VideoTable";
// import MetricsSummary from "@/components/report/MetricsSummary";
// import { FileText } from "lucide-react";

// type ApiChannel = {
//   channel_id: string;
//   channel_name: string;
//   subscribers: number;
//   region?: string;
//   channel_url?: string;
// };

// type ApiVideo = {
//   title: string;
//   publishedAt: string;
//   views: number;
//   likes: number;
//   comments: number;
//   duration: string;
// };

// type ApiMetrics = {
//   mean_views?: number;
//   median_views?: number;
//   engagement_rate?: number;
//   like_rate?: number;
//   comment_rate?: number;
//   volatility_ratio?: number;
//   risk_level?: string;
// };

// type ApiResponse = {
//   channel: ApiChannel;
//   videos?: ApiVideo[];
//   metrics?: ApiMetrics;
// };

// function safeNum(x: unknown): number | undefined {
//   return typeof x === "number" && Number.isFinite(x) ? x : undefined;
// }

// export default function AnalysePage() {
//   const { upsertAnalysis, getActive } = useAnalysis();
//   const active = getActive();

//   const [youtubeUrl, setYoutubeUrl] = useState("");
//   const [videoCount, setVideoCount] = useState(8);

//   // Pricing inputs
//   const [clientCurrency, setClientCurrency] = useState("ZAR");
//   const [creatorCurrency, setCreatorCurrency] = useState("ZAR");
//   const [quotedFeeClient, setQuotedFeeClient] = useState<string>("");
//   const [targetMarginPct, setTargetMarginPct] = useState<number>(30);
//   const [targetCpm, setTargetCpm] = useState<string>("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [data, setData] = useState<ApiResponse | null>(null);
//   const [showReport, setShowReport] = useState(false);

//   const apiBase = useMemo(() => {
//     return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
//   }, []);

//   async function runAnalysis(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     setData(null);
//     setShowReport(false);

//     try {
//       const res = await fetch(`${apiBase}/api/analysis`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           youtube_url: youtubeUrl.trim(),
//           video_count: videoCount,
//         }),
//       });

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(
//           `API error (${res.status}). ${text || "Check backend logs."}`,
//         );
//       }

//       const json = (await res.json()) as ApiResponse;
//       setData(json);
//       setShowReport(true);

//       const createdAt = new Date().toISOString();
//       const id = `${Date.now()}`;

//       const medianViews = safeNum(json.metrics?.median_views);
//       const averageViews = safeNum(json.metrics?.mean_views);

//       const feeNum =
//         quotedFeeClient.trim() === "" ? undefined : Number(quotedFeeClient);
//       const fee = Number.isFinite(feeNum as number) ? feeNum : undefined;

//       const tCpmNum = targetCpm.trim() === "" ? undefined : Number(targetCpm);
//       const tCpm = Number.isFinite(tCpmNum as number) ? tCpmNum : undefined;

//       upsertAnalysis({
//         id,
//         channelId: json.channel.channel_id,
//         channelName: json.channel.channel_name,
//         channelUrl: json.channel.channel_url,
//         region: json.channel.region,
//         subscribers: json.channel.subscribers,
//         medianViews,
//         averageViews,
//         createdAt,

//         // Pricing inputs persisted for calculator + later
//         clientCurrency,
//         creatorCurrency,
//         quotedFeeClient: fee,
//         targetMarginPct,
//         targetCpm: tCpm,
//       });
//     } catch (err: any) {
//       setError(err?.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-7xl pb-10">
//       <div className="mb-6">
//         <div className="text-2xl font-semibold">Analyse</div>
//         <div className="mt-1 text-sm opacity-70">
//           Paste a YouTube channel or video link. We'll analyse performance and save it to your recent list.
//         </div>
//       </div>

//       <form
//         onSubmit={runAnalysis}
//         className="rounded-2xl p-5"
//         style={{
//           border: "1px solid var(--border)",
//           background: "color-mix(in srgb, var(--muted) 45%, transparent)",
//           backdropFilter: "blur(10px)",
//         }}
//       >
//         <label className="block text-sm font-medium">
//           YouTube Channel / Video
//         </label>
//         <div className="mt-2 flex gap-3">
//           <input
//             value={youtubeUrl}
//             onChange={(e) => setYoutubeUrl(e.target.value)}
//             placeholder="https://www.youtube.com/channel/UCF210wfiA4jvfCxW4sSXaQ"
//             className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
//             style={{
//               border: "1px solid var(--border)",
//               background: "transparent",
//             }}
//           />
//           <div className="w-32">
//             <input
//               type="number"
//               min={1}
//               max={25}
//               value={videoCount}
//               onChange={(e) => setVideoCount(Number(e.target.value))}
//               placeholder="8"
//               className="w-full rounded-xl px-3 py-2 text-sm outline-none text-center"
//               style={{
//                 border: "1px solid var(--border)",
//                 background: "transparent",
//               }}
//               title="Recent videos to analyse"
//             />
//             <div className="text-xs opacity-60 text-center mt-1">videos</div>
//           </div>
//         </div>

//         {/* Brand Inputs */}
//         <div className="mt-4">
//           <div className="text-xs font-medium opacity-80 mb-2">Brand inputs (optional)</div>
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             <div>
//               <label className="block text-xs opacity-70">Creator region</label>
//               <input
//                 value={clientCurrency}
//                 onChange={(e) => setClientCurrency(e.target.value.toUpperCase())}
//                 placeholder="South Africa"
//                 className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
//                 style={{
//                   border: "1px solid var(--border)",
//                   background: "transparent",
//                 }}
//               />
//             </div>

//             <div>
//               <label className="block text-xs opacity-70">Client currency</label>
//               <input
//                 value={clientCurrency}
//                 onChange={(e) => setClientCurrency(e.target.value.toUpperCase())}
//                 placeholder="ZAR"
//                 className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
//                 style={{
//                   border: "1px solid var(--border)",
//                   background: "transparent",
//                 }}
//               />
//             </div>

//             <div>
//               <label className="block text-xs opacity-70">Creator currency</label>
//               <input
//                 value={creatorCurrency}
//                 onChange={(e) => setCreatorCurrency(e.target.value.toUpperCase())}
//                 placeholder="ZAR"
//                 className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
//                 style={{
//                   border: "1px solid var(--border)",
//                   background: "transparent",
//                 }}
//               />
//             </div>

//             <div>
//               <label className="block text-xs opacity-70">Quoted fee (client)</label>
//               <input
//                 inputMode="decimal"
//                 value={quotedFeeClient}
//                 onChange={(e) => setQuotedFeeClient(e.target.value)}
//                 placeholder="10000"
//                 className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
//                 style={{
//                   border: "1px solid var(--border)",
//                   background: "transparent",
//                 }}
//               />
//             </div>

//             <div>
//               <label className="block text-xs opacity-70">Agency margin %</label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 value={targetMarginPct}
//                 onChange={(e) => setTargetMarginPct(Number(e.target.value))}
//                 placeholder="0"
//                 className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
//                 style={{
//                   border: "1px solid var(--border)",
//                   background: "transparent",
//                 }}
//               />
//             </div>

//             <div>
//               <label className="block text-xs opacity-70">Target CPM</label>
//               <input
//                 inputMode="decimal"
//                 value={targetCpm}
//                 onChange={(e) => setTargetCpm(e.target.value)}
//                 placeholder="111"
//                 className="mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none"
//                 style={{
//                   border: "1px solid var(--border)",
//                   background: "transparent",
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Expected views basis */}
//         <div className="mt-4">
//           <label className="block text-xs font-medium opacity-80 mb-2">
//             Expected views basis
//           </label>
//           <div className="flex gap-2">
//             <button
//               type="button"
//               className="rounded-lg px-4 py-2 text-sm transition"
//               style={{
//                 background: "var(--primary)",
//                 color: "#0E1114",
//                 opacity: 0.7,
//               }}
//             >
//               Median views
//             </button>
//             <button
//               type="button"
//               className="rounded-lg px-4 py-2 text-sm transition"
//               style={{
//                 border: "1px solid var(--border)",
//                 background: "transparent",
//                 opacity: 0.7,
//               }}
//             >
//               Average views
//             </button>
//           </div>
//         </div>

//         <div className="mt-5 flex flex-wrap items-center gap-3">
//           <button
//             type="submit"
//             disabled={loading || !youtubeUrl.trim()}
//             className="rounded-xl px-6 py-2.5 text-sm font-medium transition disabled:opacity-60 flex items-center gap-2"
//             style={{ background: "var(--primary)", color: "#0E1114" }}
//           >
//             {loading ? (
//               <>
//                 <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
//                 Running...
//               </>
//             ) : (
//               "Run analysis"
//             )}
//           </button>

//           <div className="text-xs opacity-70">
//             YouTube uploads playlist fetches up to 25.
//           </div>
//         </div>

//         {error && (
//           <div
//             className="mt-4 rounded-xl p-3 text-sm"
//             style={{
//               border: "1px solid #ef4444",
//               background: "color-mix(in srgb, #ef4444 15%, transparent)",
//             }}
//           >
//             <div className="font-medium">Error</div>
//             <div className="mt-1 opacity-80">{error}</div>
//           </div>
//         )}
//       </form>

//       {/* Report Section */}
//       {showReport && data && (
//         <div className="mt-8 space-y-6">
//           {/* Report Header */}
//           <div
//             className="rounded-2xl p-6"
//             style={{
//               border: "1px solid var(--border)",
//               background: "color-mix(in srgb, var(--primary) 10%, transparent)",
//             }}
//           >
//             <div className="flex items-center gap-3">
//               <FileText size={24} style={{ color: "var(--primary)" }} />
//               <div>
//                 <h2 className="text-xl font-semibold">Analysis Report</h2>
//                 <p className="text-sm opacity-70 mt-1">
//                   Generated on {new Date().toLocaleDateString()} at{" "}
//                   {new Date().toLocaleTimeString()}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Channel Card */}
//           <ChannelCard
//             channelName={data.channel.channel_name}
//             channelUrl={data.channel.channel_url}
//             subscribers={data.channel.subscribers}
//             region={data.channel.region}
//             medianViews={data.metrics?.median_views}
//             averageViews={data.metrics?.mean_views}
//             engagementRate={data.metrics?.engagement_rate}
//             riskLevel={data.metrics?.risk_level}
//           />

//           {/* Metrics Summary */}
//           <MetricsSummary
//             medianViews={data.metrics?.median_views}
//             averageViews={data.metrics?.mean_views}
//             engagementRate={data.metrics?.engagement_rate}
//             likeRate={data.metrics?.like_rate}
//             commentRate={data.metrics?.comment_rate}
//             volatilityRatio={data.metrics?.volatility_ratio}
//             riskLevel={data.metrics?.risk_level}
//             quotedFeeClient={
//               quotedFeeClient ? Number(quotedFeeClient) : undefined
//             }
//             targetCpm={targetCpm ? Number(targetCpm) : undefined}
//             clientCurrency={clientCurrency}
//           />

//           {/* Charts */}
//           {data.videos && data.videos.length > 0 && (
//             <>
//               <ViewsChart
//                 videos={data.videos}
//                 medianViews={data.metrics?.median_views}
//                 averageViews={data.metrics?.mean_views}
//               />

//               <EngagementChart videos={data.videos} />

//               <VideoTable videos={data.videos} />
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
