# Fix Git Line Ending Warnings

## Quick Fix

The `.gitattributes` file has been created to handle line endings properly. Now follow these steps:

### Step 1: Configure Git (if not already done)

```bash
# Disable automatic line ending conversion
git config core.autocrlf false

# Or for this repository only:
git config core.autocrlf input
```

### Step 2: Normalize existing files

```bash
# Refresh Git's index to apply .gitattributes
git add --renormalize .

# Or just add the transcript files:
git add --renormalize transcripts/*.txt
```

### Step 3: Commit the changes

```bash
git commit -m "Normalize line endings"
```

## What the .gitattributes file does

- **Text files** (`.txt`, `.ts`, `.js`, etc.) → Normalized to LF (Unix line endings)
- **Binary files** (`.png`, `.jpg`, etc.) → Left as-is
- **Transcript files** → Explicitly set to LF for consistency across platforms

## Why this matters

- **Windows** uses CRLF (`\r\n`)
- **Linux/Ubuntu** uses LF (`\n`)
- Since your app runs in Docker on Ubuntu, we want LF line endings
- The `.gitattributes` file ensures consistency

## Alternative: If you want to ignore the warnings

If you don't want to normalize line endings, you can suppress the warnings:

```bash
git config core.safecrlf false
```

But it's better to normalize them for consistency!

## Verify it worked

After running the commands above, try:

```bash
git status
```

You should no longer see the line ending warnings.


