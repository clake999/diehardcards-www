#!/usr/bin/env bash

# Start a Markdown-first Field Note workspace without touching published pages.

set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
published_dir="$repo_root/public/dispatches"
drafts_dir="$repo_root/drafts"
assets_root="$repo_root/draft-assets"

number=1
while :; do
    printf -v note_number '%03d' "$number"

    published=false
    if [ -d "$published_dir" ] &&
        grep -R -q --include='*.html' "DHC-FN-$note_number" "$published_dir"; then
        published=true
    fi

    if [ "$published" = false ] && [ ! -e "$drafts_dir/FN-$note_number.md" ]; then
        break
    fi

    number=$((number + 1))
done

archive_id="DHC-FN-$note_number"
draft_path="$drafts_dir/FN-$note_number.md"
asset_path="$assets_root/FN-$note_number"

printf '\nNext Field Note: %s\n' "$note_number"
printf 'Archive ID: %s\n\n' "$archive_id"

# Stop before prompting if an incomplete or conflicting workspace is present.
if [ -e "$draft_path" ] || [ -e "$asset_path" ]; then
    printf 'Cannot create FIELD NOTE %s because a workspace target already exists:\n' "$note_number" >&2
    [ -e "$draft_path" ] && printf '  %s\n' "$draft_path" >&2
    [ -e "$asset_path" ] && printf '  %s\n' "$asset_path" >&2
    printf 'Nothing was overwritten or deleted.\n' >&2
    exit 1
fi

title=''
while [ -z "$title" ]; do
    printf 'Title: '
    IFS= read -r title
    if [ -z "$title" ]; then
        printf 'A title is required.\n'
    fi
done

printf 'Optional subtitle: '
IFS= read -r subtitle

printf '\nApproved categories:\n'
printf '  - Hans\n'
printf '  - OCR\n'
printf '  - Catalog Intelligence\n'
printf '  - Cardboard Archaeology\n'
printf '  - Collector Stories\n'
printf '  - Interesting Cards\n'
printf '  - Market Intelligence\n'
printf '  - Behind the Build\n'
printf '  - Lessons Learned\n'
printf '  - Engineering\n\n'

category=''
while [ -z "$category" ]; do
    printf 'Category: '
    IFS= read -r category
    if [ -z "$category" ]; then
        printf 'A category is required.\n'
    fi
done

printf 'Optional URL slug (leave blank to generate from title): '
IFS= read -r slug_input

if [ -z "$slug_input" ]; then
    slug_source=$title
else
    slug_source=$slug_input
fi

# Normalize either a title or a supplied phrase to a URL-safe ASCII slug.
slug=$(printf '%s' "$slug_source" |
    LC_ALL=C tr '[:upper:]' '[:lower:]' |
    LC_ALL=C sed 's/[^a-z0-9][^a-z0-9]*/-/g; s/^-//; s/-$//')

if [ -z "$slug" ]; then
    printf '\nCould not create a safe slug from the supplied text. Nothing was created.\n' >&2
    exit 1
fi

subtitle_metadata=''
if [ -n "$subtitle" ]; then
    subtitle_metadata=" $subtitle"
fi

mkdir -p "$drafts_dir" "$assets_root"
mkdir "$asset_path"

cat > "$draft_path" <<EOF
# FIELD NOTE $note_number

- Archive ID: $archive_id
- Revision: 1.0
- Title: $title
- Subtitle:$subtitle_metadata
- Category: $category
- Slug: $slug
- Status: Draft
- Publication Date:
- Reading Time:

## Opening

_Set the scene. What was noticed, built, questioned, or learned?_

## Observation

_Record the specific evidence or collector observation._

## Why It Matters

_Explain why this matters without turning it into marketing copy._

## Behind the Build

_Describe relevant process, tradeoffs, or work in progress._

## Collector Takeaway

_Leave the collector with one useful or thoughtful idea._

## Closing

_End with an earned observation rather than a sales pitch._

## Figures / Photos

Photos are optional. Copy any files for this note into:

\`draft-assets/FN-$note_number/\`

Place a figure where it belongs in the draft using this notation:

\`\`\`text
[FIGURE: center-stage-prototype.jpg]

Caption:
Early Center Stage prototype used while testing repeatable card placement.

Alt text:
Foam-board prototype of the Hans Center Stage capture surface.
\`\`\`

Use the exact filename from the photo folder. Write a concise caption and
describe the meaningful visual content in the alt text. Remove this example if
the note has no photos.

## Author Notes

_Keep private drafting reminders, source checks, and follow-up questions here.
Review and remove anything that should not be published._
EOF

printf '\nFIELD NOTE %s workspace created.\n\n' "$note_number"
printf 'Draft:\n%s\n\n' "${draft_path#"$repo_root/"}"
printf 'Photos:\n%s/\n\n' "${asset_path#"$repo_root/"}"
printf 'Next:\n'
printf '1. Open the Markdown draft.\n'
printf '2. Start writing.\n'
printf '3. Copy optional photos into the photo folder.\n'
