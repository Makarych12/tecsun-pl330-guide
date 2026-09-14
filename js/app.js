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
    const items = cat.special
      ? Object.values(views)
      : topics.filter((t) => t.cat === cat.id);
    items.forEach((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tile' + (cat.special ? ' tile-fun' : '');
      btn.dataset.topic = t.id;
      btn.innerHTML = `<span class="icon" aria-hidden="true">${t.icon}</span><span class="label">${t.title}</span>`;
      grid.appendChild(btn);
    });
    menu.appendChild(grid);
  });

  // ---------------- Шкала на декоративном дисплее ----------------
  (function buildScale() {
    const g = $('ticks');
    if (!g) return;
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i <= 20; i++) {
      const x = 20 + i * 16;
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
        t.textContent = 88 + i;
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

  // ---------------- Подсказка про установку ----------------
  const hint = $('installHint');
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  let dismissed = false;
  try { dismissed = localStorage.getItem('pl330-install-dismissed') === '1'; } catch (e) { /* приватный режим */ }

  function dismissHint() {
    hint.classList.remove('show');
    hint.innerHTML = '';
    try { localStorage.setItem('pl330-install-dismissed', '1'); } catch (e) { /* ignore */ }
  }

  function showHint(html) {
    hint.innerHTML = html;
    hint.classList.add('show');
    const later = hint.querySelector('[data-later]');
    if (later) later.addEventListener('click', dismissHint);
  }

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (isStandalone || dismissed) return;
    showHint(`
      <b>Можно поставить инструкцию на экран телефона</b> — как обычное приложение.
      Тогда она будет открываться одним нажатием и работать без интернета.
      <div class="row">
        <button class="btn" type="button" data-install>Установить</button>
        <button class="btn secondary" type="button" data-later>Не сейчас</button>
      </div>`);
    hint.querySelector('[data-install]').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') dismissHint();
    });
  });
  window.addEventListener('appinstalled', dismissHint);

  if (isIOS && !isStandalone && !dismissed) {
    showHint(`
      <b>Чтобы поставить инструкцию на экран iPhone:</b><br>
      1. Внизу Safari нажмите кнопку «Поделиться» <span class="key">⎙</span>.<br>
      2. Выберите <b>«На экран «Домой»»</b>.<br>
      3. Нажмите <b>«Добавить»</b>.
      <div class="row">
        <button class="btn secondary" type="button" data-later>Понятно</button>
      </div>`);
  }

  // ---------------- Service Worker (офлайн) ----------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
})();
