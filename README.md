# 大港開唱 2026 行程助手

音樂祭行程規劃工具，選團、排行程、自動偵測衝突時段。

**Live:** [https://luchichitw.github.io/megaport2026/](https://luchichitw.github.io/megaport2026/)

## 功能

- 依舞台瀏覽所有演出，點選加入個人行程
- 左右滑動快速切換舞台
- 時刻表模式：以時間 × 舞台方格總覽所有演出
- 行程表依時間排列，自動標示衝突時段
- 長按演出卡片或時刻表方塊，檢視完整演出資訊
- 串流平台嵌入播放（Spotify / Apple Music / 街聲 / YouTube / Podcast）
- 多表演者場次支援切換瀏覽
- 演出中即時標示與進度條
- 模擬時間功能，預覽不同時段的行程狀態
- 深色 / 淺色模式，跟隨系統或手動切換
- 加入主畫面後可完全離線使用 (PWA)

## 隱私

- 純靜態頁面，不連線任何後端伺服器
- 不蒐集任何個人資料
- 所有選取資料僅儲存於裝置本機 (IndexedDB / localStorage)

## 資料來源

所有演出資料皆來自[大港開唱官方 Instagram](https://www.instagram.com/megaportfest/)。

## 技術

- React 18 + Babel (CDN)
- 單一 `index.html` + `schedule.js` / `artists.js` 資料檔
- Service Worker 離線快取
- Liquid Glass 設計語言

## TODO 2027

- [ ] 新增 splash screen
- [ ] 以 solid radio button 切換表格/清單模式，改善目前需點擊才知道可切換的體驗
- [ ] 拆分元件（目前整個 React app 在單一 `app.jsx`）
- [ ] 將表演者名稱、舞台代碼、天數等抽成 enum / 常數設定檔，避免手動輸入出錯
