"""
Fetches YouTube channel and video data via YouTube Data API v3.
"""

from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .parser import extract_identifier

load_dotenv()


def _get_youtube_client():
    """
    Lazy-init the YouTube client so importing this module never crashes the app.
    """
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError(
            "YOUTUBE_API_KEY not found. Add it to your environment (.env / host env vars)."
        )
    return build("youtube", "v3", developerKey=api_key)


def _resolve_channel_id_from_video_id(youtube, video_id: str) -> Optional[str]:
    """
    Given a YouTube video ID, return the owning channelId.
    """
    if not video_id:
        return None
    try:
        resp = youtube.videos().list(part="snippet", id=video_id).execute()
        items = resp.get("items", [])
        if not items:
            return None
        snippet = items[0].get("snippet", {})
        return snippet.get("channelId")
    except HttpError as e:
        print(f"[YouTube API HttpError] {e}")
        return None
    except Exception as e:
        print(f"[YouTube API Error] {e}")
        return None


def _resolve_channel_id_from_vanity(youtube, query: str) -> Optional[str]:
    """
    Best-effort resolution for /c/ and /user/ inputs or custom names.
    Uses YouTube search API to find the most relevant channel.
    """
    if not query:
        return None
    try:
        resp = (
            youtube.search()
            .list(part="snippet", q=query, type="channel", maxResults=1)
            .execute()
        )
        items = resp.get("items", [])
        if not items:
            return None
        return items[0].get("snippet", {}).get("channelId")
    except HttpError as e:
        print(f"[YouTube API HttpError] {e}")
        return None
    except Exception as e:
        print(f"[YouTube API Error] {e}")
        return None


def get_channel_stats(channel_input: str) -> Optional[Dict[str, Any]]:
    """
    Resolves a channel input (URL / handle / channel ID / video link) to stats + uploads playlist.

    Returns:
    {
        "channel_id": str,
        "channel_name": str,
        "subscribers": int,
        "region": str,
        "uploads_playlist_id": str,
        "channel_url": str
    }
    """
    identifier, id_type = extract_identifier(channel_input)
    youtube = _get_youtube_client()

    try:
        # Resolve to a channel ID when needed
        channel_id: Optional[str] = None
        channel_url: str = ""

        if id_type == "handle":
            request = youtube.channels().list(
                part="snippet,statistics,contentDetails",
                forHandle=identifier,
            )
            channel_url = f"https://www.youtube.com/@{identifier.lstrip('@')}"

        elif id_type == "channel_id":
            channel_id = identifier
            request = youtube.channels().list(
                part="snippet,statistics,contentDetails",
                id=channel_id,
            )
            channel_url = f"https://www.youtube.com/channel/{channel_id}"

        elif id_type == "video_id":
            channel_id = _resolve_channel_id_from_video_id(youtube, identifier)
            if not channel_id:
                return None
            request = youtube.channels().list(
                part="snippet,statistics,contentDetails",
                id=channel_id,
            )
            channel_url = f"https://www.youtube.com/channel/{channel_id}"

        elif id_type == "vanity":
            channel_id = _resolve_channel_id_from_vanity(youtube, identifier)
            if not channel_id:
                return None
            request = youtube.channels().list(
                part="snippet,statistics,contentDetails",
                id=channel_id,
            )
            channel_url = f"https://www.youtube.com/channel/{channel_id}"

        else:
            # Backward-compatible fallback
            request = youtube.channels().list(
                part="snippet,statistics,contentDetails",
                id=identifier,
            )
            channel_url = f"https://www.youtube.com/channel/{identifier}"

        response = request.execute()
        items = response.get("items", [])
        if not items:
            return None

        item = items[0]
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})
        content_details = item.get("contentDetails", {})

        resolved_channel_id = item.get("id") or channel_id or identifier
        channel_name = snippet.get("title", "")
        subs = int(stats.get("subscriberCount", 0))
        region = snippet.get("country", "Global")
        uploads_playlist_id = (
            content_details.get("relatedPlaylists", {}).get("uploads", "")
        )

        # If channel_url wasn't constructed above (rare), default now
        if not channel_url:
            channel_url = f"https://www.youtube.com/channel/{resolved_channel_id}"

        return {
            "channel_id": resolved_channel_id,
            "channel_name": channel_name,
            "subscribers": subs,
            "region": region,
            "uploads_playlist_id": uploads_playlist_id,
            "channel_url": channel_url,
        }

    except HttpError as e:
        print(f"[YouTube API HttpError] {e}")
        return None
    except Exception as e:
        print(f"[YouTube API Error] {e}")
        return None


def get_recent_videos(playlist_id: str, count: int = 8) -> List[Dict[str, Any]]:
    """
    Returns the most recent `count` regular videos (excluding live streams).

    Each item:
    {
        "title": str,
        "publishedAt": str (ISO),
        "views": int,
        "likes": int,
        "comments": int,
        "duration": str (ISO 8601 duration)
    }
    """
    youtube = _get_youtube_client()

    if not playlist_id:
        return []

    try:
        playlist_request = youtube.playlistItems().list(
            part="contentDetails",
            playlistId=playlist_id,
            maxResults=25,
        )
        playlist_response = playlist_request.execute()

        video_ids = [
            item["contentDetails"]["videoId"]
            for item in playlist_response.get("items", [])
            if item.get("contentDetails", {}).get("videoId")
        ]

        if not video_ids:
            return []

        stats_request = youtube.videos().list(
            part="statistics,snippet,contentDetails",
            id=",".join(video_ids),
        )
        stats_response = stats_request.execute()

        regular_videos: List[Dict[str, Any]] = []
        live_streams: List[Dict[str, Any]] = []
        
        for item in stats_response.get("items", []):
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})
            content = item.get("contentDetails", {})

            live_broadcast_content = snippet.get("liveBroadcastContent", "none")
            published_at = snippet.get("publishedAt", "")

            video_obj = {
                "title": snippet.get("title", ""),
                "publishedAt": published_at,
                "views": int(stats.get("viewCount", 0)),
                "likes": int(stats.get("likeCount", 0)),
                "comments": int(stats.get("commentCount", 0)),
                "duration": content.get("duration", ""),
            }

            # Separate live streams from regular videos
            if live_broadcast_content in ["live", "upcoming"]:
                video_obj["isLive"] = True
                live_streams.append(video_obj)
            else:
                regular_videos.append(video_obj)

        def _parse_dt(iso_str: str) -> datetime:
            return datetime.fromisoformat(iso_str.replace("Z", "+00:00"))

        regular_videos.sort(key=lambda x: _parse_dt(x["publishedAt"]), reverse=True)

        return regular_videos[:count]

    except HttpError as e:
        print(f"[YouTube API HttpError] {e}")
        return []
    except Exception as e:
        print(f"[YouTube API Error] {e}")
        return []


def get_live_streams(playlist_id: str, count: int = 25) -> List[Dict[str, Any]]:
    """
    Returns live streams and past live broadcasts from the uploads playlist.

    Each item:
    {
        "title": str,
        "publishedAt": str (ISO),
        "views": int,
        "likes": int,
        "comments": int,
        "duration": str (ISO 8601 duration),
        "isLive": bool
    }
    """
    youtube = _get_youtube_client()

    if not playlist_id:
        return []

    try:
        playlist_request = youtube.playlistItems().list(
            part="contentDetails",
            playlistId=playlist_id,
            maxResults=50,  # Get more to find live streams
        )
        playlist_response = playlist_request.execute()

        video_ids = [
            item["contentDetails"]["videoId"]
            for item in playlist_response.get("items", [])
            if item.get("contentDetails", {}).get("videoId")
        ]

        if not video_ids:
            return []

        stats_request = youtube.videos().list(
            part="statistics,snippet,contentDetails",
            id=",".join(video_ids),
        )
        stats_response = stats_request.execute()

        live_streams: List[Dict[str, Any]] = []
        
        for item in stats_response.get("items", []):
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})
            content = item.get("contentDetails", {})

            live_broadcast_content = snippet.get("liveBroadcastContent", "none")
            
            # Only include live streams (current, upcoming, or completed)
            if live_broadcast_content != "none":
                published_at = snippet.get("publishedAt", "")
                view_count = int(stats.get("viewCount", 0))
                
                # Debug logging
                print(f"[Live Stream] {snippet.get('title', 'Unknown')[:50]}")
                print(f"  Status: {live_broadcast_content}")
                print(f"  Views: {view_count}")
                print(f"  Stats available: {list(stats.keys())}")
                
                live_streams.append({
                    "title": snippet.get("title", ""),
                    "publishedAt": published_at,
                    "views": view_count,
                    "likes": int(stats.get("likeCount", 0)),
                    "comments": int(stats.get("commentCount", 0)),
                    "duration": content.get("duration", ""),
                    "isLive": live_broadcast_content in ["live", "upcoming"],
                })

        def _parse_dt(iso_str: str) -> datetime:
            return datetime.fromisoformat(iso_str.replace("Z", "+00:00"))

        live_streams.sort(key=lambda x: _parse_dt(x["publishedAt"]), reverse=True)

        return live_streams[:count]

    except HttpError as e:
        print(f"[YouTube API HttpError] {e}")
        return []
    except Exception as e:
        print(f"[YouTube API Error] {e}")
        return []
