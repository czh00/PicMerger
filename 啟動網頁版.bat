@echo off
setlocal
echo ==========================================
echo   PicMerger v1.0.9 - 網頁版啟動器
echo ==========================================
echo.
echo [1/2] 正在檢查本地環境...

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [2/2] 偵測到 Python，正在啟動臨時伺服器...
    echo 請保持此視窗開啟，並在瀏覽器中操作。
    echo 啟動網址: http://localhost:8000
    start http://localhost:8000/dist/index.html
    python -m http.server 8000
) else (
    where npm >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [2/2] 偵測到 Node.js，正在啟動 Vite 預覽...
        start http://localhost:4173/dist/index.html
        npm run preview
    ) else (
        echo [!] 錯誤: 找不到 Python 或 Node.js 環境。
        echo 由於瀏覽器安全性限制，直接雙擊 index.html 可能無法正常運作。
        echo 請嘗試將整個資料夾上傳至網頁伺服器，或安裝 Python 後再執行此腳本。
        pause
    )
)
pause
