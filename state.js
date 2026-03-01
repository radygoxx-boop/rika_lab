// =============================================
//  RIKA LAB — State Management
// =============================================

const STATE_KEY = 'rikalab_state_v1';

const defaultState = () => ({
  streakDays: 0,
  lastPlayDate: null,
  totalCorrect: 0,
  totalAnswered: 0,
  unlockedBadges: [],
  newBadges: [],
  unitProgress: {},  // { unitId: { easy: cleared, normal: cleared, hard: cleared } }
  pointsViewed: [],
  installPrompted: false,
});

let _state = defaultState();

function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      _state = { ...defaultState(), ...JSON.parse(saved) };
    }
  } catch (e) {
    _state = defaultState();
  }
  // Update streak
  const today = new Date().toDateString();
  if (_state.lastPlayDate) {
    const last = new Date(_state.lastPlayDate);
    const now = new Date();
    const diffDays = Math.floor((now - last) / 86400000);
    if (diffDays === 1) {
      _state.streakDays++;
    } else if (diffDays > 1) {
      _state.streakDays = 1;
    }
  } else {
    _state.streakDays = 1;
  }
  _state.lastPlayDate = today;
  saveState();
}

function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(_state));
  } catch (e) {}
}

function getState() { return _state; }

function markUnitCleared(unitId, level) {
  if (!_state.unitProgress[unitId]) _state.unitProgress[unitId] = {};
  _state.unitProgress[unitId][level] = true;
  saveState();
}

function unlockBadge(badgeId) {
  if (_state.unlockedBadges.includes(badgeId)) return false;
  _state.unlockedBadges.push(badgeId);
  _state.newBadges.push(badgeId);
  saveState();
  return true;
}

function clearNewBadge(badgeId) {
  _state.newBadges = _state.newBadges.filter(b => b !== badgeId);
  saveState();
}

function checkAndUnlockBadges(context) {
  const earned = [];
  const { score, total, unitId, level, isRandom, timePerQuestion, hour } = context;
  
  // first clear
  if (!_state.unlockedBadges.includes('first_clear')) {
    if (unlockBadge('first_clear')) earned.push('first_clear');
  }
  // perfect
  if (score === total && unlockBadge('perfect')) earned.push('perfect');
  // streak
  if (_state.streakDays >= 3 && unlockBadge('streak3')) earned.push('streak3');
  if (_state.streakDays >= 7 && unlockBadge('streak7')) earned.push('streak7');
  // time-based
  if (hour !== undefined) {
    if (hour < 6 && unlockBadge('early_bird')) earned.push('early_bird');
    if (hour >= 22 && unlockBadge('night_owl')) earned.push('night_owl');
  }
  // speed
  if (timePerQuestion && timePerQuestion < 10 && score === total && unlockBadge('speed_star')) {
    earned.push('speed_star');
  }
  // hard
  if (level === 'hard' && score === total && unlockBadge('hard_first')) earned.push('hard_first');
  // random master
  if (isRandom && score === total && unlockBadge('random_master')) earned.push('random_master');
  // collector - check all units cleared
  const allCleared = UNITS.every(u => {
    const p = _state.unitProgress[u.id];
    return p && (p.easy || p.normal || p.hard);
  });
  if (allCleared && unlockBadge('collector')) earned.push('collector');
  // hidden: stars perfect
  if (unitId === 'stars' && score === total && unlockBadge('hidden3')) earned.push('hidden3');
  
  return earned;
}
