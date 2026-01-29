#!/usr/bin/env python3
"""
Show transcript processing status.

Usage:
    python status.py           # Show summary and list
    python status.py --json    # Output as JSON (for programmatic use)

All data is stored within the skill folder:
- Raw transcripts: .claude/skills/sync-transcripts/transcripts/raw/
- Cleaned transcripts: .claude/skills/sync-transcripts/transcripts/cleaned/
- Tracking data: .claude/skills/sync-transcripts/transcripts/processed.json
"""

import json
import re
import sys
from pathlib import Path


def get_skill_root() -> Path:
    """Get the skill root directory."""
    # Script is at .claude/skills/sync-transcripts/scripts/status.py
    return Path(__file__).parent.parent


def extract_video_id(filename: str) -> str | None:
    """Extract YouTube video ID from filename."""
    match = re.search(r'\[([a-zA-Z0-9_-]{11})\]', filename)
    return match.group(1) if match else None


def extract_date_from_filename(filename: str) -> str | None:
    """Extract date from filename (YYYY-MM-DD prefix)."""
    match = re.match(r'^(\d{4}-\d{2}-\d{2})', filename)
    return match.group(1) if match else None


def load_tracking_file() -> dict:
    """Load the processed.json tracking file."""
    skill_root = get_skill_root()
    tracking_path = skill_root / 'transcripts' / 'processed.json'
    if tracking_path.exists():
        with open(tracking_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"processed": {}}


def save_tracking_file(data: dict):
    """Save the processed.json tracking file."""
    skill_root = get_skill_root()
    tracking_path = skill_root / 'transcripts' / 'processed.json'
    tracking_path.parent.mkdir(parents=True, exist_ok=True)
    with open(tracking_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


def get_status(output_json: bool = False):
    """Get and display transcript processing status."""
    skill_root = get_skill_root()
    raw_dir = skill_root / 'transcripts' / 'raw'
    cleaned_dir = skill_root / 'transcripts' / 'cleaned'

    # Load tracking data
    tracking = load_tracking_file()
    processed_map = tracking.get("processed", {})

    # Get raw transcripts
    raw_files = []
    if raw_dir.exists():
        raw_files = sorted(raw_dir.glob('*.txt'))

    # Get cleaned transcripts
    cleaned_files = []
    if cleaned_dir.exists():
        cleaned_files = sorted(cleaned_dir.glob('*.md'))

    # Build status for each raw transcript
    transcripts = []
    for raw_file in raw_files:
        video_id = extract_video_id(raw_file.name)
        date = extract_date_from_filename(raw_file.name)

        # Check if processed (via tracking file)
        status = "raw"
        cleaned_path = None
        if video_id and video_id in processed_map:
            status = "cleaned"
            cleaned_path = processed_map[video_id].get("cleaned_file")

        # Get file size for context
        size_kb = raw_file.stat().st_size / 1024

        transcripts.append({
            "video_id": video_id,
            "date": date,
            "raw_file": raw_file.name,
            "status": status,
            "cleaned_file": cleaned_path,
            "size_kb": round(size_kb, 1)
        })

    # Count by status
    raw_count = sum(1 for t in transcripts if t["status"] == "raw")
    cleaned_count = sum(1 for t in transcripts if t["status"] == "cleaned")

    if output_json:
        result = {
            "summary": {
                "total": len(transcripts),
                "raw": raw_count,
                "cleaned": cleaned_count
            },
            "transcripts": transcripts,
            "cleaned_files": [f.name for f in cleaned_files]
        }
        print(json.dumps(result, indent=2))
        return

    # Pretty print
    print("\n" + "=" * 60)
    print("TRANSCRIPT STATUS")
    print("=" * 60)
    print(f"\nTotal: {len(transcripts)} transcripts")
    print(f"  - Raw (needs cleaning): {raw_count}")
    print(f"  - Cleaned (ready for RAG): {cleaned_count}")
    print()

    if raw_count > 0:
        print("-" * 60)
        print("RAW TRANSCRIPTS (need cleaning):")
        print("-" * 60)
        for t in transcripts:
            if t["status"] == "raw":
                try:
                    # Truncate long titles for display
                    display_name = t["raw_file"]
                    if len(display_name) > 55:
                        display_name = display_name[:52] + "..."
                    print(f"  [{t['date']}] {display_name}")
                    print(f"             ID: {t['video_id']} | Size: {t['size_kb']} KB")
                except UnicodeEncodeError:
                    print(f"  [{t['date']}] (filename contains special chars)")
                    print(f"             ID: {t['video_id']} | Size: {t['size_kb']} KB")
        print()

    if cleaned_count > 0:
        print("-" * 60)
        print("CLEANED TRANSCRIPTS:")
        print("-" * 60)
        for t in transcripts:
            if t["status"] == "cleaned":
                print(f"  [{t['date']}] {t['video_id']}")
                print(f"             -> {t['cleaned_file']}")
        print()

    # Show cleaned .md files
    if cleaned_files:
        print("-" * 60)
        print("FILES IN transcripts/cleaned/:")
        print("-" * 60)
        for f in cleaned_files:
            print(f"  {f.name}")
        print()

    print("=" * 60)
    print("\nNext steps:")
    if raw_count > 0:
        print("  1. Clean a transcript from transcripts/raw/")
        print("  2. Follow scripts/CLEANING-GUIDE.md")
        print("  3. Save to transcripts/cleaned/YYYY-MM-DD_title.md")
        print("  4. Mark as processed: python scripts/mark-processed.py <video_id> <filename>")
    else:
        print("  All transcripts are cleaned!")
    print()


def main():
    output_json = '--json' in sys.argv
    get_status(output_json)


if __name__ == '__main__':
    main()
