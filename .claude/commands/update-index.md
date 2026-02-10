---
name: update-index
description: Update the .agents/INDEX.md by running the index generation script
allowed-tools:
  - Bash
---

<objective>
Run the `.agents/update-index.py` script to regenerate `.agents/INDEX.md` from all markdown files in the `.agents` directory. Use this after creating, renaming, moving, or deleting any doc, task, bug, or report file.
</objective>

<process>

<step name="run-script">
Run the index update script:

```bash
python .agents/update-index.py
```

If Python is not available as `python`, try `python3`.
</step>

<step name="report">
Report the result to the user — include the file counts from the script output (docs, bugs, tasks, reports).
</step>

</process>
