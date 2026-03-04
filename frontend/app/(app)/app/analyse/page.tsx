"use client";

import { useMemo, useState } from "react";
import { useAnalysis } from "@/context/AnalysisContext";

type ApiChannel = {
  channel_id: string;
  channel_name: string;
  subscribers: number;
  region?: string;
  channel_url?: string;
};

type ApiResponse = {
  channel: ApiChannel;
  videos?: Array<{
    title: string;
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
    duration: string;
  }>;
    metrics_report?: {
    mean_views?: number;
    median_views?: number;
    engagement_rate_percent?: number;
    like_rate_percent?: number;
    comment_rate_percent?: number;
    volatility_ratio?: number;
    risk_level?: string;
  };
};

function safeNum(x: unknown): number | undefined {
  return typeof x === "number" && Number.isFinite(x) ? x : undefined;
}

export default function AnalysePage() {
  const { upsertAnalysis, getActive } = useAnalysis();
  const active = getActive();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoCount, setVideoCount] = useState(8);

  // Pricing inputs (NEW)
  const [clientCurrency, setClientCurrency] = useState("ZAR");
  const [creatorCurrency, setCreatorCurrency] = useState("ZAR");
  const [quotedFeeClient, setQuotedFeeClient] = useState<string>("");
  const [targetMarginPct, setTargetMarginPct] = useState<number>(30);
  const [targetCpm, setTargetCpm] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const apiBase = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  }, []);

  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setData(null);

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

      const createdAt = new Date().toISOString();
      const id = `${Date.now()}`;

      const medianViews = safeNum(json.metrics_report?.median_views);
      const averageViews = safeNum(json.metrics_report?.mean_views);

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
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="text-2xl font-semibold">Analyse</div>
        <div className="mt-1 text-sm opacity-70">
          Paste a YouTube channel or video link. Save pricing inputs so the
          calculator can reuse them.
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
          YouTube URL / Handle
        </label>
        <input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/@ghosthlubi OR https://www.youtube.com/watch?v=..."
          className="mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
          style={{
            border: "1px solid var(--border)",
            background: "transparent",
          }}
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium opacity-80">
              Video count
            </label>
            <input
              type="number"
              min={1}
              max={25}
              value={videoCount}
              onChange={(e) => setVideoCount(Number(e.target.value))}
              className="mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium opacity-80">
              Client currency
            </label>
            <input
              value={clientCurrency}
              onChange={(e) => setClientCurrency(e.target.value.toUpperCase())}
              placeholder="ZAR"
              className="mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium opacity-80">
              Creator currency
            </label>
            <input
              value={creatorCurrency}
              onChange={(e) => setCreatorCurrency(e.target.value.toUpperCase())}
              placeholder="ZAR"
              className="mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium opacity-80">
              Quoted fee (client)
            </label>
            <input
              inputMode="decimal"
              value={quotedFeeClient}
              onChange={(e) => setQuotedFeeClient(e.target.value)}
              placeholder="10000"
              className="mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium opacity-80">
              Target margin (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={targetMarginPct}
              onChange={(e) => setTargetMarginPct(Number(e.target.value))}
              className="mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium opacity-80">
              Target CPM (optional)
            </label>
            <input
              inputMode="decimal"
              value={targetCpm}
              onChange={(e) => setTargetCpm(e.target.value)}
              placeholder="111"
              className="mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || !youtubeUrl.trim()}
            className="rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60"
            style={{ background: "var(--primary)", color: "#0E1114" }}
          >
            {loading ? "Analysing…" : "Run analysis"}
          </button>

          <div className="text-xs opacity-70">
            API: <span className="opacity-90">{apiBase}</span>
          </div>
        </div>

        {error && (
          <div
            className="mt-4 rounded-xl p-3 text-sm"
            style={{
              border: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--muted) 70%, transparent)",
            }}
          >
            <div className="font-medium">Error</div>
            <div className="mt-1 opacity-80">{error}</div>
          </div>
        )}
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div
          className="rounded-2xl p-5"
          style={{
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="text-sm font-semibold">Active creator</div>
          <div className="mt-2 text-sm opacity-80">
            {active ? (
              <>
                <div className="font-medium">{active.channelName}</div>
                <div className="mt-1 opacity-80">
                  {active.region ?? "Global"} •{" "}
                  {active.subscribers
                    ? `${active.subscribers.toLocaleString()} subs`
                    : "—"}
                </div>

                <div className="mt-3 text-xs opacity-70">
                  Median views:{" "}
                  {typeof active.medianViews === "number"
                    ? active.medianViews.toLocaleString()
                    : "—"}
                  <br />
                  Average views:{" "}
                  {typeof active.averageViews === "number"
                    ? active.averageViews.toLocaleString()
                    : "—"}
                </div>

                <div className="mt-3 text-xs opacity-70">
                  Fee:{" "}
                  {typeof active.quotedFeeClient === "number"
                    ? `${active.clientCurrency ?? ""} ${active.quotedFeeClient.toLocaleString()}`
                    : "—"}{" "}
                  <br />
                  Margin:{" "}
                  {typeof active.targetMarginPct === "number"
                    ? `${active.targetMarginPct}%`
                    : "—"}
                </div>
              </>
            ) : (
              "None yet — run an analysis."
            )}
          </div>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="text-sm font-semibold">Latest result</div>
          <div className="mt-2 text-sm opacity-80">
            {data?.metrics ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="opacity-70">Median views</div>
                  <div className="font-medium">
                    {data.metrics.median_views?.toLocaleString?.() ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="opacity-70">Average views</div>
                  <div className="font-medium">
                    {data.metrics.mean_views?.toLocaleString?.() ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="opacity-70">Engagement rate</div>
                  <div className="font-medium">
                    {typeof data.metrics.engagement_rate === "number"
                      ? `${data.metrics.engagement_rate.toFixed(2)}%`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="opacity-70">Risk</div>
                  <div className="font-medium">
                    {data.metrics.risk_level ?? "—"}
                  </div>
                </div>
              </div>
            ) : (
              "Run an analysis to see metrics."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useMemo, useState } from "react";
// import { useAnalysis } from "@/context/AnalysisContext";

// type ApiChannel = {
//   channel_id: string;
//   channel_name: string;
//   subscribers: number;
//   region?: string;
//   channel_url?: string;
// };

// type ApiResponse = {
//   channel: ApiChannel;
//   videos?: Array<{
//     title: string;
//     publishedAt: string;
//     views: number;
//     likes: number;
//     comments: number;
//     duration: string;
//   }>;
//   metrics?: {
//     mean_views?: number;
//     median_views?: number;
//     engagement_rate?: number;
//     like_rate?: number;
//     comment_rate?: number;
//     volatility_ratio?: number;
//     risk_level?: string;
//   };
// };

// function safeNum(x: unknown): number | undefined {
//   return typeof x === "number" && Number.isFinite(x) ? x : undefined;
// }

// export default function AnalysePage() {
//   const { upsertAnalysis, getActive } = useAnalysis();

//   const active = getActive();

//   const [youtubeUrl, setYoutubeUrl] = useState("");
//   const [videoCount, setVideoCount] = useState(8);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [data, setData] = useState<ApiResponse | null>(null);

//   const apiBase = useMemo(() => {
//     return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
//   }, []);

//   async function runAnalysis(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     setData(null);

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

//       const createdAt = new Date().toISOString();
//       const id = `${Date.now()}`;

//       const medianViews = safeNum(json.metrics?.median_views);
//       const averageViews = safeNum(json.metrics?.mean_views);

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
//       });
//     } catch (err: any) {
//       setError(err?.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-4xl">
//       <div className="mb-6">
//         <div className="text-2xl font-semibold">Analyse</div>
//         <div className="mt-1 text-sm opacity-70">
//           Paste a YouTube channel or video link. We’ll fetch recent videos and
//           compute reliability metrics.
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
//           YouTube URL / Handle
//         </label>
//         <input
//           value={youtubeUrl}
//           onChange={(e) => setYoutubeUrl(e.target.value)}
//           placeholder="https://www.youtube.com/@ghosthlubi OR https://www.youtube.com/watch?v=..."
//           className="mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
//           style={{
//             border: "1px solid var(--border)",
//             background: "transparent",
//           }}
//         />

//         <div className="mt-4 flex flex-wrap items-end gap-3">
//           <div>
//             <label className="block text-xs font-medium opacity-80">
//               Video count
//             </label>
//             <input
//               type="number"
//               min={1}
//               max={25}
//               value={videoCount}
//               onChange={(e) => setVideoCount(Number(e.target.value))}
//               className="mt-2 w-28 rounded-xl px-3 py-2 text-sm outline-none"
//               style={{
//                 border: "1px solid var(--border)",
//                 background: "transparent",
//               }}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !youtubeUrl.trim()}
//             className="rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60"
//             style={{ background: "var(--primary)", color: "#0E1114" }}
//           >
//             {loading ? "Analysing…" : "Run analysis"}
//           </button>

//           <div className="text-xs opacity-70">
//             API: <span className="opacity-90">{apiBase}</span>
//           </div>
//         </div>

//         {error && (
//           <div
//             className="mt-4 rounded-xl p-3 text-sm"
//             style={{
//               border: "1px solid var(--border)",
//               background: "color-mix(in srgb, var(--muted) 70%, transparent)",
//             }}
//           >
//             <div className="font-medium">Error</div>
//             <div className="mt-1 opacity-80">{error}</div>
//           </div>
//         )}
//       </form>

//       <div className="mt-6 grid gap-4 md:grid-cols-2">
//         <div
//           className="rounded-2xl p-5"
//           style={{
//             border: "1px solid var(--border)",
//             background: "rgba(255,255,255,0.04)",
//             backdropFilter: "blur(10px)",
//           }}
//         >
//           <div className="text-sm font-semibold">Active creator</div>
//           <div className="mt-2 text-sm opacity-80">
//             {active ? (
//               <>
//                 <div className="font-medium">{active.channelName}</div>
//                 <div className="mt-1 opacity-80">
//                   {active.region ?? "Global"} •{" "}
//                   {active.subscribers
//                     ? `${active.subscribers.toLocaleString()} subs`
//                     : "—"}
//                 </div>
//                 <div className="mt-2 text-xs opacity-70">
//                   Median views:{" "}
//                   {typeof active.medianViews === "number"
//                     ? active.medianViews.toLocaleString()
//                     : "—"}
//                   <br />
//                   Average views:{" "}
//                   {typeof active.averageViews === "number"
//                     ? active.averageViews.toLocaleString()
//                     : "—"}
//                 </div>
//               </>
//             ) : (
//               "None yet — run an analysis."
//             )}
//           </div>
//         </div>

//         <div
//           className="rounded-2xl p-5"
//           style={{
//             border: "1px solid var(--border)",
//             background: "rgba(255,255,255,0.04)",
//             backdropFilter: "blur(10px)",
//           }}
//         >
//           <div className="text-sm font-semibold">Latest result</div>
//           <div className="mt-2 text-sm opacity-80">
//             {data?.metrics ? (
//               <div className="grid grid-cols-2 gap-3 text-xs">
//                 <div>
//                   <div className="opacity-70">Median views</div>
//                   <div className="font-medium">
//                     {data.metrics.median_views?.toLocaleString?.() ?? "—"}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="opacity-70">Average views</div>
//                   <div className="font-medium">
//                     {data.metrics.mean_views?.toLocaleString?.() ?? "—"}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="opacity-70">Engagement rate</div>
//                   <div className="font-medium">
//                     {typeof data.metrics.engagement_rate === "number"
//                       ? `${data.metrics.engagement_rate.toFixed(2)}%`
//                       : "—"}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="opacity-70">Risk</div>
//                   <div className="font-medium">
//                     {data.metrics.risk_level ?? "—"}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               "Run an analysis to see metrics."
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AnalysePage() {
//   return (
//     <div className="space-y-2">
//       <h1 className="text-2xl font-semibold">Analyse</h1>
//       <p className="text-sm opacity-80">
//         Paste a YouTube channel or video link to generate an influencer report.
//       </p>
//     </div>
//   );
// }
