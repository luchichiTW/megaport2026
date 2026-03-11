/* ═══════════════════════════════════════════════════════════
   share.js — Megaport 2026 Itinerary Sharing
   QR Code Generator + Web Crypto + Share Codec
   ═══════════════════════════════════════════════════════════ */

// ═══ Part 1: QR Code SVG Generator ═══
// Minimal QR encoder — byte mode, EC level M, versions 1-40
const QR = (() => {
  // GF(256) with primitive polynomial 0x11D
  const EXP = new Uint8Array(256), LOG = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x; LOG[x] = i;
    x = (x << 1) ^ (x & 128 ? 0x11D : 0);
  }
  EXP[255] = EXP[0];

  const gfMul = (a, b) => a && b ? EXP[(LOG[a] + LOG[b]) % 255] : 0;

  // Reed-Solomon: generate EC codewords
  function rsEncode(data, ecCount) {
    const gen = new Uint8Array(ecCount + 1);
    gen[0] = 1;
    for (let i = 0; i < ecCount; i++) {
      for (let j = i + 1; j > 0; j--)
        gen[j] = gen[j] ^ gfMul(gen[j - 1], EXP[i]);
    }
    const result = new Uint8Array(ecCount);
    for (let i = 0; i < data.length; i++) {
      const coef = data[i] ^ result[0];
      result.copyWithin(0, 1);
      result[ecCount - 1] = 0;
      for (let j = 0; j < ecCount; j++)
        result[j] ^= gfMul(gen[j + 1], coef);
    }
    // Reverse to match expected polynomial order
    return result;
  }

  // EC codewords per block for EC level M (index = version-1)
  const EC_M = [10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28];
  // Total codewords per version
  const TOTAL_CW = [26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];
  // Data codewords for EC level M per version
  const DATA_CW_M = [16,28,44,64,86,108,124,154,182,216,254,290,334,365,415,453,507,563,627,669,714,782,860,914,1000,1062,1128,1193,1267,1373,1455,1541,1631,1725,1812,1914,1992,2102,2216,2334];
  // Number of blocks for EC level M [group1_count, group1_data, group2_count, group2_data]
  const BLOCKS_M = [
    [1,16,0,0],[1,28,0,0],[1,44,0,0],[2,32,0,0],[2,43,0,0],[4,27,0,0],[4,31,0,0],[2,38,2,39],
    [3,36,2,37],[4,43,1,44],[1,50,4,51],[6,36,2,37],[6,43,2,44],[7,44,1,45],[5,54,2,55],[15,24,2,25],
    [1,50,15,51],[17,30,1,31],[17,34,4,35],[15,34,5,35],[17,28,6,29],[7,49,16,50],[11,44,14,45],[11,46,16,47],
    [7,42,22,43],[28,39,6,40],[8,40,26,41],[4,40,31,41],[1,32,37,33],[15,43,25,44],[42,24,1,25],[10,35,35,36],
    [29,34,19,35],[44,24,7,25],[39,28,14,29],[46,32,10,33],[49,32,10,33],[48,30,14,31],[43,30,22,31],[34,30,34,31],
  ];

  // Alignment pattern positions per version (version 2+)
  const ALIGN_POS = [
    [],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],
    [6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],
    [6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],
    [6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],
    [6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],
    [6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],
    [6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170],
  ];

  // Format info for EC level M (mask 0-7)
  const FORMAT_M = [0x5412,0x5125,0x5E7C,0x5B4B,0x45F9,0x40CE,0x4F97,0x4AA0];

  // Version info (versions 7-40)
  const VERSION_INFO = [
    0x07C94,0x085BC,0x09A99,0x0A4D3,0x0BBF6,0x0C762,0x0D847,0x0E60D,0x0F928,
    0x10B78,0x1145D,0x12A17,0x13532,0x149A6,0x15683,0x168C9,0x177EC,0x18EC4,
    0x191E1,0x1AFAB,0x1B08E,0x1CC1A,0x1D33F,0x1ED75,0x1F250,0x209D5,0x216F0,
    0x228BA,0x2379F,0x24B0B,0x2542E,0x26A64,0x27541,
  ];

  function bestVersion(dataLen) {
    // Byte mode: 4 (mode) + char count bits + data bits, padded to codewords
    for (let v = 1; v <= 40; v++) {
      const ccBits = v <= 9 ? 8 : 16;
      const bits = 4 + ccBits + dataLen * 8;
      const cw = Math.ceil(bits / 8);
      if (cw <= DATA_CW_M[v - 1]) return v;
    }
    return -1;
  }

  function encode(text) {
    const data = typeof text === "string" ? new TextEncoder().encode(text) : text;
    const ver = bestVersion(data.length);
    if (ver < 0) throw new Error("Data too long for QR");

    const size = ver * 4 + 17;
    const dataCW = DATA_CW_M[ver - 1];
    const totalCW = TOTAL_CW[ver - 1];
    const ecPerBlock = EC_M[ver - 1];
    const ccBits = ver <= 9 ? 8 : 16;

    // 1. Build data bitstream
    const bits = [];
    const pushBits = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };

    pushBits(0b0100, 4); // byte mode
    pushBits(data.length, ccBits);
    for (const b of data) pushBits(b, 8);
    pushBits(0, Math.min(4, dataCW * 8 - bits.length)); // terminator
    while (bits.length % 8) bits.push(0); // byte align
    const pads = [0xEC, 0x11];
    let pi = 0;
    while (bits.length < dataCW * 8) {
      pushBits(pads[pi], 8);
      pi = 1 - pi;
    }

    // Convert bits to codewords
    const codewords = new Uint8Array(dataCW);
    for (let i = 0; i < dataCW; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
      codewords[i] = b;
    }

    // 2. Split into blocks and compute EC
    const bl = BLOCKS_M[ver - 1];
    const g1c = bl[0], g1d = bl[1], g2c = bl[2], g2d = bl[3];
    const blocks = [];
    let offset = 0;
    for (let i = 0; i < g1c; i++) {
      blocks.push(codewords.slice(offset, offset + g1d));
      offset += g1d;
    }
    for (let i = 0; i < g2c; i++) {
      blocks.push(codewords.slice(offset, offset + g2d));
      offset += g2d;
    }

    const ecBlocks = blocks.map(b => rsEncode(b, ecPerBlock));

    // 3. Interleave
    const final = new Uint8Array(totalCW);
    let fi = 0;
    const maxDataLen = Math.max(g1d, g2d || 0);
    for (let i = 0; i < maxDataLen; i++)
      for (const b of blocks) if (i < b.length) final[fi++] = b[i];
    for (let i = 0; i < ecPerBlock; i++)
      for (const b of ecBlocks) final[fi++] = b[i];

    // 4. Build matrix
    const mod = Array.from({ length: size }, () => new Uint8Array(size));
    const used = Array.from({ length: size }, () => new Uint8Array(size));

    // Finder patterns
    function finderPattern(r, c) {
      for (let dr = -1; dr <= 7; dr++)
        for (let dc = -1; dc <= 7; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          used[rr][cc] = 1;
          if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
            const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
            mod[rr][cc] = ring !== 2 && ring !== 4 ? 1 : 0;
          }
        }
    }
    finderPattern(0, 0);
    finderPattern(0, size - 7);
    finderPattern(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      used[6][i] = 1; mod[6][i] = i % 2 === 0 ? 1 : 0;
      used[i][6] = 1; mod[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Alignment patterns
    if (ver >= 2) {
      const pos = ALIGN_POS[ver - 1];
      for (const r of pos) for (const c of pos) {
        if (used[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++)
          for (let dc = -2; dc <= 2; dc++) {
            const rr = r + dr, cc = c + dc;
            used[rr][cc] = 1;
            mod[rr][cc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1 ? 1 : 0;
          }
      }
    }

    // Reserve format info areas
    for (let i = 0; i < 8; i++) {
      used[8][i] = used[8][i] || 1; used[i][8] = used[i][8] || 1;
      used[8][size - 1 - i] = used[8][size - 1 - i] || 1;
      used[size - 1 - i][8] = used[size - 1 - i][8] || 1;
    }
    used[8][8] = 1;
    // Dark module
    used[size - 8][8] = 1; mod[size - 8][8] = 1;

    // Reserve version info
    if (ver >= 7) {
      for (let i = 0; i < 6; i++)
        for (let j = 0; j < 3; j++) {
          used[i][size - 11 + j] = 1;
          used[size - 11 + j][i] = 1;
        }
    }

    // 5. Place data bits
    const dataBits = [];
    for (const b of final) for (let i = 7; i >= 0; i--) dataBits.push((b >> i) & 1);

    let bi = 0;
    for (let col = size - 1; col >= 0; col -= 2) {
      if (col === 6) col = 5; // skip timing
      for (let row = 0; row < size; row++) {
        const upward = ((size - 1 - col) >> 1) % 2 === 0;
        const r = upward ? size - 1 - row : row;
        for (let dc = 0; dc >= -1; dc--) {
          const c = col + dc;
          if (c < 0 || used[r][c]) continue;
          mod[r][c] = bi < dataBits.length ? dataBits[bi++] : 0;
        }
      }
    }

    // 6. Try all 8 masks, pick best
    const masks = [
      (r, c) => (r + c) % 2 === 0,
      (r, c) => r % 2 === 0,
      (r, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
      (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
      (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
    ];

    function applyMask(maskIdx) {
      const m = Array.from({ length: size }, (_, r) =>
        Uint8Array.from({ length: size }, (_, c) => {
          if (used[r][c]) return mod[r][c];
          return mod[r][c] ^ (masks[maskIdx](r, c) ? 1 : 0);
        })
      );
      // Write format info
      const fmt = FORMAT_M[maskIdx];
      for (let i = 0; i < 15; i++) {
        const bit = (fmt >> (14 - i)) & 1;
        // Around top-left finder
        if (i < 6) m[8][i] = bit;
        else if (i === 6) m[8][7] = bit;
        else if (i === 7) m[8][8] = bit;
        else if (i === 8) m[7][8] = bit;
        else m[14 - i][8] = bit;
        // Split between top-right and bottom-left
        if (i < 8) m[size - 1 - i][8] = bit;
        else m[8][size - 15 + i] = bit;
      }
      // Version info
      if (ver >= 7) {
        const vi = VERSION_INFO[ver - 7];
        for (let i = 0; i < 18; i++) {
          const bit = (vi >> i) & 1;
          m[Math.floor(i / 3)][size - 11 + (i % 3)] = bit;
          m[size - 11 + (i % 3)][Math.floor(i / 3)] = bit;
        }
      }
      return m;
    }

    function penalty(m) {
      let p = 0;
      // Rule 1: runs of 5+ same-color modules
      for (let r = 0; r < size; r++) {
        let run = 1;
        for (let c = 1; c < size; c++) {
          if (m[r][c] === m[r][c - 1]) { run++; }
          else { if (run >= 5) p += run - 2; run = 1; }
        }
        if (run >= 5) p += run - 2;
      }
      for (let c = 0; c < size; c++) {
        let run = 1;
        for (let r = 1; r < size; r++) {
          if (m[r][c] === m[r - 1][c]) { run++; }
          else { if (run >= 5) p += run - 2; run = 1; }
        }
        if (run >= 5) p += run - 2;
      }
      // Rule 2: 2x2 same-color blocks
      for (let r = 0; r < size - 1; r++)
        for (let c = 0; c < size - 1; c++)
          if (m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c] && m[r][c] === m[r + 1][c + 1])
            p += 3;
      // Rule 3: finder-like patterns (simplified)
      const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
      const pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
      for (let r = 0; r < size; r++)
        for (let c = 0; c <= size - 11; c++) {
          let match1 = true, match2 = true;
          for (let k = 0; k < 11; k++) {
            if (m[r][c + k] !== pat1[k]) match1 = false;
            if (m[r][c + k] !== pat2[k]) match2 = false;
          }
          if (match1 || match2) p += 40;
        }
      for (let c = 0; c < size; c++)
        for (let r = 0; r <= size - 11; r++) {
          let match1 = true, match2 = true;
          for (let k = 0; k < 11; k++) {
            if (m[r + k][c] !== pat1[k]) match1 = false;
            if (m[r + k][c] !== pat2[k]) match2 = false;
          }
          if (match1 || match2) p += 40;
        }
      // Rule 4: proportion of dark modules
      let dark = 0;
      for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) dark += m[r][c];
      const pct = dark / (size * size) * 100;
      p += Math.floor(Math.abs(pct - 50) / 5) * 10;
      return p;
    }

    let bestMask = 0, bestPen = Infinity;
    for (let i = 0; i < 8; i++) {
      const p = penalty(applyMask(i));
      if (p < bestPen) { bestPen = p; bestMask = i; }
    }

    return { matrix: applyMask(bestMask), size, version: ver };
  }

  function toSVG(text, opts = {}) {
    const { matrix, size } = encode(text);
    const scale = opts.scale || 4;
    const margin = opts.margin ?? 2;
    const total = (size + margin * 2) * scale;
    const fg = opts.fg || "#000";
    const bg = opts.bg || "#fff";

    let paths = "";
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (matrix[r][c])
          paths += `M${(c + margin) * scale},${(r + margin) * scale}h${scale}v${scale}h-${scale}z`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}">` +
      `<rect width="${total}" height="${total}" fill="${bg}"/>` +
      `<path d="${paths}" fill="${fg}"/>` +
      `</svg>`;
  }

  return { encode, toSVG };
})();


// ═══ Part 2: Web Crypto Helpers ═══
const ShareCrypto = (() => {
  const subtle = crypto.subtle;

  async function generateKeyPair() {
    const keyPair = await subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );
    return keyPair;
  }

  async function exportPublicKey(key) {
    const jwk = await subtle.exportKey("jwk", key);
    return { x: jwk.x, y: jwk.y };
  }

  async function importPublicKey(pub) {
    return subtle.importKey("jwk",
      { kty: "EC", crv: "P-256", x: pub.x, y: pub.y },
      { name: "ECDSA", namedCurve: "P-256" },
      false, ["verify"]
    );
  }

  async function exportPrivateKey(key) {
    return subtle.exportKey("jwk", key);
  }

  async function importPrivateKey(jwk) {
    return subtle.importKey("jwk", jwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false, ["sign"]
    );
  }

  async function sign(privateKey, data) {
    const encoded = new TextEncoder().encode(data);
    const sig = await subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      privateKey, encoded
    );
    return new Uint8Array(sig);
  }

  async function verify(publicKey, signature, data) {
    const encoded = new TextEncoder().encode(data);
    return subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      publicKey, signature, encoded
    );
  }

  // AES-GCM encryption with passphrase (PBKDF2)
  async function encryptWithPassphrase(data, passphrase) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyMaterial = await subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    const key = await subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false, ["encrypt"]
    );
    const ct = await subtle.encrypt({ name: "AES-GCM", iv }, key, data);
    // salt(16) + iv(12) + ciphertext
    const result = new Uint8Array(28 + ct.byteLength);
    result.set(salt, 0);
    result.set(iv, 16);
    result.set(new Uint8Array(ct), 28);
    return result;
  }

  async function decryptWithPassphrase(data, passphrase) {
    const enc = new TextEncoder();
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const ct = data.slice(28);
    const keyMaterial = await subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    const key = await subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false, ["decrypt"]
    );
    const pt = await subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new Uint8Array(pt);
  }

  async function fingerprint(pub) {
    const data = new TextEncoder().encode(pub.x + pub.y);
    const hash = await subtle.digest("SHA-256", data);
    const arr = new Uint8Array(hash);
    return Array.from(arr.slice(0, 4)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  return { generateKeyPair, exportPublicKey, importPublicKey, exportPrivateKey, importPrivateKey, sign, verify, encryptWithPassphrase, decryptWithPassphrase, fingerprint };
})();


// ═══ Part 3: Share Codec ═══
const ShareCodec = (() => {
  const BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const B64_LOOKUP = new Uint8Array(128);
  for (let i = 0; i < 64; i++) B64_LOOKUP[BASE64URL.charCodeAt(i)] = i;

  function toBase64url(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 3) {
      const b0 = bytes[i], b1 = bytes[i + 1] ?? 0, b2 = bytes[i + 2] ?? 0;
      s += BASE64URL[(b0 >> 2)];
      s += BASE64URL[((b0 & 3) << 4) | (b1 >> 4)];
      if (i + 1 < bytes.length) s += BASE64URL[((b1 & 15) << 2) | (b2 >> 6)];
      if (i + 2 < bytes.length) s += BASE64URL[(b2 & 63)];
    }
    return s;
  }

  function fromBase64url(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i += 4) {
      const a = B64_LOOKUP[str.charCodeAt(i)];
      const b = i + 1 < str.length ? B64_LOOKUP[str.charCodeAt(i + 1)] : 0;
      const c = i + 2 < str.length ? B64_LOOKUP[str.charCodeAt(i + 2)] : 0;
      const d = i + 3 < str.length ? B64_LOOKUP[str.charCodeAt(i + 3)] : 0;
      bytes.push((a << 2) | (b >> 4));
      if (i + 2 < str.length) bytes.push(((b & 15) << 4) | (c >> 2));
      if (i + 3 < str.length) bytes.push(((c & 3) << 6) | d);
    }
    return new Uint8Array(bytes);
  }

  // Build performance ID index for compact bitfield encoding
  // T is globally available from schedule.js
  function buildIndex() {
    const ids = T.map(t => t.id);
    const map = {};
    ids.forEach((id, i) => map[id] = i);
    return { ids, map, count: ids.length };
  }

  function selToBitfield(sel, index) {
    const bytes = new Uint8Array(Math.ceil(index.count / 8));
    for (const id of sel) {
      const i = index.map[id];
      if (i !== undefined) bytes[i >> 3] |= 1 << (7 - (i & 7));
    }
    return bytes;
  }

  function bitfieldToSel(bytes, index) {
    const sel = [];
    for (let i = 0; i < index.count; i++) {
      if (bytes[i >> 3] & (1 << (7 - (i & 7)))) sel.push(index.ids[i]);
    }
    return sel;
  }

  // Encode share payload to binary
  // Format: [version:1][flags:1][name_len:1][name:N][timestamp:4][bitfield:B][pubX:43][pubY:43][sig:64]
  // flags: bit0 = encrypted
  async function encodePayload(sel, name, privateKey, publicKey) {
    const index = buildIndex();
    const bitfield = selToBitfield(sel, index);
    const pub = await ShareCrypto.exportPublicKey(publicKey);
    const ts = Math.floor(Date.now() / 1000);

    // Data to sign: bitfield + name + timestamp
    const signData = JSON.stringify({ b: toBase64url(bitfield), n: name, t: ts });
    const sig = await ShareCrypto.sign(privateKey, signData);

    const nameBytes = new TextEncoder().encode(name);
    const pubXBytes = new TextEncoder().encode(pub.x);
    const pubYBytes = new TextEncoder().encode(pub.y);

    // Binary format
    const total = 1 + 1 + 1 + nameBytes.length + 4 + bitfield.length +
      1 + pubXBytes.length + 1 + pubYBytes.length + sig.length;
    const buf = new Uint8Array(total);
    let off = 0;

    buf[off++] = 1; // version
    buf[off++] = 0; // flags
    buf[off++] = nameBytes.length;
    buf.set(nameBytes, off); off += nameBytes.length;
    // timestamp (4 bytes big-endian)
    buf[off++] = (ts >> 24) & 0xFF;
    buf[off++] = (ts >> 16) & 0xFF;
    buf[off++] = (ts >> 8) & 0xFF;
    buf[off++] = ts & 0xFF;
    // bitfield
    buf.set(bitfield, off); off += bitfield.length;
    // public key
    buf[off++] = pubXBytes.length;
    buf.set(pubXBytes, off); off += pubXBytes.length;
    buf[off++] = pubYBytes.length;
    buf.set(pubYBytes, off); off += pubYBytes.length;
    // signature
    buf.set(sig, off);

    return buf;
  }

  // Decode share payload from binary
  function decodePayload(buf) {
    const index = buildIndex();
    let off = 0;

    const version = buf[off++];
    const flags = buf[off++];
    const encrypted = !!(flags & 1);

    if (encrypted) {
      // Return encrypted payload for decryption
      return { encrypted: true, data: buf.slice(off), version };
    }

    const nameLen = buf[off++];
    const name = new TextDecoder().decode(buf.slice(off, off + nameLen)); off += nameLen;
    const ts = (buf[off] << 24 | buf[off + 1] << 16 | buf[off + 2] << 8 | buf[off + 3]) >>> 0;
    off += 4;

    const bfLen = Math.ceil(index.count / 8);
    const bitfield = buf.slice(off, off + bfLen); off += bfLen;
    const sel = bitfieldToSel(bitfield, index);

    const pubXLen = buf[off++];
    const pubX = new TextDecoder().decode(buf.slice(off, off + pubXLen)); off += pubXLen;
    const pubYLen = buf[off++];
    const pubY = new TextDecoder().decode(buf.slice(off, off + pubYLen)); off += pubYLen;

    const sig = buf.slice(off);

    return {
      encrypted: false, version, name, ts, sel, pub: { x: pubX, y: pubY }, sig,
      bitfield, signData: JSON.stringify({ b: toBase64url(bitfield), n: name, t: ts }),
    };
  }

  async function encodeShareURL(sel, name, privateKey, publicKey, passphrase) {
    let payload = await encodePayload(sel, name, privateKey, publicKey);

    if (passphrase) {
      // Encrypt the payload (skip version byte)
      const encrypted = await ShareCrypto.encryptWithPassphrase(payload.slice(2), passphrase);
      const encBuf = new Uint8Array(2 + encrypted.length);
      encBuf[0] = 1; // version
      encBuf[1] = 1; // flags: encrypted
      encBuf.set(encrypted, 2);
      payload = encBuf;
    }

    const encoded = toBase64url(payload);
    return `${location.origin}${location.pathname}#s=${encoded}`;
  }

  async function decodeShareURL(hash) {
    if (!hash || !hash.startsWith("#s=")) return null;
    const encoded = hash.slice(3);
    const buf = fromBase64url(encoded);
    const decoded = decodePayload(buf);

    if (decoded.encrypted) {
      return { encrypted: true, data: decoded.data, version: decoded.version };
    }

    // Verify signature
    try {
      const pubKey = await ShareCrypto.importPublicKey(decoded.pub);
      decoded.verified = await ShareCrypto.verify(pubKey, decoded.sig, decoded.signData);
      decoded.fingerprint = await ShareCrypto.fingerprint(decoded.pub);
    } catch {
      decoded.verified = false;
    }

    return decoded;
  }

  async function decryptAndDecode(encData, passphrase) {
    const decrypted = await ShareCrypto.decryptWithPassphrase(encData, passphrase);
    // Reconstruct buffer with version=1, flags=0
    const buf = new Uint8Array(2 + decrypted.length);
    buf[0] = 1; buf[1] = 0;
    buf.set(decrypted, 2);
    const decoded = decodePayload(buf);

    try {
      const pubKey = await ShareCrypto.importPublicKey(decoded.pub);
      decoded.verified = await ShareCrypto.verify(pubKey, decoded.sig, decoded.signData);
      decoded.fingerprint = await ShareCrypto.fingerprint(decoded.pub);
    } catch {
      decoded.verified = false;
    }

    return decoded;
  }

  return { toBase64url, fromBase64url, encodeShareURL, decodeShareURL, decryptAndDecode, buildIndex };
})();


// ═══ Part 4: Identity Store (IndexedDB) ═══
const ShareIdentity = (() => {
  const DB_NAME = "mp2026";
  const STORE = "s";
  const KEY_IDENTITY = "share-id";

  async function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function get() {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY_IDENTITY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async function save(identity) {
    const db = await openDB();
    db.transaction(STORE, "readwrite").objectStore(STORE).put(identity, KEY_IDENTITY);
  }

  // Get or create identity
  async function getOrCreate(name) {
    let id = await get();
    if (id && id.name === name) return id;

    const keyPair = await ShareCrypto.generateKeyPair();
    const privJwk = await ShareCrypto.exportPrivateKey(keyPair.privateKey);
    const pub = await ShareCrypto.exportPublicKey(keyPair.publicKey);
    const fp = await ShareCrypto.fingerprint(pub);

    id = { name, privJwk, pub, fingerprint: fp, created: Date.now() };
    await save(id);
    return id;
  }

  async function getPrivateKey(identity) {
    return ShareCrypto.importPrivateKey(identity.privJwk);
  }

  async function getPublicKey(identity) {
    return ShareCrypto.importPublicKey(identity.pub);
  }

  return { get, save, getOrCreate, getPrivateKey, getPublicKey };
})();
