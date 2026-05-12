# PicMerger (圖片合併) v1.0.0

一個極簡、高品質的圖片與影片合併工具，支援 Android 與 Web 平台。

## 主要功能
- **網格合併**：支援自定義列數，自動計算佈局。
- **無損畫質**：採用原始解析度進行合併，不縮放（除非手動調整）。
- **影片處理**：支援合併多個影片，或從影片中自動提取畫面進行預覽。
- **靈活對齊**：支援起點、置中、終點對齊模式。
- **即時預覽**：所有參數調整（列數、尺寸、背景色）皆可即時看到預覽效果。
- **自定義輸出**：支援按百分比、指定寬度或高度進行等比例輸出。
- **智慧排序**：支援長按拖拽排序，直覺調整合併順序。

## 檔案結構
- `/android`: Android 原生專案 (Kotlin + Jetpack Compose)。
  - `/app/src/main/java`: 核心邏輯與 UI 程式碼。
- `/index.html`: Web 版介面。
- `/main.js`: Web 版核心邏輯與圖片處理。
- `/style.css`: Web 版樣式定義（現代化深色主題）。
- `PicMerger_v1.0.0.apk`: 最新發佈的 Android 安裝包。

## 技術棧
- **Android**: Kotlin, Jetpack Compose, Coil (圖片載入), RxFFmpeg (影片處理)。
- **Web**: HTML5 Canvas, JavaScript (Vanilla), CSS3。

## 如何使用 (Android)
1. 下載並安裝 `PicMerger_v1.0.0.apk`。
2. 點擊「增加」選取圖片或影片。
3. 調整「列數」決定佈局。
4. 使用「生成合併」按鈕完成渲染。
5. 點擊「儲存」或「分享」匯出結果。

---
由 Antigravity 助開發。
