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

- [x] Aooo [JP]
- [x] milet [JP]
- [x] NEE [JP]
- [ ] jo0ji [JP]（缺 YouTube）
- [ ] 黑狼人肉戰車那卡西（手動找）
- [x] AVRALIZE [DE]
- [ ] 宅邦戰隊 OTAKUNI 學園祭（手動找）
- [ ] 馬克（手動找）
- [ ] Manic Sheep（缺 YouTube）
- [ ] MoonD'shake（缺 YouTube）
- [ ] BBFFMF（缺 YouTube）
- [ ] 大象體操 比夢境真實紀錄長片（手動找）
- [ ] 巨大的轟鳴（缺 YouTube）
- [ ] Hiromi's Sonicwonder [JP・US・FR]（缺 YouTube）
- [ ] 五月五日 [KR]（缺 YouTube）
- [ ] LEIGHT NINE（手動找）
- [ ] 破地獄（缺 YouTube）
- [x] 喜劇開港 單口喜劇（Podcast）
- [ ] Plutato（缺 YouTube）
- [ ] 壓滿俱樂部（手動找）
- [ ] debloop（缺 YouTube）

### 多歌手場次（需分別補齊）

- [ ] **李竺芯 ft. 妮妮雅·瘋**
  - [ ] 李竺芯（缺 YouTube）
  - [ ] 妮妮雅·瘋（手動找，變裝皇后妮妃雅）
- [ ] **Mong Tong × XTRUX**
  - [ ] Mong Tong（缺 YouTube）
  - [ ] XTRUX（手動找，新媒體藝術團隊）
- [ ] **憂憂 ft. 奕碩**
  - [ ] 憂憂（僅 Apple Music，手動找 Spotify/YouTube）
  - [ ] 奕碩（手動找）
- [ ] **寫下你對這場派對的心得 何勁旻｜陳冠哼**
  - [ ] 何勁旻（手動找）
  - [ ] 陳冠哼（手動找）
- [ ] **你也貢獻難聽 曾國宏｜許正泰**
  - [ ] 曾國宏（缺 YouTube/StreetVoice）
  - [ ] 許正泰（手動找）
- [ ] **昭霖 & 甜吻吻**
  - [ ] 昭霖（僅 Spotify，手動找其餘）
  - [ ] 甜吻吻（手動找）
- [ ] **Gummy B × 陳嫺靜**
  - [x] Gummy B（缺 YouTube）
  - [x] 陳嫺靜（缺 YouTube）
- [ ] **陪嗨吉放歌 vol.1 呱吉｜迪拉｜李毅誠**
  - [x] 呱吉（Podcast）
  - [ ] 迪拉（手動找）
  - [x] 李毅誠（Podcast）
- [ ] **丸長世代 柯家洋｜阿舌**
  - [ ] 柯家洋（手動找）
  - [ ] 阿舌（手動找）
- [ ] **還有夜間限定 小堯｜阿賢**
  - [ ] 小堯（手動找）
  - [ ] 阿賢（手動找）
- [ ] **Slow Roast 慢熟｜Debby Wang 王思雅｜林映辰｜郝東東**
  - [ ] Slow Roast 慢熟（手動找）
  - [x] Debby Wang 王思雅（缺 YouTube）
  - [x] 林映辰（僅 StreetVoice）
  - [ ] 郝東東（手動找）
- [ ] **多米多羅 ft. 可凡**
  - [ ] 多米多羅（手動找）
  - [ ] 可凡（手動找）
- [ ] **馬尾 ft. 立長**
  - [ ] 馬尾（手動找）
  - [ ] 立長（手動找）
- [x] **血肉果汁機 ft. 陳亞蘭**
  - [x] 血肉果汁機
  - [x] 陳亞蘭
- [x] **怕胖團 ft. 陽帆**
  - [x] 怕胖團
  - [x] 陽帆（缺 YouTube）
- [x] **拍謝少年 ft. AYUNi D from PEDRO**
  - [x] 拍謝少年
  - [x] AYUNi D（缺 YouTube）
- [ ] **美麗本人 ft. 異鄉人**
  - [x] 美麗本人
  - [ ] 異鄉人
- [ ] **ゲシュタルト乙女 urban session ft. yurinasia**
  - [x] ゲシュタルト乙女
  - [ ] yurinasia
- [ ] **隨性 ft. 婷文**
  - [x] 隨性
  - [ ] 婷文
- [ ] **FunkyMo ft. 小尾巴**
  - [x] FunkyMo
  - [ ] 小尾巴
- [ ] **薄荷葉 ft. JB**
  - [x] 薄荷葉
  - [ ] JB
- [ ] **派對超人 羅百吉 ft. 寶貝｜謝明諺｜C.Holly｜潤少｜LiiHAO**
  - [ ] 羅百吉
  - [ ] 寶貝
  - [ ] 謝明諺
  - [ ] C.Holly
  - [ ] 潤少
  - [ ] LiiHAO

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
