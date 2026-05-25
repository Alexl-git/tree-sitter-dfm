# Build a DFM corpus manifest: one absolute path per line.
#
# Roots are read from tools/corpus-roots.txt (one path per line, # for comments).
# A starter file is provided — edit it to point at your own DFM/FMX sources.
#
# Usage:
#   pwsh tools/build-manifest.ps1 -OutFile work/manifest.txt
param(
  [string]$OutFile = "work/manifest.txt",
  [string]$RootsFile = ""
)

$ErrorActionPreference = 'Stop'

if (-not $RootsFile) {
  $RootsFile = Join-Path (Split-Path -Parent $PSCommandPath) 'corpus-roots.txt'
}

$roots = @()
if (Test-Path $RootsFile) {
  $roots = Get-Content $RootsFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) { $line }
  }
} else {
  Write-Host "  no roots file at $RootsFile — using empty manifest"
}

$excludePatterns = @(
  '\\tree-sitter-pascal\\',
  '\\tree-sitter-dfm\\',
  '\\node_modules\\',
  '\\\.git\\',
  '\\\.hg\\',
  '\\Win32\\Debug\\',
  '\\Win32\\Release\\',
  '\\Win64\\Debug\\',
  '\\Win64\\Release\\',
  '\\__history\\',
  '\\__recovery\\',
  '\\Backup\\',
  '\\_BACKUP\\'
)

$dir = Split-Path -Parent $OutFile
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

$writer = New-Object System.IO.StreamWriter($OutFile, $false, [System.Text.Encoding]::UTF8)
$count = 0
$skipped = 0

foreach ($r in $roots) {
  if (-not (Test-Path $r)) {
    Write-Host "  MISSING root: $r"
    continue
  }
  Write-Host "  scanning: $r"
  Get-ChildItem $r -Recurse -File -Include *.dfm,*.fmx -ErrorAction SilentlyContinue | ForEach-Object {
    $p = $_.FullName
    $skip = $false
    foreach ($pat in $excludePatterns) {
      if ($p -match $pat) { $skip = $true; break }
    }
    if ($skip) { $skipped++ } else {
      $writer.WriteLine($p)
      $count++
    }
  }
}
$writer.Close()

Write-Host ""
Write-Host "manifest: $OutFile"
Write-Host "  included: $count"
Write-Host "  excluded: $skipped"
