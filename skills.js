// ══════════════════════════════════════════════
//  skills.js  ——  Monstro Garden 被動技能系統
//  包含：技能定義、SKILL_CONFIG、狀態系統、執行器
// ══════════════════════════════════════════════

// ── 技能數值設定（可透過後台調整）──
const SKILL_CONFIG = {
  innate: {
    fire_innate_1:     { burnChance: 0.50 },
    fire_innate_2:     { burnChance: 0.30 },
    water_innate_1:    { wetChance: 0.25 },
    water_innate_2:    { hpThreshold: 0.50, defMulti: 2.0, duration: 5 },
    water_innate_3:    { intervalSec: 10 },
    grass_innate_3:    { paralyzeDuration: 3 },
    electric_innate_2: { paralyzeChance: 0.20, paralyzeDuration: 1 },
    electric_innate_3: { triggerCount: 4 },
    earth_innate_1:    { defMulti: 1.5, spdReduction: 0.20 },
    earth_innate_2:    { counterChance: 0.20 },
    light_innate_1:    { duration: 5 },
    light_innate_2:    { regenChance: 0.30 },
    dark_innate_1:     { fearChance: 0.10, fearDuration: 2 },
    dark_innate_2:     { healPercent: 0.20 },
  },
  free: {
    fire_free_1:     { triggerCount: 3 },
    fire_free_2:     { triggerCount: 4, atkMulti: 0.50, burnStacks: 1 },
    fire_free_3:     { intervalSec: 3, maxHpPercent: 0.02, levelFloor: 2 },
    fire_free_4:     { atkBonusPerStack: 0.05, minBonus: 1 },
    fire_free_5:     { hpThreshold: 0.20, intervalMulti: 0.50 },
    water_free_1:    { triggerCount: 4, atkMulti: 0.80, freezeDuration: 1.5 },
    water_free_2:    { triggerCount: 3, defMulti: 2.0, duration: 2 },
    water_free_3:    { intervalSec: 4, atkMulti: 0.50, freezeStackMulti: 10 },
    water_free_4:    { wetTriggerChance: 0.20 },
    water_free_5:    { spreadChance: 0.30 },
    grass_free_1:    { triggerCount: 3, atkMulti: 0.30, poisonStacks: 2 },
    grass_free_2:    { triggerCount: 2, thornsGain: 5 },
    grass_free_3:    { intervalSec: 5, maxHpPercent: 0.05, poisonStackMulti: 5, levelFloor: 2 },
    grass_free_4:    { dmgBonus: 0.40, minBonus: 5 },
    grass_free_5:    { defReduction: 0.10, minReduction: 2 },
    electric_free_1: { triggerCount: 2, chainMulti: 0.30 },
    electric_free_2: { triggerCount: 4, atkMulti: 0.40, paralyzeDuration: 2 },
    electric_free_3: { intervalSec: 3, stackMulti: 15, chainCount: 2 },
    electric_free_4: { resetChance: 0.15 },
    electric_free_5: { immuneChance: 0.25 },
    dark_free_1:     { triggerCount: 3, atkMulti: 1.20, fearDuration: 1 },
    dark_free_2:     { triggerCount: 3, atkMulti: 0.60, poisonStacks: 1 },
    dark_free_3:     { intervalSec: 4, lostHpPercent: 0.15, levelFloor: 5 },
    dark_free_4:     {},
    dark_free_5:     { regenPercent: 0.10, regenDuration: 1 },
    light_free_1:    { triggerCount: 4, atkMulti: 0.50 },
    light_free_2:    { triggerCount: 5, defMulti: 2.0, duration: 3 },
    light_free_3:    { intervalSec: 6, atkMulti: 2.0, debuffMulti: 1.50 },
    light_free_4:    { defIgnorePercent: 0.30 },
    light_free_5:    { shieldPercent: 0.20 },
  },
  status: {
    brave:      { atkMulti: 1.5, defMulti: 1.5, duration: 5 },
    endure:     { defMulti: 2.0, duration: 5 },
    frenzy:     { dmgMulti: 2.0 },
    regen:      { totalHpPercent: 0.50, duration: 5 },
    aroused:    { counterChance: 0.20, counterMulti: 0.8 },
    conductive: { chainMulti: 0.30 },
    burn:       { durationSec: 5 },
    freeze:     { triggerStacks: 5, stunDuration: 3 },
    paralyze:   { missChance: 0.20 },
    fear:       { duration: 2 },
    poison:     { maxHpPercentPerStack: 0.01, minDmgPerStack: 1, maxStacks: 10, healReduction: 0.50 },
  },
  system: {
    awakeningChance:     0.30,
    breedInheritChanceA: 0.30,
    breedInheritChanceB: 0.30,
    breedRandomChance:   0.20,
    freeSlotFillChance:  0.50,
  },
};

// ── 18 種天生技能定義 ──
const INNATE_SKILLS = {
  fire_innate_1:     { id:'fire_innate_1',     name:'烈焰之軀', attr:'fire',     trigger:'on_hit_received',  desc:'受到近戰攻擊時，50%機率使攻擊者+1層燃燒' },
  fire_innate_2:     { id:'fire_innate_2',     name:'火花濺射', attr:'fire',     trigger:'on_attack',        desc:'每次普攻，30%機率對目標+1層燃燒' },
  fire_innate_3:     { id:'fire_innate_3',     name:'狂熱',     attr:'fire',     trigger:'on_kill',          desc:'擊殺後，下次攻擊必獲得狂暴(傷害×2)' },
  water_innate_1:    { id:'water_innate_1',    name:'滲透',     attr:'water',    trigger:'on_attack',        desc:'所有攻擊25%機率使目標進入潮濕狀態' },
  water_innate_2:    { id:'water_innate_2',    name:'水幕護盾', attr:'water',    trigger:'health_threshold', desc:'首次低於50%HP時，立即獲得堅忍5秒' },
  water_innate_3:    { id:'water_innate_3',    name:'潤澤',     attr:'water',    trigger:'periodic',         intervalSec:10, desc:'每10秒清除自身1個負面狀態' },
  grass_innate_1:    { id:'grass_innate_1',    name:'光合作用', attr:'grass',    trigger:'on_battle_start',  desc:'戰鬥開始時自動獲得再生(5秒回50%HP)' },
  grass_innate_2:    { id:'grass_innate_2',    name:'倒鉤',     attr:'grass',    trigger:'on_hit_received',  desc:'每次受擊自身+1層荊棘(受擊反彈1點真傷)' },
  grass_innate_3:    { id:'grass_innate_3',    name:'孢子擴散', attr:'grass',    trigger:'on_death',         desc:'死亡時使全體敵方陷入麻痺3秒' },
  electric_innate_1: { id:'electric_innate_1', name:'高壓過載', attr:'electric', trigger:'on_attack',        desc:'攻擊潮濕目標時，100%觸發導電效果' },
  electric_innate_2: { id:'electric_innate_2', name:'靜電',     attr:'electric', trigger:'on_hit_received',  desc:'受攻擊時，20%機率使攻擊者麻痺1秒' },
  electric_innate_3: { id:'electric_innate_3', name:'極速',     attr:'electric', trigger:'count_attack',     triggerCount:4, desc:'每4次攻擊後，下次攻擊獲得勇敢' },
  earth_innate_1:    { id:'earth_innate_1',    name:'岩化',     attr:'earth',    trigger:'permanent',        desc:'永久擁有堅忍(DEF×1.5)，但移動速度降低20%' },
  earth_innate_2:    { id:'earth_innate_2',    name:'大地回響', attr:'earth',    trigger:'on_hit_received',  desc:'受攻擊時，20%機率立即無視冷卻普攻一次' },
  light_innate_1:    { id:'light_innate_1',    name:'聖光降臨', attr:'light',    trigger:'on_battle_start',  desc:'進入戰場時賦予全體隊友勇敢5秒' },
  light_innate_2:    { id:'light_innate_2',    name:'淨化之光', attr:'light',    trigger:'on_passive_trigger',desc:'觸發被動後30%機率獲得再生' },
  dark_innate_1:     { id:'dark_innate_1',     name:'虛空凝視', attr:'dark',     trigger:'on_attack',        desc:'攻擊時10%機率使目標恐懼2秒' },
  dark_innate_2:     { id:'dark_innate_2',     name:'靈魂抽取', attr:'dark',     trigger:'on_kill',          desc:'擊殺後立即回復自身MaxHP×20%血量' },
};

// ── 自由技能池（每屬性5個）──
const FREE_SKILL_POOLS = {
  fire: [
    { id:'fire_free_1', name:'熾熱連擊', attr:'fire', trigger:'count_attack',     triggerCount:3,   desc:'每3次攻擊，下次攻擊獲得狂暴(傷害×2)' },
    { id:'fire_free_2', name:'烈焰反撲', attr:'fire', trigger:'count_hit',        triggerCount:4,   desc:'每受擊4次，對全敵造成ATK×0.5並附加1層燃燒' },
    { id:'fire_free_3', name:'焦土審判', attr:'fire', trigger:'periodic',         intervalSec:3,    desc:'每3秒對燃燒中的敵人造成MaxHP×2%×層數傷害' },
    { id:'fire_free_4', name:'餘燼賦能', attr:'fire', trigger:'status_check',                       desc:'自身每有1層燃燒，ATK提升5%（保底+1）' },
    { id:'fire_free_5', name:'焚身',     attr:'fire', trigger:'health_threshold', hpThreshold:0.20, desc:'HP<20%時攻擊冷卻縮短50%（一次性觸發）' },
  ],
  water: [
    { id:'water_free_1', name:'潮汐積累', attr:'water', trigger:'count_attack',  triggerCount:4,  desc:'每4次攻擊，造成ATK×0.8額外水傷並施加冰凍1.5秒' },
    { id:'water_free_2', name:'水幕化勁', attr:'water', trigger:'count_hit',     triggerCount:3,  desc:'每受擊3次，獲得堅忍(DEF×2)持續2秒' },
    { id:'water_free_3', name:'寒霜入骨', attr:'water', trigger:'periodic',      intervalSec:4,   desc:'每4秒對潮濕目標造成ATK×0.5+冰凍層數×10傷害，並+1層冰凍' },
    { id:'water_free_4', name:'潤物無聲', attr:'water', trigger:'status_check',                   desc:'攻擊潮濕目標時，20%機率獲得再生' },
    { id:'water_free_5', name:'波紋擴散', attr:'water', trigger:'on_buff_gained',                  desc:'自身獲得BUFF時，30%機率同步給隨機一名隊友' },
  ],
  grass: [
    { id:'grass_free_1', name:'蔓延打擊', attr:'grass', trigger:'count_attack', triggerCount:3,  desc:'每3次攻擊，造成ATK×0.3並附加2層中毒' },
    { id:'grass_free_2', name:'荊棘甲片', attr:'grass', trigger:'count_hit',    triggerCount:2,  desc:'每受擊2次，自身獲得5層荊棘' },
    { id:'grass_free_3', name:'毒素引爆', attr:'grass', trigger:'periodic',     intervalSec:5,   desc:'每5秒對中毒目標造成MaxHP×5%+中毒層數×5傷害' },
    { id:'grass_free_4', name:'根鬚纏繞', attr:'grass', trigger:'status_check',                  desc:'攻擊麻痺中的敵人時，傷害+40%（保底+5）' },
    { id:'grass_free_5', name:'生命共感', attr:'grass', trigger:'status_check',                  desc:'自身有再生時，敵方全體DEF降低10%（保底-2）' },
  ],
  electric: [
    { id:'electric_free_1', name:'高壓蓄能', attr:'electric', trigger:'count_attack', triggerCount:2, desc:'每2次攻擊，觸發導電彈射ATK×0.3' },
    { id:'electric_free_2', name:'放電迴路', attr:'electric', trigger:'count_hit',    triggerCount:4, desc:'每受擊4次，對周圍敵人造成ATK×0.4並麻痺2秒' },
    { id:'electric_free_3', name:'電磁共振', attr:'electric', trigger:'periodic',     intervalSec:3,  desc:'每3秒對觸電目標造成層數×15電傷，彈射至2名敵方' },
    { id:'electric_free_4', name:'超載意志', attr:'electric', trigger:'status_check',               desc:'擁有勇敢時，攻擊有15%機率立即重置攻擊冷卻' },
    { id:'electric_free_5', name:'靜電屏障', attr:'electric', trigger:'on_ranged_hit',              desc:'受到遠程傷害時，25%機率免疫並使攻擊者觸電' },
  ],
  dark: [
    { id:'dark_free_1', name:'暗影連刺', attr:'dark', trigger:'count_attack',  triggerCount:3, desc:'每3次攻擊，造成ATK×1.2並附帶恐懼1秒' },
    { id:'dark_free_2', name:'噩夢反噬', attr:'dark', trigger:'count_hit',     triggerCount:3, desc:'每受擊3次，對攻擊者造成ATK×0.6並使全敵+1層中毒' },
    { id:'dark_free_3', name:'心靈崩潰', attr:'dark', trigger:'periodic',      intervalSec:4,  desc:'每4秒對恐懼中的敵人造成損失血量×15%傷害（保底Level×5）' },
    { id:'dark_free_4', name:'夜幕收割', attr:'dark', trigger:'on_kill',                       desc:'擊殺帶負面狀態的敵人，全隊獲得勇敢' },
    { id:'dark_free_5', name:'虛無身法', attr:'dark', trigger:'on_dodge',                      desc:'閃避攻擊後，自身獲得再生（1秒回10%HP）' },
  ],
  light: [
    { id:'light_free_1', name:'聖光洗禮', attr:'light', trigger:'count_attack', triggerCount:4, desc:'每4次攻擊，造成ATK×0.5並為最虛弱隊友施加再生' },
    { id:'light_free_2', name:'神聖領域', attr:'light', trigger:'count_hit',    triggerCount:5, desc:'每受擊5次，全體隊友獲得堅忍持續3秒' },
    { id:'light_free_3', name:'天罰',     attr:'light', trigger:'periodic',     intervalSec:6,  desc:'每6秒對隨機敵人造成ATK×2.0傷害，有負面狀態則×1.5' },
    { id:'light_free_4', name:'破曉',     attr:'light', trigger:'status_check',                 desc:'擁有勇敢時，攻擊無視目標30%防禦力' },
    { id:'light_free_5', name:'守護之光', attr:'light', trigger:'on_death',                     desc:'死亡時全隊清除負面狀態並獲得MaxHP×20%護盾' },
  ],
  earth: [],
};

// ── 狀態效果輔助函式 ──
function applyStatus(bt, key, stacks = 1, durationOverride = null) {
  if (!bt || bt.dead) return;
  if (!bt.statuses) bt.statuses = {};
  if (!bt.statuses[key]) bt.statuses[key] = { stacks: 0, timer: 0 };
  const s = bt.statuses[key];
  s.stacks = Math.max(0, s.stacks) + stacks;
  // Apply duration (in frames @ 60fps)
  const cfg = SKILL_CONFIG.status;
  const dur = durationOverride !== null ? durationOverride :
    key === 'brave'      ? (cfg.brave.duration * 60) :
    key === 'endure'     ? (cfg.endure.duration * 60) :
    key === 'regen'      ? (cfg.regen.duration * 60) :
    key === 'aroused'    ? 300 :
    key === 'conductive' ? 300 :
    key === 'frenzy'     ? 9999 :  // consumed on next attack
    key === 'burn'       ? (cfg.burn.durationSec * 60) :
    key === 'paralyze'   ? 60 :    // 1 second default
    key === 'fear'       ? (cfg.fear.duration * 60) :
    key === 'wet'        ? 600 :   // 10 seconds
    0; // shock, freeze, thorns, poison: no timer (stack-based)
  if (dur > 0) s.timer = Math.max(s.timer, dur);
  // Poison: cap stacks
  if (key === 'poison') s.stacks = Math.min(s.stacks, SKILL_CONFIG.status.poison.maxStacks);
}

function hasStatus(bt, key) {
  if (!bt || !bt.statuses) return false;
  const s = bt.statuses[key];
  if (!s) return false;
  if (s.timer > 0) return true;
  if (s.stacks > 0) return true;
  return false;
}

function getStatusStacks(bt, key) {
  if (!bt || !bt.statuses || !bt.statuses[key]) return 0;
  return bt.statuses[key].stacks || 0;
}

function clearStatus(bt, key) {
  if (bt && bt.statuses) delete bt.statuses[key];
}

function clearRandomNegativeStatus(bt) {
  if (!bt || !bt.statuses) return false;
  const neg = ['burn', 'shock', 'freeze', 'paralyze', 'wet', 'fear', 'poison'];
  const active = neg.filter(k => hasStatus(bt, k));
  if (!active.length) return false;
  clearStatus(bt, active[Math.floor(Math.random() * active.length)]);
  return true;
}

function hasAnyNegativeStatus(bt) {
  const neg = ['burn', 'shock', 'freeze', 'paralyze', 'wet', 'fear', 'poison'];
  return neg.some(k => hasStatus(bt, k));
}

// 每幀處理狀態效果 tick（在 battleLoop 中每幀呼叫）
function tickBattleStatuses(bt) {
  if (!bt || !bt.statuses) return;
  const s = bt.statuses;
  const cfg = SKILL_CONFIG.status;

  // 燃燒：每秒扣層數等量HP，5秒後清除
  if (s.burn) {
    s.burn._tick = (s.burn._tick || 0) + 1;
    if (s.burn._tick >= 60) {
      s.burn._tick = 0;
      const dmg = s.burn.stacks;
      bt.hp = Math.max(0, bt.hp - dmg);
      s.burn.timer -= 60;
      if (s.burn.timer <= 0) delete s.burn;
    }
  }
  // 再生：5秒內回復MaxHP×50%（每幀均勻回復，累積後以整數計算）
  if (s.regen) {
    const perFrame = bt.maxHP * (cfg.regen.totalHpPercent / (cfg.regen.duration * 60));
    s.regen._acc = (s.regen._acc || 0) + perFrame;
    const heal = Math.floor(s.regen._acc);
    if (heal >= 1) {
      bt.hp = Math.min(bt.maxHP, bt.hp + heal);
      s.regen._acc -= heal;
    }
    s.regen.timer--;
    if (s.regen.timer <= 0) delete s.regen;
  }
  // 中毒：每秒 ceil(max(MaxHP×1%×層數, 1×層數))
  if (s.poison) {
    s.poison._tick = (s.poison._tick || 0) + 1;
    if (s.poison._tick >= 60) {
      s.poison._tick = 0;
      const stk = s.poison.stacks;
      const dmg = Math.ceil(Math.max(bt.maxHP * cfg.poison.maxHpPercentPerStack * stk, cfg.poison.minDmgPerStack * stk));
      bt.hp = Math.max(0, bt.hp - dmg);
    }
  }
  // 計時型 BUFF/DEBUFF（倒數計時）
  ['brave', 'endure', 'frenzy', 'aroused', 'conductive', 'fear', 'paralyze', 'wet'].forEach(k => {
    if (s[k] && s[k].timer > 0) {
      s[k].timer--;
      if (s[k].timer <= 0) {
        if (k === 'frenzy') return; // frenzy consumed on attack, not by timer
        delete s[k];
      }
    }
  });
  // 冰凍暈眩計時
  if (s.freeze && s.freeze.stunTimer > 0) {
    s.freeze.stunTimer--;
    if (s.freeze.stunTimer <= 0) delete s.freeze.stunTimer;
  }
}

// 套用BUFF效果至stat快照（每幀呼叫）
function applyBuffStats(bt) {
  if (!bt || !bt.m) return;
  const base = getStats(bt.m);
  const cfg = SKILL_CONFIG.status;
  let atkMult = 1, defMult = 1;
  if (hasStatus(bt, 'brave'))  { atkMult *= cfg.brave.atkMulti; defMult *= cfg.brave.defMulti; }
  if (hasStatus(bt, 'endure')) { defMult *= cfg.endure.defMulti; }
  // 岩化：常駐堅忍 DEF×1.5，移速-20%（earth_innate_1）
  if (bt.m.passiveInnate === 'earth_innate_1') {
    defMult *= SKILL_CONFIG.innate.earth_innate_1.defMulti;
    bt.stats.SPD = Math.max(1, Math.floor(base.SPD * (1 - SKILL_CONFIG.innate.earth_innate_1.spdReduction)));
  } else {
    bt.stats.SPD = base.SPD;
  }
  bt.stats.ATK = Math.max(1, Math.ceil(base.ATK * atkMult));
  bt.stats.DEF = Math.max(1, Math.ceil(base.DEF * defMult));
  // 餘燼賦能（fire_free_4）：每層燃燒提升ATK%
  if (hasStatus(bt, 'burn') && _hasFreeSkill(bt, 'fire_free_4')) {
    const cfg4 = SKILL_CONFIG.free.fire_free_4;
    const stacks = getStatusStacks(bt, 'burn');
    const bonus = Math.max(cfg4.minBonus, Math.ceil(bt.stats.ATK * cfg4.atkBonusPerStack * stacks));
    bt.stats.ATK += bonus;
  }
}

// 「生命共感」：自身有再生時敵方全體DEF-10%
function applyLifeSharedDebuff(bt, enemies) {
  if (!_hasFreeSkill(bt, 'grass_free_5')) return;
  if (!hasStatus(bt, 'regen')) return;
  const cfg = SKILL_CONFIG.free.grass_free_5;
  enemies.forEach(e => {
    if (e.dead) return;
    const base = getStats(e.m);
    const reduction = Math.max(cfg.minReduction, Math.ceil(base.DEF * cfg.defReduction));
    e.stats.DEF = Math.max(1, e.stats.DEF - reduction);
  });
}

// ── 被動槽位輔助函式 ──
function _getAllSkillsFlat() {
  const all = {};
  Object.values(FREE_SKILL_POOLS).forEach(pool => pool.forEach(sk => { all[sk.id] = sk; }));
  return all;
}
const _FREE_SKILLS_FLAT = {}; // populated lazily

function findFreeSkillById(id) {
  if (_FREE_SKILLS_FLAT[id]) return _FREE_SKILLS_FLAT[id];
  for (const pool of Object.values(FREE_SKILL_POOLS)) {
    const found = pool.find(s => s.id === id);
    if (found) { _FREE_SKILLS_FLAT[id] = found; return found; }
  }
  return null;
}

function getSkillById(id) {
  if (!id) return null;
  return INNATE_SKILLS[id] || findFreeSkillById(id) || null;
}

function _hasFreeSkill(bt, id) {
  return bt && bt.m && (bt.m.passiveFreeA === id || bt.m.passiveFreeB === id);
}

function getFreePool(attr) {
  return FREE_SKILL_POOLS[attr] || [];
}

function pickFreeSkill(pool, exclude = []) {
  const avail = pool.filter(s => !exclude.includes(s.id));
  if (!avail.length) return null;
  return avail[Math.floor(Math.random() * avail.length)].id;
}

function pickInheritedSkill(parent, exclude = []) {
  if (!parent) return null;
  const candidates = [parent.passiveFreeA, parent.passiveFreeB].filter(id => id && !exclude.includes(id));
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function initPassiveSlots(m, pA = null, pB = null) {
  const sp = SPECIES[m.speciesId];
  // Slot 1: 天生技能（永久固定）
  m.passiveInnate = sp.innateSkillId || null;
  const sys = SKILL_CONFIG.system;
  // Slot 2 & 3: 自由被動
  if (pA && pB) {
    // 交配繼承
    const [fA, fB] = _inheritFreeSkills(m, pA, pB);
    m.passiveFreeA = fA;
    m.passiveFreeB = fB;
  } else {
    // 初始生成：各50%填充
    const pool = getFreePool(sp.attr);
    const exclude1 = [m.passiveInnate];
    m.passiveFreeA = Math.random() < sys.freeSlotFillChance ? pickFreeSkill(pool, exclude1) : null;
    const exclude2 = [m.passiveInnate, m.passiveFreeA].filter(Boolean);
    m.passiveFreeB = Math.random() < sys.freeSlotFillChance ? pickFreeSkill(pool, exclude2) : null;
  }
}

function _inheritFreeSkills(m, pA, pB) {
  const sp = SPECIES[m.speciesId];
  const pool = getFreePool(sp.attr);
  const sys = SKILL_CONFIG.system;
  const ownedBase = [m.passiveInnate].filter(Boolean);
  const results = [null, null];
  const owned = [...ownedBase];
  for (let i = 0; i < 2; i++) {
    const r = Math.random();
    let skill = null;
    if (r < sys.breedInheritChanceA) {
      skill = pickInheritedSkill(pA, owned);
    } else if (r < sys.breedInheritChanceA + sys.breedInheritChanceB) {
      skill = pickInheritedSkill(pB, owned);
    } else if (r < sys.breedInheritChanceA + sys.breedInheritChanceB + sys.breedRandomChance) {
      skill = pickFreeSkill(pool, owned);
    }
    // else: 空缺（剩餘機率）
    if (skill) owned.push(skill);
    results[i] = skill;
  }
  // 去重
  if (results[0] && results[0] === results[1]) results[1] = null;
  return results;
}

function tryAwakeningSkill(m) {
  const emptyA = !m.passiveFreeA;
  const emptyB = !m.passiveFreeB;
  if (!emptyA && !emptyB) return null;
  if (Math.random() >= SKILL_CONFIG.system.awakeningChance) return null;
  const sp = SPECIES[m.speciesId];
  const pool = getFreePool(sp.attr);
  const exclude = [m.passiveInnate, m.passiveFreeA, m.passiveFreeB].filter(Boolean);
  const newSkill = pickFreeSkill(pool, exclude);
  if (!newSkill) return null;
  if (emptyA) m.passiveFreeA = newSkill;
  else m.passiveFreeB = newSkill;
  return newSkill;
}

// ── 取得戰鬥單位的所有技能物件 ──
function getActiveBattlerSkills(bt) {
  const m = bt.m;
  return [
    m.passiveInnate ? getSkillById(m.passiveInnate) : null,
    m.passiveFreeA  ? getSkillById(m.passiveFreeA)  : null,
    m.passiveFreeB  ? getSkillById(m.passiveFreeB)  : null,
  ].filter(Boolean);
}

// ── 戰鬥初始化：設定計時器並觸發開場技能 ──
function initBattlerPassives(bt, allBattlers) {
  const skills = getActiveBattlerSkills(bt);
  const allies = allBattlers.filter(b => b.team === bt.team && b !== bt);
  const enemies = allBattlers.filter(b => b.team !== bt.team);

  // 初始化週期計時器
  skills.forEach(sk => {
    if (sk.trigger === 'periodic') {
      bt.periodicTimers[sk.id] = (sk.intervalSec || 5) * 60;
    }
    // 常駐型：permanent（岩化）— 不需要特別處理，在 applyBuffStats 中持續套用
  });

  // 觸發開場技能
  skills.forEach(sk => {
    if (sk.trigger === 'on_battle_start') {
      SKILL_EXECUTORS[sk.id]?.(bt, { allies, enemies, allBattlers });
      _postPassiveTrigger(bt, sk, { allies, enemies });
    }
  });
}

// ── 淨化之光：被動觸發後30%機率獲得再生 ──
function _postPassiveTrigger(bt, triggeredSkill, ctx) {
  // light_innate_2 本身觸發不再套用自己（防止無限循環）
  if (!bt.m.passiveInnate || bt.m.passiveInnate !== 'light_innate_2') return;
  if (triggeredSkill && triggeredSkill.id === 'light_innate_2') return;
  const cfg = SKILL_CONFIG.innate.light_innate_2;
  if (Math.random() < cfg.regenChance) {
    applyStatus(bt, 'regen');
    if (typeof addBattleLog === 'function')
      addBattleLog(`💚 ${bt.m.nickname||bt.m.name} 淨化之光：獲得再生！`, 'win');
  }
}

// ── 週期型技能 tick ──
function tickPeriodicSkills(bt, allBattlers) {
  const skills = getActiveBattlerSkills(bt);
  const allies = allBattlers.filter(b => b.team === bt.team && !b.dead);
  const enemies = allBattlers.filter(b => b.team !== bt.team && !b.dead);

  skills.forEach(sk => {
    if (sk.trigger !== 'periodic') return;
    if (!bt.periodicTimers[sk.id]) bt.periodicTimers[sk.id] = (sk.intervalSec || 5) * 60;
    bt.periodicTimers[sk.id]--;
    if (bt.periodicTimers[sk.id] <= 0) {
      bt.periodicTimers[sk.id] = (sk.intervalSec || 5) * 60;
      SKILL_EXECUTORS[sk.id]?.(bt, { allies, enemies, allBattlers });
      _postPassiveTrigger(bt, sk, { allies, enemies });
    }
  });
}

// ── 技能觸發輔助（通用呼叫入口）──
function triggerSkills(bt, triggerType, ctx) {
  const skills = getActiveBattlerSkills(bt);
  skills.forEach(sk => {
    if (sk.trigger !== triggerType) return;
    SKILL_EXECUTORS[sk.id]?.(bt, ctx);
    _postPassiveTrigger(bt, sk, ctx);
  });
}

// ── 計次型技能觸發 ──
function triggerCountSkills(bt, counterKey, ctx) {
  // counterKey: 'atkCount' | 'hitCount'
  const triggerType = counterKey === 'atkCount' ? 'count_attack' : 'count_hit';
  const skills = getActiveBattlerSkills(bt);
  skills.forEach(sk => {
    if (sk.trigger !== triggerType) return;
    const count = counterKey === 'atkCount' ? bt.atkCount : bt.hitCount;
    const needed = sk.triggerCount || SKILL_CONFIG.innate[sk.id]?.triggerCount || SKILL_CONFIG.free[sk.id]?.triggerCount || 3;
    if (count % needed === 0) {
      SKILL_EXECUTORS[sk.id]?.(bt, ctx);
      _postPassiveTrigger(bt, sk, ctx);
    }
  });
}

// ═══════════════════════════════════════════
// SKILL_EXECUTORS — 48 個技能執行器
// 每個函式接收 (bt, ctx)，bt 是技能擁有者的 battler 物件
// ctx 依觸發類型不同包含不同欄位
// ═══════════════════════════════════════════
const SKILL_EXECUTORS = {

  // ── 火系天生 ──

  // 烈焰之軀：受到近戰攻擊時，50%機率使攻擊者+1層燃燒
  fire_innate_1(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.fire_innate_1;
    if (ctx.attackType !== 'melee' && ctx.attackType !== 'area') return;
    if (Math.random() < cfg.burnChance) {
      applyStatus(ctx.attacker, 'burn', 1);
      _log(`🔥 ${bt.m.nickname||bt.m.name} 烈焰之軀：${ctx.attacker.m.name} +1層燃燒！`, 'hit');
    }
  },

  // 火花濺射：每次普攻，30%機率對目標+1層燃燒
  fire_innate_2(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.fire_innate_2;
    if (Math.random() < cfg.burnChance) {
      applyStatus(ctx.target, 'burn', 1);
      _log(`🔥 ${bt.m.nickname||bt.m.name} 火花濺射：${ctx.target.m.name} +1層燃燒！`, 'hit');
    }
  },

  // 狂熱：擊殺後，下次攻擊必獲得狂暴
  fire_innate_3(bt, ctx) {
    applyStatus(bt, 'frenzy');
    _log(`💥 ${bt.m.nickname||bt.m.name} 狂熱：下次攻擊狂暴！`, 'crit');
  },

  // ── 水系天生 ──

  // 滲透：所有攻擊25%機率使目標潮濕
  water_innate_1(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.water_innate_1;
    if (Math.random() < cfg.wetChance) {
      applyStatus(ctx.target, 'wet');
      _log(`💧 ${bt.m.nickname||bt.m.name} 滲透：${ctx.target.m.name} 進入潮濕狀態！`, 'hit');
    }
  },

  // 水幕護盾：首次低於50%HP時，立即獲得堅忍5秒
  water_innate_2(bt, ctx) {
    if (bt.halfHpTriggered) return;
    bt.halfHpTriggered = true;
    const cfg = SKILL_CONFIG.innate.water_innate_2;
    applyStatus(bt, 'endure', 1, cfg.duration * 60);
    _log(`🛡️ ${bt.m.nickname||bt.m.name} 水幕護盾：獲得堅忍${cfg.duration}秒！`, 'win');
  },

  // 潤澤：每10秒清除自身1個負面狀態
  water_innate_3(bt, ctx) {
    const cleared = clearRandomNegativeStatus(bt);
    if (cleared) _log(`💧 ${bt.m.nickname||bt.m.name} 潤澤：清除一個負面狀態！`, 'win');
  },

  // ── 草系天生 ──

  // 光合作用：戰鬥開始時獲得再生
  grass_innate_1(bt, ctx) {
    applyStatus(bt, 'regen');
    _log(`🌿 ${bt.m.nickname||bt.m.name} 光合作用：獲得再生！`, 'win');
  },

  // 倒鉤：每次受擊自身+1層荊棘
  grass_innate_2(bt, ctx) {
    applyStatus(bt, 'thorns', 1);
    // (荊棘反傷在 battleLoop 中的受擊區塊處理)
  },

  // 孢子擴散：死亡時使全體敵方陷入麻痺3秒
  grass_innate_3(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.grass_innate_3;
    const dur = cfg.paralyzeDuration * 60;
    ctx.enemies.forEach(e => {
      if (!e.dead) applyStatus(e, 'paralyze', 1, dur);
    });
    _log(`🍄 ${bt.m.nickname||bt.m.name} 孢子擴散：敵方全體麻痺${cfg.paralyzeDuration}秒！`, 'win');
  },

  // ── 電系天生 ──

  // 高壓過載：攻擊潮濕目標時，100%觸發導電效果（在 battleLoop status_check 區塊處理）
  electric_innate_1(bt, ctx) {
    // 已在 battleLoop on_attack 時判斷：若 target 有 wet 則觸發鏈傷
    if (!ctx.target || !hasStatus(ctx.target, 'wet')) return;
    const chainMulti = SKILL_CONFIG.status.conductive.chainMulti;
    const chainDmg = Math.ceil(bt.stats.ATK * chainMulti);
    // 對其他敵方造成鏈傷
    ctx.enemies.filter(e => !e.dead && e !== ctx.target).forEach(e => {
      e.hp = Math.max(0, e.hp - chainDmg);
      e.hitFlash = 6;
    });
    if (chainDmg > 0) _log(`⚡ ${bt.m.nickname||bt.m.name} 高壓過載：鏈傷 ${chainDmg}！`, 'hit');
  },

  // 靜電：受攻擊時，20%機率使攻擊者麻痺1秒
  electric_innate_2(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.electric_innate_2;
    if (Math.random() < cfg.paralyzeChance) {
      applyStatus(ctx.attacker, 'paralyze', 1, cfg.paralyzeDuration * 60);
      _log(`⚡ ${bt.m.nickname||bt.m.name} 靜電：${ctx.attacker.m.name} 麻痺！`, 'hit');
    }
  },

  // 極速：每4次攻擊，下次攻擊獲得勇敢
  electric_innate_3(bt, ctx) {
    applyStatus(bt, 'brave');
    _log(`⚡ ${bt.m.nickname||bt.m.name} 極速：獲得勇敢！`, 'win');
  },

  // ── 地系天生 ──

  // 岩化：常駐被動，在 applyBuffStats 中處理
  earth_innate_1(bt, ctx) { /* handled in applyBuffStats */ },

  // 大地回響：受攻擊時，20%機率無視冷卻立即普攻一次
  earth_innate_2(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.earth_innate_2;
    if (Math.random() < cfg.counterChance && ctx.attacker && !ctx.attacker.dead) {
      bt.passiveFlags.instantAttackTarget = ctx.attacker;
    }
  },

  // ── 光系天生 ──

  // 聖光降臨：進入戰場時賦予全體隊友勇敢5秒
  light_innate_1(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.light_innate_1;
    ctx.allies.forEach(a => {
      if (!a.dead) applyStatus(a, 'brave', 1, cfg.duration * 60);
    });
    _log(`✨ ${bt.m.nickname||bt.m.name} 聖光降臨：隊友全體獲得勇敢！`, 'win');
  },

  // 淨化之光：在 _postPassiveTrigger 中處理
  light_innate_2(bt, ctx) { /* handled in _postPassiveTrigger */ },

  // ── 暗系天生 ──

  // 虛空凝視：攻擊時10%機率使目標恐懼2秒
  dark_innate_1(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.dark_innate_1;
    if (Math.random() < cfg.fearChance) {
      applyStatus(ctx.target, 'fear', 1, cfg.fearDuration * 60);
      _log(`👁️ ${bt.m.nickname||bt.m.name} 虛空凝視：${ctx.target.m.name} 陷入恐懼！`, 'hit');
    }
  },

  // 靈魂抽取：擊殺後回復自身MaxHP×20%血量
  dark_innate_2(bt, ctx) {
    const cfg = SKILL_CONFIG.innate.dark_innate_2;
    const heal = Math.ceil(bt.maxHP * cfg.healPercent);
    bt.hp = Math.min(bt.maxHP, bt.hp + heal);
    _log(`🌑 ${bt.m.nickname||bt.m.name} 靈魂抽取：回復 ${heal} HP！`, 'win');
  },

  // ═══ 火系自由技能 ═══

  // 熾熱連擊：每3次攻擊，下次攻擊獲得狂暴
  fire_free_1(bt, ctx) {
    applyStatus(bt, 'frenzy');
    _log(`🔥 ${bt.m.nickname||bt.m.name} 熾熱連擊：下次攻擊狂暴！`, 'crit');
  },

  // 烈焰反撲：每受擊4次，對全體敵方造成ATK×0.5並+1層燃燒
  fire_free_2(bt, ctx) {
    const cfg = SKILL_CONFIG.free.fire_free_2;
    const dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti);
    ctx.enemies.forEach(e => {
      if (e.dead) return;
      e.hp = Math.max(0, e.hp - dmg);
      e.hitFlash = 6;
      applyStatus(e, 'burn', cfg.burnStacks);
    });
    _log(`🔥 ${bt.m.nickname||bt.m.name} 烈焰反撲：全敵 ${dmg}傷害+燃燒！`, 'hit');
  },

  // 焦土審判：每3秒對燃燒中的敵人造成爆發傷害
  fire_free_3(bt, ctx) {
    const cfg = SKILL_CONFIG.free.fire_free_3;
    ctx.enemies.forEach(e => {
      if (e.dead || !hasStatus(e, 'burn')) return;
      const stk = getStatusStacks(e, 'burn');
      const dmg = Math.ceil(Math.max(e.maxHP * cfg.maxHpPercent * stk, cfg.levelFloor * bt.m.level));
      e.hp = Math.max(0, e.hp - dmg);
      e.hitFlash = 8;
      _log(`🔥 ${bt.m.nickname||bt.m.name} 焦土審判：${e.m.name} ${dmg}傷害！`, 'crit');
    });
  },

  // 餘燼賦能：在 applyBuffStats 中處理
  fire_free_4(bt, ctx) { /* handled in applyBuffStats */ },

  // 焚身：HP<20%時攻擊冷卻縮短50%（一次性）
  fire_free_5(bt, ctx) {
    if (bt.passiveFlags.fire_free_5_triggered) return;
    bt.passiveFlags.fire_free_5_triggered = true;
    // 直接縮短攻擊計時器
    bt.atkTimer = Math.floor(bt.atkTimer * SKILL_CONFIG.free.fire_free_5.intervalMulti);
    _log(`🔥 ${bt.m.nickname||bt.m.name} 焚身：攻擊速度暴增！`, 'crit');
  },

  // ═══ 水系自由技能 ═══

  // 潮汐積累：每4次攻擊，造成ATK×0.8額外水傷並冰凍
  water_free_1(bt, ctx) {
    const cfg = SKILL_CONFIG.free.water_free_1;
    const dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti);
    if (ctx.target && !ctx.target.dead) {
      ctx.target.hp = Math.max(0, ctx.target.hp - dmg);
      ctx.target.hitFlash = 8;
      applyStatus(ctx.target, 'freeze', 1, cfg.freezeDuration * 60);
      _log(`💧 ${bt.m.nickname||bt.m.name} 潮汐積累：額外 ${dmg}傷害+冰凍！`, 'hit');
    }
  },

  // 水幕化勁：每受擊3次，獲得堅忍2秒
  water_free_2(bt, ctx) {
    const cfg = SKILL_CONFIG.free.water_free_2;
    applyStatus(bt, 'endure', 1, cfg.duration * 60);
    _log(`🛡️ ${bt.m.nickname||bt.m.name} 水幕化勁：獲得堅忍${cfg.duration}秒！`, 'win');
  },

  // 寒霜入骨：每4秒對潮濕目標造成額外傷害+冰凍
  water_free_3(bt, ctx) {
    const cfg = SKILL_CONFIG.free.water_free_3;
    ctx.enemies.forEach(e => {
      if (e.dead || !hasStatus(e, 'wet')) return;
      const freezeStacks = getStatusStacks(e, 'freeze');
      const dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti + freezeStacks * cfg.freezeStackMulti);
      e.hp = Math.max(0, e.hp - dmg);
      e.hitFlash = 6;
      applyStatus(e, 'freeze', 1);
      _log(`❄️ ${bt.m.nickname||bt.m.name} 寒霜入骨：${e.m.name} ${dmg}傷害+1層冰凍！`, 'hit');
    });
  },

  // 潤物無聲：攻擊潮濕目標時20%機率獲得再生
  water_free_4(bt, ctx) {
    const cfg = SKILL_CONFIG.free.water_free_4;
    if (!ctx.target || !hasStatus(ctx.target, 'wet')) return;
    if (Math.random() < cfg.wetTriggerChance) {
      applyStatus(bt, 'regen');
      _log(`💚 ${bt.m.nickname||bt.m.name} 潤物無聲：獲得再生！`, 'win');
    }
  },

  // 波紋擴散：自身獲得BUFF時，30%機率同步給隨機隊友
  water_free_5(bt, ctx) {
    // 由 applyStatus 外部呼叫時觸發，ctx.buffKey 為 BUFF 名稱
    const cfg = SKILL_CONFIG.free.water_free_5;
    if (!ctx.buffKey || !ctx.allies || !ctx.allies.length) return;
    if (Math.random() < cfg.spreadChance) {
      const alive = ctx.allies.filter(a => !a.dead);
      if (!alive.length) return;
      const target = alive[Math.floor(Math.random() * alive.length)];
      applyStatus(target, ctx.buffKey);
      _log(`💧 ${bt.m.nickname||bt.m.name} 波紋擴散：${ctx.buffKey}同步給 ${target.m.name}！`, 'win');
    }
  },

  // ═══ 草系自由技能 ═══

  // 蔓延打擊：每3次攻擊，造成ATK×0.3並+2層中毒
  grass_free_1(bt, ctx) {
    const cfg = SKILL_CONFIG.free.grass_free_1;
    const dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti);
    if (ctx.target && !ctx.target.dead) {
      ctx.target.hp = Math.max(0, ctx.target.hp - dmg);
      ctx.target.hitFlash = 6;
      applyStatus(ctx.target, 'poison', cfg.poisonStacks);
      _log(`🌿 ${bt.m.nickname||bt.m.name} 蔓延打擊：${ctx.target.m.name} ${dmg}傷害+${cfg.poisonStacks}層中毒！`, 'hit');
    }
  },

  // 荊棘甲片：每受擊2次，自身+5層荊棘
  grass_free_2(bt, ctx) {
    const cfg = SKILL_CONFIG.free.grass_free_2;
    applyStatus(bt, 'thorns', cfg.thornsGain);
    _log(`🌵 ${bt.m.nickname||bt.m.name} 荊棘甲片：+${cfg.thornsGain}層荊棘！`, 'win');
  },

  // 毒素引爆：每5秒對中毒目標造成爆發傷害
  grass_free_3(bt, ctx) {
    const cfg = SKILL_CONFIG.free.grass_free_3;
    ctx.enemies.forEach(e => {
      if (e.dead || !hasStatus(e, 'poison')) return;
      const stk = getStatusStacks(e, 'poison');
      const dmg = Math.ceil(Math.max(e.maxHP * cfg.maxHpPercent + stk * cfg.poisonStackMulti, cfg.levelFloor * bt.m.level));
      e.hp = Math.max(0, e.hp - dmg);
      e.hitFlash = 8;
      _log(`☠️ ${bt.m.nickname||bt.m.name} 毒素引爆：${e.m.name} ${dmg}爆發傷害！`, 'crit');
    });
  },

  // 根鬚纏繞：在 battleLoop status_check 區塊處理（修改 dmgRef）
  grass_free_4(bt, ctx) {
    if (!ctx.target || !ctx.dmgRef) return;
    if (!hasStatus(ctx.target, 'paralyze')) return;
    const cfg = SKILL_CONFIG.free.grass_free_4;
    const bonus = Math.max(cfg.minBonus, Math.ceil(ctx.dmgRef.val * cfg.dmgBonus));
    ctx.dmgRef.val += bonus;
  },

  // 生命共感：在 applyLifeSharedDebuff 中處理
  grass_free_5(bt, ctx) { /* handled in applyLifeSharedDebuff */ },

  // ═══ 電系自由技能 ═══

  // 高壓蓄能：每2次攻擊，觸發導電鏈傷
  electric_free_1(bt, ctx) {
    const cfg = SKILL_CONFIG.free.electric_free_1;
    const dmg = Math.ceil(bt.stats.ATK * cfg.chainMulti);
    if (ctx.enemies) {
      ctx.enemies.filter(e => !e.dead).forEach(e => {
        e.hp = Math.max(0, e.hp - dmg);
        e.hitFlash = 6;
      });
      _log(`⚡ ${bt.m.nickname||bt.m.name} 高壓蓄能：鏈傷 ${dmg}！`, 'hit');
    }
  },

  // 放電迴路：每受擊4次，對周圍敵人造成傷害並麻痺2秒
  electric_free_2(bt, ctx) {
    const cfg = SKILL_CONFIG.free.electric_free_2;
    const dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti);
    ctx.enemies.forEach(e => {
      if (e.dead) return;
      e.hp = Math.max(0, e.hp - dmg);
      e.hitFlash = 6;
      applyStatus(e, 'paralyze', 1, cfg.paralyzeDuration * 60);
    });
    _log(`⚡ ${bt.m.nickname||bt.m.name} 放電迴路：${dmg}傷害+麻痺！`, 'hit');
  },

  // 電磁共振：每3秒對觸電目標造成層數×15電傷，彈射至附近2敵
  electric_free_3(bt, ctx) {
    const cfg = SKILL_CONFIG.free.electric_free_3;
    const targets = ctx.enemies.filter(e => !e.dead && hasStatus(e, 'shock'));
    targets.forEach(e => {
      const stk = getStatusStacks(e, 'shock');
      const dmg = stk * cfg.stackMulti;
      if (dmg <= 0) return;
      e.hp = Math.max(0, e.hp - dmg);
      e.hitFlash = 6;
      // 彈射至附近 chainCount 個其他敵方
      const others = ctx.enemies.filter(o => !o.dead && o !== e).slice(0, cfg.chainCount);
      others.forEach(o => {
        o.hp = Math.max(0, o.hp - Math.ceil(dmg * 0.5));
        o.hitFlash = 4;
      });
      _log(`⚡ ${bt.m.nickname||bt.m.name} 電磁共振：${e.m.name} ${dmg}電傷！`, 'hit');
    });
  },

  // 超載意志：擁有勇敢時，攻擊有15%機率立即重置攻擊冷卻
  electric_free_4(bt, ctx) {
    if (!hasStatus(bt, 'brave')) return;
    const cfg = SKILL_CONFIG.free.electric_free_4;
    if (Math.random() < cfg.resetChance) {
      bt.atkTimer = 0;
      _log(`⚡ ${bt.m.nickname||bt.m.name} 超載意志：攻擊冷卻重置！`, 'crit');
    }
  },

  // 靜電屏障：受遠程攻擊時25%機率免疫並使攻擊者觸電
  electric_free_5(bt, ctx) {
    const cfg = SKILL_CONFIG.free.electric_free_5;
    if (ctx.attackType !== 'ranged') return;
    if (Math.random() < cfg.immuneChance) {
      // 免疫傷害：重置 dmgRef
      if (ctx.dmgRef) ctx.dmgRef.val = 0;
      if (ctx.attacker) applyStatus(ctx.attacker, 'shock', 1);
      _log(`🛡️ ${bt.m.nickname||bt.m.name} 靜電屏障：免疫並觸電攻擊者！`, 'win');
    }
  },

  // ═══ 暗系自由技能 ═══

  // 暗影連刺：每3次攻擊，造成ATK×1.2並附帶恐懼1秒
  dark_free_1(bt, ctx) {
    const cfg = SKILL_CONFIG.free.dark_free_1;
    const dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti);
    if (ctx.target && !ctx.target.dead) {
      ctx.target.hp = Math.max(0, ctx.target.hp - dmg);
      ctx.target.hitFlash = 8;
      applyStatus(ctx.target, 'fear', 1, cfg.fearDuration * 60);
      _log(`🌑 ${bt.m.nickname||bt.m.name} 暗影連刺：${ctx.target.m.name} ${dmg}傷害+恐懼！`, 'crit');
    }
  },

  // 噩夢反噬：每受擊3次，對攻擊者造成傷害並使全敵+1層中毒
  dark_free_2(bt, ctx) {
    const cfg = SKILL_CONFIG.free.dark_free_2;
    if (ctx.attacker && !ctx.attacker.dead) {
      const dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti);
      ctx.attacker.hp = Math.max(0, ctx.attacker.hp - dmg);
      ctx.attacker.hitFlash = 6;
    }
    ctx.enemies.forEach(e => {
      if (!e.dead) applyStatus(e, 'poison', cfg.poisonStacks);
    });
    _log(`🌑 ${bt.m.nickname||bt.m.name} 噩夢反噬：全敵+${cfg.poisonStacks}層中毒！`, 'hit');
  },

  // 心靈崩潰：每4秒對恐懼中的敵人造成損失血量×15%傷害
  dark_free_3(bt, ctx) {
    const cfg = SKILL_CONFIG.free.dark_free_3;
    ctx.enemies.forEach(e => {
      if (e.dead || !hasStatus(e, 'fear')) return;
      const lostHP = e.maxHP - e.hp;
      const dmg = Math.ceil(Math.max(lostHP * cfg.lostHpPercent, cfg.levelFloor * bt.m.level));
      e.hp = Math.max(0, e.hp - dmg);
      e.hitFlash = 8;
      _log(`🌑 ${bt.m.nickname||bt.m.name} 心靈崩潰：${e.m.name} ${dmg}傷害！`, 'crit');
    });
  },

  // 夜幕收割：擊殺帶負面狀態的敵人，全隊獲得勇敢
  dark_free_4(bt, ctx) {
    if (!ctx.target) return;
    if (!hasAnyNegativeStatus(ctx.target)) return;
    ctx.allies.filter(a => !a.dead).forEach(a => applyStatus(a, 'brave'));
    applyStatus(bt, 'brave');
    _log(`🌑 ${bt.m.nickname||bt.m.name} 夜幕收割：全隊獲得勇敢！`, 'win');
  },

  // 虛無身法：閃避後自身獲得再生（1秒回10%HP）
  dark_free_5(bt, ctx) {
    const cfg = SKILL_CONFIG.free.dark_free_5;
    const regenHeal = Math.ceil(bt.maxHP * cfg.regenPercent);
    // 立即治療（1秒短效再生）
    bt.hp = Math.min(bt.maxHP, bt.hp + regenHeal);
    _log(`👻 ${bt.m.nickname||bt.m.name} 虛無身法：閃避後回復 ${regenHeal} HP！`, 'win');
  },

  // ═══ 光系自由技能 ═══

  // 聖光洗禮：每4次攻擊，造成ATK×0.5並為最虛弱隊友施加再生
  light_free_1(bt, ctx) {
    const cfg = SKILL_CONFIG.free.light_free_1;
    if (ctx.target && !ctx.target.dead) {
      const dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti);
      ctx.target.hp = Math.max(0, ctx.target.hp - dmg);
      ctx.target.hitFlash = 6;
    }
    // 為最虛弱隊友施加再生
    const allAllies = [bt, ...ctx.allies].filter(a => !a.dead);
    if (allAllies.length) {
      const weakest = allAllies.reduce((a, b) => (a.hp / a.maxHP) < (b.hp / b.maxHP) ? a : b);
      applyStatus(weakest, 'regen');
      _log(`✨ ${bt.m.nickname||bt.m.name} 聖光洗禮：${weakest.m.name} 獲得再生！`, 'win');
    }
  },

  // 神聖領域：每受擊5次，全體隊友獲得堅忍3秒
  light_free_2(bt, ctx) {
    const cfg = SKILL_CONFIG.free.light_free_2;
    const dur = cfg.duration * 60;
    const allAllies = [bt, ...ctx.allies].filter(a => !a.dead);
    allAllies.forEach(a => applyStatus(a, 'endure', 1, dur));
    _log(`✨ ${bt.m.nickname||bt.m.name} 神聖領域：全隊獲得堅忍${cfg.duration}秒！`, 'win');
  },

  // 天罰：每6秒對隨機敵人造成ATK×2.0傷害，有負面狀態×1.5
  light_free_3(bt, ctx) {
    const cfg = SKILL_CONFIG.free.light_free_3;
    const alive = ctx.enemies.filter(e => !e.dead);
    if (!alive.length) return;
    const target = alive[Math.floor(Math.random() * alive.length)];
    let dmg = Math.ceil(bt.stats.ATK * cfg.atkMulti);
    if (hasAnyNegativeStatus(target)) dmg = Math.ceil(dmg * cfg.debuffMulti);
    target.hp = Math.max(0, target.hp - dmg);
    target.hitFlash = 10;
    _log(`✨ ${bt.m.nickname||bt.m.name} 天罰：${target.m.name} ${dmg}神聖傷害！`, 'crit');
  },

  // 破曉：在 battleLoop status_check 區塊處理（修改 dmgRef）
  light_free_4(bt, ctx) {
    if (!hasStatus(bt, 'brave')) return;
    if (!ctx.target || !ctx.dmgRef) return;
    const cfg = SKILL_CONFIG.free.light_free_4;
    const defBonus = Math.ceil(ctx.target.stats.DEF * cfg.defIgnorePercent);
    ctx.dmgRef.val += defBonus;
  },

  // 守護之光：死亡時全隊清除負面狀態並獲得護盾（以 HP 模擬）
  light_free_5(bt, ctx) {
    const cfg = SKILL_CONFIG.free.light_free_5;
    const shieldHP = Math.ceil(bt.maxHP * cfg.shieldPercent);
    ctx.allies.filter(a => !a.dead).forEach(a => {
      // 清除所有負面狀態
      ['burn', 'shock', 'freeze', 'paralyze', 'wet', 'fear', 'poison'].forEach(k => clearStatus(a, k));
      // 回復HP（模擬護盾）
      a.hp = Math.min(a.maxHP, a.hp + shieldHP);
    });
    _log(`✨ ${bt.m.nickname||bt.m.name} 守護之光：隊友清除負評並回復 ${shieldHP} HP！`, 'win');
  },
};

// ── 日誌輔助（避免在 skills.js 中直接呼叫 addBattleLog 前未定義）──
function _log(msg, type) {
  if (typeof addBattleLog === 'function') addBattleLog(msg, type);
}
