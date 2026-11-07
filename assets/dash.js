/* 정적 사이트용 대시보드 런타임
   - data/*.csv 를 읽어 dash.data(id) 로 제공
   - dash.calc / dash.draw / dash.onData / dash.params 를 페이지 코드에 제공
   의존: d3 v7 (CDN) */
(function () {
  const DATASETS = {
    kr_format: 'data/kr_format.csv',
    kr_buckets: 'data/kr_buckets.csv',
    global_share: 'data/global_share.csv',
    market_year: 'data/market_year.csv',
    kr_films: 'data/kr_films.csv',
    kr_tests: 'data/kr_tests.csv',
    kr_sensitivity: 'data/kr_sensitivity.csv',
  };
  const DEFAULT_PARAMS = {year: '2026', fmt: 'd4'};

  const store = {};          // id -> {status, data, columns}
  const calcs = [];          // [{id, inputs, fn}]
  const draws = new Map();   // name -> fn
  const dataFns = [];
  let params = {...DEFAULT_PARAMS};
  let queued = false;

  Object.keys(DATASETS).forEach((id) => { store[id] = {status: 'loading', data: [], columns: []}; });

  function runCalcs() {
    calcs.forEach((c) => {
      const ins = c.inputs.map((i) => store[i]);
      if (ins.some((s) => !s || s.status !== 'ok')) { store[c.id] = {status: 'loading', data: []}; return; }
      try { store[c.id] = {status: 'ok', data: c.fn(...ins.map((s) => s.data))}; }
      catch (e) { console.error('calc', c.id, e); store[c.id] = {status: 'error', data: [], message: String(e)}; }
    });
  }

  function drawOne(name, fn) {
    document.querySelectorAll(`[data-draw="${name}"]`).forEach((el) => {
      if (el.closest('[hidden]')) return;
      try { fn(el); } catch (e) { console.error('draw', name, e); }
    });
  }
  function redrawAll() {
    queued = false;
    dataFns.forEach((f) => { try { f(); } catch (e) { console.error('onData', e); } });
    draws.forEach((fn, name) => drawOne(name, fn));
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(redrawAll); } }

  window.dash = {
    colors: ['#2F6FE4', '#F2742B', '#14A37F', '#9B59D0', '#E0B000', '#D9435E', '#3BA4C9', '#8A8F98'],
    data(id) {
      const s = store[id];
      return s ? {status: s.status, data: s.data, columns: s.columns || [], message: s.message, refreshing: false, meta: []}
               : {status: 'missing', data: [], columns: [], refreshing: false, meta: []};
    },
    calc(id, {inputs, fn}) { calcs.push({id, inputs, fn}); store[id] = {status: 'loading', data: []}; },
    draw(name, fn) {
      if (typeof fn === 'function') { draws.set(name, fn); schedule(); }
      else if (draws.has(name)) drawOne(name, draws.get(name));
    },
    onData(fn) { dataFns.push(fn); try { fn(); } catch (e) { console.error(e); } },
    params() { return {...params}; },
    setParams(p) {
      Object.entries(p).forEach(([k, v]) => { if (v == null) delete params[k]; else params[k] = v; });
      schedule();
    },
    resetParams() { params = {...DEFAULT_PARAMS}; schedule(); },
    setLink(name) { try { history.replaceState(null, '', name ? '#' + name : location.pathname); } catch (e) { /* 무시 */ } },
    refresh() {},
    loader() {},
  };

  // 데이터 읽기
  Promise.all(Object.entries(DATASETS).map(([id, url]) =>
    fetch(url).then((r) => { if (!r.ok) throw new Error(r.status + ' ' + url); return r.text(); })
      .then((text) => { const rows = d3.csvParse(text); store[id] = {status: 'ok', data: rows, columns: rows.columns}; })
      .catch((e) => { console.error(e); store[id] = {status: 'error', data: [], message: String(e)}; })
  )).then(() => { runCalcs(); schedule(); });

  // 페이지 전환(hidden 해제)과 화면 크기 변화 때 다시 그리기
  document.addEventListener('DOMContentLoaded', () => {
    new MutationObserver(schedule).observe(document.body, {attributes: true, attributeFilter: ['hidden'], subtree: true});
  });
  let w = window.innerWidth;
  window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - w) > 4) { w = window.innerWidth; schedule(); } });
})();
