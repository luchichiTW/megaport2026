import { useState, useEffect, useCallback, useMemo } from "react";

/*
 ═══════════════════════════════════════════════════════════════
  🎸 大港開唱 2026 — Megaport Festival Schedule Planner
  📅 2026/03/21–22 高雄駁二藝術特區
  💾 資料以 IndexedDB 存在使用者端，跨 session 保留
 ═══════════════════════════════════════════════════════════════
*/

const STAGES = {
  SO: { name: "南霸天", bg: "#E63946" },
  DK: { name: "海龍王", bg: "#264653" },
  DG: { name: "女神龍", bg: "#E76F51" },
  HB: { name: "海波浪", bg: "#7E57C2" },
  KM: { name: "卡魔麥", bg: "#00897B" },
  CT: { name: "出頭天", bg: "#EF6C00" },
  DX: { name: "大雄丸", bg: "#D4A017" },
  BS: { name: "藍寶石", bg: "#5C6BC0" },
  QC: { name: "青春夢", bg: "#EC407A" },
  XG: { name: "小港祭", bg: "#26A69A" },
};

// 時刻表資料（從官方節目表圖片逐格抄錄）
const T = [
  // ════════════ DAY 1 — 03/21 (六) ════════════
  // 南霸天
  { id:"1-SO-1", day:1, stage:"SO", artist:"椅子樂團", start:"12:40", end:"13:00" },
  { id:"1-SO-2", day:1, stage:"SO", artist:"The Birthday [JP]", start:"14:20", end:"14:50" },
  { id:"1-SO-3", day:1, stage:"SO", artist:"Aooo [JP]", start:"16:00", end:"16:20" },
  { id:"1-SO-4", day:1, stage:"SO", artist:"滅火器", start:"17:40", end:"18:00" },
  { id:"1-SO-5", day:1, stage:"SO", artist:"milet [JP]", start:"19:20", end:"19:50" },
  { id:"1-SO-6", day:1, stage:"SO", artist:"血肉果汁機 ft. 陳亞蘭", start:"21:10", end:"21:50" },
  // 女神龍
  { id:"1-DG-1", day:1, stage:"DG", artist:"海豚刑警", start:"12:40", end:"13:00" },
  { id:"1-DG-2", day:1, stage:"DG", artist:"倒車入庫", start:"13:10", end:"13:40" },
  { id:"1-DG-3", day:1, stage:"DG", artist:"漂流出口", start:"14:00", end:"14:20" },
  { id:"1-DG-4", day:1, stage:"DG", artist:"南瓜妮歌迷俱樂部", start:"15:10", end:"15:40" },
  { id:"1-DG-5", day:1, stage:"DG", artist:"the band apart [JP]", start:"16:50", end:"17:10" },
  { id:"1-DG-6", day:1, stage:"DG", artist:"same Sam but different. 鄭敬儀｜山姆 楊世暄", start:"18:00", end:"18:30" },
  { id:"1-DG-7", day:1, stage:"DG", artist:"李竺芯 ft. 妮妮雅·瘋", start:"19:30", end:"20:00" },
  { id:"1-DG-8", day:1, stage:"DG", artist:"謝金燕", start:"21:00", end:"21:20" },
  // 海龍王
  { id:"1-DK-1", day:1, stage:"DK", artist:"NEE [JP]", start:"13:10", end:"13:40" },
  { id:"1-DK-2", day:1, stage:"DK", artist:"jo0ji [JP]", start:"14:50", end:"15:20" },
  { id:"1-DK-3", day:1, stage:"DK", artist:"黑狼人肉戰車 那卡西", start:"16:00", end:"16:30" },
  { id:"1-DK-4", day:1, stage:"DK", artist:"AVRALIZE [DE]", start:"17:30", end:"17:50" },
  { id:"1-DK-5", day:1, stage:"DK", artist:"無妄合作社", start:"18:50", end:"19:10" },
  { id:"1-DK-6", day:1, stage:"DK", artist:"Käärijä [FI]", start:"20:20", end:"21:00" },
  // 海波浪
  { id:"1-HB-1", day:1, stage:"HB", artist:"DSPS", start:"14:40", end:"15:00" },
  { id:"1-HB-2", day:1, stage:"HB", artist:"Yokkorio", start:"16:00", end:"16:30" },
  { id:"1-HB-3", day:1, stage:"HB", artist:"Mong Tong × XTRUX", start:"17:20", end:"17:50" },
  { id:"1-HB-4", day:1, stage:"HB", artist:"體熊專科。Major in Body Bear", start:"18:50", end:"19:10" },
  { id:"1-HB-5", day:1, stage:"HB", artist:"宅邦戰隊 OTAKUNI 學園祭", start:"20:30", end:"21:00" },
  // 卡魔麥
  { id:"1-KM-1", day:1, stage:"KM", artist:"COLD DEW", start:"13:10", end:"13:40" },
  { id:"1-KM-2", day:1, stage:"KM", artist:"MoonD'shake", start:"13:50", end:"14:10" },
  { id:"1-KM-3", day:1, stage:"KM", artist:"Yappy", start:"15:00", end:"15:20" },
  { id:"1-KM-4", day:1, stage:"KM", artist:"馬克", start:"16:40", end:"17:00" },
  { id:"1-KM-5", day:1, stage:"KM", artist:"陳以恆", start:"17:50", end:"18:10" },
  { id:"1-KM-6", day:1, stage:"KM", artist:"P!SCO", start:"18:20", end:"18:50" },
  { id:"1-KM-7", day:1, stage:"KM", artist:"Manic Sheep", start:"20:00", end:"20:20" },
  // 出頭天
  { id:"1-CT-1", day:1, stage:"CT", artist:"LAWA ft. Angie安吉", start:"15:00", end:"15:40" },
  { id:"1-CT-2", day:1, stage:"CT", artist:"憂憂 ft. 奕碩", start:"16:30", end:"16:50" },
  // 大雄丸
  { id:"1-DX-1", day:1, stage:"DX", artist:"寫下你對這場派對的心得 何勁旻 陳冠哼", start:"13:10", end:"13:40" },
  { id:"1-DX-2", day:1, stage:"DX", artist:"憑光頭入場 光頭火鳥 光頭美麗 光頭珞亦", start:"15:10", end:"15:50" },
  { id:"1-DX-3", day:1, stage:"DX", artist:"你也貢獻難聽 曾國宏 許正泰", start:"17:20", end:"17:50" },
  { id:"1-DX-4", day:1, stage:"DX", artist:"大象體操 比夢境真實 紀錄長片", start:"19:20", end:"19:50" },
  // 藍寶石
  { id:"1-BS-1", day:1, stage:"BS", artist:"黃雨晴", start:"14:10", end:"14:30" },
  { id:"1-BS-2", day:1, stage:"BS", artist:"帕崎拉", start:"14:50", end:"15:10" },
  { id:"1-BS-3", day:1, stage:"BS", artist:"昭霖 & 甜吻吻", start:"15:20", end:"15:50" },
  { id:"1-BS-4", day:1, stage:"BS", artist:"BBFFMF", start:"17:00", end:"17:10" },
  { id:"1-BS-5", day:1, stage:"BS", artist:"震樂堂", start:"17:30", end:"17:50" },
  { id:"1-BS-6", day:1, stage:"BS", artist:"美麗本人 ft. 異鄉人", start:"18:10", end:"18:40" },
  { id:"1-BS-7", day:1, stage:"BS", artist:"庵心自在所", start:"18:50", end:"19:10" },
  // 青春夢
  { id:"1-QC-1", day:1, stage:"QC", artist:"共振效應", start:"13:20", end:"13:50" },
  { id:"1-QC-2", day:1, stage:"QC", artist:"MOTIF HIVE", start:"16:10", end:"16:30" },
  // 小港祭
  { id:"1-XG-1", day:1, stage:"XG", artist:"DJ N.OERS", start:"15:20", end:"16:00" },
  { id:"1-XG-2", day:1, stage:"XG", artist:"DJ GAN3DA", start:"16:40", end:"17:10" },
  { id:"1-XG-3", day:1, stage:"XG", artist:"DJ GTER", start:"17:50", end:"18:10" },
  { id:"1-XG-4", day:1, stage:"XG", artist:"DJ YU", start:"19:00", end:"19:20" },
  { id:"1-XG-5", day:1, stage:"XG", artist:"DJ DINDIN", start:"20:20", end:"20:50" },

  // ════════════ DAY 2 — 03/22 (日) ════════════
  // 南霸天
  { id:"2-SO-1", day:2, stage:"SO", artist:"結束バンド [JP]", start:"12:40", end:"13:10" },
  { id:"2-SO-2", day:2, stage:"SO", artist:"芒果醬", start:"14:20", end:"14:40" },
  { id:"2-SO-3", day:2, stage:"SO", artist:"康士坦的變化球", start:"16:00", end:"16:20" },
  { id:"2-SO-4", day:2, stage:"SO", artist:"怕胖團 ft. 陽帆", start:"17:30", end:"18:00" },
  { id:"2-SO-5", day:2, stage:"SO", artist:"拍謝少年 ft. AYUNi D from PEDRO", start:"19:10", end:"19:50" },
  { id:"2-SO-6", day:2, stage:"SO", artist:"落日飛車", start:"21:10", end:"21:50" },
  // 女神龍
  { id:"2-DG-1", day:2, stage:"DG", artist:"HUSH", start:"12:50", end:"13:20" },
  { id:"2-DG-2", day:2, stage:"DG", artist:"TOOBOE [JP]", start:"14:10", end:"14:40" },
  { id:"2-DG-3", day:2, stage:"DG", artist:"Gummy B × 陳嫺靜", start:"15:20", end:"15:50" },
  { id:"2-DG-4", day:2, stage:"DG", artist:"當代電影大師", start:"16:50", end:"17:10" },
  { id:"2-DG-5", day:2, stage:"DG", artist:"鄭宜農", start:"18:10", end:"18:30" },
  { id:"2-DG-6", day:2, stage:"DG", artist:"BAND-MAID [JP]", start:"19:40", end:"20:10" },
  { id:"2-DG-7", day:2, stage:"DG", artist:"AiNA THE END [JP]", start:"21:00", end:"21:40" },
  // 海龍王
  { id:"2-DK-1", day:2, stage:"DK", artist:"EmptyORio", start:"13:20", end:"13:50" },
  { id:"2-DK-2", day:2, stage:"DK", artist:"ゲシュタルト乙女 urban session ft. yurinasia", start:"14:40", end:"15:10" },
  { id:"2-DK-3", day:2, stage:"DK", artist:"隨性 ft. 婷文", start:"16:00", end:"16:40" },
  { id:"2-DK-4", day:2, stage:"DK", artist:"NOVELISTS [FR]", start:"17:20", end:"17:50" },
  { id:"2-DK-5", day:2, stage:"DK", artist:"巨大的轟鳴", start:"18:50", end:"19:10" },
  { id:"2-DK-6", day:2, stage:"DK", artist:"Hiromi's Sonicwonder [JP・US・FR]", start:"20:20", end:"21:10" },
  // 海波浪
  { id:"2-HB-1", day:2, stage:"HB", artist:"黃宇寒", start:"13:10", end:"13:50" },
  { id:"2-HB-2", day:2, stage:"HB", artist:"KINAKO & 東京中央線", start:"14:40", end:"15:10" },
  { id:"2-HB-3", day:2, stage:"HB", artist:"多米多羅 ft. 可凡", start:"15:50", end:"16:20" },
  { id:"2-HB-4", day:2, stage:"HB", artist:"FunkyMo ft. 小尾巴", start:"17:10", end:"17:50" },
  { id:"2-HB-5", day:2, stage:"HB", artist:"粉紅噪音", start:"18:40", end:"19:00" },
  { id:"2-HB-6", day:2, stage:"HB", artist:"派對超人 羅百吉 ft. 寶貝 謝明諺 C.Holly 潤少 LiiHAO", start:"20:20", end:"21:10" },
  // 卡魔麥
  { id:"2-KM-1", day:2, stage:"KM", artist:"TSS [FR]", start:"13:20", end:"13:50" },
  { id:"2-KM-2", day:2, stage:"KM", artist:"薄荷葉 ft. JB", start:"15:10", end:"15:40" },
  { id:"2-KM-3", day:2, stage:"KM", artist:"五月五日 [KR]", start:"16:40", end:"17:00" },
  { id:"2-KM-4", day:2, stage:"KM", artist:"Infernal Chaos", start:"18:20", end:"18:50" },
  // 出頭天
  { id:"2-CT-1", day:2, stage:"CT", artist:"畫室", start:"13:50", end:"14:20" },
  { id:"2-CT-2", day:2, stage:"CT", artist:"恆月三途", start:"15:00", end:"15:20" },
  { id:"2-CT-3", day:2, stage:"CT", artist:"馬尾 ft. 立長", start:"16:30", end:"17:00" },
  { id:"2-CT-4", day:2, stage:"CT", artist:"洪安妮", start:"17:50", end:"18:10" },
  { id:"2-CT-5", day:2, stage:"CT", artist:"忘憂水", start:"20:00", end:"20:20" },
  // 大雄丸
  { id:"2-DX-1", day:2, stage:"DX", artist:"陪嗨吉放歌 vol.1 唱吉｜迪拉 李毅誠", start:"13:10", end:"13:50" },
  { id:"2-DX-2", day:2, stage:"DX", artist:"丸長世代 柯家洋 阿舌", start:"15:10", end:"15:50" },
  { id:"2-DX-3", day:2, stage:"DX", artist:"還有夜間限定 小兔｜阿賢", start:"17:20", end:"17:50" },
  // 藍寶石
  { id:"2-BS-1", day:2, stage:"BS", artist:"LEIGHT NINE", start:"14:10", end:"14:40" },
  { id:"2-BS-2", day:2, stage:"BS", artist:"破地獄", start:"15:30", end:"15:50" },
  { id:"2-BS-3", day:2, stage:"BS", artist:"沈默紳士", start:"16:20", end:"16:40" },
  { id:"2-BS-4", day:2, stage:"BS", artist:"喜劇開港 單口喜劇", start:"16:50", end:"17:10" },
  { id:"2-BS-5", day:2, stage:"BS", artist:"debloop", start:"17:30", end:"17:50" },
  { id:"2-BS-6", day:2, stage:"BS", artist:"Plutato", start:"18:10", end:"18:30" },
  { id:"2-BS-7", day:2, stage:"BS", artist:"貓膽汁", start:"18:50", end:"19:10" },
  // 青春夢
  { id:"2-QC-1", day:2, stage:"QC", artist:"打倒三明治", start:"13:30", end:"14:00" },
  { id:"2-QC-2", day:2, stage:"QC", artist:"壓滿俱樂部", start:"14:50", end:"15:10" },
  { id:"2-QC-3", day:2, stage:"QC", artist:"Flowstrong + Dac", start:"17:10", end:"17:30" },
  { id:"2-QC-4", day:2, stage:"QC", artist:"BRADD + 阿法", start:"17:50", end:"18:10" },
  { id:"2-QC-5", day:2, stage:"QC", artist:"That's My Shhh", start:"18:50", end:"19:40" },
  // 小港祭
  { id:"2-XG-1", day:2, stage:"XG", artist:"DJ QuestionMark 英語金曲復興運動", start:"15:20", end:"16:00" },
  { id:"2-XG-2", day:2, stage:"XG", artist:"DCIV + Lazy Habits", start:"16:40", end:"17:00" },
  { id:"2-XG-3", day:2, stage:"XG", artist:"DJ 賴皮 MR.SKIN 國語作業簿", start:"20:10", end:"20:50" },
];

// ── Utils ──
const t2m = t => { const [h,m]=t.split(":").map(Number); return h*60+m };
const clash = (a,b) => a.day===b.day && t2m(a.start)<t2m(b.end) && t2m(b.start)<t2m(a.end);

const openDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open("mp2026", 1);
  req.onupgradeneeded = () => req.result.createObjectStore("s");
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const dbGet = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = db.transaction("s", "readonly").objectStore("s").get("v");
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn("dbGet failed:", err);
    return [];
  }
};

const dbSet = async (value) => {
  try {
    const db = await openDB();
    db.transaction("s", "readwrite").objectStore("s").put(value, "v");
  } catch (err) {
    console.warn("dbSet failed:", err);
  }
};

// ── Styles ──
const S = {
  root:{minHeight:"100dvh",background:"#0B0B0D",color:"#E8E6E3",fontFamily:'"Noto Sans TC","SF Pro Display",-apple-system,sans-serif',maxWidth:520,margin:"0 auto",paddingBottom:72},
  hdr:{position:"sticky",top:0,zIndex:100,padding:"10px 14px 6px",background:"rgba(11,11,13,.92)",backdropFilter:"blur(24px) saturate(180%)",WebkitBackdropFilter:"blur(24px) saturate(180%)",borderBottom:"1px solid rgba(255,255,255,.06)"},
  h1:{fontSize:19,fontWeight:800,margin:0,letterSpacing:-.5,background:"linear-gradient(135deg,#E63946,#F4A261,#E9C46A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  sub:{fontSize:11,color:"#666",margin:"2px 0 0",fontWeight:500},
  vb:a=>({padding:"5px 13px",borderRadius:7,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",background:a?"rgba(230,57,70,.18)":"rgba(255,255,255,.05)",color:a?"#E63946":"#888"}),
  db:a=>({flex:1,padding:"7px 0",borderRadius:8,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",background:a?"linear-gradient(135deg,#E63946,#C1121F)":"rgba(255,255,255,.05)",color:a?"#fff":"#888"}),
  si:{width:"100%",padding:"8px 12px 8px 30px",borderRadius:8,boxSizing:"border-box",border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.04)",color:"#E8E6E3",fontSize:14,outline:"none",fontFamily:"inherit",marginTop:6},
  sb:(a,bg)=>({padding:"3px 9px",borderRadius:6,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",background:a?(bg?bg+"30":"rgba(255,255,255,.13)"):"rgba(255,255,255,.04)",color:a?(bg||"#fff"):"#555",transition:"all .15s"}),
  bg:(c,sm)=>({display:"inline-block",background:c,color:"#fff",padding:sm?"1px 5px":"2px 7px",borderRadius:4,fontSize:sm?9:10,fontWeight:700,letterSpacing:.3,whiteSpace:"nowrap",flexShrink:0}),
  cd:(s,st,d)=>({display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 12px",borderRadius:10,cursor:"pointer",textAlign:"left",border:s?`2px solid ${STAGES[st]?.bg}`:d?"2px dashed rgba(255,80,80,.25)":"2px solid rgba(255,255,255,.04)",background:s?STAGES[st]?.bg+"14":d?"rgba(255,50,50,.03)":"rgba(255,255,255,.02)",opacity:d&&!s?.55:1,transition:"all .12s",position:"relative",color:"#E8E6E3",fontFamily:"inherit"}),
  ck:bg=>({position:"absolute",top:-5,right:-5,width:18,height:18,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,.5)"}),
  si2:bg=>({background:bg+"10",borderLeft:`3px solid ${bg}`,borderRadius:"0 8px 8px 0",padding:"10px 12px",marginBottom:5}),
  em:{textAlign:"center",padding:"60px 20px",color:"#444",fontSize:14},
  cb:{display:"inline-block",background:"rgba(239,68,68,.12)",color:"#EF4444",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:4,marginLeft:6},
  bar:{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:"rgba(11,11,13,.95)",backdropFilter:"blur(16px)",borderTop:"1px solid rgba(255,255,255,.06)",padding:"8px 0",display:"flex",justifyContent:"center",gap:12,fontSize:11,color:"#777"},
};

export default function App() {
  const [sel,setSel]=useState([]);
  const [view,setView]=useState("pick");
  const [day,setDay]=useState(1);
  const [stg,setStg]=useState("ALL");
  const [q,setQ]=useState("");
  const [rdy,setRdy]=useState(false);

  useEffect(()=>{dbGet().then(v=>{setSel(v);setRdy(true)})},[]);
  useEffect(()=>{if(rdy)dbSet(sel)},[sel,rdy]);

  const toggle=useCallback(id=>setSel(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]),[]);

  const selItems=useMemo(()=>T.filter(t=>sel.includes(t.id)),[sel]);
  const confIds=useMemo(()=>{const s=new Set();for(let i=0;i<selItems.length;i++)for(let j=i+1;j<selItems.length;j++)if(clash(selItems[i],selItems[j])){s.add(selItems[i].id);s.add(selItems[j].id)}return s},[selItems]);
  const dimIds=useMemo(()=>{const s=new Set();T.forEach(t=>{if(sel.includes(t.id))return;for(const si of selItems)if(clash(t,si)){s.add(t.id);break}});return s},[sel,selItems]);

  const list=useMemo(()=>T.filter(t=>{if(t.day!==day)return false;if(stg!=="ALL"&&t.stage!==stg)return false;if(q&&!t.artist.toLowerCase().includes(q.toLowerCase()))return false;return true}).sort((a,b)=>t2m(a.start)-t2m(b.start)),[day,stg,q]);

  const sched=useMemo(()=>{const d={1:[],2:[]};selItems.forEach(i=>d[i.day]?.push(i));Object.values(d).forEach(a=>a.sort((x,y)=>t2m(x.start)-t2m(y.start)));return d},[selItems]);
  const stgsDay=useMemo(()=>{const s=new Set();T.forEach(t=>{if(t.day===day)s.add(t.stage)});return["ALL",...Object.keys(STAGES).filter(k=>s.has(k))]},[day]);
  const nC=Math.floor(confIds.size/2);

  return(
    <div style={S.root}>
      <div style={S.hdr}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <h1 style={S.h1}>大港開唱 2026</h1>
            <p style={S.sub}>3/21–22 高雄駁二 ・ 已選 {sel.length} 組{nC>0&&<span style={S.cb}>⚠ {nC} 組衝突</span>}</p>
          </div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>setView("pick")} style={S.vb(view==="pick")}>選團</button>
            <button onClick={()=>setView("sched")} style={S.vb(view==="sched")}>行程表</button>
          </div>
        </div>
        {view==="pick"&&<>
          <div style={{display:"flex",gap:4,marginTop:8}}>
            {[1,2].map(d=><button key={d} onClick={()=>{setDay(d);setStg("ALL")}} style={S.db(day===d)}>{d===1?"DAY 1 — 3/21 (六)":"DAY 2 — 3/22 (日)"}</button>)}
          </div>
          <div style={{position:"relative"}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜尋藝人 / Search..." style={S.si}/>
            <span style={{position:"absolute",left:9,top:14,fontSize:13,opacity:.35}}>🔍</span>
          </div>
          <div style={{display:"flex",gap:3,overflowX:"auto",paddingTop:6,paddingBottom:2,scrollbarWidth:"none"}}>
            {stgsDay.map(s=><button key={s} onClick={()=>setStg(s)} style={S.sb(stg===s,s==="ALL"?null:STAGES[s]?.bg)}>{s==="ALL"?"全部":STAGES[s]?.name}</button>)}
          </div>
        </>}
      </div>

      <div style={{padding:"6px 12px"}}>
        {view==="pick"?
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {list.length===0&&<div style={S.em}>{q?"找不到符合的藝人 🤔":"此舞台本日無演出"}</div>}
            {list.map(item=>{
              const iS=sel.includes(item.id),iD=dimIds.has(item.id),iC=confIds.has(item.id);
              return(
                <button key={item.id} onClick={()=>toggle(item.id)} style={S.cd(iS,item.stage,iD)}>
                  {iS&&<span style={S.ck(STAGES[item.stage]?.bg)}>✓</span>}
                  <span style={{fontVariantNumeric:"tabular-nums",fontSize:11,color:"#9CA3AF",minWidth:78,fontWeight:500}}>{item.start}–{item.end}</span>
                  <span style={S.bg(STAGES[item.stage]?.bg,true)}>{STAGES[item.stage]?.name}</span>
                  <span style={{fontSize:13,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.artist}</span>
                  {iC&&iS&&<span style={{color:"#EF4444",fontSize:11,flexShrink:0}}>⚠</span>}
                </button>
              )
            })}
          </div>
        :
          <div>
            {sel.length===0?<div style={S.em}>還沒選任何演出<br/>去「選團」加入想看的表演吧 🎵</div>:
              [1,2].map(d=>{
                const items=sched[d]; if(!items?.length)return null;
                return(
                  <div key={d} style={{marginBottom:16}}>
                    <h3 style={{fontSize:15,fontWeight:800,margin:"12px 0 8px",color:d===1?"#E63946":"#F4A261"}}>
                      {d===1?"DAY 1 — 3/21 (六)":"DAY 2 — 3/22 (日)"}
                      <span style={{fontSize:11,fontWeight:500,color:"#555",marginLeft:8}}>{items.length} 組</span>
                    </h3>
                    {items.map((item,idx)=>{
                      const bg=STAGES[item.stage]?.bg||"#666";
                      const iC=confIds.has(item.id);
                      let gap=null;
                      if(idx>0)gap=t2m(item.start)-t2m(items[idx-1].end);
                      return(
                        <div key={item.id}>
                          {gap!==null&&gap>0&&<div style={{textAlign:"center",padding:"3px 0",fontSize:10,color:"#555"}}>☕ 空檔 {gap} 分鐘</div>}
                          {gap!==null&&gap<0&&<div style={{textAlign:"center",padding:"3px 0",fontSize:10,color:"#EF4444"}}>⚠ 時間重疊！</div>}
                          <div style={S.si2(bg)}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontVariantNumeric:"tabular-nums",fontSize:12,color:"#aaa",fontWeight:600,minWidth:90}}>{item.start} – {item.end}</span>
                              <span style={S.bg(bg)}>{STAGES[item.stage]?.name}</span>
                              {iC&&<span style={{color:"#EF4444",fontSize:10}}>⚠ 衝突</span>}
                            </div>
                            <div style={{fontSize:15,fontWeight:700,marginTop:4}}>{item.artist}</div>
                            <div style={{fontSize:10,color:"#666",marginTop:2}}>{t2m(item.end)-t2m(item.start)} 分鐘</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })
            }
            {sel.length>0&&<div style={{textAlign:"center",marginTop:16,paddingBottom:8}}>
              <button onClick={()=>setSel([])} style={{padding:"8px 20px",borderRadius:8,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.08)",color:"#EF4444",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>清除所有選取</button>
            </div>}
          </div>
        }
      </div>

      <div style={S.bar}>
        <span>DAY1: {sched[1]?.length||0} 組</span>
        <span style={{color:"#333"}}>|</span>
        <span>DAY2: {sched[2]?.length||0} 組</span>
        {nC>0&&<><span style={{color:"#333"}}>|</span><span style={{color:"#EF4444"}}>⚠ {nC} 衝突</span></>}
      </div>
    </div>
  );
}
