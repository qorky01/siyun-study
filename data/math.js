// 수학 1-2 (2022 개정 교육과정)
// 모든 문제는 생성기(build)로 만들어지며, 각 주제마다 서로 다른 출제 형식(tag)을 여러 개 갖는다.
// 풀이 방식: choice(고르기) / input(숫자 입력) / ox(맞아요·아니에요) / multi(모두 고르기) / order(순서대로 놓기)
window.STUDY_DATA = window.STUDY_DATA || {};

(function () {
  // ---------- 공통 유틸 ----------
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[R(0, arr.length - 1)];
  const shuf = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = arr => [...new Set(arr)];
  // 정답 근처의 그럴듯한 오답 만들기
  function distract(ans, n, lo = 0, hi = 100) {
    const cands = shuf(uniq([ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2, swapDigits(ans), ans + 20, ans - 20, ans + 3, ans - 3]
      .filter(x => x !== ans && x >= lo && x <= hi)));
    return cands.slice(0, n);
  }
  function swapDigits(n) { if (n < 10 || n > 99) return n + 5; const t = Math.floor(n / 10), o = n % 10; return o * 10 + t; }
  const opts = (ans, n = 3, lo = 0, hi = 100) => [ans, ...distract(ans, n, lo, hi)];
  const times = (n, fn) => Array.from({ length: n }, fn);

  const SINO_ONES = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const SINO_TENS = ['', '십', '이십', '삼십', '사십', '오십', '육십', '칠십', '팔십', '구십'];
  const NAT_ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
  const NAT_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
  const readSino = n => n === 100 ? '백' : SINO_TENS[Math.floor(n / 10)] + SINO_ONES[n % 10];
  const readNat = n => n === 100 ? '백' : NAT_TENS[Math.floor(n / 10)] + NAT_ONES[n % 10];

  const NAMES = ['시윤이', '스티브', '알렉스', '친구'];
  const ITEMS = [
    ['다이아몬드', '💎', '개'], ['나무 블록', '🪵', '개'], ['사과', '🍎', '개'], ['쿠키', '🍪', '개'],
    ['철 광석', '⛏️', '개'], ['양', '🐑', '마리'], ['닭', '🐔', '마리'], ['돌 블록', '🪨', '개'], ['로벅스', '💰', '개'],
  ];
  const BLOCKS = [['🟩', '잔디'], ['🟫', '흙'], ['⬜', '돌'], ['🟦', '물'], ['🟨', '금'], ['🟥', '용암'], ['💎', '다이아']];

  // ---------- SVG 그림 ----------
  const S = 13; // 큐브 한 변
  function cube(x, y, fill, edge) {
    return `<rect x="${x}" y="${y}" width="${S - 1}" height="${S - 1}" fill="${fill}" stroke="${edge}" stroke-width="1"/>`;
  }
  // 10개씩 묶음(초록 기둥)과 낱개(갈색 큐브)
  function svgBlocks(tens, ones) {
    let out = '';
    for (let t = 0; t < tens; t++) for (let i = 0; i < 10; i++) out += cube(t * (S + 6), i * S, '#5cb85c', '#2d6a2d');
    const ox = tens * (S + 6) + (tens ? 14 : 0);
    for (let i = 0; i < ones; i++) out += cube(ox + Math.floor(i / 5) * (S + 3), (i % 5) * S + 5 * S - (i >= 5 ? 0 : 0), '#a0713d', '#5c3d1e');
    const w = ox + (ones ? (ones > 5 ? 2 : 1) * (S + 3) : 0) + 4;
    return `<svg viewBox="0 0 ${Math.max(w, 40)} ${10 * S + 2}" style="width:${Math.max(w, 40) * 1.4}px;max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }
  function svgClock(hh, mm, size = 150) {
    const c = 60, r = 54;
    let out = `<circle cx="${c}" cy="${c}" r="${r + 4}" fill="#f3e3c3" stroke="#5c3d1e" stroke-width="4"/>`;
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      out += `<text x="${c + Math.sin(a) * 42}" y="${c - Math.cos(a) * 42 + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="#333">${i}</text>`;
      out += `<line x1="${c + Math.sin(a) * 50}" y1="${c - Math.cos(a) * 50}" x2="${c + Math.sin(a) * 54}" y2="${c - Math.cos(a) * 54}" stroke="#5c3d1e" stroke-width="2"/>`;
    }
    const ha = ((hh % 12) + mm / 60) / 12 * Math.PI * 2;
    const ma = (mm / 60) * Math.PI * 2;
    out += `<line x1="${c}" y1="${c}" x2="${c + Math.sin(ha) * 26}" y2="${c - Math.cos(ha) * 26}" stroke="#222" stroke-width="6" stroke-linecap="round"/>`;
    out += `<line x1="${c}" y1="${c}" x2="${c + Math.sin(ma) * 40}" y2="${c - Math.cos(ma) * 40}" stroke="#d9534f" stroke-width="4" stroke-linecap="round"/>`;
    out += `<circle cx="${c}" cy="${c}" r="4" fill="#222"/>`;
    return `<svg viewBox="0 0 120 120" style="width:${size}px;height:${size}px" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }
  function svgNumberLine(start, count, blankIdx) {
    const gap = 44, pad = 20;
    let out = `<line x1="${pad - 10}" y1="30" x2="${pad + gap * (count - 1) + 10}" y2="30" stroke="#333" stroke-width="3"/>`;
    for (let i = 0; i < count; i++) {
      const x = pad + gap * i;
      out += `<line x1="${x}" y1="22" x2="${x}" y2="38" stroke="#333" stroke-width="3"/>`;
      if (i === blankIdx) out += `<rect x="${x - 16}" y="44" width="32" height="26" rx="4" fill="#fff3cd" stroke="#e6a800" stroke-width="2"/><text x="${x}" y="63" text-anchor="middle" font-size="16" font-weight="bold" fill="#e6a800">?</text>`;
      else out += `<text x="${x}" y="63" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">${start + i}</text>`;
    }
    const w = pad * 2 + gap * (count - 1);
    return `<svg viewBox="0 0 ${w} 80" style="width:${w * 1.3}px;max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }
  function svgTenFrame(n, color = '#4d96ff') {
    let out = '';
    for (let i = 0; i < 10; i++) {
      const x = (i % 5) * 34 + 4, y = Math.floor(i / 5) * 34 + 4;
      out += `<rect x="${x}" y="${y}" width="32" height="32" fill="#fff" stroke="#333" stroke-width="2"/>`;
      if (i < n) out += `<circle cx="${x + 16}" cy="${y + 16}" r="11" fill="${color}"/>`;
    }
    return `<svg viewBox="0 0 176 74" style="width:230px;max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }
  function svgDots(n) {
    // 둘씩 짝지어 놓은 점 (짝수·홀수)
    let out = '';
    for (let i = 0; i < n; i++) {
      const col = Math.floor(i / 2), row = i % 2;
      out += `<circle cx="${col * 30 + 16}" cy="${row * 30 + 16}" r="11" fill="#ff8c42" stroke="#b35c1e" stroke-width="2"/>`;
    }
    const w = Math.ceil(n / 2) * 30 + 4;
    return `<svg viewBox="0 0 ${w} 64" style="width:${w * 1.2}px;max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }
  function shapeSvg(kind, x, y, s, fill) {
    if (kind === 'sq') return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${fill}" stroke="#333" stroke-width="2"/>`;
    if (kind === 'tri') return `<polygon points="${x + s / 2},${y} ${x},${y + s} ${x + s},${y + s}" fill="${fill}" stroke="#333" stroke-width="2"/>`;
    return `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s / 2}" fill="${fill}" stroke="#333" stroke-width="2"/>`;
  }
  function svgShapes(counts) {
    // counts: {sq, tri, cir} -> 6x3 격자에 무작위 배치
    const cells = shuf(times(18, (_, i) => i));
    const kinds = [].concat(times(counts.sq, () => 'sq'), times(counts.tri, () => 'tri'), times(counts.cir, () => 'cir'));
    const colors = { sq: '#4d96ff', tri: '#ffd93d', cir: '#ff6b81' };
    let out = '';
    kinds.forEach((k, i) => {
      const c = cells[i];
      out += shapeSvg(k, (c % 6) * 46 + 6, Math.floor(c / 6) * 46 + 6, 34, colors[k]);
    });
    return `<svg viewBox="0 0 282 142" style="width:300px;max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }
  const SHAPE_ICON = {
    '네모': `<svg viewBox="0 0 40 40" style="width:44px;height:44px"><rect x="4" y="4" width="32" height="32" fill="#4d96ff" stroke="#333" stroke-width="2"/></svg>`,
    '세모': `<svg viewBox="0 0 40 40" style="width:44px;height:44px"><polygon points="20,4 4,36 36,36" fill="#ffd93d" stroke="#333" stroke-width="2"/></svg>`,
    '동그라미': `<svg viewBox="0 0 40 40" style="width:44px;height:44px"><circle cx="20" cy="20" r="16" fill="#ff6b81" stroke="#333" stroke-width="2"/></svg>`,
  };
  function svgGrid(start, cols, rows, blankVal) {
    // 수 배열표 (예: 41~60)
    let out = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const v = start + r * cols + c, x = c * 30 + 2, y = r * 30 + 2;
      const blank = v === blankVal;
      out += `<rect x="${x}" y="${y}" width="28" height="28" fill="${blank ? '#fff3cd' : '#fff'}" stroke="${blank ? '#e6a800' : '#999'}" stroke-width="${blank ? 2 : 1}"/>`;
      out += `<text x="${x + 14}" y="${y + 19}" text-anchor="middle" font-size="12" font-weight="bold" fill="${blank ? '#e6a800' : '#333'}">${blank ? '?' : v}</text>`;
    }
    const w = cols * 30 + 4, hgt = rows * 30 + 4;
    return `<svg viewBox="0 0 ${w} ${hgt}" style="width:${w * 1.1}px;max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  }
  // 세로셈
  function vert(a, op, b) {
    const d = n => String(n).padStart(2, ' ').split('').map(ch => `<span>${ch.trim()}</span>`).join('');
    return `<div class="vert"><div class="vrow"><span></span>${d(a)}</div><div class="vrow"><span class="op">${op}</span>${d(b)}</div><div class="vline"></div><div class="vrow ans"><span></span><span>?</span><span>?</span></div></div>`;
  }
  const seqHtml = arr => `<div class="seq">${arr.map(v => `<span class="${v === '?' ? 'q' : ''}">${v}</span>`).join('')}</div>`;

  // 문장제 재료
  function story() {
    const [item, emoji, unit] = pick(ITEMS);
    return { name: pick(NAMES), item, emoji, unit };
  }

  // 문제 객체 생성 도우미
  const Q = (tag, obj) => Object.assign({ tag }, obj);

  // ======================================================
  // 1단원 100까지의 수
  // ======================================================
  const u1_count = () => [
    ...times(3, () => { const t = R(3, 9), o = R(0, 9); return Q('블록 세기', { type: 'input', prompt: '블록은 모두 몇 개일까요?', svg: svgBlocks(t, o), answer: t * 10 + o, unit: '개', speak: '블록은 모두 몇 개일까요?', hint: `10개씩 묶음 ${t}개와 낱개 ${o}개라서 ${t * 10 + o}개예요.` }); }),
    ...times(2, () => { const t = R(5, 9), o = R(1, 9); const n = t * 10 + o; return Q('묶음과 낱개', { type: 'choice', prompt: `10개씩 묶음 ${t}개와 낱개 ${o}개는 얼마일까요?`, visual: '📦', options: opts(n), answer: n, hint: `10개씩 ${t}묶음은 ${t * 10}, 낱개 ${o}개를 더하면 ${n}이에요.` }); }),
    ...times(2, () => { const t = R(5, 9), o = R(1, 9); const n = t * 10 + o; return Q('묶음 수 찾기', { type: 'input', prompt: `${n}은 10개씩 묶음 몇 개와 낱개 ${o}개일까요?`, word: String(n), answer: t, unit: '묶음', speak: `${readSino(n)}은 10개씩 묶음 몇 개와 낱개 ${o}개일까요?`, hint: `${n}은 10개씩 묶음 ${t}개와 낱개 ${o}개예요.` }); }),
    ...times(2, () => { const n = R(51, 99); const nat = Math.random() < 0.5; return Q('수 읽기', { type: 'input', prompt: `"${nat ? readNat(n) : readSino(n)}"을 숫자로 쓰면?`, word: nat ? readNat(n) : readSino(n), answer: n, speak: `${nat ? readNat(n) : readSino(n)}을 숫자로 쓰면 얼마일까요?`, hint: `${nat ? readNat(n) : readSino(n)}은 ${n}이에요.` }); }),
    ...times(2, () => { const n = R(60, 99); const nat = Math.random() < 0.5; const ans = nat ? readNat(n) : readSino(n); const wrong = nat ? [readNat(swapDigits(n)), readNat(n + (n < 90 ? 10 : -10)), readNat(n - 1)] : [readSino(swapDigits(n)), readSino(n + (n < 90 ? 10 : -10)), readSino(n - 1)]; return Q('수 읽기', { type: 'choice', prompt: `${n}을 바르게 읽은 것은?`, word: String(n), options: uniq([ans, ...wrong]).slice(0, 4), answer: ans, speak: `이 수를 바르게 읽은 것은 무엇일까요?`, hint: `${n}은 "${readSino(n)}" 또는 "${readNat(n)}"이라고 읽어요.` }); }),
    ...times(2, () => { const s = story(); const t = R(5, 9), o = R(1, 9); return Q('문장제', { type: 'input', prompt: `${s.name}가 ${s.item}을 10${s.unit}씩 ${t}묶음과 낱개 ${o}${s.unit} 모았어요. 모두 몇 ${s.unit}일까요?`, visual: s.emoji, answer: t * 10 + o, unit: s.unit, hint: `10${s.unit}씩 ${t}묶음은 ${t * 10}${s.unit}, 낱개 ${o}${s.unit}를 더해 ${t * 10 + o}${s.unit}예요.` }); }),
    ...times(2, () => { const t = R(5, 9); const ok = Math.random() < 0.5; const shown = ok ? t * 10 : t * 10 + pick([10, -10, 1]); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '맞으면 ⭕, 틀리면 ❌를 눌러요.', statement: `10개씩 묶음 ${t}개는 ${shown}이에요.`, answer: ok ? 'O' : 'X', speak: `10개씩 묶음 ${t}개는 ${readSino(shown)}이에요. 맞을까요?`, hint: `10개씩 묶음 ${t}개는 ${t * 10}이에요.` }); }),
  ];

  const u1_order = () => [
    ...times(2, () => { const s = R(50, 95); const bi = R(1, 3); const arr = times(5, (_, i) => i === bi ? '?' : s + i); return Q('빈칸 채우기', { type: 'input', prompt: '순서에 맞게 빈칸에 알맞은 수를 써요.', html: seqHtml(arr), answer: s + bi, speak: '순서에 맞게 빈칸에 알맞은 수를 써요.', hint: `${s + bi - 1} 다음 수는 ${s + bi}이에요.` }); }),
    ...times(2, () => { const n = R(51, 98); const kind = pick(['1 큰 수', '1 작은 수', '10 큰 수', '10 작은 수']); const d = kind === '1 큰 수' ? 1 : kind === '1 작은 수' ? -1 : kind === '10 큰 수' ? 10 : -10; if (n + d > 100 || n + d < 0) return Q('큰 수 작은 수', { type: 'input', prompt: `${n}보다 1 큰 수는?`, word: String(n), answer: n + 1, hint: `${n}보다 1 큰 수는 ${n + 1}이에요.` }); return Q('큰 수 작은 수', { type: 'input', prompt: `${n}보다 ${kind}는?`, word: String(n), answer: n + d, speak: `${readSino(n)}보다 ${kind}는 얼마일까요?`, hint: `${n}보다 ${kind}는 ${n + d}이에요.` }); }),
    ...times(2, () => { const s = R(50, 94); const bi = R(1, 4); return Q('수직선', { type: 'input', prompt: '수직선에서 ? 에 알맞은 수는?', svg: svgNumberLine(s, 6, bi), answer: s + bi, speak: '수직선에서 물음표에 알맞은 수는 무엇일까요?', hint: `${s + bi - 1}과 ${s + bi + 1} 사이에 있는 수는 ${s + bi}이에요.` }); }),
    ...times(2, () => { let a = R(50, 99), b = R(50, 99); if (a === b) b = a + (a < 99 ? 1 : -1); return Q('크기 비교', { type: 'choice', keepOrder: true, prompt: '○ 안에 알맞은 것은?', word: `${a} ○ ${b}`, options: ['>', '<'], answer: a > b ? '>' : '<', speak: `${readSino(a)}과 ${readSino(b)}. 어느 쪽이 더 클까요?`, hint: `${a}은 ${b}보다 ${a > b ? '커요' : '작아요'}. 그래서 ${a} ${a > b ? '>' : '<'} ${b}예요.` }); }),
    ...times(2, () => { const items = uniq(times(4, () => R(50, 99))); while (items.length < 4) { const v = R(50, 99); if (!items.includes(v)) items.push(v); } const asc = Math.random() < 0.6; const answer = items.slice().sort((x, y) => asc ? x - y : y - x); return Q('순서대로 놓기', { type: 'order', prompt: asc ? '작은 수부터 순서대로 눌러요.' : '큰 수부터 순서대로 눌러요.', items, answer, orderLabel: asc ? '작은 수 → 큰 수' : '큰 수 → 작은 수', hint: `순서대로 놓으면 ${answer.join(', ')}이에요.` }); }),
    ...times(2, () => { const items = uniq(times(4, () => R(50, 99))); while (items.length < 4) { const v = R(50, 99); if (!items.includes(v)) items.push(v); } const big = Math.random() < 0.5; const ans = big ? Math.max(...items) : Math.min(...items); return Q('가장 큰 수·작은 수', { type: 'choice', prompt: big ? '가장 큰 수는?' : '가장 작은 수는?', visual: big ? '🐘' : '🐜', options: items, answer: ans, hint: `가장 ${big ? '큰' : '작은'} 수는 ${ans}이에요.` }); }),
    ...times(2, () => { const a = R(50, 92); const b = a + R(3, 5); const options = shuf([...times(b - a - 1, (_, i) => a + 1 + i), a - 1, b + 1, a - 2].slice(0, 6)); const answer = times(b - a - 1, (_, i) => a + 1 + i); return Q('사이의 수', { type: 'multi', prompt: `${a}과 ${b} 사이에 있는 수를 모두 골라요.`, word: `${a} ~ ${b}`, options, answer, hint: `${a}과 ${b} 사이의 수는 ${answer.join(', ')}이에요.` }); }),
    ...times(2, () => { const s = story(); let a = R(50, 99), b = R(50, 99); if (a === b) b = a - 1; const n1 = '시윤이', n2 = pick(['스티브', '알렉스']); return Q('문장제', { type: 'choice', keepOrder: true, prompt: `${n1}는 ${s.item}을 ${a}${s.unit}, ${n2}는 ${b}${s.unit} 가지고 있어요. 누가 더 많이 가지고 있을까요?`, visual: s.emoji, options: [n1, n2], answer: a > b ? n1 : n2, hint: `${a}과 ${b} 중 ${Math.max(a, b)}이 더 커요. ${a > b ? n1 : n2}가 더 많아요.` }); }),
  ];

  const u1_evenodd = () => [
    ...times(3, () => { const n = R(10, 99); return Q('짝수? 홀수?', { type: 'choice', keepOrder: true, prompt: '이 수는 짝수일까요, 홀수일까요?', word: String(n), options: ['짝수', '홀수'], answer: n % 2 === 0 ? '짝수' : '홀수', speak: `${readSino(n)}은 짝수일까요, 홀수일까요?`, hint: `${n}은 낱개가 ${n % 10}이라서 ${n % 2 === 0 ? '짝수' : '홀수'}예요.` }); }),
    ...times(2, () => { const options = uniq(times(8, () => R(10, 60))).slice(0, 6); while (options.length < 6) { const v = R(10, 60); if (!options.includes(v)) options.push(v); } const even = Math.random() < 0.5; const answer = options.filter(v => (v % 2 === 0) === even); if (!answer.length) { options[0] = even ? 24 : 25; answer.push(options[0]); } return Q('모두 고르기', { type: 'multi', prompt: `${even ? '짝수' : '홀수'}를 모두 골라요.`, visual: even ? '👫' : '🙋', options, answer, hint: `${even ? '짝수' : '홀수'}는 ${answer.join(', ')}이에요.` }); }),
    ...times(2, () => { const n = R(10, 99); const say = Math.random() < 0.5 ? '짝수' : '홀수'; const ok = (n % 2 === 0) === (say === '짝수'); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '맞으면 ⭕, 틀리면 ❌를 눌러요.', statement: `${n}은 ${say}예요.`, answer: ok ? 'O' : 'X', speak: `${readSino(n)}은 ${say}예요. 맞을까요?`, hint: `${n}은 ${n % 2 === 0 ? '짝수' : '홀수'}예요.` }); }),
    ...times(2, () => { const n = R(5, 13); return Q('짝 지어 보기', { type: 'choice', keepOrder: true, prompt: '둘씩 짝을 지어 보세요. 이 수는 짝수일까요, 홀수일까요?', svg: svgDots(n), options: ['짝수', '홀수'], answer: n % 2 === 0 ? '짝수' : '홀수', speak: '둘씩 짝을 지어 보세요. 짝수일까요, 홀수일까요?', hint: `모두 ${n}개예요. 둘씩 짝을 지으면 ${n % 2 === 0 ? '남는 것이 없어서 짝수' : '하나가 남아서 홀수'}예요.` }); }),
    ...times(1, () => { const s = R(5, 20) * 2; const items = [s, s + 2, s + 4, s + 6]; return Q('순서대로 놓기', { type: 'order', prompt: '짝수를 작은 수부터 순서대로 눌러요.', items, answer: items.slice(), orderLabel: '작은 수 → 큰 수', hint: `순서대로 놓으면 ${items.join(', ')}이에요.` }); }),
  ];

  // ======================================================
  // 2단원 덧셈과 뺄셈(1)  - 받아올림·받아내림 없음
  // ======================================================
  function addPair() {
    const kind = pick(['tt+o', 't+t', 'tt+tt']);
    if (kind === 'tt+o') { const a = R(1, 9) * 10 + R(1, 8); const b = R(1, 9 - a % 10); return Math.random() < 0.5 ? [a, b] : [b, a]; }
    if (kind === 't+t') { const a = R(1, 8) * 10; const b = R(1, 9 - a / 10) * 10; return [a, b]; }
    const t1 = R(1, 8), t2 = R(1, 9 - t1), o1 = R(0, 8), o2 = R(0, 9 - o1);
    if (o1 + o2 === 0) return [t1 * 10 + 1, t2 * 10 + 2];
    return [t1 * 10 + o1, t2 * 10 + o2];
  }
  function subPair() {
    const kind = pick(['tt-o', 't-t', 'tt-t', 'tt-tt']);
    if (kind === 'tt-o') { const a = R(1, 9) * 10 + R(2, 9); return [a, R(1, a % 10)]; }
    if (kind === 't-t') { const a = R(2, 9) * 10; return [a, R(1, a / 10 - 1) * 10]; }
    if (kind === 'tt-t') { const a = R(2, 9) * 10 + R(1, 9); return [a, R(1, Math.floor(a / 10) - 1) * 10]; }
    const t1 = R(2, 9), o1 = R(1, 9), t2 = R(1, t1 - 1), o2 = R(0, o1);
    return [t1 * 10 + o1, t2 * 10 + o2];
  }
  const cmpSym = (x, y) => x > y ? '>' : x < y ? '<' : '=';

  const u2_add = () => [
    ...times(3, () => { const [a, b] = addPair(); return Q('가로셈', { type: 'input', prompt: '계산해 보세요.', word: `${a} + ${b} = ?`, answer: a + b, speak: `${a} 더하기 ${b}는?`, hint: `${a} + ${b} = ${a + b}` }); }),
    ...times(2, () => { const [a, b] = addPair(); return Q('세로셈', { type: 'input', prompt: '세로로 계산해 보세요.', html: vert(a, '+', b), answer: a + b, speak: `${a} 더하기 ${b}는?`, hint: `낱개끼리, 10개씩 묶음끼리 더하면 ${a + b}이에요.` }); }),
    ...times(2, () => { const [a, b] = addPair(); const first = Math.random() < 0.5; return Q('□ 구하기', { type: 'input', prompt: '□ 안에 알맞은 수는?', word: first ? `□ + ${b} = ${a + b}` : `${a} + □ = ${a + b}`, answer: first ? a : b, speak: first ? `어떤 수 더하기 ${b}는 ${a + b}. 어떤 수일까요?` : `${a} 더하기 어떤 수는 ${a + b}. 어떤 수일까요?`, hint: `${a + b}에서 ${first ? b : a}를 빼면 ${first ? a : b}이에요.` }); }),
    ...times(2, () => { const s = story(); const [a, b] = addPair(); return Q('문장제', { type: 'input', prompt: `${s.name}가 ${s.item}을 ${a}${s.unit} 모았어요. ${b}${s.unit}를 더 모으면 모두 몇 ${s.unit}일까요?`, visual: s.emoji, answer: a + b, unit: s.unit, hint: `${a} + ${b} = ${a + b}` }); }),
    ...times(2, () => { const [a, b] = addPair(); const sum = a + b; const wrongs = [[a + 1, b], [a, b + 10], [a - 1, b - 1]].filter(([x, y]) => x >= 0 && y >= 0 && x + y !== sum).map(([x, y]) => `${x} + ${y}`); return Q('식 찾기', { type: 'choice', prompt: `합이 ${sum}이 되는 식은?`, word: String(sum), options: [`${a} + ${b}`, ...wrongs].slice(0, 4), answer: `${a} + ${b}`, hint: `${a} + ${b} = ${sum}이에요.` }); }),
    ...times(2, () => { const [a, b] = addPair(); const ok = Math.random() < 0.5; const shown = ok ? a + b : a + b + pick([1, -1, 10, -10]); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '계산이 맞으면 ⭕, 틀리면 ❌를 눌러요.', statement: `${a} + ${b} = ${shown}`, answer: ok ? 'O' : 'X', speak: `${a} 더하기 ${b}는 ${shown}. 맞을까요?`, hint: `${a} + ${b} = ${a + b}이에요.` }); }),
    ...times(2, () => { const [a, b] = addPair(); const sum = a + b; const others = uniq([a + 1, b - 1, a + 10, b + 2].filter(x => x > 0 && x !== a && x !== b)).slice(0, 3); return Q('두 수 고르기', { type: 'multi', prompt: `합이 ${sum}이 되는 두 수를 골라요.`, word: `□ + □ = ${sum}`, options: shuf(uniq([a, b, ...others])), answer: uniq([a, b]), hint: `${a} + ${b} = ${sum}이에요.` }); }),
  ];

  const u2_sub = () => [
    ...times(3, () => { const [a, b] = subPair(); return Q('가로셈', { type: 'input', prompt: '계산해 보세요.', word: `${a} - ${b} = ?`, answer: a - b, speak: `${a} 빼기 ${b}는?`, hint: `${a} - ${b} = ${a - b}` }); }),
    ...times(2, () => { const [a, b] = subPair(); return Q('세로셈', { type: 'input', prompt: '세로로 계산해 보세요.', html: vert(a, '-', b), answer: a - b, speak: `${a} 빼기 ${b}는?`, hint: `낱개끼리, 10개씩 묶음끼리 빼면 ${a - b}이에요.` }); }),
    ...times(2, () => { const [a, b] = subPair(); const first = Math.random() < 0.5; return Q('□ 구하기', { type: 'input', prompt: '□ 안에 알맞은 수는?', word: first ? `□ - ${b} = ${a - b}` : `${a} - □ = ${a - b}`, answer: first ? a : b, speak: first ? `어떤 수 빼기 ${b}는 ${a - b}. 어떤 수일까요?` : `${a} 빼기 어떤 수는 ${a - b}. 어떤 수일까요?`, hint: first ? `${a - b}에 ${b}를 더하면 ${a}이에요.` : `${a}에서 ${a - b}를 빼면 ${b}이에요.` }); }),
    ...times(2, () => { const s = story(); const [a, b] = subPair(); return Q('문장제', { type: 'input', prompt: `${s.name}가 ${s.item}을 ${a}${s.unit} 가지고 있었어요. ${b}${s.unit}를 ${pick(['썼어요', '친구에게 주었어요', '잃어버렸어요'])}. 남은 것은 몇 ${s.unit}일까요?`, visual: s.emoji, answer: a - b, unit: s.unit, hint: `${a} - ${b} = ${a - b}` }); }),
    ...times(2, () => { const [a, b] = subPair(); const [c, d] = subPair(); return Q('크기 비교', { type: 'choice', keepOrder: true, prompt: '○ 안에 알맞은 것은?', word: `${a} - ${b} ○ ${c} - ${d}`, options: ['>', '<', '='], answer: cmpSym(a - b, c - d), speak: `${a} 빼기 ${b}와 ${c} 빼기 ${d}. 어느 쪽이 더 클까요?`, hint: `${a} - ${b} = ${a - b}, ${c} - ${d} = ${c - d}이에요.` }); }),
    ...times(2, () => { const [a, b] = subPair(); const ok = Math.random() < 0.5; const shown = ok ? a - b : Math.max(0, a - b + pick([1, -1, 10, -10])); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '계산이 맞으면 ⭕, 틀리면 ❌를 눌러요.', statement: `${a} - ${b} = ${shown}`, answer: ok || shown === a - b ? 'O' : 'X', speak: `${a} 빼기 ${b}는 ${shown}. 맞을까요?`, hint: `${a} - ${b} = ${a - b}이에요.` }); }),
    ...times(2, () => { const ps = [subPair(), subPair(), subPair()]; const items = uniq(ps.map(([a, b]) => `${a} - ${b}`)); const vals = {}; ps.forEach(([a, b]) => { vals[`${a} - ${b}`] = a - b; }); if (items.length < 3 || uniq(items.map(i => vals[i])).length < items.length) { const it = ['50 - 20', '47 - 5', '89 - 61']; return Q('순서대로 놓기', { type: 'order', prompt: '계산 결과가 작은 것부터 순서대로 눌러요.', items: it, answer: ['50 - 20', '89 - 61', '47 - 5'], orderLabel: '작은 것 → 큰 것', hint: '30, 28, 42니까 28, 30, 42 순서예요.' }); } const answer = items.slice().sort((x, y) => vals[x] - vals[y]); return Q('순서대로 놓기', { type: 'order', prompt: '계산 결과가 작은 것부터 순서대로 눌러요.', items, answer, orderLabel: '작은 것 → 큰 것', hint: `계산하면 ${answer.map(i => vals[i]).join(', ')} 순서예요.` }); }),
  ];

  const u2_mix = () => [
    ...times(2, () => { const [a, b] = addPair(); const sum = a + b; const first = Math.random() < 0.5; return Q('덧셈식과 뺄셈식', { type: 'input', prompt: '덧셈식을 보고 뺄셈식을 완성해요.', html: `<div class="seq"><span>${a} + ${b} = ${sum}</span></div><div class="seq"><span>${sum} - ${first ? a : b} = <b class="q">?</b></span></div>`, answer: first ? b : a, speak: `${a} 더하기 ${b}는 ${sum}. 그러면 ${sum} 빼기 ${first ? a : b}는?`, hint: `${sum} - ${first ? a : b} = ${first ? b : a}이에요.` }); }),
    ...times(2, () => { const [a, b] = addPair(); const t1 = Math.floor(a / 10), o1 = a % 10, t2 = Math.floor(b / 10), o2 = b % 10; return Q('그림 보고 식 만들기', { type: 'choice', prompt: '그림에 알맞은 덧셈식은?', html: `<div class="two-pics"><div>${svgBlocks(t1, o1)}</div><div class="plus">+</div><div>${svgBlocks(t2, o2)}</div></div>`, options: [`${a} + ${b} = ${a + b}`, `${a} + ${b + 1} = ${a + b + 1}`, `${a + 10} + ${b} = ${a + b + 10}`, a - b > 0 ? `${a} - ${b} = ${a - b}` : `${b} - ${a} = ${b - a}`], answer: `${a} + ${b} = ${a + b}`, speak: '그림에 알맞은 덧셈식은 무엇일까요?', hint: `${a}개와 ${b}개를 더하면 ${a + b}개예요.` }); }),
    ...times(2, () => { const s = story(); const add = Math.random() < 0.5; const [a, b] = add ? addPair() : subPair(); const prompt = add ? `${s.item}이 ${a}${s.unit} 있는데 ${b}${s.unit}를 더 얻었어요. 모두 몇 ${s.unit}인지 구하는 식은?` : `${s.item}이 ${a}${s.unit} 있는데 ${b}${s.unit}를 썼어요. 남은 ${s.item}을 구하는 식은?`; return Q('알맞은 식 고르기', { type: 'choice', prompt, visual: s.emoji, options: [`${a} + ${b}`, `${a} - ${b}`, `${b} - ${a}`, `${a} + ${a}`], answer: add ? `${a} + ${b}` : `${a} - ${b}`, hint: add ? `더 얻었으니까 더하기! ${a} + ${b}예요.` : `썼으니까 빼기! ${a} - ${b}예요.` }); }),
    ...times(2, () => { const [a, b] = addPair(); const [c, d] = subPair(); return Q('크기 비교', { type: 'choice', keepOrder: true, prompt: '○ 안에 알맞은 것은?', word: `${a} + ${b} ○ ${c} - ${d}`, options: ['>', '<', '='], answer: cmpSym(a + b, c - d), speak: `${a} 더하기 ${b}와 ${c} 빼기 ${d}. 어느 쪽이 더 클까요?`, hint: `${a} + ${b} = ${a + b}, ${c} - ${d} = ${c - d}이에요.` }); }),
    ...times(2, () => { const [a, b] = addPair(); const ok = Math.random() < 0.5; const shown = ok ? `${a + b} - ${b} = ${a}` : `${a + b} - ${b} = ${a + pick([1, 10, -1])}`; return Q('맞아요? 아니에요?', { type: 'ox', prompt: '맞으면 ⭕, 틀리면 ❌를 눌러요.', statement: `${a} + ${b} = ${a + b}이면  ${shown}`, answer: ok ? 'O' : 'X', speak: `${a} 더하기 ${b}는 ${a + b}이면, ${shown.replace('-', ' 빼기 ').replace('=', '는 ')}. 맞을까요?`, hint: `${a + b} - ${b} = ${a}이에요.` }); }),
    ...times(2, () => { const [a, b] = addPair(); const sum = a + b; const items = shuf(uniq([`${a} + ${b}`, `${sum} - ${a}`, `${sum} - ${b}`, `${b} + ${a}`])); const vals = { [`${a} + ${b}`]: sum, [`${b} + ${a}`]: sum, [`${sum} - ${a}`]: b, [`${sum} - ${b}`]: a }; const answer = items.filter(i => vals[i] === sum); return Q('모두 고르기', { type: 'multi', prompt: `계산 결과가 ${sum}인 식을 모두 골라요.`, word: String(sum), options: items, answer, hint: `${a} + ${b}와 ${b} + ${a}가 ${sum}이에요.` }); }),
  ];

  // ======================================================
  // 3단원 모양과 시각
  // ======================================================
  const SHAPE_THINGS = {
    '네모': [['📕', '책'], ['📱', '휴대폰'], ['🚪', '문'], ['🧱', '벽돌'], ['🖼️', '액자'], ['🪟', '창문'], ['📦', '상자 옆면'], ['🎁', '선물 상자 옆면']],
    '세모': [['🍕', '피자 조각'], ['🔺', '삼각형 표지판'], ['⛺', '텐트'], ['🍙', '주먹밥'], ['📐', '삼각자'], ['🎄', '트리 모양']],
    '동그라미': [['⚽', '축구공'], ['🍪', '쿠키'], ['⏰', '시계'], ['🪙', '동전'], ['🍩', '도넛'], ['🌕', '보름달'], ['🍕', '피자 한 판'], ['🎯', '과녁']],
  };
  const SHAPES = ['네모', '세모', '동그라미'];
  const u3_shape = () => [
    ...times(3, () => { const k = pick(SHAPES); const [e, name] = pick(SHAPE_THINGS[k]); return Q('물건의 모양', { type: 'choice', keepOrder: true, prompt: `${name}은(는) 어떤 모양일까요?`, visual: e, options: SHAPES, optionSvg: SHAPE_ICON, answer: k, hint: `${name}은(는) ${k} 모양이에요.` }); }),
    ...times(2, () => { const counts = { sq: R(1, 5), tri: R(1, 5), cir: R(1, 5) }; const k = pick(['sq', 'tri', 'cir']); const name = { sq: '네모', tri: '세모', cir: '동그라미' }[k]; return Q('모양 세기', { type: 'input', prompt: `${name} 모양은 몇 개일까요?`, svg: svgShapes(counts), answer: counts[k], unit: '개', hint: `${name} 모양은 ${counts[k]}개예요.` }); }),
    ...times(2, () => { const d = pick([['뾰족한 곳이 4군데 있고, 곧은 선으로 되어 있어요.', '네모'], ['뾰족한 곳이 3군데 있고, 곧은 선으로 되어 있어요.', '세모'], ['뾰족한 곳이 없고, 둥글어요.', '동그라미'], ['굴러갈 수 있고 뾰족한 곳이 없어요.', '동그라미'], ['곧은 선 4개로 둘러싸여 있어요.', '네모'], ['곧은 선 3개로 둘러싸여 있어요.', '세모']]); return Q('설명 듣고 찾기', { type: 'choice', keepOrder: true, prompt: '어떤 모양을 설명한 것일까요?', statement: d[0], options: SHAPES, optionSvg: SHAPE_ICON, answer: d[1], speak: d[0] + ' 어떤 모양일까요?', hint: `${d[1]} 모양이에요.` }); }),
    ...times(2, () => { const k = pick(SHAPES); const yes = shuf(SHAPE_THINGS[k]).slice(0, R(2, 3)); const others = SHAPES.filter(s => s !== k).flatMap(s => SHAPE_THINGS[s].filter(t => t[0] !== '🍕')); const no = shuf(others).slice(0, 6 - yes.length); const all = shuf([...yes, ...no]); const em = {}; all.forEach(([e, n]) => { em[n] = e; }); return Q('모두 고르기', { type: 'multi', prompt: `${k} 모양인 것을 모두 골라요.`, svg: SHAPE_ICON[k].replace('width:44px;height:44px', 'width:70px;height:70px'), options: all.map(t => t[1]), optionEmoji: em, answer: yes.map(t => t[1]), hint: `${k} 모양은 ${yes.map(t => t[1]).join(', ')}이에요.` }); }),
    ...times(2, () => { const k = pick(SHAPES); const [e, name] = pick(SHAPE_THINGS[k].filter(t => t[0] !== '🍕')); const say = Math.random() < 0.5 ? k : pick(SHAPES.filter(s => s !== k)); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '맞으면 ⭕, 틀리면 ❌를 눌러요.', visual: e, statement: `${name}은(는) ${say} 모양이에요.`, answer: say === k ? 'O' : 'X', hint: `${name}은(는) ${k} 모양이에요.` }); }),
    ...times(2, () => { const k = pick(['네모', '세모']); const n = k === '네모' ? 4 : 3; return Q('뾰족한 곳 세기', { type: 'input', prompt: `${k} 모양은 뾰족한 곳이 몇 군데일까요?`, svg: SHAPE_ICON[k].replace('width:44px;height:44px', 'width:90px;height:90px'), answer: n, unit: '군데', hint: `${k}는 뾰족한 곳이 ${n}군데예요.` }); }),
  ];

  const timeLabel = (hh, mm) => `${hh}시${mm ? ' 30분' : ''}`;
  const randTime = () => [R(1, 12), pick([0, 0, 30])];
  const u3_clock = () => [
    ...times(3, () => { const [hh, mm] = randTime(); const ans = timeLabel(hh, mm); const wrong = uniq([timeLabel(hh, mm ? 0 : 30), timeLabel(hh % 12 + 1, mm), timeLabel((hh + 10) % 12 + 1, mm), timeLabel(mm ? (hh % 12) + 1 : (hh + 5) % 12 + 1, mm ? 0 : 30)].filter(x => x !== ans)).slice(0, 3); return Q('시계 읽기', { type: 'choice', prompt: '시계가 나타내는 시각은?', svg: svgClock(hh, mm), options: [ans, ...wrong], answer: ans, speak: '시계가 나타내는 시각은 몇 시일까요?', hint: `짧은바늘이 ${mm ? hh + '과 ' + (hh % 12 + 1) + ' 사이' : hh}, 긴바늘이 ${mm ? 6 : 12}을 가리키니까 ${ans}이에요.` }); }),
    ...times(2, () => { const [hh, mm] = randTime(); const ans = timeLabel(hh, mm); const cands = [[hh, mm ? 0 : 30], [hh % 12 + 1, mm], [(hh + 5) % 12 + 1, mm]]; const svgs = {}; svgs[ans] = svgClock(hh, mm, 110); const options = [ans]; cands.forEach(([h2, m2]) => { const l = timeLabel(h2, m2); if (!svgs[l]) { svgs[l] = svgClock(h2, m2, 110); options.push(l); } }); return Q('시계 찾기', { type: 'choice', prompt: `${ans}를 나타내는 시계는?`, word: ans, options, optionSvg: svgs, optionHideLabel: true, answer: ans, speak: `${ans}를 나타내는 시계는 어느 것일까요?`, hint: `${ans}는 짧은바늘이 ${mm ? hh + '과 ' + (hh % 12 + 1) + ' 사이' : hh}, 긴바늘이 ${mm ? 6 : 12}을 가리켜요.` }); }),
    ...times(2, () => { const [hh, mm] = randTime(); const ok = Math.random() < 0.5; const [sh, sm] = ok ? [hh, mm] : pick([[hh, mm ? 0 : 30], [hh % 12 + 1, mm]]); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '맞으면 ⭕, 틀리면 ❌를 눌러요.', svg: svgClock(hh, mm, 130), statement: `이 시계는 ${timeLabel(sh, sm)}를 나타내요.`, answer: ok ? 'O' : 'X', speak: `이 시계는 ${timeLabel(sh, sm)}를 나타내요. 맞을까요?`, hint: `이 시계는 ${timeLabel(hh, mm)}예요.` }); }),
    ...times(2, () => { const hs = shuf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 3).sort((a, b) => a - b); const ts = hs.map(hh => [hh, pick([0, 30])]); const labels = ts.map(([hh, mm]) => timeLabel(hh, mm)); const svgs = {}; ts.forEach(([hh, mm], i) => { svgs[labels[i]] = svgClock(hh, mm, 100); }); return Q('순서대로 놓기', { type: 'order', prompt: '아침부터 이른 시각 순서대로 시계를 눌러요.', items: labels, itemSvg: svgs, answer: labels.slice(), orderLabel: '이른 시각 → 늦은 시각', hint: `${labels.join(', ')} 순서예요.` }); }),
    ...times(2, () => { const [hh, mm] = randTime(); const desc = mm ? `짧은바늘은 ${hh}과 ${hh % 12 + 1} 사이, 긴바늘은 6을 가리켜요.` : `짧은바늘은 ${hh}, 긴바늘은 12를 가리켜요.`; const ans = timeLabel(hh, mm); const wrong = uniq([timeLabel(hh, mm ? 0 : 30), timeLabel(hh % 12 + 1, mm), timeLabel(mm ? hh % 12 + 1 : (hh + 2) % 12 + 1, mm ? 30 : 0)].filter(x => x !== ans)).slice(0, 3); return Q('바늘 설명 듣기', { type: 'choice', prompt: '몇 시일까요?', visual: '🕰️', statement: desc, options: [ans, ...wrong], answer: ans, speak: desc + ' 몇 시일까요?', hint: `${ans}예요.` }); }),
    ...times(2, () => { const qa = pick([['긴바늘이 12를 가리키면 몇 분일까요?', '0분', ['30분', '12분', '6분']], ['긴바늘이 6을 가리키면 몇 분일까요?', '30분', ['0분', '6분', '12분']], ['시계에서 짧은바늘은 무엇을 나타낼까요?', '시', ['분', '초', '요일']], ['시계에서 긴바늘은 무엇을 나타낼까요?', '분', ['시', '초', '날짜']], ['"몇 시 30분"일 때 긴바늘은 어디를 가리킬까요?', '6', ['12', '3', '9']]]); return Q('시계 상식', { type: 'choice', prompt: qa[0], visual: '⏰', options: [qa[1], ...qa[2]], answer: qa[1], hint: `정답은 ${qa[1]}이에요.` }); }),
    ...times(2, () => { const hh = R(1, 12); return Q('몇 시 쓰기', { type: 'input', prompt: '시계가 나타내는 시각은 몇 시일까요?', svg: svgClock(hh, 0), answer: hh, unit: '시', speak: '시계가 나타내는 시각은 몇 시일까요? 숫자로 써요.', hint: `짧은바늘이 ${hh}, 긴바늘이 12를 가리키니까 ${hh}시예요.` }); }),
  ];

  // ======================================================
  // 4단원 덧셈과 뺄셈(2) - 세 수의 계산, 10이 되는 더하기, 10에서 빼기
  // ======================================================
  function three_add() { const a = R(1, 5), b = R(1, 9 - a - 1), c = R(1, 9 - a - b); return [a, b, c]; }
  function three_sub() { const a = R(6, 9), b = R(1, a - 2), c = R(1, a - b - 1); return [a, b, c]; }
  const u4_three = () => [
    ...times(3, () => { const [a, b, c] = three_add(); return Q('세 수의 덧셈', { type: 'input', prompt: '계산해 보세요.', word: `${a} + ${b} + ${c} = ?`, answer: a + b + c, speak: `${a} 더하기 ${b} 더하기 ${c}는?`, hint: `앞에서부터 차례로! ${a} + ${b} = ${a + b}, ${a + b} + ${c} = ${a + b + c}` }); }),
    ...times(3, () => { const [a, b, c] = three_sub(); return Q('세 수의 뺄셈', { type: 'input', prompt: '계산해 보세요.', word: `${a} - ${b} - ${c} = ?`, answer: a - b - c, speak: `${a} 빼기 ${b} 빼기 ${c}는?`, hint: `앞에서부터 차례로! ${a} - ${b} = ${a - b}, ${a - b} - ${c} = ${a - b - c}` }); }),
    ...times(2, () => { const s = story(); const add = Math.random() < 0.5; if (add) { const [a, b, c] = three_add(); return Q('문장제', { type: 'input', prompt: `${s.item}을 ${a}${s.unit}, ${b}${s.unit}, ${c}${s.unit} 모았어요. 모두 몇 ${s.unit}일까요?`, visual: s.emoji, answer: a + b + c, unit: s.unit, hint: `${a} + ${b} + ${c} = ${a + b + c}` }); } const [a, b, c] = three_sub(); return Q('문장제', { type: 'input', prompt: `${s.item} ${a}${s.unit} 중에서 ${b}${s.unit}를 쓰고, 또 ${c}${s.unit}를 썼어요. 남은 것은 몇 ${s.unit}일까요?`, visual: s.emoji, answer: a - b - c, unit: s.unit, hint: `${a} - ${b} - ${c} = ${a - b - c}` }); }),
    ...times(2, () => { const [a, b, c] = three_add(); const pics = [a, b, c].map(n => svgTenFrame(n, pick(['#4d96ff', '#ff6b81', '#6bcb77']))); return Q('그림 보고 식 만들기', { type: 'choice', prompt: '그림에 알맞은 식은?', html: `<div class="three-pics">${pics.map(p => `<div>${p}</div>`).join('<div class="plus">+</div>')}</div>`, options: [`${a} + ${b} + ${c} = ${a + b + c}`, `${a} + ${b} + ${c} = ${a + b + c + 1}`, `${a} + ${b} - ${c} = ${a + b - c}`, `${a + 1} + ${b} + ${c} = ${a + b + c + 1}`], answer: `${a} + ${b} + ${c} = ${a + b + c}`, speak: '그림에 알맞은 식은 무엇일까요?', hint: `${a}개, ${b}개, ${c}개를 더하면 ${a + b + c}개예요.` }); }),
    ...times(2, () => { const add = Math.random() < 0.5; const [a, b, c] = add ? three_add() : three_sub(); const real = add ? a + b + c : a - b - c; const ok = Math.random() < 0.5; const shown = ok ? real : Math.max(0, real + pick([1, -1, 2])); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '계산이 맞으면 ⭕, 틀리면 ❌를 눌러요.', statement: `${a} ${add ? '+' : '-'} ${b} ${add ? '+' : '-'} ${c} = ${shown}`, answer: shown === real ? 'O' : 'X', speak: `${a} ${add ? '더하기' : '빼기'} ${b} ${add ? '더하기' : '빼기'} ${c}는 ${shown}. 맞을까요?`, hint: `${a} ${add ? '+' : '-'} ${b} ${add ? '+' : '-'} ${c} = ${real}이에요.` }); }),
    ...times(2, () => { const [a, b, c] = three_add(); const [d, e, f] = three_sub(); return Q('크기 비교', { type: 'choice', keepOrder: true, prompt: '○ 안에 알맞은 것은?', word: `${a} + ${b} + ${c} ○ ${d} - ${e} - ${f}`, options: ['>', '<', '='], answer: cmpSym(a + b + c, d - e - f), speak: `${a} 더하기 ${b} 더하기 ${c}와 ${d} 빼기 ${e} 빼기 ${f}. 어느 쪽이 더 클까요?`, hint: `${a + b + c}과 ${d - e - f}을 비교해요.` }); }),
    ...times(1, () => { const [a, b, c] = three_add(); const first = Math.random() < 0.5; return Q('□ 구하기', { type: 'input', prompt: '□ 안에 알맞은 수는?', word: first ? `${a} + ${b} + □ = ${a + b + c}` : `${a} + □ + ${c} = ${a + b + c}`, answer: first ? c : b, speak: '네모 안에 알맞은 수는 무엇일까요?', hint: `${a} + ${b} + ${c} = ${a + b + c}이에요.` }); }),
  ];

  const u4_ten = () => [
    ...times(3, () => { const n = R(1, 9); return Q('10이 되는 더하기', { type: 'input', prompt: '10이 되려면 몇 개 더 필요할까요?', svg: svgTenFrame(n), word: `${n} + □ = 10`, answer: 10 - n, unit: '개', speak: `${n}에 몇을 더하면 10이 될까요?`, hint: `${n} + ${10 - n} = 10이에요.` }); }),
    ...times(3, () => { const n = R(1, 9); return Q('10에서 빼기', { type: 'input', prompt: '계산해 보세요.', word: `10 - ${n} = ?`, answer: 10 - n, speak: `10 빼기 ${n}은?`, hint: `10 - ${n} = ${10 - n}` }); }),
    ...times(2, () => { const a = R(1, 9); const b = 10 - a; const others = uniq([a + 1, b + 1, a - 1, 5].filter(x => x >= 1 && x <= 9 && x !== a && x !== b)).slice(0, 3); return Q('10의 짝 찾기', { type: 'multi', prompt: '더해서 10이 되는 두 수를 골라요.', word: '□ + □ = 10', options: shuf(uniq([a, b, ...others])), answer: uniq([a, b]), hint: a === b ? `5 + 5 = 10이에요.` : `${a} + ${b} = 10이에요.` }); }),
    ...times(2, () => { const a = R(1, 9), b = 10 - a, c = R(1, 9); const options = uniq([10 + c, 10 + c + 1, 10 + c - 1, a + c]).filter(x => x >= 0); return Q('10을 만들어 더하기', { type: 'choice', prompt: '10을 먼저 만들어 계산해 보세요.', word: `${a} + ${b} + ${c} = ?`, options: options.slice(0, 4), answer: 10 + c, speak: `${a} 더하기 ${b} 더하기 ${c}는?`, hint: `${a} + ${b} = 10, 10 + ${c} = ${10 + c}이에요.` }); }),
    ...times(2, () => { const s = story(); const n = R(1, 9); const add = Math.random() < 0.5; return add ? Q('문장제', { type: 'input', prompt: `${s.item}이 ${n}${s.unit} 있어요. 10${s.unit}가 되려면 몇 ${s.unit} 더 있어야 할까요?`, visual: s.emoji, answer: 10 - n, unit: s.unit, hint: `${n} + ${10 - n} = 10이에요.` }) : Q('문장제', { type: 'input', prompt: `${s.item}이 10${s.unit} 있었는데 ${n}${s.unit}를 썼어요. 남은 것은 몇 ${s.unit}일까요?`, visual: s.emoji, answer: 10 - n, unit: s.unit, hint: `10 - ${n} = ${10 - n}이에요.` }); }),
    ...times(2, () => { const pairs = shuf([[1, 9], [2, 8], [3, 7], [4, 6], [5, 5], [6, 4], [7, 3], [8, 2], [9, 1]]).slice(0, 3); const good = pairs.map(([a, b]) => `${a} + ${b}`); const bad = shuf([[2, 7], [3, 6], [4, 5], [5, 6], [8, 3], [1, 8]]).slice(0, 3).map(([a, b]) => `${a} + ${b}`); return Q('모두 고르기', { type: 'multi', prompt: '합이 10이 되는 식을 모두 골라요.', word: '10', options: shuf([...good, ...bad]), answer: good, hint: `${good.join(', ')}이 10이에요.` }); }),
    ...times(2, () => { const n = R(1, 9); const ok = Math.random() < 0.5; const shown = ok ? 10 - n : Math.max(0, 10 - n + pick([1, -1])); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '계산이 맞으면 ⭕, 틀리면 ❌를 눌러요.', statement: `${n} + ${shown} = 10`, answer: shown === 10 - n ? 'O' : 'X', speak: `${n} 더하기 ${shown}은 10. 맞을까요?`, hint: `${n} + ${10 - n} = 10이에요.` }); }),
  ];

  // ======================================================
  // 5단원 규칙 찾기
  // ======================================================
  function makePattern() {
    const [b1, b2, b3] = shuf(BLOCKS).slice(0, 3);
    const kind = pick(['AB', 'AAB', 'ABB', 'ABC', 'AABB']);
    const unit = { AB: [b1, b2], AAB: [b1, b1, b2], ABB: [b1, b2, b2], ABC: [b1, b2, b3], AABB: [b1, b1, b2, b2] }[kind];
    const len = unit.length * 3;
    const seq = times(len, (_, i) => unit[i % unit.length]);
    return { unit, seq, kind, blocks: [b1, b2, b3] };
  }
  const em = arr => arr.map(b => b[0]).join(' ');
  const u5_shape = () => [
    ...times(3, () => { const p = makePattern(); const shown = p.seq.slice(0, p.seq.length - 1); const ans = p.seq[p.seq.length - 1]; const options = uniq([ans[0], ...p.blocks.map(b => b[0])]).slice(0, 3); const names = {}; p.blocks.forEach(b => { names[b[0]] = b[1]; }); return Q('다음 블록', { type: 'choice', prompt: '규칙을 찾아 다음에 올 블록을 골라요.', html: `<div class="pattern">${em(shown)} <span class="q">?</span></div>`, options, answer: ans[0], speak: '규칙을 찾아 다음에 올 블록을 골라요.', hint: `${p.unit.map(b => b[1]).join(', ')}가 반복돼요. 다음은 ${ans[1]}이에요.` }); }),
    ...times(2, () => { const p = makePattern(); const bi = R(2, p.seq.length - 3); const ans = p.seq[bi]; const shown = p.seq.map((b, i) => i === bi ? '<span class="q">?</span>' : b[0]).join(' '); return Q('가운데 빈칸', { type: 'choice', prompt: '규칙을 찾아 빈칸에 알맞은 블록을 골라요.', html: `<div class="pattern">${shown}</div>`, options: uniq([ans[0], ...p.blocks.map(b => b[0])]).slice(0, 3), answer: ans[0], speak: '규칙을 찾아 빈칸에 알맞은 블록을 골라요.', hint: `${p.unit.map(b => b[1]).join(', ')}가 반복돼요. 빈칸은 ${ans[1]}이에요.` }); }),
    ...times(2, () => { const p = makePattern(); const ok = Math.random() < 0.5; let seq = p.seq.slice(); if (!ok) { const i = R(1, seq.length - 2); const other = p.blocks.find(b => b[0] !== seq[i][0]); seq[i] = other; } return Q('규칙이 맞나요?', { type: 'ox', prompt: '규칙에 맞게 놓았으면 ⭕, 아니면 ❌를 눌러요.', html: `<div class="pattern">${em(seq)}</div>`, statement: `"${p.unit.map(b => b[1]).join(', ')}"이 반복되는 규칙이에요.`, answer: ok ? 'O' : 'X', speak: `${p.unit.map(b => b[1]).join(', ')}이 반복되는 규칙이 맞을까요?`, hint: ok ? '규칙에 맞게 잘 놓았어요.' : '중간에 규칙이 깨진 곳이 있어요.' }); }),
    ...times(2, () => { const p = makePattern(); const ans = p.unit.map(b => b[1]).join(', ') + ' 반복'; const wrongs = uniq([shuf(p.unit).map(b => b[1]).join(', ') + ' 반복', p.blocks.slice(0, 2).reverse().map(b => b[1]).join(', ') + ' 반복', [p.blocks[0], p.blocks[2] || p.blocks[1]].map(b => b[1]).join(', ') + ' 반복'].filter(x => x !== ans)).slice(0, 3); return Q('규칙 말하기', { type: 'choice', prompt: '어떤 규칙일까요?', html: `<div class="pattern">${em(p.seq)}</div>`, options: [ans, ...wrongs], answer: ans, speak: '어떤 규칙일까요?', hint: `${ans}이에요.` }); }),
    ...times(2, () => { const p = makePattern(); const shown = p.seq.slice(0, p.seq.length - 2); const two = p.seq.slice(-2).map(b => b[0]).join(' '); const alts = uniq([two, p.seq.slice(-2).map(b => b[0]).reverse().join(' '), `${p.blocks[2][0]} ${p.blocks[0][0]}`, `${p.blocks[0][0]} ${p.blocks[0][0]}`].filter(Boolean)).slice(0, 4); if (!alts.includes(two)) alts[0] = two; return Q('다음 두 개', { type: 'choice', prompt: '다음에 올 블록 두 개를 순서대로 고른 것은?', html: `<div class="pattern">${em(shown)} <span class="q">?</span> <span class="q">?</span></div>`, options: alts, answer: two, speak: '다음에 올 블록 두 개를 순서대로 고른 것은 무엇일까요?', hint: `${p.unit.map(b => b[1]).join(', ')}가 반복되니까 ${two}예요.` }); }),
    ...times(2, () => { const p = makePattern(); const u = p.unit; const items = times(u.length * 2, (_, i) => u[i % u.length][0]); const labeled = items.map((e, i) => `${e}`); const uniqItems = uniq(labeled); if (uniqItems.length < 2) return Q('다음 블록', { type: 'choice', prompt: '규칙을 찾아 다음에 올 블록을 골라요.', html: `<div class="pattern">🟩 🟫 🟩 🟫 🟩 <span class="q">?</span></div>`, options: ['🟫', '🟩', '⬜'], answer: '🟫', hint: '잔디, 흙이 반복돼요. 다음은 흙이에요.' }); const first = u[0][0]; const rule = `${u.map(b => b[1]).join(', ')}`; return Q('규칙 만들기', { type: 'choice', prompt: `"${rule}"이 반복되는 규칙으로 바르게 놓은 것은?`, visual: '🧱', options: uniq([em(p.seq.slice(0, u.length * 2)), em(shuf(p.seq.slice(0, u.length * 2))), em([...p.seq.slice(0, u.length * 2)].reverse()), em(p.seq.slice(0, u.length * 2).map((b, i) => i === 1 ? p.blocks[2] : b))]).slice(0, 4), answer: em(p.seq.slice(0, u.length * 2)), speak: `${rule}이 반복되는 규칙으로 바르게 놓은 것은 무엇일까요?`, hint: `${rule} 순서로 계속 반복되어야 해요.` }); }),
  ];

  function numRule() {
    const step = pick([1, 2, 5, 10, 2, 5, 10]);
    const up = Math.random() < 0.7;
    const start = up ? R(1, 40) : R(50, 99);
    const seq = times(5, (_, i) => up ? start + step * i : start - step * i);
    return { step, up, seq, desc: `${step}씩 ${up ? '커져요' : '작아져요'}` };
  }
  const u5_num = () => [
    ...times(3, () => { const r = numRule(); return Q('다음 수', { type: 'input', prompt: '규칙을 찾아 다음 수를 써요.', html: seqHtml([...r.seq.slice(0, 4), '?']), answer: r.seq[4], speak: '규칙을 찾아 다음 수를 써요.', hint: `${r.desc}. 다음 수는 ${r.seq[4]}이에요.` }); }),
    ...times(2, () => { const r = numRule(); const wrongs = uniq([`${r.step}씩 ${r.up ? '작아져요' : '커져요'}`, `${r.step === 1 ? 2 : 1}씩 ${r.up ? '커져요' : '작아져요'}`, `${r.step === 10 ? 5 : 10}씩 ${r.up ? '커져요' : '작아져요'}`].filter(x => x !== r.desc)).slice(0, 3); return Q('규칙 말하기', { type: 'choice', prompt: '어떤 규칙일까요?', html: seqHtml(r.seq), options: [r.desc, ...wrongs], answer: r.desc, speak: '수가 어떤 규칙으로 놓여 있을까요?', hint: `${r.seq[0]}, ${r.seq[1]}, ${r.seq[2]}... ${r.desc}.` }); }),
    ...times(2, () => { const start = pick([1, 11, 21, 31, 41, 51, 61, 71]); const blank = start + R(0, 19); return Q('수 배열표', { type: 'input', prompt: '수 배열표에서 ? 에 알맞은 수는?', svg: svgGrid(start, 10, 2, blank), answer: blank, speak: '수 배열표에서 물음표에 알맞은 수는 무엇일까요?', hint: `오른쪽으로 1씩, 아래로 10씩 커져요. ${blank}이에요.` }); }),
    ...times(2, () => { const r = numRule(); const shown = [r.seq[0], r.seq[1], '?', r.seq[3], '?']; const ans = `${r.seq[2]}, ${r.seq[4]}`; const wrongs = uniq([`${r.seq[2] + 1}, ${r.seq[4] + 1}`, `${r.seq[2]}, ${r.seq[4] + r.step}`, `${r.seq[1]}, ${r.seq[3]}`]).slice(0, 3); return Q('빈칸 두 개', { type: 'choice', prompt: '빈칸 두 개에 알맞은 수를 순서대로 고른 것은?', html: seqHtml(shown), options: [ans, ...wrongs], answer: ans, speak: '빈칸 두 개에 알맞은 수는 무엇일까요?', hint: `${r.desc}. ${ans}이에요.` }); }),
    ...times(2, () => { const r = numRule(); const ok = Math.random() < 0.5; const seq = r.seq.slice(); if (!ok) seq[3] += pick([1, -1, r.step]); return Q('규칙이 맞나요?', { type: 'ox', prompt: '규칙에 맞으면 ⭕, 아니면 ❌를 눌러요.', html: seqHtml(seq), statement: `"${r.desc}" 규칙이에요.`, answer: ok ? 'O' : 'X', speak: `${r.desc} 규칙이 맞을까요?`, hint: ok ? `${r.desc}. 규칙에 잘 맞아요.` : '중간에 규칙이 깨진 수가 있어요.' }); }),
    ...times(2, () => { const r = numRule(); const items = r.seq.slice(0, 4); return Q('규칙대로 놓기', { type: 'order', prompt: `"${r.desc}" 규칙에 맞게 순서대로 눌러요.`, items, answer: items.slice(), orderLabel: r.desc, hint: `${items.join(', ')} 순서예요.` }); }),
  ];

  // ======================================================
  // 6단원 덧셈과 뺄셈(3) - 받아올림·받아내림 (한 자리 수끼리 / 십몇 - 몇)
  // ======================================================
  function carryPair() { const a = R(2, 9); const b = R(10 - a + 1 > 9 ? 9 : 11 - a, 9); return [a, Math.min(b, 9)]; }
  function borrowPair() { const a = R(11, 18); const b = R(a - 9, 9); return [a, b]; }
  const u6_add = () => [
    ...times(3, () => { const [a, b] = carryPair(); return Q('가로셈', { type: 'input', prompt: '계산해 보세요.', word: `${a} + ${b} = ?`, answer: a + b, speak: `${a} 더하기 ${b}는?`, hint: `${a} + ${b} = ${a + b}` }); }),
    ...times(2, () => { const [a, b] = carryPair(); const need = 10 - a; return Q('10 만들어 더하기', { type: 'input', prompt: `${b}를 가르기 하여 10을 먼저 만들어요. □에 알맞은 수는?`, html: `<div class="seq"><span>${a} + ${b}</span><span>=</span><span>${a} + ${need} + <b class="q">□</b></span></div>`, answer: b - need, speak: `${a} 더하기 ${b}는 ${a} 더하기 ${need} 더하기 얼마일까요?`, hint: `${b}를 ${need}과 ${b - need}로 가르면 ${a} + ${need} = 10, 10 + ${b - need} = ${a + b}이에요.` }); }),
    ...times(2, () => { const [a, b] = carryPair(); return Q('세로셈', { type: 'input', prompt: '세로로 계산해 보세요.', html: vert(a, '+', b), answer: a + b, speak: `${a} 더하기 ${b}는?`, hint: `낱개 ${a} + ${b} = ${a + b}. 10을 넘으니까 10개씩 묶음이 1개 생겨요.` }); }),
    ...times(2, () => { const s = story(); const [a, b] = carryPair(); return Q('문장제', { type: 'input', prompt: `${s.name}가 ${s.item}을 ${a}${s.unit} 캤어요. ${b}${s.unit}를 더 캤어요. 모두 몇 ${s.unit}일까요?`, visual: s.emoji, answer: a + b, unit: s.unit, hint: `${a} + ${b} = ${a + b}` }); }),
    ...times(2, () => { const sum = R(11, 17); const good = []; for (let a = sum - 9; a <= 9; a++) good.push(`${a} + ${sum - a}`); const goodPick = shuf(good).slice(0, 3); const bad = shuf([`${sum - 10} + 9`, `${sum - 8} + 7`, `${Math.min(9, sum - 3)} + ${sum - Math.min(9, sum - 3) + 1}`, `${sum - 9} + 8`].filter(e => { const [x, y] = e.split(' + ').map(Number); return x + y !== sum && x >= 1 && y >= 1 && x <= 9 && y <= 9; })).slice(0, 3); return Q('모두 고르기', { type: 'multi', prompt: `합이 ${sum}인 식을 모두 골라요.`, word: String(sum), options: shuf(uniq([...goodPick, ...bad])), answer: goodPick, hint: `${goodPick.join(', ')}이 ${sum}이에요.` }); }),
    ...times(2, () => { const [a, b] = carryPair(); const [c, d] = carryPair(); return Q('크기 비교', { type: 'choice', keepOrder: true, prompt: '○ 안에 알맞은 것은?', word: `${a} + ${b} ○ ${c} + ${d}`, options: ['>', '<', '='], answer: cmpSym(a + b, c + d), speak: `${a} 더하기 ${b}와 ${c} 더하기 ${d}. 어느 쪽이 더 클까요?`, hint: `${a + b}과 ${c + d}을 비교해요.` }); }),
    ...times(2, () => { const [a, b] = carryPair(); const ok = Math.random() < 0.5; const shown = ok ? a + b : a + b + pick([1, -1, 10]); return Q('맞아요? 아니에요?', { type: 'ox', prompt: '계산이 맞으면 ⭕, 틀리면 ❌를 눌러요.', statement: `${a} + ${b} = ${shown}`, answer: ok ? 'O' : 'X', speak: `${a} 더하기 ${b}는 ${shown}. 맞을까요?`, hint: `${a} + ${b} = ${a + b}이에요.` }); }),
  ];
  const u6_sub = () => [
    ...times(3, () => { const [a, b] = borrowPair(); return Q('가로셈', { type: 'input', prompt: '계산해 보세요.', word: `${a} - ${b} = ?`, answer: a - b, speak: `${a} 빼기 ${b}는?`, hint: `${a} - ${b} = ${a - b}` }); }),
    ...times(2, () => { const [a, b] = borrowPair(); const o = a - 10; return Q('10에서 빼기', { type: 'input', prompt: `${a}를 10과 ${o}으로 가르기 해요. □에 알맞은 수는?`, html: `<div class="seq"><span>${a} - ${b}</span><span>=</span><span>10 - ${b} + <b class="q">□</b></span></div>`, answer: o, speak: `${a} 빼기 ${b}는 10 빼기 ${b} 더하기 얼마일까요?`, hint: `${a}는 10과 ${o}. 10 - ${b} = ${10 - b}, ${10 - b} + ${o} = ${a - b}이에요.` }); }),
    ...times(2, () => { const [a, b] = borrowPair(); const o = a - 10; return Q('세로셈', { type: 'input', prompt: '세로로 계산해 보세요.', html: vert(a, '-', b), answer: a - b, speak: `${a} 빼기 ${b}는?`, hint: `낱개 ${o}에서 ${b}를 뺄 수 없으니 10에서 빼요. ${a} - ${b} = ${a - b}` }); }),
    ...times(2, () => { const s = story(); const [a, b] = borrowPair(); return Q('문장제', { type: 'input', prompt: `${s.item}이 ${a}${s.unit} 있었어요. ${pick(['좀비', '크리퍼', '친구'])}가 ${b}${s.unit}를 가져갔어요. 남은 것은 몇 ${s.unit}일까요?`, visual: s.emoji, answer: a - b, unit: s.unit, hint: `${a} - ${b} = ${a - b}` }); }),
    ...times(2, () => { const [a, b] = borrowPair(); const first = Math.random() < 0.5; return Q('□ 구하기', { type: 'input', prompt: '□ 안에 알맞은 수는?', word: first ? `${a} - □ = ${a - b}` : `□ - ${b} = ${a - b}`, answer: first ? b : a, speak: '네모 안에 알맞은 수는 무엇일까요?', hint: `${a} - ${b} = ${a - b}이에요.` }); }),
    ...times(2, () => { const [a, b] = borrowPair(); const [c, d] = borrowPair(); return Q('크기 비교', { type: 'choice', keepOrder: true, prompt: '○ 안에 알맞은 것은?', word: `${a} - ${b} ○ ${c} - ${d}`, options: ['>', '<', '='], answer: cmpSym(a - b, c - d), speak: `${a} 빼기 ${b}와 ${c} 빼기 ${d}. 어느 쪽이 더 클까요?`, hint: `${a - b}과 ${c - d}을 비교해요.` }); }),
    ...times(2, () => { const ps = [borrowPair(), borrowPair(), borrowPair()]; const vals = {}; ps.forEach(([a, b]) => { vals[`${a} - ${b}`] = a - b; }); const items = Object.keys(vals); if (items.length < 3 || uniq(Object.values(vals)).length < 3) return Q('순서대로 놓기', { type: 'order', prompt: '계산 결과가 작은 것부터 순서대로 눌러요.', items: ['15 - 9', '13 - 5', '17 - 8'], answer: ['15 - 9', '13 - 5', '17 - 8'], orderLabel: '작은 것 → 큰 것', hint: '6, 8, 9 순서예요.' }); const answer = items.slice().sort((x, y) => vals[x] - vals[y]); return Q('순서대로 놓기', { type: 'order', prompt: '계산 결과가 작은 것부터 순서대로 눌러요.', items, answer, orderLabel: '작은 것 → 큰 것', hint: `계산하면 ${answer.map(i => vals[i]).join(', ')} 순서예요.` }); }),
  ];

  // ======================================================
  window.STUDY_DATA.math = {
    id: 'math',
    name: '수학',
    emoji: '🔢',
    color: 'math',
    units: [
      { id: 'm1', name: '1. 100까지의 수', emoji: '💯', topics: [
        { id: 'm1-count', name: '몇십과 99까지의 수', emoji: '🧱', desc: '블록 세기 · 묶음과 낱개 · 수 읽기', build: u1_count },
        { id: 'm1-order', name: '수의 순서와 크기 비교', emoji: '📏', desc: '빈칸 · 수직선 · 크기 비교 · 순서대로', build: u1_order },
        { id: 'm1-evenodd', name: '짝수와 홀수', emoji: '👫', desc: '짝 짓기 · 모두 고르기', build: u1_evenodd },
      ] },
      { id: 'm2', name: '2. 덧셈과 뺄셈(1)', emoji: '➕', topics: [
        { id: 'm2-add', name: '받아올림이 없는 덧셈', emoji: '➕', desc: '가로셈 · 세로셈 · □ 구하기 · 문장제', build: u2_add },
        { id: 'm2-sub', name: '받아내림이 없는 뺄셈', emoji: '➖', desc: '가로셈 · 세로셈 · □ 구하기 · 문장제', build: u2_sub },
        { id: 'm2-mix', name: '덧셈과 뺄셈 섞어서', emoji: '🔀', desc: '식 만들기 · 덧셈식과 뺄셈식 · 비교', build: u2_mix },
      ] },
      { id: 'm3', name: '3. 모양과 시각', emoji: '🕒', topics: [
        { id: 'm3-shape', name: '여러 가지 모양 (□ △ ○)', emoji: '🔷', desc: '물건의 모양 · 모양 세기 · 설명 듣기', build: u3_shape },
        { id: 'm3-clock', name: '시계 보기 (몇 시, 몇 시 30분)', emoji: '⏰', desc: '시계 읽기 · 시계 찾기 · 시각 순서', build: u3_clock },
      ] },
      { id: 'm4', name: '4. 덧셈과 뺄셈(2)', emoji: '🔟', topics: [
        { id: 'm4-three', name: '세 수의 덧셈과 뺄셈', emoji: '3️⃣', desc: '세 수 계산 · 그림 보고 식 만들기 · 문장제', build: u4_three },
        { id: 'm4-ten', name: '10이 되는 더하기와 10에서 빼기', emoji: '🔟', desc: '10 만들기 · 10의 짝 · 10에서 빼기', build: u4_ten },
      ] },
      { id: 'm5', name: '5. 규칙 찾기', emoji: '🧩', topics: [
        { id: 'm5-shape', name: '블록 규칙 찾기', emoji: '🟩', desc: '다음 블록 · 빈칸 · 규칙 말하기', build: u5_shape },
        { id: 'm5-num', name: '수 규칙 찾기', emoji: '🔢', desc: '다음 수 · 수 배열표 · 규칙 말하기', build: u5_num },
      ] },
      { id: 'm6', name: '6. 덧셈과 뺄셈(3)', emoji: '💪', topics: [
        { id: 'm6-add', name: '받아올림이 있는 덧셈', emoji: '⬆️', desc: '10 만들어 더하기 · 세로셈 · 문장제', build: u6_add },
        { id: 'm6-sub', name: '받아내림이 있는 뺄셈', emoji: '⬇️', desc: '10에서 빼기 · 세로셈 · □ 구하기', build: u6_sub },
      ] },
    ],
  };
})();
