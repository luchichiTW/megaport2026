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
- 多歌手場次支援歌手切換瀏覽
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
- [ ] 將藝人名稱、舞台代碼、天數等抽成 enum / 常數設定檔，避免手動輸入出錯

## 串流資料待補

### 單一藝人

- [ ] Aooo [JP]
- [ ] milet [JP]
- [ ] NEE [JP]
- [ ] jo0ji [JP]
- [ ] 黑狼人肉戰車那卡西
- [ ] AVRALIZE [DE]
- [ ] 宅邦戰隊 OTAKUNI 學園祭
- [ ] 馬克
- [ ] Manic Sheep
- [ ] MoonD'shake
- [ ] BBFFMF
- [ ] 大象體操 比夢境真實紀錄長片
- [ ] 巨大的轟鳴
- [ ] Hiromi's Sonicwonder [JP・US・FR]
- [ ] 五月五日 [KR]
- [ ] 多米多羅 ft. 可凡
- [ ] 馬尾 ft. 立長
- [ ] LEIGHT NINE
- [ ] 破地獄
- [ ] 喜劇開港 單口喜劇
- [ ] Plutato
- [ ] 壓滿俱樂部
- [ ] debloop

### 多歌手場次（需分別補齊）

- [ ] **李竺芯 ft. 妮妮雅·瘋**
  - [ ] 李竺芯
  - [ ] 妮妮雅·瘋
- [ ] **Mong Tong × XTRUX**
  - [ ] Mong Tong
  - [ ] XTRUX
- [ ] **憂憂 ft. 奕碩**
  - [ ] 憂憂
  - [ ] 奕碩
- [ ] **寫下你對這場派對的心得 何勁旻｜陳冠哼**
  - [ ] 何勁旻
  - [ ] 陳冠哼
- [ ] **你也貢獻難聽 曾國宏｜許正泰**
  - [ ] 曾國宏
  - [ ] 許正泰
- [ ] **昭霖 & 甜吻吻**
  - [ ] 昭霖
  - [ ] 甜吻吻
- [ ] **Gummy B × 陳嫺靜**
  - [ ] Gummy B
  - [ ] 陳嫺靜
- [ ] **陪嗨吉放歌 vol.1 呱吉｜迪拉｜李毅誠**
  - [ ] 呱吉
  - [ ] 迪拉
  - [ ] 李毅誠
- [ ] **丸長世代 柯家洋｜阿舌**
  - [ ] 柯家洋
  - [ ] 阿舌
- [ ] **還有夜間限定 小堯｜阿賢**
  - [ ] 小堯
  - [ ] 阿賢
- [ ] **Slow Roast 慢熟｜Debby Wang 王思雅｜林映辰｜郝東東**
  - [ ] Slow Roast 慢熟
  - [ ] Debby Wang 王思雅
  - [ ] 林映辰
  - [ ] 郝東東

### 部分藝人缺少串流

- [ ] **憑光頭入場可換啤酒一瓶 光頭火鳥｜光頭美麗｜光頭珞亦**
  - [ ] 光頭火鳥（無任何資料）
  - [x] 光頭美麗（僅 Podcast）
  - [x] 光頭珞亦（僅 Podcast）

### DJ / 電音場（可能無串流）

- [ ] DJ N.OERS
- [ ] DJ GAN3DA
- [ ] DJ GTER
- [ ] DJ YU
- [ ] DJ DINDIN
- [ ] Brain Youth
- [ ] Mr. Kloud
- [ ] DJ ChiLL
- [ ] DJ QuestionMark 英語金曲復興運動
- [ ] DJ Hunter
- [ ] **DCIV + Lazy Habits**
  - [ ] DCIV
  - [ ] Lazy Habits
- [ ] **Flowstrong + Dac**
  - [ ] Flowstrong
  - [ ] Dac
- [ ] **BRADD + 阿法**
  - [ ] BRADD
  - [ ] 阿法
- [ ] That's My Shhh
- [ ] DJ 賴皮 MR.SKIN 國語作業簿
- [ ] **DJ Litro ft. 大樹下練歌坊**
  - [ ] DJ Litro
  - [ ] 大樹下練歌坊

### 親子區（不需串流）

- [ ] 好朋友集合！巧虎的港邊大冒險
- [ ] 蘇俊穎 掌中木偶劇團
- [ ] 生活大擊合
- [ ] **蓓蓓姐姐＆芋泥姐姐唱跳秀**
  - [ ] 蓓蓓姐姐
  - [ ] 芋泥姐姐
