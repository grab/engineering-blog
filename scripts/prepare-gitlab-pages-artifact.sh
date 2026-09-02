#!/usr/bin/env bash
# Build a GitLab Pages artifact small enough to publish.
#
# The full Jekyll site is ~600MB, mostly img/ and files/. GitLab Pages rejects
# artifacts that large. This script:
#   1. Copies _site/ to public/
#   2. Re-adds only binary assets changed in the current MR (img/, files/, screenshots/)
#   3. Rewrites other /img/ and /files/ URLs to production
#   4. Keeps MR asset URLs on the staging site so new post images render in preview
#
# gh-pages-staging (via jgd) still receives the full site for a complete mirror.

set -euo pipefail

SOURCE_DIR="${1:-_site}"
OUTPUT_DIR="${2:-public}"
ASSET_ORIGIN="${ASSET_ORIGIN:-https://engineering.grab.com}"
STAGING_SITE_URL="${STAGING_SITE_URL:-}"
MR_ASSET_BASE="${MR_ASSET_BASE:-${CI_MERGE_REQUEST_DIFF_BASE_SHA:-}}"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

rm -rf "$OUTPUT_DIR"
cp -a "$SOURCE_DIR" "$OUTPUT_DIR"

for dir in img files screenshots; do
  if [[ -d "$OUTPUT_DIR/$dir" ]]; then
    rm -rf "$OUTPUT_DIR/$dir"
  fi
done

MANIFEST="$(mktemp)"
trap 'rm -f "$MANIFEST"' EXIT

list_mr_asset_paths() {
  local base="$1"
  if [[ -z "$base" ]]; then
    return 0
  fi

  git diff --name-only --diff-filter=AM "$base" HEAD -- img/ files/ screenshots/
}

copy_mr_assets() {
  local base="$1"
  local copied=0

  while IFS= read -r rel_path; do
    [[ -z "$rel_path" ]] && continue

    local src="$SOURCE_DIR/$rel_path"
    local dest="$OUTPUT_DIR/$rel_path"

    if [[ ! -f "$src" ]]; then
      echo "Skipping missing built asset: $rel_path" >&2
      continue
    fi

    mkdir -p "$(dirname "$dest")"
    cp "$src" "$dest"
    printf '%s\n' "$rel_path" >> "$MANIFEST"
    copied=$((copied + 1))
  done < <(list_mr_asset_paths "$base")

  echo "Bundled $copied MR asset(s) for staging preview"
}

if [[ -n "$MR_ASSET_BASE" ]]; then
  copy_mr_assets "$MR_ASSET_BASE"
elif [[ -n "${CI_MERGE_REQUEST_TARGET_BRANCH_NAME:-}" ]]; then
  git fetch origin "${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}"
  copy_mr_assets "origin/${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}"
else
  echo "No MR asset base found; staging preview will load all assets from production"
fi

if [[ -z "$STAGING_SITE_URL" ]]; then
  STAGING_SITE_URL="${ASSET_ORIGIN}"
fi

export OUTPUT_DIR ASSET_ORIGIN STAGING_SITE_URL MANIFEST

ruby <<'RUBY'
require "pathname"

output_dir = ENV.fetch("OUTPUT_DIR")
asset_origin = ENV.fetch("ASSET_ORIGIN").sub(%r{/\z}, "")
staging_site_url = ENV.fetch("STAGING_SITE_URL").sub(%r{/\z}, "")
manifest_path = ENV.fetch("MANIFEST")

local_assets = File.exist?(manifest_path) ? File.read(manifest_path).lines.map(&:strip).reject(&:empty?) : []
local_lookup = local_assets.each_with_object({}) do |path, memo|
  memo[path] = true
  memo[path.sub(%r{\A/}, "")] = true
end

def rewrite_file(path, asset_origin, staging_site_url, local_lookup)
  contents = File.read(path)
  changed = false

  contents = contents.gsub(%r{(["'=])/img/([^"'?#\s]+)}) do
    quote, asset_path = Regexp.last_match(1), Regexp.last_match(2)
    normalized = "img/#{asset_path.sub(%r{\Aimg/}, '')}"
    origin = local_lookup[normalized] ? staging_site_url : asset_origin
    changed = true
    "#{quote}#{origin}/img/#{asset_path.sub(%r{\Aimg/}, '')}"
  end

  contents = contents.gsub(%r{(["'=])/files/([^"'?#\s]+)}) do
    quote, asset_path = Regexp.last_match(1), Regexp.last_match(2)
    normalized = "files/#{asset_path.sub(%r{\Afiles/}, '')}"
    origin = local_lookup[normalized] ? staging_site_url : asset_origin
    changed = true
    "#{quote}#{origin}/files/#{asset_path.sub(%r{\Afiles/}, '')}"
  end

  contents = contents.gsub(%r{url\((['"]?)/img/([^)"']+)}) do
    quote, asset_path = Regexp.last_match(1), Regexp.last_match(2)
    normalized = "img/#{asset_path.sub(%r{\Aimg/}, '')}"
    origin = local_lookup[normalized] ? staging_site_url : asset_origin
    changed = true
    "url(#{quote}#{origin}/img/#{asset_path.sub(%r{\Aimg/}, '')}"
  end

  File.write(path, contents) if changed
end

root = Pathname.new(output_dir)
patterns = %w[*.html *.json *.xml *.css *.js]
files = patterns.flat_map { |pattern| root.glob("**/#{pattern}") }

files.each do |file|
  rewrite_file(file.to_s, asset_origin, staging_site_url, local_lookup)
end

puts "Rewrote asset URLs in #{files.length} file(s)"
puts "Local MR assets: #{local_assets.length}"
RUBY

echo "GitLab Pages artifact prepared at $OUTPUT_DIR"
du -sh "$OUTPUT_DIR"
du -sh "$OUTPUT_DIR"/* 2>/dev/null | sort -hr | head -10
