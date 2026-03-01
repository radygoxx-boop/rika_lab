// =============================================
//  RIKA LAB — UI Renderers
// =============================================

function renderHome() {
  const state = getState();
  const el = document.getElementById('screen-home');
  
  // Calculate badge count
  const unlockedCount = state.unlockedBadges.length;
  
  el.innerHTML = `
    <div class="top-bar">
      <div class="logo">Rika Lab <sup>✦</sup></div>
      <div class="streak-pill">
        <span>🔥</span>
        <span>${state.streakDays}日連続</span>
      </div>
    </div>

    <div class="hero">
      <div class="hero-sub">SCIENCE QUIZ</div>
      <div class="hero-heading">
        今日も<span class="accent">理科</span>、<br>やってみよ？
      </div>
    </div>

    <div class="section-label" style="margin-bottom:10px;">RANDOM MIX</div>
    <div class="random-banner" id="random-banner">
      <div class="random-icon-wrap">🎲</div>
      <div class="random-info">
        <div class="random-title">ランダムミックス</div>
        <div class="random-desc">全単元・全レベルから10問出題<br>EASY40% + NORMAL40% + HARD20%</div>
      </div>
      <div class="random-badge">10問</div>
    </div>

    <div class="section-label">単元を選ぶ</div>
    <div class="unit-grid" id="unit-grid"></div>
  `;

  // Render unit cards
  const grid = el.querySelector('#unit-grid');
  UNITS.forEach(unit => {
    const progress = state.unitProgress[unit.id] || {};
    const cleared = [progress.easy, progress.normal, progress.hard].filter(Boolean).length;
    const pct = (cleared / 3) * 100;
    
    const card = document.createElement('div');
    card.className = 'unit-card';
    card.innerHTML = `
      <div class="unit-card-glow" style="background:${unit.color}"></div>
      <span class="unit-emoji">${unit.emoji}</span>
      <div class="unit-name">${unit.name}</div>
      <div class="unit-progress"><div class="unit-progress-fill" style="width:${pct}%"></div></div>
      <div class="unit-levels">
        <button class="lvl-btn lvl-easy" data-unit="${unit.id}" data-level="easy">EASY</button>
        <button class="lvl-btn lvl-normal" data-unit="${unit.id}" data-level="normal">NRM</button>
        <button class="lvl-btn lvl-hard" data-unit="${unit.id}" data-level="hard">HARD</button>
      </div>
      <button class="unit-point-btn" data-unit="${unit.id}" data-action="point">
        ✦ POINT まとめ
      </button>
    `;
    grid.appendChild(card);
  });

  // Events
  el.querySelector('#random-banner').addEventListener('click', () => startQuiz(null, null, true));
  
  el.querySelectorAll('.lvl-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const uid = btn.dataset.unit;
      const lvl = btn.dataset.level;
      startQuiz(uid, lvl, false);
    });
  });
  
  el.querySelectorAll('.unit-point-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const uid = btn.dataset.unit;
      showPointOverlay(uid);
    });
  });
}

function renderBadges() {
  const state = getState();
  const el = document.getElementById('screen-badges');
  const unlockedCount = state.unlockedBadges.length;
  const total = BADGES.length;
  
  el.innerHTML = `
    <div class="badges-screen">
      <div class="top-bar" style="padding-top:52px;padding-bottom:0;">
        <div class="logo">コレクション</div>
      </div>
      <div class="badges-header" style="padding:12px 0 0;">
        <div class="hero-sub" style="font-family:'Syne',sans-serif;font-size:10px;letter-spacing:3px;color:var(--c-muted);">BADGES</div>
        <div class="badges-count"><span>${unlockedCount}</span> / ${total} 獲得済み</div>
      </div>
      <div class="badge-grid" id="badge-grid"></div>
    </div>
  `;
  
  const grid = el.querySelector('#badge-grid');
  BADGES.forEach(badge => {
    const unlocked = state.unlockedBadges.includes(badge.id);
    const isNew = state.newBadges.includes(badge.id);
    const item = document.createElement('div');
    item.className = `badge-item ${unlocked ? 'unlocked' : 'locked'} ${badge.rare ? 'rare' : ''}`;
    item.innerHTML = `
      ${isNew ? '<div class="badge-new-dot"></div>' : ''}
      <div class="badge-emoji-wrap">
        ${badge.rare && unlocked ? '<div class="rare-glow"></div>' : ''}
        ${unlocked ? badge.emoji : (badge.hidden ? '🔒' : badge.emoji)}
      </div>
      <div class="badge-name">${unlocked ? badge.name : (badge.hidden ? '？？？' : badge.name)}</div>
    `;
    if (unlocked && isNew) {
      item.addEventListener('click', () => {
        clearNewBadge(badge.id);
        item.querySelector('.badge-new-dot')?.remove();
      });
    }
    grid.appendChild(item);
  });
}

function showPointOverlay(unitId) {
  const unit = UNITS.find(u => u.id === unitId);
  if (!unit) return;
  
  const sheet = document.getElementById('point-sheet');
  sheet.innerHTML = `
    <div class="overlay-handle"></div>
    <div class="point-unit-header">
      <div class="point-unit-emoji">${unit.emoji}</div>
      <div>
        <div class="point-unit-title">POINT SUMMARY</div>
        <div class="point-unit-name">${unit.name}</div>
      </div>
    </div>
    <div class="point-label">これさえ押さえればOK！</div>
    <div class="point-list">
      ${unit.point.items.map(item => `
        <div class="point-item">
          <div class="point-item-icon">${item.icon}</div>
          <div class="point-item-text">${item.text}</div>
        </div>
      `).join('')}
    </div>
  `;
  
  const overlay = document.getElementById('point-overlay');
  overlay.classList.remove('hidden');
  
  // Track viewed
  const state = getState();
  if (!state.pointsViewed.includes(unitId)) {
    state.pointsViewed.push(unitId);
    saveState();
    // Check hidden badge
    if (state.pointsViewed.length >= UNITS.length) {
      const earned = unlockBadge('hidden2');
      if (earned) showBadgeUnlock('hidden2');
    }
  }
}

function hidePointOverlay() {
  document.getElementById('point-overlay').classList.add('hidden');
}

function showBadgeUnlock(badgeId) {
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return;
  
  const popup = document.getElementById('badge-unlock-popup');
  popup.innerHTML = `
    <div class="badge-unlock-glow"></div>
    <div class="badge-unlock-label">✦ NEW BADGE UNLOCKED ✦</div>
    <span class="badge-unlock-emoji">${badge.emoji}</span>
    <div class="badge-unlock-name">${badge.name}</div>
    <div class="badge-unlock-desc">${badge.desc}</div>
    <button class="badge-unlock-close" onclick="hideBadgeUnlock()">やったー！ ✦</button>
  `;
  
  const overlay = document.getElementById('badge-unlock-overlay');
  overlay.classList.remove('hidden');
}

function hideBadgeUnlock() {
  document.getElementById('badge-unlock-overlay').classList.add('hidden');
}

function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  
  if (tab === 'home') {
    document.querySelector('[data-tab="home"]').classList.add('active');
    document.getElementById('screen-home').classList.add('active');
    renderHome();
  } else if (tab === 'badges') {
    document.querySelector('[data-tab="badges"]').classList.add('active');
    document.getElementById('screen-badges').classList.add('active');
    renderBadges();
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}
