from __future__ import annotations

from typing import Any, Dict

from src.youtube.client import get_channel_stats, get_recent_videos, get_live_streams
from src.metrics.metrics import InfluencerMetrics
from src.analysis.analyser import build_analysis


def run_youtube_analysis(youtube_input: str, video_count: int = 8) -> Dict[str, Any]:
    """
    End-to-end orchestrator for the YouTube analysis MVP.

    Input:
        youtube_input: channel URL / handle / channel ID / video URL
        video_count: number of recent uploads to analyze

    Output (JSON-friendly):
        {
          "channel": {...},
          "videos": [...],
          "metrics_report": {...},
          "analysis": {...}
        }
    """
    channel = get_channel_stats(youtube_input)
    if not channel:
        raise ValueError("Could not resolve a YouTube channel from the provided input.")

    videos = get_recent_videos(channel.get("uploads_playlist_id", ""), count=video_count)
    live_streams = get_live_streams(channel.get("uploads_playlist_id", ""), count=25)
    
    # Debug: Log videos being analyzed
    print(f"\n[ANALYSIS DEBUG] Analyzing {len(videos)} videos for {channel.get('channel_name', 'Unknown')}")
    for i, v in enumerate(videos, 1):
        print(f"  {i}. {v.get('title', 'Unknown')[:50]} - {v.get('views', 0):,} views")

    # Metrics layer for regular videos
    metrics_obj = InfluencerMetrics(
        channel_name=channel.get("channel_name", ""),
        sub_count=int(channel.get("subscribers", 0)),
        video_data=videos,
        region=channel.get("region", "Global"),
        channel_url=channel.get("channel_url", ""),
    )
    report = metrics_obj.get_performance_report()
    if not report:
        raise ValueError("No video data returned for this channel (or playlist is empty).")
    
    # Debug: Log calculated metrics
    print(f"\n[METRICS DEBUG] Calculated Results:")
    print(f"  Median Views: {report.get('median_views', 0):,}")
    print(f"  Average Views: {report.get('mean_views', 0):,}")
    print(f"  Sample Size: {report.get('sample_size', 0)} videos\n")

    # Analysis layer (benchmarks + tiering)
    analysis = build_analysis(report)

    # Calculate live stream metrics if available
    live_metrics = None
    if live_streams:
        live_metrics_obj = InfluencerMetrics(
            channel_name=channel.get("channel_name", ""),
            sub_count=int(channel.get("subscribers", 0)),
            video_data=live_streams,
            region=channel.get("region", "Global"),
            channel_url=channel.get("channel_url", ""),
        )
        live_report = live_metrics_obj.get_performance_report()
        if live_report:
            live_metrics = {
                "mean_views": live_report.get("mean_views"),
                "median_views": live_report.get("median_views"),
                "engagement_rate": live_report.get("engagement_rate_percent"),
                "like_rate": live_report.get("like_rate_percent"),
                "comment_rate": live_report.get("comment_rate_percent"),
                "total_streams": len(live_streams),
            }

    # Map backend metrics to frontend expected format
    metrics = {
        "mean_views": report.get("mean_views"),
        "median_views": report.get("median_views"),
        "engagement_rate": report.get("engagement_rate_percent"),
        "like_rate": report.get("like_rate_percent"),
        "comment_rate": report.get("comment_rate_percent"),
        "volatility_ratio": report.get("volatility_ratio"),
        "risk_level": report.get("risk_level"),
    }

    result = {
        "channel": {
            "channel_id": channel.get("channel_id", ""),
            "channel_name": channel.get("channel_name", ""),
            "subscribers": int(channel.get("subscribers", 0)),
            "region": channel.get("region", "Global"),
            "channel_url": channel.get("channel_url", ""),
            "uploads_playlist_id": channel.get("uploads_playlist_id", ""),
        },
        "videos": videos,                 # raw list for frontend charting
        "metrics": metrics,               # frontend-compatible metrics
        "metrics_report": report,         # full computed rollups (for advanced use)
        "analysis": analysis,             # benchmark comparisons + tiering
    }

    # Add live stream data if available
    if live_streams:
        result["live_streams"] = live_streams
        result["live_metrics"] = live_metrics

    return result
