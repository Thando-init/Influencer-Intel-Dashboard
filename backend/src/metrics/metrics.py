from __future__ import annotations

import statistics
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import isodate


@dataclass
class InfluencerMetrics:
    channel_name: str
    sub_count: int
    video_data: List[Dict[str, Any]]
    region: str = "Global"
    channel_url: str = ""

    def __post_init__(self) -> None:
        # Benchmarks (later can be region-based)
        self.benchmarks: Dict[str, float] = {
            "engagement_rate_percent": 3.0,
            "like_rate_percent": 2.5,
            "comment_rate_percent": 0.3,
            "loyalty_percent": 10.0,
            "cpm": 40.0,
        }

    # ---------------- CORE PERFORMANCE METRICS ----------------
    def get_performance_report(self) -> Dict[str, Any]:
        if not self.video_data:
            return {}

        # Normalize numeric fields safely
        normalized: List[Dict[str, Any]] = []
        for v in self.video_data:
            vv = dict(v)
            vv["views"] = self._to_int(v.get("views", 0))
            vv["likes"] = self._to_int(v.get("likes", 0))
            vv["comments"] = self._to_int(v.get("comments", 0))
            normalized.append(vv)

        views = [v["views"] for v in normalized]
        likes = [v["likes"] for v in normalized]
        comments = [v["comments"] for v in normalized]

        total_views = sum(views)
        total_likes = sum(likes)
        total_comments = sum(comments)

        mean_views = statistics.mean(views) if views else 0.0
        median_views = statistics.median(views) if views else 0.0

        engagement_rate_percent = (
            (total_likes + total_comments) / total_views * 100.0
            if total_views
            else 0.0
        )
        like_rate_percent = (total_likes / total_views * 100.0) if total_views else 0.0
        comment_rate_percent = (
            (total_comments / total_views * 100.0) if total_views else 0.0
        )

        # Engagement consistency (stdev of per-video engagement rate; lower = more consistent)
        per_video_engagement = [
            ((v["likes"] + v["comments"]) / v["views"] * 100.0) if v["views"] else 0.0
            for v in normalized
        ]
        engagement_consistency = (
            round(statistics.stdev(per_video_engagement), 2)
            if len(per_video_engagement) > 1
            else 0.0
        )

        # Loyalty: median views as % of subs
        loyalty_percent = (
            (median_views / self.sub_count * 100.0) if self.sub_count else 0.0
        )

        # Views per sub: mean views as % of subs (needed by benchmarks)
        views_per_sub_percent = (
            (mean_views / self.sub_count * 100.0) if self.sub_count else 0.0
        )

        # Risk classification via volatility ratio
        volatility_ratio = (mean_views / median_views) if median_views else 0.0
        if volatility_ratio > 1.5:
            risk_level = "High (Viral Reliant)"
        elif volatility_ratio > 1.2:
            risk_level = "Moderate"
        else:
            risk_level = "Low (Consistent)"

        # Short vs Long split
        short_views: List[int] = []
        long_views: List[int] = []
        short_count = 0
        long_count = 0

        for v in normalized:
            duration_raw = v.get("duration")
            if not duration_raw:
                continue
            try:
                duration_s = isodate.parse_duration(duration_raw).total_seconds()
            except (TypeError, ValueError, isodate.ISO8601Error):
                continue

            if duration_s < 420:  # < 7 minutes
                short_count += 1
                short_views.append(v["views"])
            else:
                long_count += 1
                long_views.append(v["views"])

        denom = max(short_count + long_count, 1)
        short_long_split = {
            "short_count": short_count,
            "long_count": long_count,
            "short_percent": round(short_count / denom * 100.0, 2),
            "short_avg_views": int(statistics.mean(short_views)) if short_views else 0,
            "long_avg_views": int(statistics.mean(long_views)) if long_views else 0,
        }

        # Velocity (views from last 7 days)
        velocity_views_7d = 0
        now = datetime.now(timezone.utc)

        for v in normalized:
            published_raw = v.get("publishedAt")
            if not published_raw:
                continue
            try:
                published = datetime.fromisoformat(published_raw.replace("Z", "+00:00"))
            except ValueError:
                continue

            if published >= now - timedelta(days=7):
                velocity_views_7d += v["views"]

        velocity_percent_7d = (
            round(velocity_views_7d / total_views * 100.0, 2) if total_views else 0.0
        )

        report: Dict[str, Any] = {
            # Channel identity (useful for DB saving + API)
            "channel_name": self.channel_name,
            "channel_url": self.channel_url,
            "sub_count": int(self.sub_count),

            # Core rollups
            "mean_views": int(mean_views),
            "median_views": int(median_views),
            "total_views": int(total_views),

            # Risk / distribution
            "risk_level": risk_level,
            "volatility_ratio": round(volatility_ratio, 2),

            # Rates (STANDARDIZED KEYS)
            "engagement_rate_percent": round(engagement_rate_percent, 2),
            "like_rate_percent": round(like_rate_percent, 2),
            "comment_rate_percent": round(comment_rate_percent, 2),

            # Consistency + loyalty + views/sub (STANDARDIZED)
            "engagement_consistency": float(engagement_consistency),
            "loyalty_percent": round(loyalty_percent, 2),
            "views_per_sub_percent": round(views_per_sub_percent, 2),

            # Format + momentum
            "short_long_split": short_long_split,
            "velocity_views_7d": int(velocity_views_7d),
            "velocity_percent_7d": float(velocity_percent_7d),

            # Benchmarks reference
            "benchmarks": self.benchmarks,

            # Convenience
            "sample_size": len(normalized),
        }

        # Include dashboard score (computed from this report)
        report["dashboard_score"] = self._dashboard_score(report)
        report["dashboard_interpretation"] = self._dashboard_interpretation(
            report["dashboard_score"]
        )

        return report

    # ---------------- MONETISATION ----------------
    def calculate_CPM(self, client_cost: float) -> float:
        total_views = sum(self._to_int(v.get("views", 0)) for v in self.video_data)
        return round(client_cost / max(total_views / 1000.0, 1.0), 2)

    def calculate_CPV(self, client_cost: float) -> float:
        total_views = sum(self._to_int(v.get("views", 0)) for v in self.video_data)
        return round(client_cost / max(float(total_views), 1.0), 4)

    def calculate_CPE(self, client_cost: float) -> float:
        total_engagements = sum(
            self._to_int(v.get("likes", 0)) + self._to_int(v.get("comments", 0))
            for v in self.video_data
        )
        return round(client_cost / max(float(total_engagements), 1.0), 4)

    def calculate_talent_cost(self, client_cost: float, agency_margin_percent: float) -> float:
        return round(client_cost * (1.0 - agency_margin_percent / 100.0), 2)

    def calculate_engagement_adjusted_CPM(self, client_cost: float) -> float:
        report = self.get_performance_report()
        base = self.benchmarks.get("engagement_rate_percent", 1.0) or 1.0
        factor = (report.get("engagement_rate_percent", 0.0) / base) if report else 1.0
        return round(self.calculate_CPM(client_cost) * float(factor), 2)

    # ---------------- DASHBOARD SCORE ----------------
    def _dashboard_score(self, report: Dict[str, Any]) -> float:
        # Defensive reads
        engagement = float(report.get("engagement_rate_percent", 0.0))
        loyalty = float(report.get("loyalty_percent", 0.0))
        consistency = float(report.get("engagement_consistency", 0.0))
        risk_level = str(report.get("risk_level", ""))

        eng_bm = float(self.benchmarks.get("engagement_rate_percent", 3.0) or 3.0)
        loy_bm = float(self.benchmarks.get("loyalty_percent", 10.0) or 10.0)

        score = (
            0.35 * min(engagement / eng_bm, 2.0) * 50.0
            + 0.25 * min(loyalty / loy_bm, 2.0) * 30.0
            + 0.2 * (100.0 - min(consistency * 10.0, 100.0))
            + 0.2 * (50.0 if risk_level == "Low (Consistent)" else 30.0)
        )
        return round(min(score, 100.0), 2)

    def _dashboard_interpretation(self, score: float) -> str:
        if score >= 80:
            return "Excellent"
        if score >= 65:
            return "Good"
        if score >= 45:
            return "Average"
        return "Weak"

    @property
    def dashboard_score(self) -> float:
        return self._dashboard_score(self.get_performance_report())

    @property
    def dashboard_interpretation(self) -> str:
        return self._dashboard_interpretation(self.dashboard_score)

    # ---------------- HELPERS ----------------
    @staticmethod
    def _to_int(val: Any, default: int = 0) -> int:
        try:
            return int(val)
        except (TypeError, ValueError):
            return default
