# Monstro Garden — 開發進度文件
> 最後更新：2026-03-18
> 供 Claude Code 快速掌握專案狀態使用

---

## 專案結構

```
monstro_garden/
├── index.html          ← 主遊戲（約 2250 行，純 HTML/CSS/JS，無框架）
├── species.js          ← 物種定義與全域設定（約 264 行）
├── admin.html          ← 後台管理介面（約 716 行，密碼：admin123）
├── 背景音樂.mp3        ← 預設 BGM（目前放根目錄，未來移至 assets/music/）
└── assets/             ← 資源資料夾（需手動建立，目前全空）
    ├── monsters/       ← 怪物圖片（idle/evo1/evo2/attack/hurt）
    ├── music/          ← 背景音樂 mp3
    ├── sfx/            ← 音效 mp3
    ├── scenes/         ← 場景背景圖
    ├── ui/             ← UI 素材
    └── fx/             ← 攻擊特效圖
```

> ⚠️ 必須用 Live Server 或本地伺服器開啟，直接雙擊 file:// 會讓 species.js 讀不進來。

---

## 技術架構

- **完全純前端**：無後端、無框架、無 npm
- **渲染引擎**：HTML5 Canvas，所有怪物用程式繪製（可被圖片覆蓋）
- **存檔**：
  - 遊戲進度 → `localStorage['mg2_save']`（JSON）
  - Admin 設定覆蓋 → `localStorage['mg_admin_config']`（JSON）
  - 玩家可匯出 Base64 代碼備份/轉移
- **音效**：Web Audio API 程式生成（不需任何音效檔）
- **BGM**：HTML `<Audio>` 元素，從 MUSIC_CONFIG 讀取路徑

---

## species.js 資料結構

### SPECIES 物種定義（每筆）
```js
{
  id: 0,              // 唯一 ID，不可重複
  name: '泡芽',
  attr: 'grass',      // grass / fire / water / electric / dark / light
  rarity: 1,          // 1~5
  ivRange: 5,         // 個體差異上限（每項數值 ±ivRange 隨機）
  baseHP: 45,         // 基礎血量
  baseATK: 12,        // 基礎攻擊
  baseDEF: 10,        // 基礎防禦
  baseAGI: 8,         // 閃避率相關
  baseSPD: 10,        // 攻擊頻率相關
  knockback: 0,       // 被近戰擊中時的擊退距離（像素），0=無擊退
  atkType: 'melee',   // melee / ranged / area
  sizes: [0.8, 1.2],  // 體型範圍（影響畫面中實際大小）
  evoFrom: null,      // 進化來源 species id（null=無）
  evoTo: 1,           // 進化目標 species id（null=無）
  sprites: {          // 圖片檔名（空字串=用程式繪製）
    idle: '',         // 待機 / 飼養箱顯示
    evo1: '',         // 進化一階
    evo2: '',         // 進化二階（最終）
    attack: '',       // 攻擊特效圖
    hurt: ''          // 受傷圖（選填）
  }
}
```

### BATTLE_CONFIG（全域戰鬥參數）
```js
{
  critChance: 0.10,          // 暴擊機率
  critMultiplier: 1.5,       // 暴擊倍率
  advMultiplier: 1.5,        // 屬性相剋倍率
  areaSpashRatio: 0.5,       // 範圍攻擊濺射比例
  maxAGIDodge: 0.40,         // 閃避率上限
  defDampeningRatio: 0.4,    // 防禦減傷係數（傷害 = ATK - DEF × 此值）
  expBase: 20,               // 戰鬥勝利基礎 EXP
  battleCooldown: 120,       // 戰敗CD（秒）
  shinyChance: 0.01,         // 孵蛋色違機率
  shinyDrugChance: 0.03,     // 幻想藥色違機率
  breedDuration: 30,         // 配種時間（秒）
}
```

### SHOP_CONFIG（商店道具陣列）
```js
[{
  id: 'food',           // 唯一識別碼
  name: '飼養食物',
  desc: '說明文字',
  icon: '🍬',           // Emoji 圖示
  price: 20,            // 星塵價格
  type: 'consumable',   // consumable / egg / special
  effect: 'feed',       // feed / heal / hatch / shiny_boost / custom
  expGain: 50,          // 僅 effect=feed 有效
  key: 'food',          // G.inventory 裡對應的 key
}]
```

### MUSIC_CONFIG / SFX_CONFIG
```js
MUSIC_CONFIG = {
  default:   { file: '檔名.mp3', label: '...', volume: 0.35 },
  terrarium: { file: '', ... },   // 空=用程式生成
  battle:    { file: '', ... },
  ambient:   { file: '', ... },   // 商店/育種/圖鑑
}
// 路徑 = ASSET_CONFIG.musicDir + file = 'assets/music/' + file
// 目前預設 BGM 放根目錄，MUSIC_CONFIG.default.file 填完整舊路徑
```

---

## index.html 主要模組

### 全域狀態（G 物件）
```js
let G = {
  stardust: 500,          // 貨幣
  monsters: [],           // 所有擁有的怪物實例
  terrarium: [],          // 飼養箱中的怪物 uid（最多5）
  nextId: 1,              // 怪物 uid 遞增計數器
  discovered: Set,        // 已發現的物種 id 集合（圖鑑）
  breedingSlots: [],      // 配種槽（最多3）
  inventory: {food,potion,specialEgg,drug},
  battleCooldowns: {},    // { uid: timestamp } 戰敗CD
}
```

### 怪物實例結構
```js
{
  uid: 1,               // 唯一ID
  speciesId: 0,         // 對應 SPECIES[id]
  name: '泡芽',         // 目前顯示名稱（進化後改變）
  nickname: '',         // 玩家自訂暱稱
  level: 1,             // 1~30
  exp: 0,               // 累計經驗值
  isShiny: false,       // 色違
  size: 1.05,           // 個體體型（在 species.sizes 範圍內隨機）
  ivHP/ivATK/ivDEF/ivAGI/ivSPD: 數值  // 個體差異（±ivRange）
  hp: 45,               // 目前血量
  maxHP: 45,            // 最大血量（由 calcStat 計算）
  mood: 'happy',        // happy / neutral / sad / depressed
  hunger: 100,          // 飽食度
  lastFed: timestamp,
}
```

### 數值計算公式
```js
// 實際數值 = 基礎值 + 個體值 + 等級加成
calcStat(stat, m) {
  base = SPECIES[m.speciesId]['base' + stat]
  iv   = m['iv' + stat]
  return Math.max(1, base + iv + Math.floor((m.level - 1) * base * 0.05))
}
// 傷害公式
dmg = Math.max(1, ATK - DEF * BATTLE_CONFIG.defDampeningRatio)
// 屬性相剋：dmg *= BATTLE_CONFIG.advMultiplier
// 暴擊：dmg *= BATTLE_CONFIG.critMultiplier（機率 critChance）
```

### 進化機制
- Lv.10 進化一階（speciesId 改為 evoTo）
- Lv.20 進化二階
- 進化條件：EXP 到達 EXP_TO_LEVEL[level+1]
- 進化後外觀：getEvoStage(m) 回傳 0/1/2，drawMonsterOnCanvas 依此選圖

### Canvas 繪製系統
- `DRAWERS[speciesId](ctx, s, stage, isShiny, blink, mood, timestamp)`
  - 30 種怪物各有獨立繪製函數
  - `s` = 縮放係數 × 26
  - `stage` = 0/1/2（進化階段，影響外觀細節）
  - 若 species.sprites 有設定圖片，優先用圖片（`drawMiniMonsterFull`）
- `drawBattleMonster(ctx, m, x, y, scale, blink, mood)`
  - 戰鬥場景專用，支援 sprite 圖片覆蓋

---

## 各頁面功能狀態

### 🏠 飼養箱
- ✅ Canvas 動態場景（星空 + 草地）
- ✅ 最多5隻怪物自由走動（隨機移動、碰牆反彈）
- ✅ 怪物自動眨眼、名字標籤
- ✅ 戰敗CD中的怪物顯示灰色「心情低落」
- ✅ 底部怪物卡片（HP 條、狀態）
- ✅ 點擊開啟詳細頁面
- ✅ 餵食全部按鈕
- ✅ 管理怪物（放入/移出飼養箱）

### 📦 倉庫
- ✅ 最多50隻
- ✅ 依屬性篩選 Tab
- ✅ 進化階段 badge（進化I/進化II）
- ✅ 飼養箱中標示🏠
- ✅ 點擊開啟怪物詳細頁面

### ⚔️ 戰鬥
- ✅ 四個難度分類（初階/中階/高階/大師）
- ✅ 每個分類隨機生成 5~8 名 NPC（快取，重新整理才重新生成）
- ✅ 選擇出戰怪物（1~3隻，有圖片預覽）
- ✅ 即時戰鬥（自動行動，純觀戰）
- ✅ 三種攻擊類型（近戰/遠程/範圍）各有專屬彈藥動畫
- ✅ 屬性相剋（傷害 ×1.5）
- ✅ 暴擊、閃避判定
- ✅ 傷害飄字、粒子特效、擊倒動畫
- ✅ 畫面震動（crit/death）
- ✅ HP 條即時更新
- ✅ 戰鬥 log
- ✅ 切換其他頁面時戰鬥繼續在背景跑，回來可繼續看
- ✅ 戰鬥結束時若在其他頁面，戰鬥按鈕閃金色提示
- ✅ 勝利：獲得星塵 + EXP；失敗：進入CD
- ✅ 擊退：每種怪物獨立設定 knockback（預設全部0）

### 💕 育種室
- ✅ 選擇父母 A / B
- ✅ 配種時間（預設30秒，BATTLE_CONFIG.breedDuration 可調）
- ✅ 後代繼承父母 IV 值（帶隨機浮動）
- ✅ 後代物種隨機繼承其中一方
- ✅ 使用幻想藥提升色違機率
- ✅ 最多3個配種槽同時進行
- ✅ 孵化按鈕（時間到才出現）

### 🛒 商店
- ✅ 4種預設道具（食物/回復劑/特殊蛋/幻想藥）
- ✅ 頂部顯示星塵餘額與道具庫存
- ✅ 特殊蛋可直接孵化
- ✅ 道具類型可擴充（SHOP_CONFIG 陣列）

### 📖 圖鑑
- ✅ 30種怪物格子
- ✅ 未發現顯示剪影
- ✅ 格子顯示目前持有的最高進化形態
- ✅ 點開詳細：三階段進化外觀並排預覽
- ✅ 未解鎖的進化階段顯示黑色剪影
- ✅ 底部顯示持有的個體（最多6隻，可點擊跳轉）
- ✅ 色違標示

### 💾 存檔
- ✅ localStorage 自動儲存（每5秒）
- ✅ 匯出 Base64 代碼
- ✅ 匯入代碼繼承進度
- ✅ 重置遊戲

### 🎵 音效 / BGM
- ✅ 12種 Web Audio API 程式生成音效
- ✅ BGM 切場景自動換曲（支援外部 mp3 檔）
- ✅ 🎵/🔊 開關按鈕
- ✅ MUSIC_CONFIG / SFX_CONFIG 可替換自訂音檔

### ⚙️ Admin 後台
- ✅ 密碼登入（預設：admin123）
- ✅ 物種管理（新增/刪除/編輯所有數值）
- ✅ 圖片設定（每種怪物的 idle/evo1/evo2/attack/hurt 圖檔名）
- ✅ 戰鬥參數調整（滑桿）
- ✅ 商店道具管理（新增/刪除/編輯）
- ✅ 音樂/音效路徑設定
- ✅ 場景圖片/UI 圖片路徑設定
- ✅ 升級經驗表
- ✅ 匯出 species.js（生成完整檔案）
- ✅ LocalStorage 即時套用（儲存後遊戲立即生效）

### 🖼️ 圖片系統
- ✅ 圖片快取（IMG_CACHE）
- ✅ 怪物渲染優先使用 sprite 圖片，無圖則 Canvas 繪製
- ✅ assets/ 資料夾結構已定義
- ⬜ 實際圖片尚未放入（全部使用程式繪製）

---

## 已知待辦 / 尚未實作

### 高優先
- ⬜ **技能系統**（skills.js）
  - 主動技能（戰鬥中觸發）
  - 被動技能（每N次攻擊額外效果等）
  - 已預留架構，尚未實作
- ⬜ **怪物圖片素材**（assets/monsters/）
  - 現在30隻全部 Canvas 繪製
  - 圖片命名規則：`{spId}_{stage}.png`（idle/evo1/evo2/attack/hurt）

### 中優先
- ⬜ **飢餓/心情值隨時間下降**（目前只在特定操作時變化）
- ⬜ **攻擊特效圖片支援**（attack sprite 已在資料結構中，但戰鬥繪製尚未套用）
- ⬜ **場景背景圖片**（SCENE_CONFIG 已定義，但 index.html 還未讀取套用）
- ⬜ **UI 圖片套用**（UI_CONFIG 已定義，但尚未套用到遊戲 DOM）

### 低優先 / 未來規劃
- ⬜ **成就系統**
- ⬜ **地圖探索**（怪物自動帶回星塵）
- ⬜ **排行榜 / 社交分享**
- ⬜ **節日限定活動**
- ⬜ **手機版 UI 優化**

---

## 已修過的重要 Bug

1. **Canvas 被 innerHTML 覆蓋**：倉庫/圖鑑/飼養箱的 canvas 在 innerHTML 設定後消失，改用佔位 div 再 append
2. **戰鬥 canvas 尺寸為 0**：battle-arena 還是 display:none 時量 clientWidth 得到 0，改為先顯示 arena 再用 requestAnimationFrame 量尺寸
3. **近戰怪物飛出畫面**：dashTimer 期間怪物位置被推移，改為純視覺動畫不改位置，knockback 改為獨立數值
4. **切頁後戰鬥當機**：showPage 取消 battleAnimFrame，改為戰鬥中切頁不殺 loop，shouldDraw 控制是否繪製
5. **SHOP_CONFIG 陣列被 Object.assign 破壞**：applyAdminConfig 改用正確的陣列替換
6. **音樂路徑錯誤造成 JS 崩潰**：getBGMFileFromConfig 加 try/catch 和 typeof 安全檢查
7. **選怪物畫面沒有怪物圖片**：canvas 掛載順序問題，改用 bsc-uid 佔位 div

---

## 開發慣例

- 所有物種數值調整 → 改 `species.js` 或透過 `admin.html`
- 新增遊戲邏輯 → `index.html`
- 新增技能 → 未來的 `skills.js`（獨立檔案）
- Admin 設定透過 localStorage 覆蓋 species.js 的值，遊戲啟動時 `applyAdminConfig()` 套用
- 怪物圖片：放 `assets/monsters/`，在 species.js 的 sprites 欄位填檔名
- 音樂：放 `assets/music/`，在 MUSIC_CONFIG 填檔名
