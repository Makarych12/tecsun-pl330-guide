/* ============================================================
   TECSUN PL-330 — Простая инструкция
   Контент + навигация (главная ↔ тема), подсказка установки,
   регистрация service worker. Чистый JS, без зависимостей.
   ============================================================ */
(function () {
  'use strict';

  // ---------------- Контент ----------------
  const categories = [
    { id: 'start',  title: 'Начало работы' },
    { id: 'tuning', title: 'Поиск станций' },
    { id: 'memory', title: 'Память (избранное)' },
    { id: 'clock',  title: 'Часы и будильник' },
    { id: 'extra',  title: 'Дополнительно' },
  ];

  const topics = [
    // ---------------- НАЧАЛО ----------------
    { id: 'buttons', cat: 'start', icon: '🎛️', title: 'Кнопки на приёмнике',
      body: `
      <p>Вот главные кнопки, которые вам понадобятся чаще всего:</p>
      <ul>
        <li><span class="key">POWER</span> — включить и выключить радио.</li>
        <li><span class="wheel">VOLUME</span> — колесо снизу справа, делает звук громче или тише.</li>
        <li><span class="wheel">TUNING</span> — колесо сверху справа, ищет и переключает станции.</li>
        <li><span class="key">FM/ST</span> — включить обычное FM-радио.</li>
        <li><span class="key">MW/LW</span> — переключиться на средние или длинные волны.</li>
        <li><span class="key">ETM</span> — «умный» автопоиск, находит станции сам.</li>
        <li><span class="key">M</span> (Memory) — сохранить станцию в избранное.</li>
        <li><span class="key">VF/VM</span> — переключение между «поиском» и «избранным».</li>
        <li><span class="key">TIME</span> и <span class="key">ALARM</span> — часы и будильник.</li>
      </ul>
      <div class="note">Совет: не старайтесь запомнить всё сразу. Возвращайтесь в эту инструкцию, когда что-то забудете.</div>
      ` },

    { id: 'onoff', cat: 'start', icon: '🔴', title: 'Включить и выключить радио',
      body: `
      <ol>
        <li>Найдите кнопку <span class="key">POWER</span> в правом верхнем углу.</li>
        <li>Нажмите её один раз — радио включится, на экране загорится время или частота.</li>
        <li>Чтобы выключить радио, нажмите <span class="key">POWER</span> ещё раз.</li>
      </ol>
      <div class="note">Если звучит будильник, кнопку <span class="key">POWER</span> нужно нажать <b>дважды</b>, чтобы выключить и радио, и будильник.</div>
      ` },

    { id: 'volume', cat: 'start', icon: '🔊', title: 'Сделать звук громче или тише',
      body: `
      <ol>
        <li>Найдите большое колесо снизу справа на боковой стороне — это <span class="wheel">VOLUME</span>.</li>
        <li>Крутите его вперёд (от себя) — звук становится громче.</li>
        <li>Крутите назад (к себе) — звук становится тише.</li>
      </ol>
      ` },

    { id: 'band', cat: 'start', icon: '📻', title: 'Выбрать волну: FM, СВ, ДВ или КВ',
      body: `
      <p>У приёмника четыре вида волн. Проще всего запомнить так:</p>
      <ul>
        <li><b>FM</b> — обычные музыкальные радиостанции. Кнопка <span class="key">FM/ST</span>.</li>
        <li><b>MW</b> (средние волны) и <b>LW</b> (длинные волны) — кнопка <span class="key">MW/LW</span>. Нажимайте её несколько раз, чтобы переключаться между ними.</li>
        <li><b>SW</b> (короткие волны) — для дальних, иностранных станций. Кнопки <span class="key">&lt;</span> и <span class="key">&gt;</span>.</li>
      </ul>
      <div class="note">Не знаете, какую выбрать? Начните с <b>FM</b> — там проще всего поймать станцию.</div>
      ` },

    { id: 'charge', cat: 'start', icon: '🔌', title: 'Зарядить аккумулятор',
      body: `
      <ol>
        <li>Найдите маленький разъём для кабеля сбоку приёмника (рядом с гнездом для наушников).</li>
        <li>Подключите туда USB-кабель, который шёл в комплекте.</li>
        <li>Другой конец кабеля подключите к зарядному устройству от телефона (или к компьютеру).</li>
        <li>На экране появится значок зарядки. Полная зарядка занимает несколько часов.</li>
      </ol>
      <div class="note">Радио можно слушать прямо во время зарядки.</div>
      ` },

    // ---------------- ПОИСК ----------------
    { id: 'manual-tune', cat: 'tuning', icon: '🎚️', title: 'Найти станцию вручную',
      body: `
      <ol>
        <li>Полностью выдвиньте антенну (для FM и коротких волн) — она стоит справа сверху.</li>
        <li>Выберите волну (FM, СВ/ДВ или КВ) — см. раздел «Выбрать волну».</li>
        <li>Медленно крутите верхнее правое колесо <span class="wheel">TUNING</span>.</li>
        <li>Когда услышите станцию, остановитесь — всё, вы её поймали.</li>
      </ol>
      ` },

    { id: 'autoseek', cat: 'tuning', icon: '🔍', title: 'Автопоиск (одна станция за раз)',
      body: `
      <p>Этот способ сам находит станции одну за другой, без ручной настройки.</p>
      <ol>
        <li>Нажмите и <b>подержите</b> кнопку <span class="key">VF/VM</span> пару секунд.</li>
        <li>Радио начнёт искать и остановится на первой найденной станции — подождите примерно 5 секунд, пока играет.</li>
        <li>Затем поиск сам продолжится к следующей станции.</li>
        <li>Чтобы остановиться на понравившейся станции, коротко нажмите <span class="key">VF/VM</span> ещё раз.</li>
      </ol>
      <div class="note">Понравилась станция во время поиска? Сразу нажмите кнопку <span class="key">M</span> — она сохранится в память.</div>
      ` },

    { id: 'etm', cat: 'tuning', icon: '✨', title: 'Умный поиск ETM (самый удобный)',
      body: `
      <p>Это лучший способ — радио само находит <b>и запоминает</b> сразу много станций.</p>
      <ol>
        <li>Выберите нужную волну (FM, СВ/ДВ или КВ).</li>
        <li>Коротко нажмите кнопку <span class="key">ETM</span>.</li>
        <li>Теперь нажмите и <b>подержите</b> <span class="key">ETM</span> ещё раз — начнётся поиск.</li>
        <li>Подождите, пока поиск закончится. Для FM это около 15 секунд, для коротких волн — до 2–3 минут.</li>
        <li>Готово! Теперь крутите колесо <span class="wheel">TUNING</span>, чтобы переключаться между найденными станциями.</li>
      </ol>
      <div class="note">Переехали в другой город или далеко отошли от дома? Запустите ETM заново — список станций обновится.</div>
      ` },

    { id: 'antenna', cat: 'tuning', icon: '📡', title: 'Улучшить приём (антенна)',
      body: `
      <ul>
        <li>Для <b>FM</b> и <b>коротких волн (SW)</b>: выдвиньте длинную металлическую антенну и поверните её в разные стороны, пока звук не станет чище.</li>
        <li>Для <b>средних и длинных волн (СВ/ДВ)</b>: антенна встроена внутри самого корпуса. Просто медленно поворачивайте весь приёмник в руках.</li>
      </ul>
      <div class="note">Если рядом шумит холодильник, компьютер или зарядка — отойдите от них подальше, приём станет лучше.</div>
      ` },

    // ---------------- ПАМЯТЬ ----------------
    { id: 'save', cat: 'memory', icon: '⭐', title: 'Сохранить станцию (в избранное)',
      body: `
      <ol>
        <li>Настройтесь на станцию, которая вам нравится.</li>
        <li>Нажмите кнопку <span class="key">M</span> (Memory) — на экране замигает слово «Preset» и номер.</li>
        <li>Нажмите <span class="key">M</span> ещё раз — станция сохранена. Можно также просто подождать 3 секунды.</li>
      </ol>
      ` },

    { id: 'recall', cat: 'memory', icon: '📂', title: 'Включить сохранённую станцию',
      body: `
      <ol>
        <li>Коротко нажмите кнопку <span class="key">VF/VM</span> — вверху экрана замигает номер «Preset».</li>
        <li>Крутите колесо <span class="wheel">TUNING</span>, чтобы перебирать ваши сохранённые станции.</li>
        <li>Остановитесь на нужной — она сразу заиграет.</li>
      </ol>
      ` },

    { id: 'delete', cat: 'memory', icon: '🗑️', title: 'Удалить станцию из памяти',
      body: `
      <ol>
        <li>Нажмите <span class="key">VF/VM</span>, затем колесом <span class="wheel">TUNING</span> выберите станцию, которую хотите убрать.</li>
        <li>Нажмите и <b>подержите</b> кнопку <span class="key">DELETE</span> 2 секунды. На экране замигает «DEL».</li>
        <li>Нажмите <span class="key">DELETE</span> ещё раз — станция удалена.</li>
      </ol>
      <div class="note">Если передумали — просто не нажимайте <span class="key">DELETE</span> второй раз, и через 3 секунды всё отменится само.</div>
      ` },

    // ---------------- ЧАСЫ ----------------
    { id: 'settime', cat: 'clock', icon: '🕒', title: 'Установить точное время',
      body: `
      <ol>
        <li>Радио должно быть <b>выключено</b>.</li>
        <li>Нажмите и подержите кнопку <span class="key">TIME</span> — цифры часов начнут мигать.</li>
        <li>Крутите колесо <span class="wheel">TUNING</span>, чтобы выставить час, затем нажмите <span class="key">TIME</span>.</li>
        <li>Так же выставьте минуты и снова нажмите <span class="key">TIME</span>, чтобы сохранить.</li>
      </ol>
      ` },

    { id: 'alarm', cat: 'clock', icon: '⏰', title: 'Установить будильник',
      body: `
      <ol>
        <li>Нажмите и подержите кнопку <span class="key">ALARM</span> — время будильника замигает.</li>
        <li>Крутите колесо <span class="wheel">TUNING</span>, чтобы выставить нужное время.</li>
        <li>Подождите несколько секунд — настройка сохранится сама, появится значок будильника.</li>
      </ol>
      <p><b>Чтобы выключить будильник:</b> нажмите <span class="key">ALARM</span> ещё раз — значок исчезнет.</p>
      <div class="note">Когда будильник зазвонит, нажмите <span class="key">POWER</span> один раз, если хотите послушать радио дальше, или дважды — чтобы всё выключить.</div>
      ` },

    { id: 'sleep', cat: 'clock', icon: '😴', title: 'Автовыключение (таймер сна)',
      body: `
      <p>Эта функция сама выключит радио через выбранное время — удобно слушать перед сном.</p>
      <ol>
        <li>Нажмите и подержите кнопку <span class="key">POWER</span> (радио должно играть).</li>
        <li>Крутите колесо <span class="wheel">TUNING</span>, чтобы выбрать время: 15, 30, 60, 90 минут и так далее.</li>
        <li>Больше ничего делать не нужно — радио выключится само в выбранное время.</li>
      </ol>
      ` },

    // ---------------- ДОПОЛНИТЕЛЬНО ----------------
    { id: 'backlight', cat: 'extra', icon: '💡', title: 'Подсветка экрана',
      body: `
      <p>Если в комнате темно, экран можно подсветить постоянно.</p>
      <ol>
        <li>Радио должно быть включено.</li>
        <li>Нажмите и подержите цифровую кнопку <span class="key">5</span> одну секунду — подсветка включится и останется гореть.</li>
        <li>Чтобы выключить постоянную подсветку, нажмите и подержите <span class="key">5</span> ещё раз.</li>
      </ol>
      ` },

    { id: 'lock', cat: 'extra', icon: '🔒', title: 'Заблокировать кнопки',
      body: `
      <p>Полезно, если носите радио в сумке — чтобы кнопки случайно не нажимались.</p>
      <ol>
        <li>Найдите кнопку со значком замка (рядом с кнопкой <span class="key">STEP</span>, справа сверху).</li>
        <li>Нажмите и подержите её — на экране появится значок замка, кнопки заблокированы.</li>
        <li>Чтобы разблокировать, нажмите и подержите её снова.</li>
      </ol>
      ` },

    { id: 'icons', cat: 'extra', icon: '🖥️', title: 'Что означают значки на экране',
      body: `
      <ul>
        <li>🔋 Значок батареи — сколько заряда осталось.</li>
        <li>«SLEEP» — включён таймер автовыключения.</li>
        <li>🔒 Замочек — кнопки заблокированы.</li>
        <li>FM / MW / LW / SW — какая волна выбрана сейчас.</li>
        <li>«Preset» и номер — вы находитесь в списке сохранённых станций.</li>
        <li>Значок будильника — будильник включён.</li>
      </ul>
      <p>Кнопкой <span class="key">DISPLAY</span> можно переключать, что показывать в правом верхнем углу: время, будильник или силу сигнала.</p>
      ` },

    { id: 'ssb', cat: 'extra', icon: '📶', title: 'Кнопки SSB, SYNC, LSB, USB — что это',
      body: `
      <p>Это специальный режим для опытных радиолюбителей и приёма особых, слабых станций. Обычному слушателю музыки и новостей он не нужен — можно просто не трогать эти кнопки.</p>
      <p>Если случайно нажали и звук стал странным (свист, искажение) — коротко нажмите кнопку <span class="key">SSB/SYNC</span>, чтобы вернуть обычный звук.</p>
      ` },
  ];

  // ---------------- DOM ----------------
  const $ = (id) => document.getElementById(id);
  const home = $('home');
  const detail = $('detail');
  const menu = $('menu');
  const topLink = $('topLink');
  const APP_TITLE = document.title;

  // ---------------- Главное меню ----------------
  categories.forEach((cat) => {
    const h = document.createElement('h2');
    h.className = 'cat-title';
    h.textContent = cat.title;
    menu.appendChild(h);

    const grid = document.createElement('div');
    grid.className = 'grid';
    topics.filter((t) => t.cat === cat.id).forEach((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tile';
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

  // ---------------- Навигация ----------------
  // Маршрут хранится в hash (#etm). Так работает кнопка «Назад»
  // на Android и в браузере, а прямая ссылка открывает нужную тему.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastTile = null;

  function animate(el) {
    if (reduceMotion.matches) return;
    el.classList.remove('enter');
    void el.offsetWidth; // перезапуск анимации
    el.classList.add('enter');
  }

  function render() {
    const id = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const t = id ? topics.find((x) => x.id === id) : null;

    if (t) {
      $('d-icon').textContent = t.icon;
      $('d-title').textContent = t.title;
      $('d-body').innerHTML = t.body;
      home.hidden = true;
      detail.hidden = false;
      document.title = `${t.title} — PL-330`;
      animate(detail);
      window.scrollTo(0, 0);
      $('d-title').focus({ preventScroll: true });
    } else {
      detail.hidden = true;
      home.hidden = false;
      document.title = APP_TITLE;
      animate(home);
      window.scrollTo(0, 0);
      // вернуть фокус на плитку, с которой ушли (для клавиатуры)
      if (lastTile) { lastTile.focus({ preventScroll: true }); lastTile = null; }
    }
  }

  let openedFromHome = false; // тема открыта из меню → «Назад» = history.back()

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
        render();
      }
    });
  });

  window.addEventListener('hashchange', render);
  render();

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
