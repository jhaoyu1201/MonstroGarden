// ══════════════════════════════════════════════
//  species.js  ——  Monstro Garden 物種與全域設定
//  由 Admin 後台管理，請勿手動隨意修改格式
// ══════════════════════════════════════════════

// ── 屬性 ──
const ATTRS=['grass','fire','water','electric','dark','light','earth'];
const ATTR_NAMES={grass:'草系',fire:'火系',water:'水系',electric:'電系',dark:'暗系',light:'光系',earth:'地系'};
const ATTR_COLORS={grass:'#4ecb71',fire:'#ff6b35',water:'#4a9eff',electric:'#ffd700',dark:'#8b5cf6',light:'#fbbf24',earth:'#b5894a'};
const RARITY_NAMES=['','普通','稀有','超稀有','傳說','神話'];
const RARITY_COLORS=['','#9ca3c8','#4a9eff','#8b5cf6','#ffd700','#ff6b9d'];
const ATTR_ADVANTAGE={grass:['water','electric','earth'],fire:['grass','dark'],water:['fire','electric'],electric:['water','light'],dark:['light','grass'],light:['dark','fire'],earth:['fire','electric']};

// ── 資源路徑設定 ──
const ASSET_CONFIG = {
  monsterDir:  'assets/monsters/',   // 怪物圖片資料夾
  sceneDir:    'assets/scenes/',     // 場景圖片資料夾
  uiDir:       'assets/ui/',         // UI 圖片資料夾
  fxDir:       'assets/fx/',         // 攻擊特效圖資料夾
  musicDir:    'assets/music/',      // 背景音樂資料夾
  sfxDir:      'assets/sfx/',        // 音效資料夾（選填，沒有則用程式音效）
};

// ── 場景圖片設定 ──
// 若 file 為空字串，則使用程式繪製的背景
const SCENE_CONFIG = {
  terrarium: { bgFile: '', tileSize: 512, label: '飼養箱背景' },
  battle:    { bgFile: '', tileSize: 512, label: '戰鬥場景背景' },
  warehouse: { bgFile: '', tileSize: 512, label: '倉庫背景' },
  shop:      { bgFile: '', tileSize: 512, label: '商店背景' },
  breeding:  { bgFile: '', tileSize: 512, label: '育種室背景' },
  pokedex:   { bgFile: '', tileSize: 512, label: '圖鑑背景' },
};

// ── UI 圖片設定 ──
// 若 file 為空字串，則使用 CSS 樣式
const UI_CONFIG = {
  logo:         { file: '', label: '遊戲 LOGO' },
  btnPrimary:   { file: '', label: '主要按鈕背景' },
  cardBg:       { file: '', label: '卡片背景' },
  navBg:        { file: '', label: '側邊欄背景' },
  headerBg:     { file: '', label: '頂部列背景' },
  emptyEgg:     { file: '', label: '空蛋圖示' },
  shinyStar:    { file: '', label: '色違星星圖示' },
};

// ── 音樂設定 ──
// file 填寫 musicDir 下的檔名，空白則使用程式生成音樂
const MUSIC_CONFIG = {
  default:   { file: 'backgroundmusicforvideos-roblox-minecraft-fortnite-video-game-music-358426.mp3', label: '預設背景音樂', volume: 0.35 },
  terrarium: { file: 'terrarium.mp3', label: '飼養箱音樂', volume: 0.35 },
  battle:    { file: 'battle.mp3',    label: '戰鬥音樂',   volume: 0.45 },
  ambient:   { file: 'ambient.mp3',   label: '其他頁面音樂', volume: 0.30 },
};

// ── 音效設定 ──
// file 填寫 sfxDir 下的檔名，空白則使用程式生成音效
const SFX_CONFIG = {
  click:       { file: '', label: '點擊音效' },
  feed:        { file: '', label: '餵食音效' },
  levelUp:     { file: '', label: '升級音效' },
  evolve:      { file: '', label: '進化音效' },
  hatch:       { file: '', label: '孵化音效' },
  shiny:       { file: '', label: '色違音效' },
  buy:         { file: '', label: '購買音效' },
  battleStart: { file: '', label: '戰鬥開始音效' },
  hit:         { file: '', label: '命中音效' },
  critHit:     { file: '', label: '暴擊音效' },
  miss:        { file: '', label: '閃避音效' },
  death:       { file: '', label: '擊倒音效' },
  win:         { file: '', label: '勝利音效' },
  lose:        { file: '', label: '失敗音效' },
};

// ── 全域戰鬥設定 ──
const BATTLE_CONFIG = {
  critChance:          0.10,
  critMultiplier:      1.5,
  advMultiplier:       1.5,
  areaSpashRatio:      0.5,
  maxAGIDodge:         0.40,
  defDampeningRatio:   0.55,
  dmgFloorRatio:       0.08,
  expBase:             20,
  battleCooldown:      120,
  shinyChance:         0.01,
  shinyDrugChance:     0.03,
  breedDuration:       30,
};

// ── 升級經驗表 ──
const EXP_TO_LEVEL=[0,0,100,250,450,700,1000,1350,1750,2200,2700,3300,4000,4800,5700,6700,7800,9000,10300,11700,13200,14800,16500,18300,21200,24200,27200,30200,33200,36200,40000];

// ── 物種定義 ──
// sprites: 各狀態圖片檔名（放在 assets/monsters/），空字串=使用程式繪製
//   idle   = 飼養箱待機
//   evo1   = 進化一階
//   evo2   = 進化二階（最終）
//   attack = 攻擊動作（近戰特效 or 遠程彈藥圖）
//   hurt   = 受傷圖（選填）
// knockback: 被擊中時的擊退距離（像素），0 = 無擊退
const SPECIES=[
  {id:0,name:'泡芽',attr:'grass',rarity:1,ivRange:5,innateSkillId:'grass_innate_1',
   baseHP:45,baseATK:12,baseDEF:10,baseAGI:8,baseSPD:10,knockback:0,
   atkType:'melee',sizes:[0.8,1.2],evoFrom:null,evoTo:1,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:1,name:'茂茂',attr:'grass',rarity:2,ivRange:5,innateSkillId:'grass_innate_1',
   baseHP:65,baseATK:18,baseDEF:15,baseAGI:10,baseSPD:12,knockback:0,
   atkType:'melee',sizes:[1.0,1.4],evoFrom:0,evoTo:2,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:2,name:'藤蔓王',attr:'grass',rarity:3,ivRange:5,innateSkillId:'grass_innate_1',
   baseHP:90,baseATK:28,baseDEF:22,baseAGI:12,baseSPD:14,knockback:0,
   atkType:'ranged',sizes:[1.2,1.6],evoFrom:1,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:3,name:'苔球',attr:'grass',rarity:1,ivRange:5,innateSkillId:'grass_innate_2',
   baseHP:50,baseATK:10,baseDEF:14,baseAGI:6,baseSPD:8,knockback:0,
   atkType:'melee',sizes:[0.7,1.1],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:4,name:'葉靈',attr:'grass',rarity:3,ivRange:5,innateSkillId:'grass_innate_3',
   baseHP:70,baseATK:22,baseDEF:18,baseAGI:18,baseSPD:20,knockback:0,
   atkType:'ranged',sizes:[0.9,1.3],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:5,name:'暖炭',attr:'fire',rarity:1,ivRange:5,innateSkillId:'fire_innate_1',
   baseHP:40,baseATK:15,baseDEF:8,baseAGI:10,baseSPD:12,knockback:0,
   atkType:'melee',sizes:[0.8,1.2],evoFrom:null,evoTo:6,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:6,name:'火花仔',attr:'fire',rarity:2,ivRange:5,innateSkillId:'fire_innate_1',
   baseHP:58,baseATK:22,baseDEF:12,baseAGI:14,baseSPD:15,knockback:0,
   atkType:'melee',sizes:[1.0,1.4],evoFrom:5,evoTo:7,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:7,name:'熔岩獸',attr:'fire',rarity:4,ivRange:5,innateSkillId:'fire_innate_1',
   baseHP:95,baseATK:38,baseDEF:20,baseAGI:16,baseSPD:18,knockback:0,
   atkType:'area',sizes:[1.3,1.7],evoFrom:6,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:8,name:'火花球',attr:'fire',rarity:2,ivRange:5,innateSkillId:'fire_innate_2',
   baseHP:52,baseATK:20,baseDEF:10,baseAGI:16,baseSPD:18,knockback:0,
   atkType:'ranged',sizes:[0.85,1.25],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:9,name:'炎靈',attr:'fire',rarity:3,ivRange:5,innateSkillId:'fire_innate_3',
   baseHP:75,baseATK:30,baseDEF:14,baseAGI:20,baseSPD:22,knockback:0,
   atkType:'ranged',sizes:[1.0,1.4],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:10,name:'水滴',attr:'water',rarity:1,ivRange:5,innateSkillId:'water_innate_2',
   baseHP:48,baseATK:11,baseDEF:12,baseAGI:12,baseSPD:11,knockback:0,
   atkType:'ranged',sizes:[0.75,1.15],evoFrom:null,evoTo:11,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:11,name:'泡泡魚',attr:'water',rarity:2,ivRange:5,innateSkillId:'water_innate_2',
   baseHP:68,baseATK:17,baseDEF:18,baseAGI:14,baseSPD:13,knockback:0,
   atkType:'ranged',sizes:[1.0,1.4],evoFrom:10,evoTo:12,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:12,name:'深海龍',attr:'water',rarity:4,ivRange:5,innateSkillId:'water_innate_2',
   baseHP:100,baseATK:30,baseDEF:30,baseAGI:16,baseSPD:15,knockback:0,
   atkType:'area',sizes:[1.3,1.8],evoFrom:11,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:13,name:'雨雲獸',attr:'water',rarity:3,ivRange:5,innateSkillId:'water_innate_1',
   baseHP:80,baseATK:24,baseDEF:20,baseAGI:18,baseSPD:16,knockback:0,
   atkType:'ranged',sizes:[1.1,1.5],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:14,name:'冰晶精',attr:'water',rarity:3,ivRange:5,innateSkillId:'water_innate_3',
   baseHP:72,baseATK:26,baseDEF:24,baseAGI:12,baseSPD:10,knockback:0,
   atkType:'melee',sizes:[0.95,1.35],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:15,name:'靜電毛',attr:'electric',rarity:1,ivRange:5,innateSkillId:'electric_innate_3',
   baseHP:38,baseATK:14,baseDEF:7,baseAGI:16,baseSPD:18,knockback:0,
   atkType:'ranged',sizes:[0.7,1.1],evoFrom:null,evoTo:16,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:16,name:'閃光球',attr:'electric',rarity:2,ivRange:5,innateSkillId:'electric_innate_3',
   baseHP:55,baseATK:20,baseDEF:11,baseAGI:20,baseSPD:22,knockback:0,
   atkType:'ranged',sizes:[0.9,1.3],evoFrom:15,evoTo:17,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:17,name:'雷霆獸',attr:'electric',rarity:4,ivRange:5,innateSkillId:'electric_innate_3',
   baseHP:85,baseATK:36,baseDEF:18,baseAGI:24,baseSPD:26,knockback:0,
   atkType:'area',sizes:[1.2,1.6],evoFrom:16,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:18,name:'電磁球',attr:'electric',rarity:2,ivRange:5,innateSkillId:'electric_innate_1',
   baseHP:48,baseATK:18,baseDEF:9,baseAGI:22,baseSPD:24,knockback:0,
   atkType:'ranged',sizes:[0.8,1.2],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:19,name:'雷鳴星',attr:'electric',rarity:3,ivRange:5,innateSkillId:'electric_innate_2',
   baseHP:78,baseATK:28,baseDEF:15,baseAGI:26,baseSPD:28,knockback:0,
   atkType:'ranged',sizes:[1.05,1.45],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:20,name:'夢幻影',attr:'dark',rarity:2,ivRange:5,innateSkillId:'dark_innate_1',
   baseHP:55,baseATK:18,baseDEF:13,baseAGI:20,baseSPD:16,knockback:0,
   atkType:'melee',sizes:[0.85,1.25],evoFrom:null,evoTo:21,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:21,name:'星塵精',attr:'dark',rarity:3,ivRange:5,innateSkillId:'dark_innate_1',
   baseHP:75,baseATK:26,baseDEF:18,baseAGI:24,baseSPD:20,knockback:0,
   atkType:'ranged',sizes:[1.05,1.45],evoFrom:20,evoTo:22,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:22,name:'虛空王',attr:'dark',rarity:5,ivRange:5,innateSkillId:'dark_innate_1',
   baseHP:110,baseATK:42,baseDEF:24,baseAGI:28,baseSPD:22,knockback:0,
   atkType:'area',sizes:[1.4,1.9],evoFrom:21,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:23,name:'黑洞仔',attr:'dark',rarity:2,ivRange:5,innateSkillId:'dark_innate_1',
   baseHP:60,baseATK:20,baseDEF:16,baseAGI:18,baseSPD:14,knockback:0,
   atkType:'melee',sizes:[0.9,1.3],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:24,name:'暗影靈',attr:'dark',rarity:4,ivRange:5,innateSkillId:'dark_innate_2',
   baseHP:88,baseATK:34,baseDEF:20,baseAGI:30,baseSPD:24,knockback:0,
   atkType:'ranged',sizes:[1.1,1.5],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:25,name:'晨曦',attr:'light',rarity:2,ivRange:5,innateSkillId:'light_innate_1',
   baseHP:58,baseATK:16,baseDEF:16,baseAGI:14,baseSPD:14,knockback:0,
   atkType:'ranged',sizes:[0.9,1.3],evoFrom:null,evoTo:26,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:26,name:'彩虹獸',attr:'light',rarity:3,ivRange:5,innateSkillId:'light_innate_1',
   baseHP:78,baseATK:24,baseDEF:22,baseAGI:18,baseSPD:18,knockback:0,
   atkType:'area',sizes:[1.1,1.5],evoFrom:25,evoTo:27,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:27,name:'聖光精',attr:'light',rarity:5,ivRange:5,innateSkillId:'light_innate_1',
   baseHP:115,baseATK:40,baseDEF:35,baseAGI:20,baseSPD:20,knockback:0,
   atkType:'area',sizes:[1.4,2.0],evoFrom:26,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:28,name:'光球',attr:'light',rarity:1,ivRange:5,innateSkillId:'light_innate_2',
   baseHP:42,baseATK:12,baseDEF:12,baseAGI:16,baseSPD:16,knockback:0,
   atkType:'ranged',sizes:[0.75,1.15],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:29,name:'神話龍',attr:'light',rarity:5,ivRange:5,innateSkillId:'light_innate_1',
   baseHP:130,baseATK:45,baseDEF:38,baseAGI:22,baseSPD:18,knockback:0,
   atkType:'area',sizes:[1.6,2.2],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  // ── 草系 30-34 ──
  {id:30,name:'蘑菇精',attr:'grass',rarity:1,ivRange:5,innateSkillId:'grass_innate_2',
   baseHP:46,baseATK:11,baseDEF:13,baseAGI:7,baseSPD:9,knockback:0,
   atkType:'melee',sizes:[0.75,1.15],evoFrom:null,evoTo:31,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:31,name:'菇菇王',attr:'grass',rarity:2,ivRange:5,innateSkillId:'grass_innate_2',
   baseHP:66,baseATK:19,baseDEF:17,baseAGI:11,baseSPD:13,knockback:0,
   atkType:'melee',sizes:[1.0,1.4],evoFrom:30,evoTo:32,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:32,name:'古木神',attr:'grass',rarity:4,ivRange:5,innateSkillId:'grass_innate_3',
   baseHP:98,baseATK:33,baseDEF:28,baseAGI:13,baseSPD:12,knockback:0,
   atkType:'area',sizes:[1.35,1.8],evoFrom:31,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:33,name:'仙人掌兒',attr:'grass',rarity:2,ivRange:5,innateSkillId:'grass_innate_2',
   baseHP:60,baseATK:20,baseDEF:20,baseAGI:8,baseSPD:8,knockback:0,
   atkType:'ranged',sizes:[0.9,1.3],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:34,name:'森林靈',attr:'grass',rarity:3,ivRange:5,innateSkillId:'grass_innate_1',
   baseHP:76,baseATK:25,baseDEF:19,baseAGI:19,baseSPD:21,knockback:0,
   atkType:'ranged',sizes:[1.0,1.4],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  // ── 火系 35-39 ──
  {id:35,name:'煤炭妖',attr:'fire',rarity:1,ivRange:5,innateSkillId:'fire_innate_3',
   baseHP:42,baseATK:14,baseDEF:9,baseAGI:11,baseSPD:11,knockback:0,
   atkType:'melee',sizes:[0.8,1.2],evoFrom:null,evoTo:36,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:36,name:'焰翼鳥',attr:'fire',rarity:2,ivRange:5,innateSkillId:'fire_innate_3',
   baseHP:60,baseATK:23,baseDEF:13,baseAGI:18,baseSPD:20,knockback:0,
   atkType:'ranged',sizes:[1.0,1.4],evoFrom:35,evoTo:37,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:37,name:'鳳凰王',attr:'fire',rarity:5,ivRange:5,innateSkillId:'fire_innate_3',
   baseHP:118,baseATK:43,baseDEF:30,baseAGI:26,baseSPD:24,knockback:0,
   atkType:'area',sizes:[1.5,2.0],evoFrom:36,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:38,name:'岩漿蛙',attr:'fire',rarity:2,ivRange:5,innateSkillId:'fire_innate_1',
   baseHP:64,baseATK:21,baseDEF:16,baseAGI:12,baseSPD:10,knockback:0,
   atkType:'melee',sizes:[0.95,1.35],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:39,name:'烈焰狐',attr:'fire',rarity:3,ivRange:5,innateSkillId:'fire_innate_2',
   baseHP:74,baseATK:29,baseDEF:15,baseAGI:22,baseSPD:23,knockback:0,
   atkType:'melee',sizes:[1.05,1.45],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  // ── 水系 40-44 ──
  {id:40,name:'小海獺',attr:'water',rarity:1,ivRange:5,innateSkillId:'water_innate_1',
   baseHP:50,baseATK:10,baseDEF:13,baseAGI:13,baseSPD:12,knockback:0,
   atkType:'melee',sizes:[0.75,1.15],evoFrom:null,evoTo:41,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:41,name:'海豚精',attr:'water',rarity:2,ivRange:5,innateSkillId:'water_innate_1',
   baseHP:70,baseATK:18,baseDEF:19,baseAGI:17,baseSPD:16,knockback:0,
   atkType:'ranged',sizes:[1.0,1.4],evoFrom:40,evoTo:42,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:42,name:'巨鯨神',attr:'water',rarity:4,ivRange:5,innateSkillId:'water_innate_1',
   baseHP:105,baseATK:32,baseDEF:32,baseAGI:14,baseSPD:13,knockback:0,
   atkType:'area',sizes:[1.4,1.9],evoFrom:41,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:43,name:'珊瑚精',attr:'water',rarity:2,ivRange:5,innateSkillId:'water_innate_3',
   baseHP:58,baseATK:16,baseDEF:22,baseAGI:10,baseSPD:9,knockback:0,
   atkType:'ranged',sizes:[0.9,1.3],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:44,name:'霜雪貂',attr:'water',rarity:3,ivRange:5,innateSkillId:'water_innate_2',
   baseHP:80,baseATK:26,baseDEF:22,baseAGI:15,baseSPD:14,knockback:0,
   atkType:'melee',sizes:[1.0,1.4],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  // ── 電系 45-49 ──
  {id:45,name:'電蟲',attr:'electric',rarity:1,ivRange:5,innateSkillId:'electric_innate_1',
   baseHP:36,baseATK:13,baseDEF:6,baseAGI:17,baseSPD:19,knockback:0,
   atkType:'ranged',sizes:[0.7,1.1],evoFrom:null,evoTo:46,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:46,name:'閃電蜂',attr:'electric',rarity:2,ivRange:5,innateSkillId:'electric_innate_1',
   baseHP:54,baseATK:21,baseDEF:12,baseAGI:23,baseSPD:25,knockback:0,
   atkType:'ranged',sizes:[0.9,1.3],evoFrom:45,evoTo:47,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:47,name:'暴風龍',attr:'electric',rarity:4,ivRange:5,innateSkillId:'electric_innate_1',
   baseHP:88,baseATK:37,baseDEF:19,baseAGI:27,baseSPD:28,knockback:0,
   atkType:'area',sizes:[1.25,1.65],evoFrom:46,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:48,name:'磁力石',attr:'electric',rarity:2,ivRange:5,innateSkillId:'electric_innate_2',
   baseHP:62,baseATK:17,baseDEF:18,baseAGI:14,baseSPD:12,knockback:0,
   atkType:'melee',sizes:[0.85,1.25],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:49,name:'電光蛇',attr:'electric',rarity:3,ivRange:5,innateSkillId:'electric_innate_3',
   baseHP:72,baseATK:27,baseDEF:14,baseAGI:28,baseSPD:26,knockback:0,
   atkType:'melee',sizes:[1.0,1.4],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  // ── 暗系 50-54 ──
  {id:50,name:'幽靈球',attr:'dark',rarity:1,ivRange:5,innateSkillId:'dark_innate_2',
   baseHP:40,baseATK:13,baseDEF:10,baseAGI:18,baseSPD:15,knockback:0,
   atkType:'melee',sizes:[0.75,1.15],evoFrom:null,evoTo:51,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:51,name:'魂魄精',attr:'dark',rarity:2,ivRange:5,innateSkillId:'dark_innate_2',
   baseHP:58,baseATK:21,baseDEF:15,baseAGI:22,baseSPD:18,knockback:0,
   atkType:'ranged',sizes:[1.0,1.4],evoFrom:50,evoTo:52,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:52,name:'混沌獸',attr:'dark',rarity:5,ivRange:5,innateSkillId:'dark_innate_2',
   baseHP:120,baseATK:44,baseDEF:26,baseAGI:30,baseSPD:25,knockback:0,
   atkType:'area',sizes:[1.45,1.95],evoFrom:51,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:53,name:'詛咒娃娃',attr:'dark',rarity:3,ivRange:5,innateSkillId:'dark_innate_1',
   baseHP:68,baseATK:28,baseDEF:17,baseAGI:20,baseSPD:16,knockback:0,
   atkType:'melee',sizes:[0.9,1.3],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:54,name:'暗炎貓',attr:'dark',rarity:3,ivRange:5,innateSkillId:'dark_innate_1',
   baseHP:78,baseATK:31,baseDEF:16,baseAGI:26,baseSPD:22,knockback:0,
   atkType:'ranged',sizes:[1.05,1.45],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  // ── 光系 55-59 ──
  {id:55,name:'星光精',attr:'light',rarity:1,ivRange:5,innateSkillId:'light_innate_1',
   baseHP:44,baseATK:12,baseDEF:11,baseAGI:15,baseSPD:15,knockback:0,
   atkType:'ranged',sizes:[0.75,1.15],evoFrom:null,evoTo:56,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:56,name:'月光獸',attr:'light',rarity:2,ivRange:5,innateSkillId:'light_innate_1',
   baseHP:64,baseATK:20,baseDEF:20,baseAGI:19,baseSPD:19,knockback:0,
   atkType:'ranged',sizes:[1.0,1.4],evoFrom:55,evoTo:57,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:57,name:'太陽神',attr:'light',rarity:5,ivRange:5,innateSkillId:'light_innate_1',
   baseHP:125,baseATK:44,baseDEF:36,baseAGI:24,baseSPD:21,knockback:0,
   atkType:'area',sizes:[1.5,2.0],evoFrom:56,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:58,name:'雲朵精',attr:'light',rarity:2,ivRange:5,innateSkillId:'light_innate_2',
   baseHP:56,baseATK:15,baseDEF:17,baseAGI:17,baseSPD:17,knockback:0,
   atkType:'ranged',sizes:[0.9,1.3],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},

  {id:59,name:'聖翼獸',attr:'light',rarity:4,ivRange:5,innateSkillId:'light_innate_1',
   baseHP:92,baseATK:35,baseDEF:32,baseAGI:22,baseSPD:20,knockback:0,
   atkType:'area',sizes:[1.2,1.6],evoFrom:null,evoTo:null,
   sprites:{idle:'',blink:'',attack:'',hurt:''}},
];

// ── 商店道具 ──
// type: 'consumable'(消耗品) | 'egg'(蛋) | 'special'(特殊)
// effect: 道具效果識別碼（遊戲邏輯依此執行）
const SHOP_CONFIG=[
  {id:'food',       name:'飼養食物',   desc:'餵食怪物，增加EXP & 飽食度',  price:20,  icon:'🍬', type:'consumable', effect:'feed',        expGain:50,  key:'food'},
  {id:'potion',     name:'體力回復劑', desc:'解除心情低落CD',               price:50,  icon:'💊', type:'consumable', effect:'heal',                     key:'potion'},
  {id:'specialEgg', name:'特殊怪物蛋', desc:'孵化隨機稀有怪物',             price:200, icon:'🥚', type:'egg',        effect:'hatch',                    key:'specialEgg'},
  {id:'drug',       name:'幻想藥',     desc:'配種色違機率提升至3%',         price:150, icon:'🔮', type:'special',    effect:'shiny_boost',              key:'drug'},
  {id:'bondFruit',  name:'羈絆果實',   desc:'對寵物使用後進入磨合期，累積20場勝利即觸發羈絆解放，獲得永久唯一的發光特效與專屬稱號', price:800, icon:'🍎', type:'consumable', effect:'bond', key:'bondFruit'},
];

// ── NPC 名稱池 ──
const NPC_NAMES=['小菜鳥','森林守護者','烈焰戰士','水晶法師','雷霆騎士','暗影獵人','光明聖騎','元素大師','混沌魔王','星塵收集者','怪物博士','傳說馴獸師','初心者小明','老手阿強','冠軍挑戰者'];