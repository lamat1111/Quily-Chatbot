#!/usr/bin/env python3
"""
Fetch YouTube transcripts and convert to clean text.

Usage:
    python fetch-transcripts.py                    # Fetch from default playlist
    python fetch-transcripts.py <playlist_url>    # Fetch from specific playlist
    python fetch-transcripts.py <video_url>       # Fetch single video

Requires:
    - yt-dlp: pip install yt-dlp
    - Cookies file at .claude/skills/sync-transcripts/cookies.txt

The script:
1. Downloads VTT subtitles from YouTube
2. Converts to clean text (removes timestamps, deduplicates)
3. Deletes the VTT files
4. Names files as: YYYY-MM-DD_Title_[video_id].en.txt

All data is stored within the skill folder:
- Raw transcripts: .claude/skills/sync-transcripts/transcripts/raw/
- Cleaned transcripts: .claude/skills/sync-transcripts/transcripts/cleaned/
- Tracking data: .claude/skills/sync-transcripts/transcripts/processed.json
"""

import subprocess
import sys
import re
from pathlib import Path

# Configuration
DEFAULT_PLAYLIST = "https://www.youtube.com/playlist?list=PLnhsXXDZIsK7CTdt14TM9fo9KcT3GzPRf"


def get_skill_root() -> Path:
    """Get the skill root directory."""
    # Script is at .claude/skills/sync-transcripts/scripts/fetch-transcripts.py
    return Path(__file__).parent.parent


def get_project_root() -> Path:
    """Get the project root directory."""
    return get_skill_root().parent.parent.parent.parent


def clean_vtt_line(line: str) -> str:
    """Remove HTML tags and VTT formatting from a line."""
    clean = re.sub(r'<[^>]+>', '', line)
    clean = re.sub(r'align:\w+', '', clean)
    clean = re.sub(r'position:\d+%?', '', clean)
    return clean.strip()


def vtt_to_text(vtt_content: str) -> str:
    """Convert VTT subtitle content to clean text."""
    lines = vtt_content.split('\n')
    text_parts = []
    prev_text = ""

    for line in lines:
        if line.startswith('WEBVTT') or line.startswith('Kind:') or line.startswith('Language:'):
            continue
        if '-->' in line:
            continue
        stripped = line.strip()
        if not stripped or re.match(r'^(align:|position:|\d+)$', stripped):
            continue

        clean = clean_vtt_line(stripped)
        if not clean or clean == prev_text:
            continue
        if prev_text and clean in prev_text:
            continue
        if prev_text and prev_text in clean:
            if text_parts:
                text_parts[-1] = clean
            else:
                text_parts.append(clean)
            prev_text = clean
            continue

        text_parts.append(clean)
        prev_text = clean

    full_text = ' '.join(text_parts)
    full_text = re.sub(r'\s+', ' ', full_text)
    full_text = re.sub(r'(\. )([A-Z])', r'.\n\n\2', full_text)
    return full_text.strip()


def fetch_transcripts(url: str):
    """Fetch transcripts from YouTube URL."""
    skill_root = get_skill_root()
    project_root = get_project_root()

    # Cookies file - check skill folder first, then project .temp
    cookies_path = skill_root / 'cookies.txt'
    if not cookies_path.exists():
        cookies_path = project_root / '.temp' / 'www.youtube.com_cookies.txt'

    # Output to skill folder
    output_dir = skill_root / 'transcripts' / 'raw'

    if not cookies_path.exists():
        print(f"ERROR: Cookies file not found")
        print(f"Please export YouTube cookies to: {skill_root / 'cookies.txt'}")
        print("Use a browser extension like 'Get cookies.txt LOCALLY'")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    # Get list of existing video IDs to skip
    existing_ids = set()
    for f in output_dir.glob('*.txt'):
        match = re.search(r'\[([a-zA-Z0-9_-]{11})\]', f.name)
        if match:
            existing_ids.add(match.group(1))

    print(f"Found {len(existing_ids)} existing transcript(s)")
    print(f"Fetching from: {url}\n")

    # Download VTT files
    cmd = [
        "python", "-m", "yt_dlp",
        "--cookies", str(cookies_path),
        "--write-auto-sub",
        "--sub-lang", "en",
        "--skip-download",
        "--no-overwrites",
        "-o", str(output_dir / "%(upload_date>%Y-%m-%d|)s_%(title)s_[%(id)s]"),
        url
    ]

    result = subprocess.run(cmd, cwd=project_root)

    if result.returncode != 0:
        print("\nWarning: yt-dlp returned non-zero exit code")

    # Convert VTT to TXT and delete VTT
    vtt_files = list(output_dir.glob('*.vtt'))
    if vtt_files:
        print(f"\nConverting {len(vtt_files)} VTT file(s) to text...")

        for vtt_file in sorted(vtt_files):
            txt_file = vtt_file.with_suffix('.txt')

            # Skip if already converted
            if txt_file.exists():
                vtt_file.unlink()
                continue

            try:
                with open(vtt_file, 'r', encoding='utf-8') as f:
                    vtt_content = f.read()

                text = vtt_to_text(vtt_content)

                with open(txt_file, 'w', encoding='utf-8') as f:
                    f.write(text)

                try:
                    print(f"  {txt_file.name} ({len(text):,} chars)")
                except UnicodeEncodeError:
                    print(f"  {txt_file.name.encode('ascii', 'replace').decode()} ({len(text):,} chars)")

                # Delete VTT after successful conversion
                vtt_file.unlink()

            except Exception as e:
                print(f"  Error processing {vtt_file.name}: {e}")

    # Final count
    txt_files = list(output_dir.glob('*.txt'))
    print(f"\nDone! {len(txt_files)} transcript(s) in {output_dir}")


def main():
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = DEFAULT_PLAYLIST
        print(f"Using default playlist: {url}\n")

    fetch_transcripts(url)


if __name__ == '__main__':
    main()
