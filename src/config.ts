// ══════════════════════════════════════
// src/config.ts — Single config file for all event data
// Change this file to deploy a different event/year
// ══════════════════════════════════════

export interface StageInfo {
  name: string
  bg: string
}

export interface StageLoc {
  lat: number
  lng: number
}

export interface StageRegion {
  x: number
  y: number
  w: number
  h: number
}

export interface Performance {
  id: string
  day: number
  stage: string
  artist: string
  start: string
  end: string
}

export interface ArtistInfo {
  desc: string
  embedUrl?: string
}

export interface EventImage {
  src: string
  label: string
}

// ── Event info ──

export const EVENT = {
  name: "大港開唱 2026",
  shortName: "大港開唱",
  year: "2026",
  subtitle: "3/21–22 高雄駁二",
  dates: { 1: "2026-03-21", 2: "2026-03-22" } as Record<number, string>,
  dayLabels: { 1: "DAY 1 · 3/21 六", 2: "DAY 2 · 3/22 日" } as Record<number, string>,
  dayShortLabels: { 1: "DAY 1 · 3/21 (六)", 2: "DAY 2 · 3/22 (日)" } as Record<number, string>,
  mapSrc: "/img/megaport_festival_2026_map.jpg",
  images: [
    { src: "/img/megaport_festival_2026_map.jpg", label: "場地地圖" },
    { src: "/img/megaport_festival_2026_day_1.webp", label: "DAY 1 節目表 (3/21)" },
    { src: "/img/megaport_festival_2026_day_2.webp", label: "DAY 2 節目表 (3/22)" },
    { src: "/img/megaport_festival_2026_free_stage.jpg", label: "大樹下節目表" },
  ] as EventImage[],
  icons: {
    svg: "/icon.svg",
    png180: "/icon-180.png",
    png192: "/icon-192.png",
    png512: "/icon-512.png",
  },
  links: {
    instagram: "https://www.instagram.com/megaportfest/",
    github: "https://github.com/luchichiTW/megaport2026",
  },
}

// ── Stages ──

export const STAGES: Record<string, StageInfo> = {
  SO: { name: "南霸天", bg: "#8DB63C" }, DK: { name: "海龍王", bg: "#9B7BB5" },
  DG: { name: "女神龍", bg: "#E0348A" }, HB: { name: "海波浪", bg: "#3A9ED4" },
  KM: { name: "卡魔麥", bg: "#E8736A" }, CT: { name: "出頭天", bg: "#F0A820" },
  DX: { name: "大雄丸", bg: "#E03030" }, BS: { name: "藍寶石", bg: "#4A62A8" },
  QC: { name: "青春夢", bg: "#E8896A" }, XG: { name: "小港祭", bg: "#B8855A" },
  DS: { name: "大樹下", bg: "#2A9E52" },
}

// ── Stage GPS coordinates ──

export const STAGE_LOCS: Record<string, StageLoc> = {
  SO: { lat: 22.61653, lng: 120.28367 },
  DK: { lat: 22.61833, lng: 120.28913 },
  DG: { lat: 22.61725, lng: 120.28829 },
  HB: { lat: 22.61853, lng: 120.28580 },
  KM: { lat: 22.61730, lng: 120.28167 },
  CT: { lat: 22.61856, lng: 120.28490 },
  DX: { lat: 22.61749, lng: 120.28560 },
  BS: { lat: 22.61816, lng: 120.28553 },
  QC: { lat: 22.61839, lng: 120.28764 },
  XG: { lat: 22.61789, lng: 120.28184 },
  DS: { lat: 22.61844, lng: 120.28357 },
}

// ── Stage hotspot regions on map image (x%, y%, w%, h%) ──

export const STAGE_REGIONS: Record<string, StageRegion> = {
  SO: { x: 6.4, y: 33.2, w: 9.8, h: 41.4 },
  DK: { x: 72.4, y: 85.2, w: 7.9, h: 7.1 },
  DG: { x: 46.8, y: 80.8, w: 11.6, h: 12 },
  HB: { x: 58.2, y: 55.7, w: 9.3, h: 2.3 },
  KM: { x: 12.4, y: 19.1, w: 3.5, h: 6.8 },
  CT: { x: 54.3, y: 41.8, w: 7.8, h: 2.5 },
  DX: { x: 42.1, y: 60.7, w: 4.9, h: 3.6 },
  BS: { x: 51.4, y: 55.6, w: 6.1, h: 2.4 },
  QC: { x: 66.3, y: 73.3, w: 5.7, h: 4.6 },
  XG: { x: 24.3, y: 14.6, w: 4.9, h: 3.5 },
  DS: { x: 41.3, y: 33.0, w: 4.2, h: 4.1 },
}

// ── Schedule ──

export const SCHEDULE: Performance[] = [
  // ── Day 1 (03/21) ──

  // 南霸天
  {id:"1-SO-1",day:1,stage:"SO",artist:"椅子樂團",start:"12:30",end:"13:10"},
  {id:"1-SO-2",day:1,stage:"SO",artist:"The Birthday [JP]",start:"14:10",end:"14:50"},
  {id:"1-SO-3",day:1,stage:"SO",artist:"Aooo [JP]",start:"15:50",end:"16:30"},
  {id:"1-SO-4",day:1,stage:"SO",artist:"滅火器",start:"17:30",end:"18:10"},
  {id:"1-SO-5",day:1,stage:"SO",artist:"milet [JP]",start:"19:10",end:"19:50"},
  {id:"1-SO-6",day:1,stage:"SO",artist:"血肉果汁機 ft. 陳亞蘭",start:"21:10",end:"21:50"},

  // 海龍王
  {id:"1-DK-1",day:1,stage:"DK",artist:"NEE [JP]",start:"13:10",end:"13:50"},
  {id:"1-DK-2",day:1,stage:"DK",artist:"jo0ji [JP]",start:"14:40",end:"15:20"},
  {id:"1-DK-3",day:1,stage:"DK",artist:"黑狼人肉戰車那卡西",start:"16:00",end:"16:40"},
  {id:"1-DK-4",day:1,stage:"DK",artist:"AVRALIZE [DE]",start:"17:20",end:"18:00"},
  {id:"1-DK-5",day:1,stage:"DK",artist:"無妄合作社",start:"18:40",end:"19:20"},
  {id:"1-DK-6",day:1,stage:"DK",artist:"Käärijä [FI]",start:"20:10",end:"21:00"},

  // 女神龍
  {id:"1-DG-1",day:1,stage:"DG",artist:"海豚刑警",start:"12:30",end:"13:10"},
  {id:"1-DG-2",day:1,stage:"DG",artist:"漂流出口",start:"13:50",end:"14:30"},
  {id:"1-DG-3",day:1,stage:"DG",artist:"南瓜妮歌迷俱樂部",start:"15:10",end:"15:50"},
  {id:"1-DG-4",day:1,stage:"DG",artist:"the band apart [JP]",start:"16:40",end:"17:20"},
  {id:"1-DG-5",day:1,stage:"DG",artist:"same Sam but different. 鄭敬儒｜山姆｜楊世暄",start:"18:00",end:"18:40"},
  {id:"1-DG-6",day:1,stage:"DG",artist:"李竺芯 ft. 妮妮雅·瘋",start:"19:30",end:"20:00"},
  {id:"1-DG-7",day:1,stage:"DG",artist:"謝金燕",start:"21:00",end:"21:40"},

  // 海波浪
  {id:"1-HB-1",day:1,stage:"HB",artist:"倒車入庫",start:"13:10",end:"13:50"},
  {id:"1-HB-2",day:1,stage:"HB",artist:"DSPS",start:"14:30",end:"15:10"},
  {id:"1-HB-3",day:1,stage:"HB",artist:"Yokkorio",start:"15:50",end:"16:30"},
  {id:"1-HB-4",day:1,stage:"HB",artist:"Mong Tong × XTRUX",start:"17:10",end:"17:50"},
  {id:"1-HB-5",day:1,stage:"HB",artist:"體熊專科。Major in Body Bear",start:"18:40",end:"19:20"},
  {id:"1-HB-6",day:1,stage:"HB",artist:"宅邦戰隊 OTAKUNI 學園祭",start:"20:10",end:"21:40"},

  // 卡魔麥
  {id:"1-KM-1",day:1,stage:"KM",artist:"COLD DEW",start:"13:10",end:"13:50"},
  {id:"1-KM-2",day:1,stage:"KM",artist:"Yappy",start:"14:50",end:"15:30"},
  {id:"1-KM-3",day:1,stage:"KM",artist:"馬克",start:"16:30",end:"17:10"},
  {id:"1-KM-4",day:1,stage:"KM",artist:"P!SCO",start:"18:10",end:"18:50"},
  {id:"1-KM-5",day:1,stage:"KM",artist:"Manic Sheep",start:"19:50",end:"20:30"},

  // 出頭天
  {id:"1-CT-1",day:1,stage:"CT",artist:"MoonD'shake",start:"13:40",end:"14:20"},
  {id:"1-CT-2",day:1,stage:"CT",artist:"LAWA ft. Angie安吉",start:"15:00",end:"15:40"},
  {id:"1-CT-3",day:1,stage:"CT",artist:"憂憂 ft. 奕碩",start:"16:20",end:"17:00"},
  {id:"1-CT-4",day:1,stage:"CT",artist:"陳以恆",start:"17:40",end:"18:20"},

  // 大雄丸
  {id:"1-DX-1",day:1,stage:"DX",artist:"寫下你對這場派對的心得 何勁旻｜陳冠哼",start:"13:00",end:"14:00"},
  {id:"1-DX-2",day:1,stage:"DX",artist:"憑光頭入場可換啤酒一瓶 光頭火鳥｜光頭美麗｜光頭珞亦",start:"15:00",end:"16:00"},
  {id:"1-DX-3",day:1,stage:"DX",artist:"你也貢獻難聽 曾國宏｜許正泰",start:"17:00",end:"18:00"},

  // 藍寶石
  {id:"1-BS-1",day:1,stage:"BS",artist:"黃雨晴",start:"14:00",end:"14:40"},
  {id:"1-BS-2",day:1,stage:"BS",artist:"昭霖 & 甜吻吻",start:"15:20",end:"16:00"},
  {id:"1-BS-3",day:1,stage:"BS",artist:"BBFFMF",start:"16:40",end:"17:20"},
  {id:"1-BS-4",day:1,stage:"BS",artist:"美麗本人 ft. 異鄉人",start:"18:00",end:"18:40"},
  {id:"1-BS-5",day:1,stage:"BS",artist:"大象體操 比夢境真實紀錄長片",start:"19:20",end:"21:20"},

  // 青春夢
  {id:"1-QC-1",day:1,stage:"QC",artist:"共振效應",start:"13:20",end:"14:00"},
  {id:"1-QC-2",day:1,stage:"QC",artist:"帕崎拉",start:"14:40",end:"15:20"},
  {id:"1-QC-3",day:1,stage:"QC",artist:"MOTIF HIVE",start:"16:00",end:"16:40"},
  {id:"1-QC-4",day:1,stage:"QC",artist:"震樂堂",start:"17:20",end:"18:00"},
  {id:"1-QC-5",day:1,stage:"QC",artist:"庵心自在所",start:"18:40",end:"19:20"},

  // 小港祭
  {id:"1-XG-1",day:1,stage:"XG",artist:"DJ N.OERS",start:"15:00",end:"16:10"},
  {id:"1-XG-2",day:1,stage:"XG",artist:"DJ GAN3DA",start:"16:10",end:"17:20"},
  {id:"1-XG-3",day:1,stage:"XG",artist:"DJ GTER",start:"17:20",end:"18:40"},
  {id:"1-XG-4",day:1,stage:"XG",artist:"DJ YU",start:"18:40",end:"19:50"},
  {id:"1-XG-5",day:1,stage:"XG",artist:"DJ DINDIN",start:"19:50",end:"21:00"},

  // 大樹下
  {id:"1-DS-1",day:1,stage:"DS",artist:"Brain Youth",start:"15:00",end:"15:30"},
  {id:"1-DS-2",day:1,stage:"DS",artist:"Slow Roast 慢熟｜Debby Wang 王思雅｜林映辰｜郝東東",start:"15:30",end:"16:30"},
  {id:"1-DS-3",day:1,stage:"DS",artist:"Brain Youth",start:"16:30",end:"17:00"},
  {id:"1-DS-4",day:1,stage:"DS",artist:"Mr. Kloud",start:"17:00",end:"18:00"},
  {id:"1-DS-5",day:1,stage:"DS",artist:"DJ ChiLL",start:"18:00",end:"19:00"},

  // ── Day 2 (03/22) ──

  // 南霸天
  {id:"2-SO-1",day:2,stage:"SO",artist:"結束バンド [JP]",start:"12:30",end:"13:10"},
  {id:"2-SO-2",day:2,stage:"SO",artist:"芒果醬",start:"14:10",end:"14:50"},
  {id:"2-SO-3",day:2,stage:"SO",artist:"康士坦的變化球",start:"15:50",end:"16:30"},
  {id:"2-SO-4",day:2,stage:"SO",artist:"怕胖團 ft. 陽帆",start:"17:30",end:"18:10"},
  {id:"2-SO-5",day:2,stage:"SO",artist:"拍謝少年 ft. AYUNi D from PEDRO",start:"19:10",end:"19:50"},
  {id:"2-SO-6",day:2,stage:"SO",artist:"落日飛車",start:"21:10",end:"21:50"},

  // 海龍王
  {id:"2-DK-1",day:2,stage:"DK",artist:"EmptyORio",start:"13:20",end:"14:00"},
  {id:"2-DK-2",day:2,stage:"DK",artist:"ゲシュタルト乙女 urban session ft. yurinasia",start:"14:40",end:"15:20"},
  {id:"2-DK-3",day:2,stage:"DK",artist:"隨性 ft. 婷文",start:"16:00",end:"16:40"},
  {id:"2-DK-4",day:2,stage:"DK",artist:"NOVELISTS [FR]",start:"17:20",end:"18:00"},
  {id:"2-DK-5",day:2,stage:"DK",artist:"巨大的轟鳴",start:"18:40",end:"19:20"},
  {id:"2-DK-6",day:2,stage:"DK",artist:"Hiromi's Sonicwonder [JP・US・FR]",start:"20:10",end:"21:10"},

  // 女神龍
  {id:"2-DG-1",day:2,stage:"DG",artist:"HUSH",start:"12:40",end:"13:20"},
  {id:"2-DG-2",day:2,stage:"DG",artist:"TOOBOE [JP]",start:"14:00",end:"14:40"},
  {id:"2-DG-3",day:2,stage:"DG",artist:"Gummy B × 陳嫺靜",start:"15:20",end:"16:00"},
  {id:"2-DG-4",day:2,stage:"DG",artist:"當代電影大師",start:"16:40",end:"17:20"},
  {id:"2-DG-5",day:2,stage:"DG",artist:"鄭宜農",start:"18:00",end:"18:40"},
  {id:"2-DG-6",day:2,stage:"DG",artist:"BAND-MAID [JP]",start:"19:30",end:"20:10"},
  {id:"2-DG-7",day:2,stage:"DG",artist:"AiNA THE END [JP]",start:"21:00",end:"21:40"},

  // 海波浪
  {id:"2-HB-1",day:2,stage:"HB",artist:"黃宇寒",start:"13:10",end:"13:50"},
  {id:"2-HB-2",day:2,stage:"HB",artist:"KINAKO & 東京中央線",start:"14:30",end:"15:10"},
  {id:"2-HB-3",day:2,stage:"HB",artist:"多米多羅 ft. 可凡",start:"15:50",end:"16:30"},
  {id:"2-HB-4",day:2,stage:"HB",artist:"FunkyMo ft. 小尾巴",start:"17:10",end:"17:50"},
  {id:"2-HB-5",day:2,stage:"HB",artist:"粉紅噪音",start:"18:30",end:"19:10"},
  {id:"2-HB-6",day:2,stage:"HB",artist:"派對超人 羅百吉 ft. 寶貝｜謝明諺｜C.Holly｜潤少｜LiiHAO",start:"20:10",end:"21:40"},

  // 卡魔麥
  {id:"2-KM-1",day:2,stage:"KM",artist:"TSS [FR]",start:"13:10",end:"13:50"},
  {id:"2-KM-2",day:2,stage:"KM",artist:"恆月三途",start:"14:50",end:"15:30"},
  {id:"2-KM-3",day:2,stage:"KM",artist:"五月五日 [KR]",start:"16:30",end:"17:10"},
  {id:"2-KM-4",day:2,stage:"KM",artist:"Infernal Chaos",start:"18:10",end:"18:50"},
  {id:"2-KM-5",day:2,stage:"KM",artist:"忘憂水",start:"19:50",end:"20:30"},

  // 出頭天
  {id:"2-CT-1",day:2,stage:"CT",artist:"畫室",start:"13:40",end:"14:20"},
  {id:"2-CT-2",day:2,stage:"CT",artist:"薄荷葉 ft. JB",start:"15:00",end:"15:40"},
  {id:"2-CT-3",day:2,stage:"CT",artist:"馬尾 ft. 立長",start:"16:20",end:"17:00"},
  {id:"2-CT-4",day:2,stage:"CT",artist:"洪安妮",start:"17:40",end:"18:20"},

  // 大雄丸
  {id:"2-DX-1",day:2,stage:"DX",artist:"陪嗨吉放歌 vol.1 呱吉｜迪拉｜李毅誠",start:"13:00",end:"14:00"},
  {id:"2-DX-2",day:2,stage:"DX",artist:"丸長世代 柯家洋｜阿舌",start:"15:00",end:"16:00"},
  {id:"2-DX-3",day:2,stage:"DX",artist:"還有夜間限定 小堯｜阿賢",start:"17:00",end:"18:00"},

  // 藍寶石
  {id:"2-BS-1",day:2,stage:"BS",artist:"LEIGHT NINE",start:"14:00",end:"14:40"},
  {id:"2-BS-2",day:2,stage:"BS",artist:"破地獄",start:"15:20",end:"16:00"},
  {id:"2-BS-3",day:2,stage:"BS",artist:"喜劇開港 單口喜劇",start:"16:40",end:"17:20"},
  {id:"2-BS-4",day:2,stage:"BS",artist:"Plutato",start:"18:00",end:"18:40"},

  // 青春夢
  {id:"2-QC-1",day:2,stage:"QC",artist:"打倒三明治",start:"13:20",end:"14:00"},
  {id:"2-QC-2",day:2,stage:"QC",artist:"壓滿俱樂部",start:"14:40",end:"15:20"},
  {id:"2-QC-3",day:2,stage:"QC",artist:"沈默紳士",start:"16:00",end:"16:40"},
  {id:"2-QC-4",day:2,stage:"QC",artist:"debloop",start:"17:20",end:"18:00"},
  {id:"2-QC-5",day:2,stage:"QC",artist:"貓膽汁",start:"18:40",end:"19:20"},

  // 小港祭
  {id:"2-XG-1",day:2,stage:"XG",artist:"DJ QuestionMark 英語金曲復興運動",start:"15:00",end:"16:20"},
  {id:"2-XG-2",day:2,stage:"XG",artist:"DCIV + Lazy Habits",start:"16:20",end:"17:00"},
  {id:"2-XG-3",day:2,stage:"XG",artist:"Flowstrong + Dac",start:"17:00",end:"17:40"},
  {id:"2-XG-4",day:2,stage:"XG",artist:"BRADD + 阿法",start:"17:40",end:"18:20"},
  {id:"2-XG-5",day:2,stage:"XG",artist:"That's My Shhh",start:"18:20",end:"19:40"},
  {id:"2-XG-6",day:2,stage:"XG",artist:"DJ 賴皮 MR.SKIN 國語作業簿",start:"19:40",end:"21:00"},

  // 大樹下
  {id:"2-DS-1",day:2,stage:"DS",artist:"蘇俊穎 掌中木偶劇團",start:"15:00",end:"16:00"},
  {id:"2-DS-2",day:2,stage:"DS",artist:"DJ Hunter",start:"16:00",end:"17:00"},
  {id:"2-DS-3",day:2,stage:"DS",artist:"DJ ChiLL",start:"17:00",end:"18:00"},
  {id:"2-DS-4",day:2,stage:"DS",artist:"DJ Litro ft. 大樹下練歌坊",start:"18:00",end:"19:00"},
]

// ── Artist descriptions & Apple Music embeds ──

export const ARTISTS: Record<string, ArtistInfo> = {
  "AiNA THE END [JP]":{desc:"2015年，以「不拿樂器的龐克樂團」BiSH的成員身分開始活動。\n2021年發行了全部曲目都由自己作詞作曲的首張專輯《THE END》，正式展開個人活動。\n2023年6月，BiSH在眾多不捨中解散，目前持續進行個人活動。\n在以歌手身份活動的同時，2022年，她在百老匯音樂劇《Janis》中擔任主演，飾演主角Janis Joplin。2023年10月，在岩井俊二執導的電影《祈憐之歌》中首次擔任電影主角，並以此作品獲得日本電影學院獎新人演員獎等多項殊榮。\n2024年9月舉辦個人首次日本武道館公演 \"ENDROLL\" ，門票秒殺。\n12月並在台北舉辦她的首次海外專場演唱會。\n2025年，發行動畫《膽大黨》第二季片頭曲〈革命途中 – On The Way〉，這首歌在社群媒體總播放次數突破12億次，並在Billboard JAPAN Hot 100達成連續18週進榜紀錄，於Billboard Japan Global Japan Songs excl. Japan榜單獲得冠軍，在多項排行榜上取得亮眼成績，於日本國內外皆引爆話題（以上為截至 11/14之成績）。\n10月份完成了巡迴全日本9座城市的個人巡演 \"革命途中\" 。\n12月預計於東京花園劇場舉辦個人演唱會 \"nukariari\" 。\n此外，她也確定將在團體解散後首次以個人身分獲邀演出日本年底最大音樂盛事 \"第76屆 NHK 紅白歌合戰\" 。"},
  "BAND-MAID [JP]":{desc:"BAND-MAID 成立於 2013 年，是一支由五位成員組成的全女性硬式搖滾樂團，以震撼力十足的音樂風格聞名。\n別被她們女僕風格的服裝給騙了——這五位音樂人都是實力驚人的創作者與演出者。爆裂的音牆、凌厲的吉他演奏、如雷貫耳的鼓擊，以及讓人一聽就上癮的旋律勾子，使她們贏得了全球樂迷與媒體的一致讚譽。\n隨著國內外粉絲群迅速成長，BAND-MAID 已在美國與歐洲多地舉辦多場完售演出。她們令人瞠目結舌的演奏實力，也引發無數 YouTube 反應影片，官方頻道總觀看次數突破 2.5 億次，粉絲自製的反應影片觀看數亦超過 4,000 萬次。\n2025 年，BAND-MAID 為三部人氣動畫演唱片頭與片尾主題曲，並推出 EP《SCOOOOOP》。\n以「世界征服（WORLD DOMINATION）」為終極使命，BAND-MAID 持續以無可阻擋之姿，在全球舞台上全力進擊。"},
  "COLD DEW":{desc:"成立於2018年中，由林哲安(主唱、吉他)、吳征峻(吉他)、蔡瑀晟(貝斯)、吳征鴻(鼓)組成。\n曲風多以噪音、迷幻、藍調、瞪鞋為主；聲響呈現上，強調狂躁飆揚、強烈失真的吉他與猛烈的鼓；歌詞則以人與自然間的互動為本，並融入老莊的思想概念。\n2020年初，發行《2020.02.23 LIVE AT REVOLVER》現場錄音。2021年十月，發行首張錄音室作品《欲欲》。2022年法國廠牌巫唱片發行《欲欲》黑膠版本專輯。2025年7月發行最新錄音室專輯《臺北人文地景》。"},
  "DSPS":{desc:"成立於 2014 年，由主唱曾稔文、吉他手詹詠翔、貝斯手鐘奕安、鼓手莊子恒組成。日常的歌詞、清爽的人聲和飽富點綴的吉他節奏，再加上複雜且特殊的鼓點與貝斯，主要以 Indie Pop 與 Guitar Pop 曲風成為其音樂脈絡。"},
  "EmptyORio":{desc:"用最真實的樣子，跟世界直球對決！\n由左起主唱宇辰、鼓手柯光、吉他手牧、貝斯手雷誰所組成。"},
  "HUSH":{desc:"自2010年起HUSH便以一手深具想象空間的好詞、慵懶憂鬱的煙嗓音魅惑眾生。"},
  "Infernal Chaos":{desc:"成立於2004年的指標性金屬核樂團，融合極端金屬張力與現代聲響美學的重型樂團。"},
  "Käärijä [FI]":{desc:"突破界限的藝術家卡里亞 (Käärijä) 於 2023 年創造了芬蘭音樂史，他以壓倒性的票數成為歐洲歌唱大賽的奪冠熱門。"},
  "NOVELISTS [FR]":{desc:"NOVELISTS 成立於 2013 年，來自法國巴黎。"},
  "TOOBOE [JP]":{desc:"TOOBOE是音樂創作人john的個人項目，他涉獵廣泛，包括歌曲創作、作曲、編曲、演唱、插畫和影片製作。"},
  "TSS [FR]":{desc:"TSS（前身為The Sunday Sadness）是一支充滿活力的法國現代金屬樂隊。"},
  "The Birthday [JP]":{desc:"The Birthday 成立於 2005 年 9 月，以 Chiba Yusuke（主唱／吉他）為核心組成。"},
  "the band apart [JP]":{desc:"The Band Apart樂團成立於1998年，成員包括川崎幸一（吉他）、原正和（貝斯）、新井武（主唱/吉他）和木暮榮一（鼓手）。"},
  "結束バンド [JP]":{desc:"「結束バンド」是由動畫《孤獨搖滾！》中組成的搖滾樂團。\n本次為「結束バンド」首次出演海外音樂祭！"},
  "滅火器":{desc:"以龐克搖滾為基調，歌詞真實的反應時代與生活，貼近大眾引發許多共鳴。"},
  "落日飛車":{desc:"台灣浪漫流行樂團「落日飛車」。島國濕潤又鬆弛的空氣瀰漫在他們的音樂中。"},
  "鄭宜農":{desc:"發行個人專輯《海王星》《Pluto》《給天王星》《水逆》以及多首影視主題曲。"},
  "康士坦的變化球":{desc:"成立於2013年，曲風由後搖、Emo Punk 加入 Hardcore 及全員主唱的元素。"},
}
