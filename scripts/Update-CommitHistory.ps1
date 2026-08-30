# Regenerates COMMIT_HISTORY.md from git log. Do not hand-edit the output file.
$ErrorActionPreference = "Stop"
$repoRoot = git rev-parse --show-toplevel
$log = git log --date=format:"%Y-%m-%d" --pretty=format:"- %ad — %h — %s (%an)"
$header = "# Commit History`n`nRegenerated from ``git log`` via ``scripts\Update-CommitHistory.ps1`` — do not hand-edit.`n"
$content = $header + "`n" + ($log -join "`n") + "`n"
Set-Content -Path (Join-Path $repoRoot "COMMIT_HISTORY.md") -Value $content -Encoding UTF8
Write-Host "COMMIT_HISTORY.md regenerated ($((($log) | Measure-Object).Count) commits)."
