#!/usr/bin/env python3
"""
Mark a transcript as processed.

Usage:
    python mark-processed.py <video_id> <cleaned_filename>

Example:
    python mark-processed.py ggKX4rujkrg 2025-01-21_enrollment-progress.md

This updates the processed.json tracking file to link the raw transcript
(identified by video ID) to its cleaned version.
"""

import json
import sys
from pathlib import Path
from datetime import datetime


def get_skill_root() -> Path:
    """Get the skill root directory."""
    return Path(__file__).parent.parent


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


def mark_processed(video_id: str, cleaned_filename: str):
    """Mark a transcript as processed."""
    skill_root = get_skill_root()
    cleaned_path = skill_root / 'transcripts' / 'cleaned' / cleaned_filename

    # Verify the cleaned file exists
    if not cleaned_path.exists():
        print(f"WARNING: Cleaned file not found: {cleaned_path}")
        print("The tracking entry will be created anyway.")

    # Load existing tracking data
    tracking = load_tracking_file()

    # Add/update the entry
    tracking["processed"][video_id] = {
        "cleaned_file": cleaned_filename,
        "processed_at": datetime.now().isoformat()
    }

    # Save
    save_tracking_file(tracking)
    print(f"Marked {video_id} as processed -> {cleaned_filename}")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    video_id = sys.argv[1]
    cleaned_filename = sys.argv[2]

    mark_processed(video_id, cleaned_filename)


if __name__ == '__main__':
    main()
