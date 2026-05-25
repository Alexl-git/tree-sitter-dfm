# DFM baseline: build manifest, parse all .dfm/.fmx, summarize.
param(
  [string]$Tag = ""
)

$ErrorActionPreference = 'Stop'
Set-Location "C:\Projects\tree-sitter-dfm"

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$runDir = if ($Tag) { "work/runs/$ts-$Tag" } else { "work/runs/$ts" }
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

$manifest = "$runDir/manifest.txt"
$results  = "$runDir/results.jsonl"
$summary  = "$runDir/SUMMARY.md"

Write-Host "=== building manifest ==="
& pwsh -NoProfile -File tools/build-manifest.ps1 -OutFile $manifest

Write-Host ""
Write-Host "=== parsing corpus ==="
node tools/parse-corpus.js $manifest $results | Tee-Object -FilePath "$runDir/parse-stdout.txt"

Write-Host ""
Write-Host "=== summarizing ==="
node tools/summarize.js $results $summary --top-snippets=30

Write-Host ""
Write-Host "Done.  Run dir: $runDir"
Write-Host "Summary:        $summary"

Write-Host ""
Write-Host "=== summary preview ==="
Get-Content $summary -TotalCount 50 | ForEach-Object { "  $_" }
