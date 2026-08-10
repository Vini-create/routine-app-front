#!/usr/bin/env python3
"""Build the browser-ready mountain landing story from four HEVC clips."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = ROOT / "src" / "components" / "landing" / "new_landing_video"
VIDEO_DIR = ROOT / "public" / "videos"
IMAGE_DIR = ROOT / "public" / "images"
STORY_POSTERS = {
    "mountain": 1.5,
    "climber": 7.2,
    "struggle": 13.0,
    "resilience": 14.5,
    "seasons": 20.1,
    "summit": 31.2,
}


def run(command: list[str]) -> None:
    print("+", " ".join(command), flush=True)
    subprocess.run(command, check=True)


def probe(ffprobe: str, path: Path) -> dict:
    result = subprocess.run(
        [
            ffprobe,
            "-v",
            "error",
            "-show_entries",
            "format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def source_clips(source_dir: Path) -> list[Path]:
    clips = sorted(source_dir.glob("*.mp4"))
    if len(clips) != 4:
        raise SystemExit(f"Expected exactly four MP4 clips in {source_dir}, found {len(clips)}")
    return clips


def encode_story(ffmpeg: str, clips: list[Path]) -> None:
    inputs = [argument for clip in clips for argument in ("-i", str(clip))]
    filter_graph = (
        "[0:v]setpts=PTS-STARTPTS[v0];"
        "[1:v]setpts=PTS-STARTPTS[v1];"
        "[2:v]setpts=PTS-STARTPTS[v2];"
        "[3:v]setpts=PTS-STARTPTS[v3];"
        "[v0][v1][v2][v3]concat=n=4:v=1:a=0,split=2[desktopbase][mobilebase];"
        "[desktopbase]scale=1600:900:flags=lanczos,format=yuv420p[desktop];"
        "[mobilebase]crop=1216:2160:(iw-1216)/2:0,"
        "scale=1080:1920:flags=lanczos,format=yuv420p[mobile]"
    )
    desktop_temp = VIDEO_DIR / ".landing-scroll-desktop.mp4"
    mobile_temp = VIDEO_DIR / ".landing-scroll-mobile-premium.mp4"

    run(
        [
            ffmpeg,
            "-y",
            "-hide_banner",
            *inputs,
            "-filter_complex",
            filter_graph,
            "-map",
            "[desktop]",
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "26",
            "-profile:v",
            "high",
            "-level",
            "4.0",
            "-g",
            "24",
            "-keyint_min",
            "24",
            "-sc_threshold",
            "0",
            "-movflags",
            "+faststart",
            str(desktop_temp),
            "-map",
            "[mobile]",
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "22",
            "-profile:v",
            "high",
            "-level",
            "4.1",
            "-g",
            "1",
            "-keyint_min",
            "1",
            "-sc_threshold",
            "0",
            "-movflags",
            "+faststart",
            str(mobile_temp),
        ]
    )

    desktop_temp.replace(VIDEO_DIR / "landing-scroll-desktop.mp4")
    mobile_temp.replace(VIDEO_DIR / "landing-scroll-mobile-premium.mp4")


def encode_desktop_webm(ffmpeg: str) -> None:
    source = VIDEO_DIR / "landing-scroll-desktop.mp4"
    output_temp = VIDEO_DIR / ".landing-scroll-desktop.webm"
    run(
        [
            ffmpeg,
            "-y",
            "-hide_banner",
            "-i",
            str(source),
            "-an",
            "-c:v",
            "libvpx-vp9",
            "-crf",
            "39",
            "-b:v",
            "0",
            "-deadline",
            "good",
            "-cpu-used",
            "4",
            "-row-mt",
            "1",
            "-g",
            "24",
            "-pix_fmt",
            "yuv420p",
            str(output_temp),
        ]
    )
    output_temp.replace(VIDEO_DIR / "landing-scroll-desktop.webm")


def extract_frame(ffmpeg: str, video: Path, timestamp: float, output: Path, scale: str | None = None) -> None:
    command = [ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-ss", str(timestamp), "-i", str(video)]
    if scale:
        command.extend(["-vf", scale])
    command.extend(
        [
            "-frames:v",
            "1",
            "-c:v",
            "libwebp",
            "-quality",
            "84",
            "-compression_level",
            "6",
            str(output),
        ]
    )
    run(command)


def make_posters(ffmpeg: str) -> None:
    desktop = VIDEO_DIR / "landing-scroll-desktop.mp4"
    mobile = VIDEO_DIR / "landing-scroll-mobile-premium.mp4"
    extract_frame(ffmpeg, desktop, 0.4, IMAGE_DIR / "landing-scroll-poster.webp")
    extract_frame(ffmpeg, mobile, 0.4, IMAGE_DIR / "landing-scroll-poster-mobile-premium.webp")

    for name, timestamp in STORY_POSTERS.items():
        extract_frame(
            ffmpeg,
            desktop,
            timestamp,
            IMAGE_DIR / f"landing-story-{name}.webp",
            "scale=1280:-2:flags=lanczos",
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg") or "ffmpeg")
    parser.add_argument("--ffprobe", default=shutil.which("ffprobe") or "ffprobe")
    args = parser.parse_args()

    VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    clips = source_clips(args.source_dir)
    encode_story(args.ffmpeg, clips)
    encode_desktop_webm(args.ffmpeg)
    make_posters(args.ffmpeg)

    variants = {
        "desktop": VIDEO_DIR / "landing-scroll-desktop.mp4",
        "mobile-premium": VIDEO_DIR / "landing-scroll-mobile-premium.mp4",
    }
    for variant, output in variants.items():
        metadata = probe(args.ffprobe, output)
        print(json.dumps({"variant": variant, **metadata}, indent=2))

    webm = VIDEO_DIR / "landing-scroll-desktop.webm"
    print(json.dumps({"variant": "desktop-webm", **probe(args.ffprobe, webm)}, indent=2))


if __name__ == "__main__":
    main()
