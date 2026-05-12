@echo off
echo [1/3] 檢查並關閉執行中的 PicMerger...
taskkill /F /IM PicMerger.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul

echo [2/3] 執行 Vite 編譯...
call npm run build

echo [3/3] 建置完成。
pause
