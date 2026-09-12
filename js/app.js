(function () {
  'use strict';

  const QUESTIONS_PER_SESSION = 10;
  const SUBJECT_ORDER = ['korean', 'math', 'integrated'];
  const app = document.getElementById('app');

  // ---------- 저장 ----------
  const store = {
    key: 'siyun-study-v1',
    load() {
      try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { return {}; }
    },
    save(data) {
      try { localStorage.setItem(this.key, JSON.stringify(data)); } catch (e) { /* ignore */ }
    },
    best(topicId) { return (this.load()[topicId] || {}).best || 0; },
    record(topicId, correct, total) {
      const data = this.load();
      const prev = data[topicId] || { best: 0, plays: 0 };
      const stars = starsFor(correct, total);
      data[topicId] = { best: Math.max(prev.best, stars), plays: prev.plays + 1, last: Date.now() };
      this.save(data);
      return stars;
    },
  };

  function starsFor(correct, total) {
    const r = correct / total;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
    return 0;
  }
  function starText(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }

  // ---------- 소리 ----------
  let audioCtx = null;
  function beep(freqs, dur) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      let t = audioCtx.currentTime;
      freqs.forEach(f => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + dur);
        t += dur * 0.8;
      });
    } catch (e) { /* ignore */ }
  }
  const sfx = {
    correct: () => beep([523, 659, 784], 0.18),
    wrong: () => beep([220, 180], 0.25),
    done: () => beep([523, 659, 784, 1047], 0.2),
  };

  // ---------- 읽어주기 ----------
  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.85;
    const ko = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('ko'));
    if (ko) u.voice = ko;
    window.speechSynthesis.speak(u);
  }
  if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

  // ---------- 유틸 ----------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) el.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      if (c === null || c === undefined) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }
  function render(...nodes) {
    app.innerHTML = '';
    nodes.flat().forEach(n => n && app.appendChild(n));
    window.scrollTo(0, 0);
  }
  function topbar(title, onBack) {
    return h('div', { class: 'topbar' },
      h('button', { class: 'back-btn', onclick: onBack, 'aria-label': '뒤로' }, '←'),
      h('h1', {}, title),
      h('div', { class: 'spacer' }));
  }

  // ---------- 화면: 홈 ----------
  function showHome() {
    const subjects = SUBJECT_ORDER.map(id => window.STUDY_DATA[id]).filter(Boolean);
    let total = 0;
    subjects.forEach(s => s.units.forEach(u => u.topics.forEach(t => { total += store.best(t.id); })));

    render(
      h('div', { class: 'home-hero' },
        h('div', { class: 'mascot' }, '🦁'),
        h('h1', {}, '시윤이의 공부방'),
        h('p', {}, '1학년 2학기')),
      h('div', { class: 'card-list' },
        subjects.map(s => {
          const count = s.units.reduce((n, u) => n + u.topics.length, 0);
          return h('button', { class: `big-card ${s.color}`, onclick: () => showUnits(s) },
            h('span', { class: 'emoji' }, s.emoji),
            h('span', { class: 'label' }, s.name,
              h('span', { class: 'sub' }, count ? `${count}개 주제` : '준비 중이에요')));
        })),
      h('div', { class: 'total-stars' }, `모은 별: ★ ${total}개`));
  }

  // ---------- 화면: 단원 ----------
  function showUnits(subject) {
    render(
      topbar(subject.name, showHome),
      h('div', { class: 'card-list' },
        subject.units.map(u => {
          const has = u.topics.length > 0;
          const stars = u.topics.reduce((n, t) => n + store.best(t.id), 0);
          return h('button', {
            class: `big-card ${subject.color}${has ? '' : ' locked'}`,
            onclick: () => has ? showTopics(subject, u) : null,
          },
            h('span', { class: 'emoji' }, has ? '📘' : '🔒'),
            h('span', { class: 'label' }, u.name,
              h('span', { class: 'sub' }, has ? `${u.topics.length}개 주제` : '준비 중이에요')),
            has ? h('span', { class: 'stars' }, `★${stars}`) : null);
        })));
  }

  // ---------- 화면: 주제 ----------
  function showTopics(subject, unit) {
    render(
      topbar(unit.name, () => showUnits(subject)),
      h('div', { class: 'card-list' },
        unit.topics.map(t =>
          h('button', { class: `big-card ${subject.color}`, onclick: () => startQuiz(subject, unit, t) },
            h('span', { class: 'emoji' }, t.emoji || '✏️'),
            h('span', { class: 'label' }, t.name,
              h('span', { class: 'sub' }, `${QUESTIONS_PER_SESSION}문제 도전!`)),
            h('span', { class: 'stars' }, starText(store.best(t.id)))))));
  }

  // ---------- 퀴즈 ----------
  function buildSession(topic) {
    const pool = topic.build ? topic.build() : (topic.questions || []);
    // 유형이 골고루 섞이도록: 태그별로 나눈 뒤 돌아가며 뽑기
    const byTag = {};
    shuffle(pool).forEach(q => { (byTag[q.tag || ''] = byTag[q.tag || ''] || []).push(q); });
    const tags = Object.keys(byTag);
    const picked = [];
    let i = 0;
    while (picked.length < QUESTIONS_PER_SESSION && tags.some(t => byTag[t].length)) {
      const t = tags[i % tags.length];
      if (byTag[t].length) picked.push(byTag[t].shift());
      i++;
    }
    return shuffle(picked);
  }

  function startQuiz(subject, unit, topic) {
    const state = {
      subject, unit, topic,
      questions: buildSession(topic),
      index: 0,
      correct: 0,
      wrongList: [],
    };
    if (!state.questions.length) { showTopics(subject, unit); return; }
    showQuestion(state);
  }

  function showQuestion(state) {
    const q = state.questions[state.index];
    const total = state.questions.length;
    const options = q.keepOrder ? q.options.slice() : shuffle(q.options);
    let answered = false;

    const blank = q.sentence ? h('span', { class: 'blank' }, ' ') : null;
    const sentenceEl = q.sentence
      ? h('div', { class: 'sentence' }, ...q.sentence.split('___').flatMap((part, i, arr) => i < arr.length - 1 ? [part, blank] : [part]))
      : null;

    const feedback = h('div', { class: 'feedback' });
    const nextBtn = h('button', { class: 'next-btn', style: 'visibility:hidden', onclick: () => advance(state) },
      state.index + 1 < total ? '다음 문제 →' : '결과 보기 🎉');

    const optionEls = options.map(opt =>
      h('button', { class: `option${options.length <= 2 ? ' single' : ''}`, onclick: (e) => choose(opt, e.currentTarget) },
        q.optionEmoji && q.optionEmoji[opt] ? h('span', { class: 'opt-emoji' }, q.optionEmoji[opt]) : null,
        opt));

    function choose(opt, el) {
      if (answered) return;
      answered = true;
      const ok = opt === q.answer;
      optionEls.forEach(o => { o.disabled = true; });
      if (ok) {
        state.correct++;
        el.classList.add('correct', 'pop');
        feedback.className = 'feedback good pop';
        feedback.textContent = ['정답이에요! 🎉', '참 잘했어요! 👏', '맞았어요! ⭐', '대단해요! 🌟'][Math.floor(Math.random() * 4)];
        if (blank) { blank.textContent = q.answer; blank.classList.add('filled'); }
        sfx.correct();
        speak(q.hint || q.answer);
      } else {
        state.wrongList.push(q);
        el.classList.add('wrong', 'shake');
        optionEls.find(o => o.dataset.value === q.answer).classList.add('correct');
        feedback.className = 'feedback bad';
        feedback.appendChild(document.createTextNode('아쉬워요 😅'));
        feedback.appendChild(h('span', { class: 'hint' }, q.hint || `정답은 "${q.answer}"이에요.`));
        if (blank) { blank.textContent = q.answer; blank.classList.add('filled'); }
        sfx.wrong();
        speak(q.hint || `정답은 ${q.answer}이에요`);
      }
      nextBtn.style.visibility = 'visible';
    }
    optionEls.forEach((el, i) => { el.dataset.value = options[i]; });

    const speakText = q.speak || (q.prompt + (q.sentence ? ' ' + q.sentence.replace('___', '무엇무엇') : ''));

    render(
      topbar(`${state.index + 1} / ${total}`, () => {
        if (confirm('그만할까요? 지금까지 푼 건 저장되지 않아요.')) showTopics(state.subject, state.unit);
      }),
      h('div', { class: 'progress' }, h('div', { class: 'progress-bar', style: `width:${(state.index / total) * 100}%` })),
      h('div', { class: 'question pop' },
        q.tag ? h('span', { class: 'type-tag' }, q.tag) : null,
        h('p', { class: 'prompt' }, q.prompt),
        q.visual ? h('div', { class: 'visual' }, q.visual) : null,
        q.svg ? h('div', { class: 'svg-wrap' }, svgNode(q.svg)) : null,
        q.word ? h('div', { class: 'word' }, q.word) : null,
        sentenceEl,
        h('button', { class: 'speak-btn', onclick: () => speak(speakText) }, '🔊 읽어 주세요')),
      h('div', { class: `options${options.length <= 2 ? ' single' : ''}` }, optionEls),
      feedback,
      nextBtn);

    setTimeout(() => speak(speakText), 300);
  }

  function svgNode(svgString) {
    const wrap = document.createElement('div');
    wrap.innerHTML = svgString;
    return wrap.firstElementChild;
  }

  function advance(state) {
    state.index++;
    if (state.index < state.questions.length) showQuestion(state);
    else showResult(state);
  }

  // ---------- 결과 ----------
  function showResult(state) {
    const total = state.questions.length;
    const stars = store.record(state.topic.id, state.correct, total);
    const msg = stars === 3 ? '완벽해요!' : stars === 2 ? '아주 잘했어요!' : stars === 1 ? '잘했어요!' : '다시 한번 해 봐요!';
    sfx.done();
    setTimeout(() => speak(`${total}문제 중에 ${state.correct}문제를 맞혔어요. ${msg}`), 200);

    render(
      h('div', { class: 'result' },
        h('div', { class: 'mascot pop' }, stars >= 2 ? '🏆' : stars === 1 ? '😊' : '💪'),
        h('h2', {}, msg),
        h('div', { class: 'score' }, `${total}문제 중 ${state.correct}문제 정답`),
        h('div', { class: 'stars-big pop' }, starText(stars)),
        h('div', { class: 'actions' },
          state.wrongList.length
            ? h('button', { class: 'next-btn', onclick: () => retryWrong(state) }, `틀린 문제 다시 풀기 (${state.wrongList.length})`)
            : null,
          h('button', { class: `next-btn${state.wrongList.length ? ' secondary' : ''}`, onclick: () => startQuiz(state.subject, state.unit, state.topic) }, '새 문제로 다시 하기'),
          h('button', { class: 'next-btn secondary', onclick: () => showTopics(state.subject, state.unit) }, '주제 고르기'),
          h('button', { class: 'next-btn secondary', onclick: showHome }, '처음으로'))));
  }

  function retryWrong(state) {
    const s = {
      subject: state.subject, unit: state.unit, topic: state.topic,
      questions: shuffle(state.wrongList), index: 0, correct: 0, wrongList: [],
    };
    showQuestion(s);
  }

  // ---------- 시작 ----------
  showHome();
})();
