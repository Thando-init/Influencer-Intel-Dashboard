import streamlit as st
import pandas as pd
import altair as alt
from datetime import datetime

from src.youtube.client import get_channel_stats, get_recent_videos
from src.metrics.metrics import InfluencerMetrics
from src.analysis.analyser import get_creator_tier

# ---------------- THEME TOGGLE ----------------
# theme = st.sidebar.radio("Theme", ["Light", "Dark"])
# if theme == "Dark":
#     alt.themes.enable("dark")
# else:
#     alt.themes.enable("light")

# st.set_page_config(page_title="Influencer Intel Dashboard", layout="wide")

# st.title("Influencer Intel Dashboard")
# st.caption("Performance • Engagement • Monetisation")

# ---------------- INPUTS ----------------
with st.sidebar:
    creator_url = st.text_input("YouTube Channel URL / Handle")
    client_cost = st.number_input("Client Cost", min_value=0.0, step=100.0)
    agency_margin = st.slider("Agency Margin (%)", 0, 50, 20)
    run = st.button("Run Analysis", type="primary")

# ---------------- RUN ----------------
if run and creator_url:
    channel = get_channel_stats(creator_url)
    videos = get_recent_videos(channel["uploads_playlist_id"], count=8)

    metrics = InfluencerMetrics(
        channel_name=channel["channel_name"],
        sub_count=channel["subscribers"],
        video_data=videos
    )

    report = metrics.get_performance_report()
    creator_tier = get_creator_tier(channel["subscribers"])

    # ---------------- SUMMARY ----------------
    st.subheader(f"{channel['channel_name']} • {creator_tier}")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Subscribers", f"{channel['subscribers']:,}")
    c2.metric("Mean Views", f"{report['mean_views']:,}")
    c3.metric("Median Views", f"{report['median_views']:,}")
    c4.metric("Dashboard Score", metrics.dashboard_score, metrics.dashboard_interpretation, help="Dashboard Score (0–100) is a composite performance index designed to give a quick, decision-ready view of a creator’s overall quality.")

    # ---------------- DASHBOARD SCORE EXPLANATION ------------
    with st.expander("What is the Dashboard Score?"):
        st.markdown(
            """
            **Dashboard Score (0–100)** is a composite performance index designed to give a 
            quick, decision-ready view of a creator’s overall quality.

            It combines:
            
            • Engagement rate vs industry benchmarks  
            • Audience loyalty (views-to-subscriber ratio)  
            • Engagement consistency (volatility control)  
            • Content risk profile (viral vs stable performance)

            **Higher scores indicate creators who are more reliable, brand-safe, and commercially scalable.**
            """
        )


    # ---------------- DATA ----------------
    df = pd.DataFrame(videos)
    df["published_date"] = pd.to_datetime(df["publishedAt"])
    df["engagement"] = df["likes"] + df["comments"]

    # ---------------- AVRG vs MEDIAN VIEWS & VOLATILITY ----------------
    st.subheader("Average vs Median Views Comparison")

    col1, col2, col3 = st.columns(3)

    col1.metric(
        "Average Views",
        f"{report['mean_views']:,}",
        help="Average views across recent uploads. Can be inflated by viral videos."
    )

    col2.metric(
        "Median Views",
        f"{report['median_views']:,}",
        help="Typical views per video. More reliable indicator of baseline performance."
    )

    col3.metric(
        "Volatility & Risk",
        report["risk_level"],
        help=f"Volatility Ratio: {report['volatility_ratio']} (Higher = less predictable)"
    )

    avg_med_df = pd.DataFrame({
        "Metric": ["Average Views", "Median Views"],
        "Views": [report["mean_views"], report["median_views"]]
    })

    avg_med_chart = (
        alt.Chart(avg_med_df)
        .mark_bar(cornerRadiusTopLeft=6, cornerRadiusTopRight=6)
        .encode(
            x=alt.X("Metric:N", title=None),
            y=alt.Y(
                "Views:Q",
                title="Views",
                scale=alt.Scale(domain=[0, max(avg_med_df["Views"]) * 1.2])  # 🔒 lock scale
            ),
            color=alt.Color(
                "Metric:N",
                scale=alt.Scale(
                    domain=["Average Views", "Median Views"],
                    range=["#4F81BD", "#C0504D"]  # blue vs red
                ),
                legend=None
            ),
            tooltip=[
                alt.Tooltip("Metric:N"),
                alt.Tooltip("Views:Q", format=",")
            ]
        )
        .properties(height=300)
    )

    st.altair_chart(avg_med_chart, use_container_width=True)

    st.caption(
        "Average views can be inflated by viral outliers, while median views reflect typical performance. "
        "A large gap suggests volatility."
        "Brands typically value creators with strong median performance."
    )

    # st.subheader("View Performance Summary")

    # col1, col2, col3 = st.columns(3)

    # col1.metric(
    #     "Average Views",
    #     f"{report['mean_views']:,}",
    #     help="Average views across recent uploads. Can be inflated by viral videos."
    # )

    # col2.metric(
    #     "Median Views",
    #     f"{report['median_views']:,}",
    #     help="Typical views per video. More reliable indicator of baseline performance."
    # )

    # col3.metric(
    #     "Volatility & Risk",
    #     report["risk_level"],
    #     help=f"Volatility Ratio: {report['volatility_ratio']} (Higher = less predictable)"
    # )

    # avg_median_df = pd.DataFrame({
    # "Metric": ["Average Views", "Median Views"],
    # "Views": [report["mean_views"], report["median_views"]]
    # })

    # avg_median_chart = (
    #     alt.Chart(avg_median_df)
    #     .mark_bar(cornerRadiusTopLeft=6, cornerRadiusTopRight=6)
    #     .encode(
    #         x=alt.X("Metric:N", title=""),
    #         y=alt.Y("Views:Q", title="Views"),
    #         tooltip=["Metric", "Views"]
    #     )
    #     .properties(height=250)
    # )

    # st.altair_chart(avg_median_chart, use_container_width=True)

    # st.caption(
    #     """
    #     A large difference between average and median views indicates volatility.
    #     Brands typically value creators with strong median performance.
    #     """
    # )



    # ---------------- PERFORMANCE CHART ----------------
    st.subheader("Views per Recent Video")

    st.subheader("Performance & Velocity")
    st.caption(
        """
        This section evaluates how consistently the creator performs over time 
        and whether recent content is gaining momentum. 
        It helps identify if performance is stable, declining, or driven by short-term spikes.
        """
    )

    perf_chart = (
        alt.Chart(df)
        .mark_line(point=True)
        .encode(
            x="published_date:T",
            y="views:Q",
            tooltip=["title", "views"]
        )
        .properties(height=300)
    )
    st.altair_chart(perf_chart, use_container_width=True)

    st.markdown(
        f"""
        **Risk:** {report['risk_level']}  
        **Velocity (7d):** {report['velocity_views_7d']:,} views  
        **Benchmark Velocity Contribution:** High-performing creators ≥ 25%
        """
    )


    # ---------------- VIDEO VIEWS CHART ---------------------
    st.subheader("Views per Recent Video")

    views_df = df.copy()
    views_df["views"] = pd.to_numeric(views_df["views"], errors="coerce")
    views_df["published_date"] = pd.to_datetime(views_df["published_date"], errors="coerce")
    views_df = views_df.dropna(subset=["views", "title", "published_date"])

    views_df = (
        views_df.sort_values("published_date", ascending=True)
        .tail(8)
    )

    views_df["date_label"] = views_df["published_date"].dt.strftime("%d %b %Y")

    views_chart = (
        alt.Chart(views_df)
        .mark_bar(size=42)
        .encode(
            x=alt.X("title:N", sort=None, title="Video"),
            y=alt.Y("views:Q", title="Views", axis=alt.Axis(format="~s")),
            tooltip=[
                alt.Tooltip("title:N", title="Video"),
                alt.Tooltip("date_label:N", title="Published"),
                alt.Tooltip("views:Q", title="Views", format=",")
            ],
            color=alt.value("#4F46E5")
        )
        .properties(height=360)
        .interactive()
    )

    st.altair_chart(views_chart, use_container_width=True)

    
    # ---------------- VIEW DISTRIBUTION ----------------
    st.subheader("View Distribution (Consistency vs Virality)")
    st.caption(
        """
        This chart shows how views are distributed across recent videos.
        It helps identify whether performance is consistent or driven by a few viral outliers.
        """
    )

    # ----------------------------
    # Data preparation
    # ----------------------------
    views_df = df.copy()

    views_df["views"] = pd.to_numeric(views_df["views"], errors="coerce")
    views_df = views_df.dropna(subset=["views"])

    # Safety: ensure at least 2 data points
    if len(views_df) < 2:
        st.info("Not enough data to analyse view distribution.")
    else:
        avg_views = views_df["views"].mean()
        median_views = views_df["views"].median()

        skew_ratio = avg_views / median_views if median_views else 0
        viral_skew = skew_ratio >= 1.3

        # ----------------------------
        # Histogram
        # ----------------------------
        hist = (
            alt.Chart(views_df)
            .mark_bar(
                cornerRadiusTopLeft=3,
                cornerRadiusTopRight=3,
                color="#6366F1"
            )
            .encode(
                x=alt.X(
                    "views:Q",
                    bin=alt.Bin(maxbins=20),
                    title="Views per Video",
                    axis=alt.Axis(format="~s")
                ),
                y=alt.Y(
                    "count():Q",
                    title="Number of Videos"
                ),
                tooltip=[
                    alt.Tooltip("count():Q", title="Videos in Range")
                ]
            )
            .properties(height=280)
            .interactive()  # zoom & pan like engagement chart
        )

        # ----------------------------
        # Median reference line
        # ----------------------------
        median_line = (
            alt.Chart(pd.DataFrame({"median": [median_views]}))
            .mark_rule(
                color="#DC2626",
                strokeDash=[4, 4],
                strokeWidth=2
            )
            .encode(
                x="median:Q",
                tooltip=[
                    alt.Tooltip("median:Q", title="Median Views", format=",")
                ]
            )
        )

        st.altair_chart(hist + median_line, use_container_width=True)

        # ----------------------------
        # Interpretation
        # ----------------------------
        if viral_skew:
            st.warning(
                f"""
                📈 **Viral-driven performance detected**

                • **Median views:** {median_views:,.0f}  
                • **Average views:** {avg_views:,.0f}

                Most videos cluster around the median, while a small number of
                breakout videos inflate the average.

                **What this means for brands:**  
                Reach is possible, but results are less predictable and depend
                on viral momentum rather than consistent delivery.
                """
            )
        else:
            st.info(
                f"""
                ✅ **Consistent performance profile**

                • **Median views:** {median_views:,.0f}  
                • **Average views:** {avg_views:,.0f}

                Views are evenly distributed, meaning most videos perform
                close to the average.

                **What this means for brands:**  
                More reliable reach, lower risk, and predictable outcomes.
                """
            )

        st.caption(
            "Each bar represents how many videos fall into a specific view range. "
            "The red dashed line shows the median — where typical performance sits."
        )

    
    # # ---------------- VIDEO VIEWS CHART ---------------------
    # st.subheader("Views per Recent Video")
    # st.caption(
    #     "Bars show views for the 8 most recent videos (oldest → newest). "
    #     "Green dashed line = average views, red dashed line = median views. "
    #     "Shaded area indicates viral skew when average ≫ median."
    # )

    # # ----------------------------
    # # Data preparation
    # # ----------------------------
    # views_df = df.copy()
    # views_df["views"] = pd.to_numeric(views_df["views"], errors="coerce")
    # views_df["published_date"] = pd.to_datetime(views_df["published_date"], errors="coerce")

    # views_df = views_df.dropna(subset=["views", "title", "published_date"])
    # views_df = views_df.sort_values("published_date", ascending=True).tail(8).reset_index(drop=True)

    # # Add helper fields
    # views_df["date_label"] = views_df["published_date"].dt.strftime("%d %b %Y")
    # views_df["x_order"] = views_df.index.astype(str)

    # # Metrics
    # avg_views = views_df["views"].mean()
    # median_views = views_df["views"].median()

    # # Viral skew detection
    # skew_ratio = avg_views / median_views if median_views else 0
    # viral_skew = skew_ratio >= 1.3

    # # ----------------------------
    # # Bars
    # # ----------------------------
    # bars = (
    #     alt.Chart(views_df)
    #     .mark_bar(size=40, cornerRadiusTopLeft=4, cornerRadiusTopRight=4)
    #     .encode(
    #         x=alt.X(
    #             "x_order:N",
    #             title="Upload Order (Oldest → Newest)",
    #             axis=alt.Axis(labels=False, ticks=False, labelAngle=0)
    #         ),
    #         y=alt.Y(
    #             "views:Q",
    #             title="Views",
    #             axis=alt.Axis(format="~s")
    #         ),
    #         tooltip=[
    #             alt.Tooltip("title:N", title="Video"),
    #             alt.Tooltip("date_label:N", title="Published"),
    #             alt.Tooltip("views:Q", title="Views", format=",")
    #         ],
    #         color=alt.value("#4F46E5")
    #     )
    # )

    # # ----------------------------
    # # Avg & Median lines
    # # ----------------------------
    # avg_line = (
    #     alt.Chart(pd.DataFrame({"value": [avg_views]}))
    #     .mark_rule(strokeDash=[6,4], color="#16A34A", strokeWidth=2)
    #     .encode(
    #         y="value:Q",
    #         tooltip=[alt.Tooltip("value:Q", format=",.0f", title="Average Views")]
    #     )
    # )

    # median_line = (
    #     alt.Chart(pd.DataFrame({"value": [median_views]}))
    #     .mark_rule(strokeDash=[2,2], color="#DC2626", strokeWidth=2)
    #     .encode(
    #         y="value:Q",
    #         tooltip=[alt.Tooltip("value:Q", format=",.0f", title="Median Views")]
    #     )
    # )

    # # ----------------------------
    # # Viral skew shading
    # # ----------------------------
    # if viral_skew:
    #     skew_shade = (
    #         alt.Chart(pd.DataFrame({"y1": [median_views], "y2": [avg_views]}))
    #         .mark_rect(opacity=0.12, color="#F59E0B")
    #         .encode(y="y1:Q", y2="y2:Q") #, x=alt.value(0), x2=alt.value(len(views_df))
    #     )
    # else:
    #     skew_shade = alt.Chart(pd.DataFrame()).mark_rect()

    # # ----------------------------
    # # Combine chart
    # # ----------------------------
    # views_chart = (
    #     (skew_shade + bars + avg_line + median_line)
    #     .properties(height=380)
    #     .interactive(bind_y=True)  # zoom & scroll on Y-axis
    #     .configure_axis(
    #         grid=True,
    #         gridOpacity=0.15,
    #         labelFontSize=11,
    #         titleFontSize=12
    #     )
    # )

    # st.altair_chart(views_chart, use_container_width=True)

    # # ----------------------------
    # # Explanation / Viral badge
    # # ----------------------------
    # if viral_skew:
    #     st.warning(
    #         "📈 **Viral skew detected** — Average views are significantly higher than median views. "
    #         "This suggests performance is driven by a few breakout videos."
    #     )
    # else:
    #     st.info(
    #         "Performance is evenly distributed — average and median views are closely aligned, "
    #         "indicating consistent audience response."
    #     )

    # st.caption(
    #     "Hover over bars to see video title, publish date, and views. "
    #     "Use the mouse wheel or trackpad to zoom/scroll vertically. "
    #     "Bars are spaced evenly from oldest → newest upload."
    # )


    # ---------------- LIKES vs COMMENTS CHART ---------------
    st.subheader("Engagement Breakdown")

    engagement_df = df.melt(
        id_vars=["title", "published_date"],
        value_vars=["likes", "comments"],
        var_name="Engagement Type",
        value_name="Count"
    )

    engagement_chart = (
        alt.Chart(engagement_df)
        .mark_bar()
        .encode(
            x=alt.X("title:N", title="Video"),
            y=alt.Y("Count:Q", title="Engagement"),
            color=alt.Color(
                "Engagement Type:N",
                sort=["likes", "comments"]
            ),
            order=alt.Order(
                "Engagement Type:N",
                sort="ascending"
            ),
            tooltip=[
                "Engagement Type",
                "Count",
                alt.Tooltip("published_date:T", title="Published")
            ]
        )
        .properties(height=350)
        .interactive()
    )

    st.altair_chart(engagement_chart, use_container_width=True)

    st.caption(
    """
    **How to read this chart:**  
    • Likes represent passive approval  
    • Comments indicate deeper engagement and emotional response  

    **Balanced ratio:**  
    A healthy creator typically shows comments at 3–10% of likes.  
    Very low comments may suggest passive or inflated engagement.  
    Exceptionally high comments can indicate controversy or polarising content.
    """
    )


    # ---------------- SHORT vs LONG ANALYSIS ----------------
    st.subheader("Short vs Long Content Mix")

    sl = report["short_long_split"]

    sl_df = pd.DataFrame({
        "Format": ["Short-form (<7 min)", "Long-form (≥7 min)"],
        "Count": [sl["short_count"], sl["long_count"]]
    })

    pie_chart = (
        alt.Chart(sl_df)
        .mark_arc(innerRadius=40)
        .encode(
            theta=alt.Theta("Count:Q"),
            color=alt.Color("Format:N", legend=alt.Legend(title="Content Type")),
            tooltip=["Format", "Count"]
        )
        .properties(height=300)
    )

    st.altair_chart(pie_chart, use_container_width=True)

    st.caption(
        f"""
        Short-form accounts for **{sl['short_percent']}%** of recent content.
        Short-form typically boosts reach, while long-form drives depth and retention.
        """
    )

    # st.subheader("Short vs Long Content Mix")

    # sl = report["short_long_split"]
    # sl_df = pd.DataFrame({
    #     "Format": ["Short-form", "Long-form"],
    #     "Count": [sl["short_count"], sl["long_count"]],
    #     "Avg Views": [sl["short_avg_views"], sl["long_avg_views"]],
    # })

    # st.altair_chart(
    #     alt.Chart(sl_df)
    #     .mark_bar()
    #     .encode(
    #         x="Format:N",
    #         y="Count:Q",
    #         color="Format:N",
    #         tooltip=["Count", "Avg Views"]
    #     ),
    #     use_container_width=True
    # )

    # conclusion = (
    #     "Short-form dominates reach but long-form drives depth."
    #     if sl["short_count"] > sl["long_count"]
    #     else "Long-form content drives sustained audience value."
    # )

    # st.caption(conclusion)

    # ---------------- MONETISATION ----------------
    st.subheader("Monetisation Metrics & Benchmarks")

    # Industry benchmarks (SA / emerging market averages)
    benchmarks = {
        "CPM": "R50–R150 (YouTube SA average)",
        "CPV": "R0.05–R0.30 per view",
        "CPE": "R1.00–R5.00 per engagement",
        "Engagement Adjusted CPM": "Below standard CPM indicates strong value"
    }

    total_views = sum(v["views"] for v in videos)
    total_engagements = sum(v["likes"] + v["comments"] for v in videos)

    cpm = metrics.calculate_CPM(client_cost)
    cpv = round(client_cost / max(total_views, 1), 4)
    cpe = round(client_cost / max(total_engagements, 1), 2)
    eng_adj_cpm = metrics.calculate_engagement_adjusted_CPM(client_cost)
    talent_cost = metrics.calculate_talent_cost(client_cost, agency_margin)

    # --- CPM ---
    st.markdown("### CPM — Cost per 1,000 Views")
    st.write(
        f"""
        **Result:** R{cpm}  
        **Industry Benchmark:** {benchmarks['CPM']}

        **What this means:**  
        CPM measures how much a brand pays to reach 1,000 viewers.  
        Lower CPM = more cost-efficient reach.

        **Interpretation:**  
        {"This creator is cost-efficient relative to market averages." if cpm < 150 else "This creator is priced above average and should justify cost through engagement or niche value."}
        """
    )

    # --- CPV ---
    st.markdown("### CPV — Cost per View")
    st.write(
        f"""
        **Result:** R{cpv}  
        **Industry Benchmark:** {benchmarks['CPV']}

        **What this means:**  
        CPV shows the cost of each individual view generated.

        **Interpretation:**  
        {"Strong value per view." if cpv <= 0.30 else "Higher cost per view — brand should assess targeting or audience relevance."}
        """
    )

    # --- CPE ---
    st.markdown("### CPE — Cost per Engagement")
    st.write(
        f"""
        **Result:** R{cpe}  
        **Industry Benchmark:** {benchmarks['CPE']}

        **What this means:**  
        CPE measures how much a brand pays for each like or comment.
        This is critical for campaigns focused on interaction and brand recall.

        **Interpretation:**  
        {"Efficient engagement generation." if cpe <= 5 else "Engagement is relatively expensive — may suit awareness more than interaction campaigns."}
        """
    )

    # --- Engagement-Adjusted CPM ---
    st.markdown("### Engagement-Adjusted CPM")
    st.write(
        f"""
        **Result:** R{eng_adj_cpm}  
        **Benchmark Guidance:** {benchmarks['Engagement Adjusted CPM']}

        **What this means:**  
        This adjusts CPM based on how actively viewers engage with content.

        **Interpretation:**  
        {"High engagement strengthens the value of impressions delivered." if eng_adj_cpm < cpm else "Engagement does not significantly enhance impression value."}
        """
    )

    # --- Talent Cost ---
    st.markdown("### Talent Cost (After Agency Margin)")
    st.write(
        f"""
        **Result:** R{talent_cost}

        **What this means:**  
        This is the estimated payout to the creator after agency margin.

        **Why it matters:**  
        Helps agencies evaluate margin sustainability and creator fairness.
        """
    )




# import streamlit as st
# import pandas as pd
# import altair as alt
# from datetime import datetime
# 

# from src.youtube.client import get_channel_stats, get_recent_videos
# from src.metrics.metrics import InfluencerMetrics
# from src.analysis.analyser import build_analysis, get_creator_tier

# # ---------------- STREAMLIT CONFIG ----------------
# st.set_page_config(
#     page_title="Influencer Intel Dashboard",
#     layout="wide"
# )

# st.title("Influencer Intel Dashboard")
# st.caption("Data-driven influencer performance, engagement & monetisation analysis")

# # ---------------- SIDEBAR INPUTS ----------------
# with st.sidebar:
#     st.header("Channel Input")
#     creator_url = st.text_input("YouTube Channel URL or Handle", placeholder="https://youtube.com/@creator")

#     st.divider()
#     st.header("Campaign Inputs")
#     client_cost = st.number_input("Client Cost", min_value=0.0, step=100.0)
#     agency_margin = st.slider("Agency Margin (%)", min_value=0, max_value=50, value=20)
#     run_btn = st.button("Run Analysis", type="primary")

# # ---------------- MAIN LOGIC ----------------
# if run_btn and creator_url:
#     with st.spinner("Fetching YouTube data..."):
#         channel = get_channel_stats(creator_url)
#         if not channel:
#             st.error("Could not fetch channel data.")
#             st.stop()

#         videos = get_recent_videos(channel["uploads_playlist_id"], count=8)
#         if not videos:
#             st.error("No recent videos found.")
#             st.stop()

#     metrics = InfluencerMetrics(
#         channel_name=channel["channel_name"],
#         sub_count=channel["subscribers"],
#         video_data=videos,
#         region=channel["region"]
#     )

#     report = metrics.get_performance_report()
#     talent_cost = metrics.calculate_talent_cost(client_cost, agency_margin)

#     # ---------------- ANALYSIS ----------------
#     analysis = build_analysis(metrics)
#     creator_tier = get_creator_tier(metrics.sub_count)

#     # ---------------- TOP SUMMARY ----------------
#     st.subheader(f"{channel['channel_name']} ({creator_tier})")
#     col1, col2, col3, col4 = st.columns(4)
#     col1.metric("Subscribers", f"{channel['subscribers']:,}")
#     col2.metric("Average Views (8 videos)", f"{report['mean_views']:,}")
#     col3.metric("Median Views", f"{report['median_views']:,}")
#     col4.metric("Dashboard Score", metrics.dashboard_score, metrics.dashboard_interpretation)

#     # ---------------- DATAFRAME ----------------
#     df = pd.DataFrame(videos)
#     df["published_date"] = pd.to_datetime(df["publishedAt"])
#     df["label"] = df["title"] + " (" + df["published_date"].dt.strftime("%Y-%m-%d") + ")"

#     # ---------------- VIEWS BAR CHART ----------------
#     st.subheader("Views per Recent Video")
#     views_chart = (
#         alt.Chart(df)
#         .mark_bar()
#         .encode(
#             x=alt.X("label:N", sort="-y", title="Video"),
#             y=alt.Y("views:Q", title="Views"),
#             tooltip=["title", "views", alt.Tooltip("published_date:T", title="Date")]
#         )
#         .properties(height=350)
#     )
#     st.altair_chart(views_chart, use_container_width=True)
#     st.caption("This chart shows views for the creator’s most recent 8 uploads.")

#     # ---------------- ENGAGEMENT CHART ----------------
#     st.subheader("Engagement Breakdown")
#     engagement_df = df.melt(
#         id_vars=["label", "published_date"],
#         value_vars=["likes", "comments"],
#         var_name="Type",
#         value_name="Count"
#     )

#     engagement_chart = (
#         alt.Chart(engagement_df)
#         .mark_bar()
#         .encode(
#             x=alt.X("label:N", title="Video"),
#             y=alt.Y("Count:Q", title="Engagement"),
#             color="Type:N",
#             order=alt.Order('Type', sort='ascending'),  # comments below likes
#             tooltip=["label", "Type", "Count", alt.Tooltip("published_date:T", title="Date")]
#         )
#         .properties(height=350)
#     )
#     st.altair_chart(engagement_chart, use_container_width=True)
#     st.caption("Likes and comments per video. Moderate comment-to-like ratio → normal engagement.")

#     # ---------------- SHORTS VS LONG FORM ----------------
#     st.subheader("Content Format Mix")
#     sl_df = pd.DataFrame({
#         "Format": ["Short-form (<7 min)", "Long-form (≥7 min)"],
#         "Count": [report["short_long_split"]["short_form"], report["short_long_split"]["long_form"]]
#     })
#     format_chart = (
#         alt.Chart(sl_df)
#         .mark_arc()
#         .encode(
#             theta="Count:Q",
#             color="Format:N",
#             tooltip=["Format", "Count"]
#         )
#         .properties(height=300)
#     )
#     st.altair_chart(format_chart, use_container_width=True)
#     st.caption("Short-form skew may inflate views but reduce depth.")

#     # ---------------- PERFORMANCE ANALYSIS ----------------
#     st.subheader("Performance Analysis")
#     dist = analysis["views_distribution"]
#     eng = analysis["engagement"]
#     aud = analysis["audience_loyalty"]
#     risk = analysis["risk"]

#     st.markdown(f"**View Distribution:** {dist['type']}  \n{dist['explanation']}")
#     st.markdown(f"**Engagement Rate:** {eng['rate']}%  \nBenchmark: {eng['benchmark_position']}")
#     st.markdown(f"**Audience Loyalty:** {aud['loyalty_percent']}%  \nBenchmark: {aud['benchmark_position']}")
#     st.markdown(f"**Risk Level:** {risk['risk_level']}")

#     # ---------------- MONETISATION ----------------
#     st.subheader("Monetisation Metrics")
#     col1, col2, col3, col4 = st.columns(4)
#     col1.metric("Client Cost", f"{client_cost:,.2f}")
#     col2.metric("Talent Cost", f"{talent_cost:,.2f}")
#     col3.metric("CPM", metrics.calculate_CPM(client_cost))
#     col4.metric("Engagement-Adjusted CPM", metrics.calculate_engagement_adjusted_CPM(client_cost))

# 

#     # ---------------- EXPORT REPORT ----------------
#     st.subheader("Export Dashboard Report")
#     report_export = {
#         "channel": channel,
#         "creator_tier": creator_tier,
#         "metrics": report,
#         "analysis": analysis,
#         "monetisation": {
#             "client_cost": client_cost,
#             "talent_cost": talent_cost,
#             "CPM": metrics.calculate_CPM(client_cost),
#             "engagement_adjusted_CPM": metrics.calculate_engagement_adjusted_CPM(client_cost)
#         },

#     }
#     st.download_button(
#         label="Download Report as JSON",
#         data=json.dumps(report_export, indent=2),
#         file_name=f"{channel['channel_name']}_dashboard_report.json",
#         mime="application/json"
#     )

# else:
#     st.info("Enter a YouTube channel and campaign details to begin.")





