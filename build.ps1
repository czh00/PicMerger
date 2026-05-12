Write-Host "Closing existing processes..."
Get-Process PicMerger -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Running build..."
npm run build

Write-Host "Build finished."
