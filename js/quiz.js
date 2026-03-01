// =============================================
//  RIKA LAB — Quiz Engine
// =============================================

let quizSession = null;

function startQuiz(unitId, level, isRandom) {
  // Build question pool
  let pool;
  const KEYS = ['A', 'B', 'C', 'D'];
  
  if (isRandom) {
    const easy   = QUESTIONS.filter(q => q.level === 'easy');
    const normal = QUESTIONS.filter(q => q.level === 'normal');
    const hard   = QUESTIONS.filter(q => q.level === 'hard');
    pool = [
      ...shuffle(easy).slice(0, 4),
      ...shuffle(normal).slice(0, 4),
      ...shuffle(hard).slice(0, 2),
    ];
    pool = shuffle(pool).slice(0, 10);
  } else {
    pool = shuffle(QUESTIONS.filter(q => q.unit === unitId && q.level === level)).slice(0, 5);
    if (pool.length === 0) {
      // Fall back to any level if not enough
      pool = shuffle(QUESTIONS.filter(q => q.unit === unitId)).slice(0, 5);
    }
  }
  
  quizSession = {
    questions: pool,
    current: 0,
    score: 0,
    unitId,
    level,
    isRandom,
    startTime: Date.now(),
    questionStartTime: Date.now(),
    times: [],
    answered: false,
  };
  
  showScreen('screen-quiz');
  document.getElementById('bottom-nav').style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  const s = quizSession;
  const q = s.questions[s.current];
  const total = s.questions.length;
  const el = document.getElementById('screen-quiz');
  const unit = UNITS.find(u => u.id === (q.unit || s.unitId));
  const levelLabel = s.isRandom ? 'RANDOM MIX' : s.level.toUpperCase();
  const levelChip = s.isRandom ? 'chip-mix' : `chip-${s.level}`;
  
  el.innerHTML = `
    <div class="quiz-topbar">
      <button class="back-btn" id="quiz-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="quiz-meta">
        <div class="quiz-unit-name">${unit ? unit.name : '全単元'}</div>
        <span class="quiz-level-chip ${levelChip}">${levelLabel}</span>
      </div>
      <div class="quiz-counter"><span>${s.current + 1}</span> / ${total}</div>
    </div>
    <div class="progress-wrap">
      <div class="progress-fill" id="progress-fill" style="width:${(s.current / total) * 100}%"></div>
    </div>
    <div class="question-wrap">
      <div class="question-card">
        <div class="q-num">Q ${String(s.current + 1).padStart(2, '0')}</div>
        <div class="q-text">${q.q}</div>
      </div>
      <div class="choices" id="choices"></div>
    </div>
  `;
  
  // Animate progress
  requestAnimationFrame(() => {
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = `${((s.current + 1) / total) * 100}%`;
  });
  
  const choicesEl = el.querySelector('#choices');
  const KEYS = ['A', 'B', 'C', 'D'];
  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerHTML = `<div class="choice-key">${KEYS[i]}</div>${choice}`;
    btn.addEventListener('click', () => handleAnswer(i, btn));
    // Stagger animation
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(10px)';
    btn.style.transition = `opacity 0.25s ${i * 0.06}s ease, transform 0.25s ${i * 0.06}s ease, background 0.18s, border-color 0.18s, color 0.18s, box-shadow 0.18s`;
    choicesEl.appendChild(btn);
    requestAnimationFrame(() => {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    });
  });
  
  el.querySelector('#quiz-back').addEventListener('click', exitQuiz);
  
  quizSession.answered = false;
  quizSession.questionStartTime = Date.now();
}

function handleAnswer(index, btnEl) {
  if (quizSession.answered) return;
  quizSession.answered = true;
  
  const elapsed = (Date.now() - quizSession.questionStartTime) / 1000;
  quizSession.times.push(elapsed);
  
  const q = quizSession.questions[quizSession.current];
  const correct = index === q.answer;
  
  if (correct) quizSession.score++;
  
  // Disable all choices and mark
  const el = document.getElementById('screen-quiz');
  el.querySelectorAll('.choice').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) {
      btn.classList.add('correct');
      const shimmer = document.createElement('div');
      shimmer.className = 'choice-shimmer';
      btn.appendChild(shimmer);
    } else if (i === index && !correct) {
      btn.classList.add('wrong');
    }
  });
  
  // Show explanation
  const wrap = el.querySelector('.question-wrap');
  const expCard = document.createElement('div');
  expCard.className = 'explanation-card';
  expCard.innerHTML = `
    <div class="explanation-icon">${correct ? '✅' : '💡'}</div>
    <div class="explanation-text">${q.exp}</div>
  `;
  wrap.appendChild(expCard);
  
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'next-btn';
  const isLast = quizSession.current === quizSession.questions.length - 1;
  nextBtn.innerHTML = isLast
    ? '結果を見る <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
    : '次の問題へ <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  nextBtn.addEventListener('click', () => {
    if (isLast) {
      showResult();
    } else {
      quizSession.current++;
      renderQuestion();
    }
  });
  wrap.appendChild(nextBtn);
  
  // Scroll to show explanation
  setTimeout(() => {
    expCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 150);
}

function showResult() {
  const s = quizSession;
  const total = s.questions.length;
  const score = s.score;
  const pct = score / total;
  const avgTime = s.times.reduce((a, b) => a + b, 0) / s.times.length;
  const hour = new Date().getHours();
  
  // Mark progress
  if (!s.isRandom && s.unitId) {
    markUnitCleared(s.unitId, s.level);
  }
  
  // Check badges
  const context = {
    score, total,
    unitId: s.unitId,
    level: s.level,
    isRandom: s.isRandom,
    timePerQuestion: avgTime,
    hour,
  };
  const earnedIds = checkAndUnlockBadges(context);
  
  // Message
  const messages = pct === 1
    ? ['完璧！！天才かも✨', 'パーフェクト！最高すぎる🌟', '全問正解！すごすぎ💫']
    : pct >= 0.8
    ? ['いい感じ！もう少しだ🌿', 'ほぼ完璧！あともう少し⭐', 'すごく上手くなってる！🎯']
    : pct >= 0.6
    ? ['なかなかよかったよ！📚', 'もう一回やったらもっとできる！🔄', 'いい調子！続けよう🌱']
    : ['むずかしかったね💪', 'POINTまとめを確認してみよう！📖', 'ドンマイ！次はきっとできる🌈'];
  
  const msg = messages[Math.floor(Math.random() * messages.length)];
  const stars = pct === 1 ? '⭐⭐⭐' : pct >= 0.8 ? '⭐⭐' : pct >= 0.6 ? '⭐' : '';
  
  // Circumference of ring: 2 * PI * r = 2 * 3.14159 * 54 = ~339.3
  const CIRC = 339.3;
  const dashOffset = CIRC - (CIRC * pct);
  
  const earnedBadges = BADGES.filter(b => earnedIds.includes(b.id));
  
  const el = document.getElementById('screen-result');
  el.innerHTML = `
    <div class="result-screen">
      ${stars ? `<div class="result-stars">${stars}</div>` : '<div style="height:16px"></div>'}
      
      <div class="result-score-ring">
        <svg viewBox="0 0 120 120">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6ee7b7"/>
              <stop offset="100%" style="stop-color:#7dd3fc"/>
            </linearGradient>
          </defs>
          <circle class="ring-bg" cx="60" cy="60" r="54"/>
          <circle class="ring-fill" cx="60" cy="60" r="54" id="ring-fill"/>
        </svg>
        <div class="result-score-label">
          <div class="result-score-num">${score}</div>
          <div class="result-score-total">/ ${total}問</div>
        </div>
      </div>
      
      <div class="result-message">${msg}</div>
      <div class="result-sub">正解率 ${Math.round(pct * 100)}% ・ 平均${avgTime.toFixed(1)}秒/問</div>
      
      ${earnedBadges.length > 0 ? `
        <div class="earned-badges">
          <div class="earned-badges-title">✦ NEW BADGES EARNED ✦</div>
          <div class="earned-badges-list">
            ${earnedBadges.map((b, i) => `
              <div class="earned-badge-item" style="animation-delay:${i * 0.15}s">
                <div class="earned-badge-emoji">${b.emoji}</div>
                <div class="earned-badge-name">${b.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="result-btns">
        <button class="btn-primary" id="retry-btn">もう一度チャレンジ ↺</button>
        <button class="btn-secondary" id="home-btn">ホームに戻る</button>
      </div>
    </div>
  `;
  
  showScreen('screen-result');
  
  // Animate ring after render
  setTimeout(() => {
    const ringFill = document.getElementById('ring-fill');
    if (ringFill) ringFill.style.strokeDashoffset = dashOffset;
  }, 100);
  
  // Show badge unlock popups sequentially
  if (earnedIds.length > 0) {
    setTimeout(() => {
      showBadgeUnlock(earnedIds[0]);
    }, 800);
  }
  
  el.querySelector('#retry-btn').addEventListener('click', () => {
    startQuiz(s.unitId, s.level, s.isRandom);
  });
  el.querySelector('#home-btn').addEventListener('click', () => {
    exitQuiz();
  });
}

function exitQuiz() {
  quizSession = null;
  document.getElementById('bottom-nav').style.display = 'flex';
  switchTab('home');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
