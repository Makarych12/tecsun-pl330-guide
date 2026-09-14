/* ============================================================
   TECSUN PL-330 — Простая инструкция
   Ядро: меню, навигация (главная ↔ тема/раздел), анимации
   появления, подсказка установки, регистрация service worker.
   Контент — js/topics.js, особые разделы — js/extras.js.
   ============================================================ */
(function () {
  'use strict';

  const { categories, topics, views } = window.PL330;

  // ---------------- DOM ----------------
  const $ = (id) => document.getElementById(id);
  const home = $('home');
  const detail = $('detail');
  const menu = $('menu');
  const topLink = $('topLink');
  const APP_TITLE = document.title;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------------- Главное меню ----------------
  categories.forEach((cat) => {
    const h = document.createElement('h2');
    h.className = 'cat-title';
    h.textContent = cat.title;
    menu.appendChild(h);

    const grid = document.createElement('div');
    grid.className = 'grid';
    const shown = Object.values(views).filter((v) => !v.hidden);
    const items = cat.special
      ? shown.filter((v) => !v.cat)
      : [...shown.filter((v) => v.cat === cat.id), ...topics.filter((t) => t.cat === cat.id)];
    if (cat.order) items.sort((a, b) => cat.order.indexOf(a.id) - cat.order.indexOf(b.id));
    items.forEach((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tile' + (cat.special ? ' tile-fun' : '') + (t.tileClass ? ' ' + t.tileClass : '');
      btn.dataset.topic = t.id;
      btn.innerHTML = t.thumb
        ? `<img class="thumb" src="${t.thumb}" alt="" width="240" height="180" loading="lazy"><span class="tile-txt"><span class="label">${t.title}</span><span class="sub">Винтажный немецкий приёмник, 1970 год</span></span>`
        : `<span class="icon" aria-hidden="true">${t.icon}</span><span class="label">${t.title}</span>`;
      grid.appendChild(btn);
    });
    menu.appendChild(grid);
  });

  // ---------------- Шкала на декоративном дисплее ----------------
  // 20-метровый любительский диапазон: 14.000–14.350 МГц, деление 25 кГц
  (function buildScale() {
    const g = $('ticks');
    if (!g) return;
    const ns = 'http://www.w3.org/2000/svg';
    const N = 14, stepX = 320 / N;
    for (let i = 0; i <= N; i++) {
      const x = 20 + i * stepX;
      const major = i % 4 === 0;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      line.setAttribute('y1', major ? 8 : 14); line.setAttribute('y2', 24);
      line.setAttribute('class', major ? 'tick major' : 'tick');
      g.appendChild(line);
      if (major) {
        const t = document.createElementNS(ns, 'text');
        t.setAttribute('x', x); t.setAttribute('y', 38);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('class', 'num');
        t.textContent = (14 + i * 0.025).toFixed(2);
        g.appendChild(t);
      }
    }
  })();

  // ---------------- Анимации появления ----------------
  // Элементам с классом .stg выставляем --i → CSS даёт им
  // ступенчатую задержку. Экран получает .enter-fwd / .enter-back.
  function stagger(root, selector) {
    const cap = 14;
    root.querySelectorAll(selector).forEach((n, k) => n.style.setProperty('--i', Math.min(k, cap)));
  }
  let enterTimer = 0;
  function animate(el, dir) {
    el.classList.remove('enter-fwd', 'enter-back');
    clearTimeout(enterTimer);
    if (reduceMotion.matches) return;
    void el.offsetWidth; // перезапуск анимации
    el.classList.add(dir === 'back' ? 'enter-back' : 'enter-fwd');
    // после завершения въезда снимаем класс: иначе Chrome держит
    // стартовое смещение анимации в области прокрутки страницы
    enterTimer = setTimeout(() => el.classList.remove('enter-fwd', 'enter-back'), 1600);
  }
  stagger(menu, '.tile');
  menu.querySelectorAll('.tile').forEach((t) => t.classList.add('stg'));

  // ---------------- Навигация ----------------
  // Маршрут хранится в hash (#etm, #quiz). Так работает кнопка «Назад»
  // на Android и в браузере, а прямая ссылка открывает нужную тему.
  let lastTile = null;
  let openedFromHome = false;

  function render(dir) {
    const id = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const topic = id ? topics.find((x) => x.id === id) : null;
    const view = !topic && id && views[id] ? views[id] : null;
    const item = topic || view;

    if (item) {
      const body = $('d-body');
      $('d-icon').textContent = item.icon;
      $('d-title').textContent = item.title;
      body.innerHTML = topic ? topic.body : view.render();
      if (topic) {
        body.querySelectorAll('.detail-body > p, .detail-body > .note, .detail-body li')
          .forEach((n) => n.classList.add('stg'));
      }
      stagger(body, '.stg');
      if (view && view.init) view.init(body);
      home.hidden = true;
      detail.hidden = false;
      document.title = `${item.title} — PL-330`;
      animate(detail, dir || 'fwd');
      window.scrollTo(0, 0);
      $('d-title').focus({ preventScroll: true });
    } else {
      detail.hidden = true;
      home.hidden = false;
      $('d-body').innerHTML = '';
      document.title = APP_TITLE;
      animate(home, dir || 'back');
      window.scrollTo(0, 0);
      // вернуть фокус на плитку, с которой ушли (для клавиатуры)
      if (lastTile) { lastTile.focus({ preventScroll: true }); lastTile = null; }
    }
  }

  menu.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    lastTile = tile;
    openedFromHome = true;
    location.hash = tile.dataset.topic;
  });

  document.querySelectorAll('[data-back]').forEach((b) => {
    b.addEventListener('click', () => {
      if (openedFromHome) {
        openedFromHome = false;
        history.back();
      } else {
        // пришли по прямой ссылке — записи «главная» в истории нет
        history.replaceState(null, '', location.pathname + location.search);
        render('back');
      }
    });
  });

  window.addEventListener('hashchange', () => render(location.hash ? 'fwd' : 'back'));
  render(location.hash ? 'fwd' : 'first');

  // ---------------- «Наверх» ----------------
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      topLink.classList.toggle('show', window.scrollY > 400);
      ticking = false;
    });
  }, { passive: true });
  topLink.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  // ---------------- Установка на экран телефона ----------------
  // Событие beforeinstallprompt приходит далеко не везде (iPhone,
  // Яндекс.Браузер, встроенные браузеры мессенджеров), поэтому:
  //  1) баннер показываем на любом телефоне, если приложение ещё не установлено;
  //  2) есть постоянная плитка «Поставить на экран телефона» с инструкцией
  //     под конкретный браузер (js/extras.js → views.install);
  //  3) если системный диалог доступен — даём кнопку «Установить».
  const env = window.PL330.env;
  const hint = $('installHint');
  let hintHidden = false;
  try { hintHidden = sessionStorage.getItem('pl330-hint-hidden') === '1'; } catch (e) { /* приватный режим */ }

  window.PL330.deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.PL330.deferredPrompt = e;
    document.dispatchEvent(new CustomEvent('pl330:installable'));
    renderHint();
  });
  window.addEventListener('appinstalled', () => {
    window.PL330.deferredPrompt = null;
    hint.classList.remove('show');
    hint.innerHTML = '';
    document.dispatchEvent(new CustomEvent('pl330:installed'));
  });

  window.PL330.promptInstall = async function () {
    const p = window.PL330.deferredPrompt;
    if (!p) return false;
    p.prompt();
    const { outcome } = await p.userChoice;
    window.PL330.deferredPrompt = null;
    return outcome === 'accepted';
  };

  function renderHint() {
    if (env.standalone || hintHidden) return;
    const canPrompt = !!window.PL330.deferredPrompt;
    hint.innerHTML = `
      <div class="install-head"><span aria-hidden="true">📲</span>
        <b>Эту инструкцию можно поставить на экран телефона</b></div>
      Она будет открываться одним нажатием, как обычное приложение, и работать без интернета.
      <div class="row">
        ${canPrompt
          ? '<button class="btn" type="button" data-install>Установить</button>'
          : '<button class="btn" type="button" data-howto>Как установить</button>'}
        <button class="btn secondary" type="button" data-later>Скрыть</button>
      </div>`;
    hint.classList.add('show');
    const inst = hint.querySelector('[data-install]');
    if (inst) inst.addEventListener('click', async () => { if (await window.PL330.promptInstall()) { hint.classList.remove('show'); } else renderHint(); });
    const how = hint.querySelector('[data-howto]');
    if (how) how.addEventListener('click', () => { location.hash = 'install'; });
    hint.querySelector('[data-later]').addEventListener('click', () => {
      hintHidden = true;
      hint.classList.remove('show');
      hint.innerHTML = '';
      try { sessionStorage.setItem('pl330-hint-hidden', '1'); } catch (e) { /* ignore */ }
    });
  }
  renderHint();


  // ---------------- Service Worker (офлайн) ----------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
})();
