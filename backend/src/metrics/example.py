# src/metrics/example.py

from src.metrics.metrics import InfluencerMetrics
import os
from datetime import datetime, timedelta, timezone

# Ensure OPENAI_API_KEY is set in environment
if "OPENAI_API_KEY" not in os.environ:
    print("Warning: OPENAI_API_KEY not found in environment. AI scoring will fallback to calculated score.")

# ---------------- MOCK VIDEO DATA ----------------
video_data = [
    {
        "views": 2000,
        "likes": 175,
        "comments": 20,
        "publishedAt": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
        "duration": "PT5M30S"
    },
    {
        "views": 1800,
        "likes": 160,
        "comments": 15,
        "publishedAt": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
        "duration": "PT12M10S"
    },
    {
        "views": 2000,
        "likes": 180,
        "comments": 20,
        "publishedAt": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
        "duration": "PT7M45S"
    }
]

# ---------------- TEST INFLUENCER ----------------
influencer = InfluencerMetrics(
    channel_name="Test Channel",
    sub_count=10000,
    video_data=video_data,
    region="Global"
)

# ---------------- PERFORMANCE REPORT ----------------
report = influencer.get_performance_report()
print("=== Performance Report ===")
for key, value in report.items():
    print(f"{key}: {value}")

# ---------------- AI ANALYSIS ----------------
ai_result = influencer.get_ai_analysis()
print("\n=== AI Analysis ===")
print(ai_result)

# ---------------- DASHBOARD SCORE ----------------
print("\n=== Dashboard Score ===")
print("Dashboard Score:", influencer.dashboard_score)
print("Interpretation:", influencer.dashboard_interpretation)

# ---------------- MONETISATION EXAMPLES ----------------
client_cost = 500  # example client campaign cost
agency_margin = 20  # percent

print("\n=== Monetisation Metrics ===")
print("CPM:", influencer.calculate_CPM(client_cost))
print("CPE:", influencer.calculate_CPE(client_cost))
print("CPV:", influencer.calculate_CPV(client_cost))
print("Talent Cost:", influencer.calculate_talent_cost(client_cost, agency_margin))
print("Engagement-adjusted CPM:", influencer.calculate_engagement_adjusted_CPM(client_cost))
