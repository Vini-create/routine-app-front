#!/usr/bin/env python3
"""Build non-destructive, scroll-friendly landing video assets.

The source file is never modified. The pipeline first composites the near-black
background over Winperium's #09090B using a soft RGB key, writes a high-quality
master, and only then creates browser variants and posters.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "background_interacting_landing_page" / "lv_0_20260630215405.mp4"
VIDEO_DIR = ROOT / "public" / "videos"
IMAGE_DIR = ROOT / "public" / "images"
COMPARE_DIR = ROOT / "artifacts" / "landing-video-comparison"
BACKGROUND = "#09090B"
SCENE_TIMES = (0.40, 1.40, 2.40, 4.50, 7.50, 10.80, 12.20)
STORY_POSTERS = {
    "helmet": 0.40,
    "rocket": 1.40,
    "blueprint": 2.40,
    "pieces": 4.50,
    "assembly": 8.60,
    "complete": 11.40,
}


def has_encoder(name: str) -> bool:
    result = subprocess.run(
        ["ffmpeg", "-hide_banner", "-encoders"],
        check=True,
        capture_output=True,
        text=True,
    )
    return name in result.stdout


def run(command: list[str]) -> None:
    print("+", " ".join(command), flush=True)
    subprocess.run(command, check=True)


def probe(path: Path) -> dict:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_format",
            "-show_streams",
            "-count_frames",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def video_stream(metadata: dict) -> dict:
    return next(stream for stream in metadata["streams"] if stream["codec_type"] == "video")


def corrected_filter(width: int, height: int, fps: str, duration: str) -> str:
    # colorkey works in RGB and therefore preserves neutral chrome; chromakey
    # would key all grayscale pixels because it primarily compares chroma.
    return (
        f"[0:v]format=rgba,colorkey=0x000000:0.06:0.035[fg];"
        f"color=c={BACKGROUND}:s={width}x{height}:r={fps}:d={duration}[bg];"
        "[bg][fg]overlay=shortest=1:format=auto,format=yuv420p[outv]"
    )


def make_master(source: Path, master: Path, metadata: dict) -> None:
    stream = video_stream(metadata)
    filter_graph = corrected_filter(
        int(stream["width"]),
        int(stream["height"]),
        stream["r_frame_rate"],
        stream["duration"],
    )
    codec_args = (
        ["-c:v", "libx264", "-preset", "slow", "-crf", "12", "-profile:v", "high"]
        if has_encoder("libx264")
        else [
            "-c:v",
            "libopenh264",
            "-b:v",
            "28M",
            "-maxrate",
            "36M",
            "-profile:v",
            "high",
            "-coder",
            "cabac",
            "-rc_mode",
            "quality",
        ]
    )
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-i",
            str(source),
            "-filter_complex",
            filter_graph,
            "-map",
            "[outv]",
            "-an",
            *codec_args,
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(master),
        ]
    )


def make_mp4(master: Path, output: Path, scale: str | None = None, gop: int = 15) -> None:
    command = ["ffmpeg", "-y", "-hide_banner", "-i", str(master), "-an"]
    if scale:
        command.extend(["-vf", scale])
    codec_args = (
        [
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "22" if scale is None else "23",
            "-profile:v",
            "high",
        ]
        if has_encoder("libx264")
        else [
            "-c:v",
            "libopenh264",
            "-b:v",
            "6M" if scale is None else "3000k",
            "-maxrate",
            "8M" if scale is None else "4500k",
            "-profile:v",
            "high",
            "-coder",
            "cabac",
            "-rc_mode",
            "quality",
        ]
    )
    command.extend(
        [
            *codec_args,
            "-pix_fmt",
            "yuv420p",
            "-g",
            str(gop),
            "-keyint_min",
            str(gop),
            "-sc_threshold",
            "0",
            "-movflags",
            "+faststart",
            str(output),
        ]
    )
    run(command)


def make_webm(master: Path, output: Path, scale: str | None = None, preview: bool = False, gop: int = 15) -> None:
    command = ["ffmpeg", "-y", "-hide_banner", "-i", str(master), "-an"]
    if preview:
        command.extend(["-t", "4", "-vf", "scale=960:-2:flags=lanczos"])
    elif scale:
        command.extend(["-vf", scale])
    command.extend(
        [
            "-c:v",
            "libvpx-vp9",
            "-crf",
            "34" if preview else "30",
            "-b:v",
            "0",
            "-row-mt",
            "1",
            "-deadline",
            "good",
            "-cpu-used",
            "2",
            "-g",
            str(gop),
            "-pix_fmt",
            "yuv420p",
            str(output),
        ]
    )
    run(command)


def make_poster(master: Path, output: Path, scale: str | None = None) -> None:
    command = ["ffmpeg", "-y", "-hide_banner", "-ss", "0.10", "-i", str(master)]
    if scale:
        command.extend(["-vf", scale])
    command.extend(
        [
            "-frames:v",
            "1",
            "-c:v",
            "libwebp",
            "-quality",
            "88",
            "-compression_level",
            "6",
            str(output),
        ]
    )
    run(command)


def make_story_posters(master: Path) -> None:
    for name, timestamp in STORY_POSTERS.items():
        run(
            [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-ss",
                f"{timestamp:.2f}",
                "-i",
                str(master),
                "-frames:v",
                "1",
                "-vf",
                "scale=1280:-2:flags=lanczos",
                "-c:v",
                "libwebp",
                "-quality",
                "86",
                "-compression_level",
                "6",
                str(IMAGE_DIR / f"landing-story-{name}.webp"),
            ]
        )


def extract_comparisons(source: Path, master: Path, desktop_webm: Path, desktop_mp4: Path) -> None:
    COMPARE_DIR.mkdir(parents=True, exist_ok=True)
    variants = {
        "original": source,
        "master": master,
        "desktop-webm": desktop_webm,
        "desktop-mp4": desktop_mp4,
    }
    for label, path in variants.items():
        for index, timestamp in enumerate(SCENE_TIMES):
            run(
                [
                    "ffmpeg",
                    "-y",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-ss",
                    f"{timestamp:.2f}",
                    "-i",
                    str(path),
                    "-frames:v",
                    "1",
                    "-vf",
                    "scale=960:-2:flags=lanczos",
                    str(COMPARE_DIR / f"{index:02d}-{timestamp:05.2f}-{label}.png"),
                ]
            )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--skip-comparison", action="store_true")
    args = parser.parse_args()

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise SystemExit("ffmpeg and ffprobe are required")
    source = args.input.resolve()
    if not source.exists():
        raise SystemExit(f"Source video not found: {source}")

    VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    master = VIDEO_DIR / "landing-scroll-master.mp4"
    preview = VIDEO_DIR / "landing-scroll-preview.webm"
    desktop_webm = VIDEO_DIR / "landing-scroll-desktop.webm"
    desktop_mp4 = VIDEO_DIR / "landing-scroll-desktop.mp4"
    mobile_webm = VIDEO_DIR / "landing-scroll-mobile.webm"
    mobile_mp4 = VIDEO_DIR / "landing-scroll-mobile.mp4"

    metadata = probe(source)
    make_master(source, master, metadata)
    make_webm(master, preview, preview=True)
    make_webm(master, desktop_webm)
    make_mp4(master, desktop_mp4)
    mobile_scale = "scale=1080:-2:flags=lanczos"
    make_webm(master, mobile_webm, scale=mobile_scale, gop=3)
    make_mp4(master, mobile_mp4, scale=mobile_scale, gop=3)
    make_poster(master, IMAGE_DIR / "landing-scroll-poster.webp")
    make_poster(master, IMAGE_DIR / "landing-scroll-poster-mobile.webp", scale=mobile_scale)
    make_story_posters(master)

    if not args.skip_comparison:
        extract_comparisons(source, master, desktop_webm, desktop_mp4)

    print("\nGenerated assets:")
    for path in (master, preview, desktop_webm, desktop_mp4, mobile_webm, mobile_mp4):
        print(f"- {path.relative_to(ROOT)}: {path.stat().st_size / 1_048_576:.2f} MiB")


if __name__ == "__main__":
    main()
