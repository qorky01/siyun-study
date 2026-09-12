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
  function gemText(n) {
    return h('span', { class: 'gems' },
      ...[0, 1, 2].map(i => h('span', { class: 'gem' + (i < n ? ' on' : '') }, '💎')));
  }

  // ---------- 소리 ----------
  let audioCtx = null;
  function beep(freqs, dur, type) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      let t = audioCtx.currentTime;
      freqs.forEach(f => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = type || 'square';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + dur);
        t += dur * 0.8;
      });
    } catch (e) { /* ignore */ }
  }
  const sfx = {
    tap: () => beep([880], 0.05),
    correct: () => beep([523, 659, 784], 0.15),
    wrong: () => beep([220, 180], 0.25, 'sawtooth'),
    done: () => beep([523, 659, 784, 1047], 0.18),
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
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) el.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
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
      h('button', { class: 'back-btn', onclick: onBack, 'aria-label': '뒤로' }, '◀'),
      h('h1', {}, title),
      h('div', { class: 'spacer' }));
  }
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    const s = new Set(a.map(String));
    return b.every(x => s.has(String(x)));
  }
  function sameList(a, b) {
    return a.length === b.length && a.every((x, i) => String(x) === String(b[i]));
  }

  // ---------- 화면: 홈 ----------
  function showHome() {
    const subjects = SUBJECT_ORDER.map(id => window.STUDY_DATA[id]).filter(Boolean);
    let total = 0;
    subjects.forEach(s => s.units.forEach(u => u.topics.forEach(t => { total += store.best(t.id); })));

    render(
      h('div', { class: 'home-hero' },
        h('div', { class: 'mascot' }, '⛏️'),
        h('h1', {}, '시윤 크래프트'),
        h('p', {}, '1학년 2학기 공부 월드')),
      h('div', { class: 'card-list' },
        subjects.map(s => {
          const count = s.units.reduce((n, u) => n + u.topics.length, 0);
          return h('button', { class: `big-card ${s.color}`, onclick: () => { sfx.tap(); showUnits(s); } },
            h('span', { class: 'emoji' }, s.emoji),
            h('span', { class: 'label' }, s.name,
              h('span', { class: 'sub' }, count ? `${count}개 주제` : '준비 중이에요')));
        })),
      h('div', { class: 'total-stars' }, `모은 다이아몬드 💎 ${total}개`));
  }

  // ---------- 화면: 단원 ----------
  function showUnits(subject) {
    render(
      topbar(subject.name, showHome),
      h('div', { class: 'card-list' },
        subject.units.map(u => {
          const has = u.topics.length > 0;
          const gems = u.topics.reduce((n, t) => n + store.best(t.id), 0);
          return h('button', {
            class: `big-card ${subject.color}${has ? '' : ' locked'}`,
            onclick: () => { if (has) { sfx.tap(); showTopics(subject, u); } },
          },
            h('span', { class: 'emoji' }, has ? (u.emoji || '📘') : '🔒'),
            h('span', { class: 'label' }, u.name,
              h('span', { class: 'sub' }, has ? `${u.topics.length}개 주제` : '준비 중이에요')),
            has ? h('span', { class: 'stars' }, `💎${gems}`) : null);
        })));
  }

  // ---------- 화면: 주제 ----------
  function showTopics(subject, unit) {
    render(
      topbar(unit.name, () => showUnits(subject)),
      h('div', { class: 'card-list' },
        unit.topics.map(t =>
          h('button', { class: `big-card ${subject.color}`, onclick: () => { sfx.tap(); startQuiz(subject, unit, t); } },
            h('span', { class: 'emoji' }, t.emoji || '✏️'),
            h('span', { class: 'label' + (t.name.length > 9 ? ' long' : '') }, t.name,
              h('span', { class: 'sub' }, t.desc || `${QUESTIONS_PER_SESSION}문제 도전!`)),
            gemText(store.best(t.id))))));
  }

  // ---------- 퀴즈 세션 ----------
  function buildSession(topic) {
    const pool = topic.build ? topic.build() : (topic.questions || []);
    // 유형(tag)이 골고루 섞이도록: 태그별로 나눈 뒤 돌아가며 뽑기
    const byTag = {};
    shuffle(pool).forEach(q => { (byTag[q.tag || ''] = byTag[q.tag || ''] || []).push(q); });
    const tags = shuffle(Object.keys(byTag));
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

  function svgNode(svgString) {
    const wrap = document.createElement('div');
    wrap.innerHTML = svgString;
    return wrap.firstElementChild;
  }

  // ---------- 문제 화면 ----------
  function showQuestion(state) {
    const q = state.questions[state.index];
    const total = state.questions.length;
    let answered = false;

    const blank = q.sentence ? h('span', { class: 'blank' }, ' ') : null;
    const sentenceEl = q.sentence
      ? h('div', { class: 'sentence' }, ...q.sentence.split('___').flatMap((part, i, arr) => i < arr.length - 1 ? [part, blank] : [part]))
      : null;

    const feedback = h('div', { class: 'feedback' });
    const nextBtn = h('button', { class: 'next-btn', style: 'visibility:hidden', onclick: () => advance(state) },
      state.index + 1 < total ? '다음 문제 ▶' : '결과 보기 🏆');

    const speakText = q.speak || (q.prompt + (q.sentence ? ' ' + q.sentence.replace('___', '무엇') : ''));

    function finish(ok, userAnswerText) {
      if (answered) return;
      answered = true;
      const answerText = q.answerText || (Array.isArray(q.answer) ? q.answer.join(', ') : String(q.answer));
      if (ok) {
        state.correct++;
        feedback.className = 'feedback good pop';
        feedback.textContent = ['정답! 💎 획득!', '참 잘했어요! 👏', '맞았어요! ⭐', '대단해요! 🌟'][Math.floor(Math.random() * 4)];
        if (blank) { blank.textContent = answerText; blank.classList.add('filled'); }
        sfx.correct();
        speak(q.hint || answerText);
      } else {
        state.wrongList.push(q);
        feedback.className = 'feedback bad';
        feedback.appendChild(document.createTextNode('아쉬워요 😅'));
        feedback.appendChild(h('span', { class: 'hint' }, q.hint || `정답은 "${answerText}"이에요.`));
        if (blank) { blank.textContent = answerText; blank.classList.add('filled'); }
        sfx.wrong();
        speak(q.hint || `정답은 ${answerText}이에요`);
      }
      nextBtn.style.visibility = 'visible';
    }

    // ----- 입력 영역 (유형별) -----
    let inputArea;
    const type = q.type || 'choice';

    if (type === 'choice' || type === 'ox') {
      const options = type === 'ox' ? ['O', 'X'] : (q.keepOrder ? q.options.slice() : shuffle(q.options));
      const optionEls = options.map(opt => {
        const el = h('button', {
          class: `option${type === 'ox' ? ' ox ' + opt : ''}`,
          onclick: () => {
            if (answered) return;
            const ok = String(opt) === String(q.answer);
            optionEls.forEach(o => { o.disabled = true; });
            el.classList.add(ok ? 'correct' : 'wrong', ok ? 'pop' : 'shake');
            if (!ok) { const c = optionEls.find(o => o.dataset.value === String(q.answer)); if (c) c.classList.add('correct'); }
            finish(ok);
          },
        },
          q.optionEmoji && q.optionEmoji[opt] ? h('span', { class: 'opt-emoji' }, q.optionEmoji[opt]) : null,
          q.optionSvg && q.optionSvg[opt] ? svgNode(q.optionSvg[opt]) : null,
          type === 'ox' ? (opt === 'O' ? '⭕ 맞아요' : '❌ 아니에요') : (q.optionHideLabel ? null : String(opt)));
        el.dataset.value = String(opt);
        return el;
      });
      const cols = type === 'ox' ? 'two' : options.length <= 2 ? 'single' : (q.optionSvg ? 'two' : 'two');
      inputArea = h('div', { class: `options ${cols}${q.optionSvg ? ' svg-opts' : ''}` }, optionEls);
    }

    if (type === 'input') {
      let value = '';
      const display = h('div', { class: 'answer-box' }, h('span', { class: 'answer-val' }, ''), q.unit ? h('span', { class: 'answer-unit' }, q.unit) : null);
      const valEl = display.querySelector('.answer-val');
      const refresh = () => { valEl.textContent = value || ''; display.classList.toggle('empty', !value); };
      refresh();
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '확인'];
      const pad = h('div', { class: 'keypad' }, keys.map(k =>
        h('button', {
          class: `key${k === '확인' ? ' key-ok' : ''}${k === '⌫' ? ' key-del' : ''}`,
          onclick: () => {
            if (answered) return;
            if (k === '⌫') { value = value.slice(0, -1); sfx.tap(); }
            else if (k === '확인') {
              if (!value) return;
              const ok = String(Number(value)) === String(q.answer);
              display.classList.add(ok ? 'correct' : 'wrong');
              pad.querySelectorAll('button').forEach(b => { b.disabled = true; });
              finish(ok);
              return;
            } else if (value.length < 3) { value += k; sfx.tap(); }
            refresh();
          },
        }, k)));
      inputArea = h('div', { class: 'input-area' }, display, pad);
    }

    if (type === 'multi') {
      const options = q.keepOrder ? q.options.slice() : shuffle(q.options);
      const selected = new Set();
      const optionEls = options.map(opt => {
        const el = h('button', {
          class: 'option multi',
          onclick: () => {
            if (answered) return;
            sfx.tap();
            if (selected.has(opt)) { selected.delete(opt); el.classList.remove('selected'); }
            else { selected.add(opt); el.classList.add('selected'); }
          },
        },
          q.optionEmoji && q.optionEmoji[opt] ? h('span', { class: 'opt-emoji' }, q.optionEmoji[opt]) : null,
          q.optionSvg && q.optionSvg[opt] ? svgNode(q.optionSvg[opt]) : null,
          String(opt));
        el.dataset.value = String(opt);
        return el;
      });
      const okBtn = h('button', {
        class: 'next-btn confirm',
        onclick: () => {
          if (answered || !selected.size) return;
          const ok = sameSet([...selected], q.answer);
          optionEls.forEach(o => {
            o.disabled = true;
            const isAns = q.answer.map(String).includes(o.dataset.value);
            if (isAns) o.classList.add('correct');
            else if (selected.has(o.dataset.value) || [...selected].map(String).includes(o.dataset.value)) o.classList.add('wrong');
          });
          okBtn.remove();
          finish(ok);
        },
      }, '골랐어요 ✔');
      inputArea = h('div', {},
        h('div', { class: 'options two' }, optionEls),
        okBtn);
    }

    if (type === 'order') {
      const items = shuffle(q.items);
      const picked = [];
      const slots = h('div', { class: 'slots' }, q.items.map(() => h('div', { class: 'slot' }, '')));
      const itemEls = items.map(it => {
        const el = h('button', {
          class: 'option chip',
          onclick: () => {
            if (answered || el.disabled) return;
            sfx.tap();
            picked.push(it);
            el.disabled = true;
            el.classList.add('used');
            slots.children[picked.length - 1].textContent = String(it);
            slots.children[picked.length - 1].classList.add('filled');
            if (picked.length === q.items.length) {
              const ok = sameList(picked, q.answer);
              [...slots.children].forEach((s, i) => s.classList.add(String(picked[i]) === String(q.answer[i]) ? 'correct' : 'wrong'));
              resetBtn.remove();
              finish(ok);
            }
          },
        }, q.itemSvg && q.itemSvg[it] ? svgNode(q.itemSvg[it]) : null, String(it));
        return el;
      });
      const resetBtn = h('button', {
        class: 'next-btn confirm secondary', onclick: () => {
          if (answered) return;
          picked.length = 0;
          itemEls.forEach(e => { e.disabled = false; e.classList.remove('used'); });
          [...slots.children].forEach(s => { s.textContent = ''; s.classList.remove('filled'); });
        },
      }, '다시 놓기 ↺');
      inputArea = h('div', {},
        h('div', { class: 'order-label' }, q.orderLabel || '순서대로 눌러요'),
        slots,
        h('div', { class: `options${q.itemSvg ? ' svg-opts' : ''} two` }, itemEls),
        resetBtn);
    }

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
        q.html ? h('div', { class: 'html-wrap', html: q.html }) : null,
        q.word ? h('div', { class: 'word' }, q.word) : null,
        q.statement ? h('div', { class: 'statement' }, q.statement) : null,
        sentenceEl,
        h('button', { class: 'speak-btn', onclick: () => speak(speakText) }, '🔊 읽어 주세요')),
      inputArea,
      feedback,
      nextBtn);

    setTimeout(() => speak(speakText), 300);
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
    const msg = stars === 3 ? '완벽해요! 다이아 채굴 성공!' : stars === 2 ? '아주 잘했어요!' : stars === 1 ? '잘했어요!' : '다시 한번 도전!';
    sfx.done();
    setTimeout(() => speak(`${total}문제 중에 ${state.correct}문제를 맞혔어요. ${msg}`), 200);

    render(
      h('div', { class: 'result' },
        h('div', { class: 'mascot pop' }, stars >= 2 ? '🏆' : stars === 1 ? '😊' : '💪'),
        h('h2', {}, msg),
        h('div', { class: 'score' }, `${total}문제 중 ${state.correct}문제 정답`),
        h('div', { class: 'stars-big pop' }, gemText(stars)),
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

  // ---------- 개발용: 특정 주제·유형 바로 열기 (?topic=m1-count&tag=블록 세기) ----------
  window.SIYUN_DEBUG = {
    start(topicId, tag) {
      for (const sid of SUBJECT_ORDER) {
        const s = window.STUDY_DATA[sid];
        if (!s) continue;
        for (const u of s.units) for (const t of u.topics) if (t.id === topicId) {
          const pool = (t.build ? t.build() : t.questions || []).filter(q => !tag || q.tag === tag);
          showQuestion({ subject: s, unit: u, topic: t, questions: shuffle(pool).slice(0, QUESTIONS_PER_SESSION), index: 0, correct: 0, wrongList: [] });
          return true;
        }
      }
      return false;
    },
  };

  // ---------- 시작 ----------
  const params = new URLSearchParams(location.search);
  if (params.get('topic') && window.SIYUN_DEBUG.start(params.get('topic'), params.get('tag'))) { /* 개발용 진입 */ }
  else showHome();
})();
