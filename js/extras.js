/* ============================================================
   Особые разделы «Интересное»: карточки фактов, круг суток с
   диапазонами, комплект, схема «что внутри», викторина.
   Каждый раздел: { id, icon, title, lead, render() → HTML, init(el) }.
   Данные — из официального руководства Tecsun PL-330 (стр. 2, 16–17,
   32–38). Анимации — только CSS (классы .stg и т.п. в styles.css).
   ============================================================ */
(function () {
  'use strict';
  window.PL330 = window.PL330 || {};
  const views = {};
  window.PL330.views = views;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ============================================================
  // 1. «А вы знали?» — карточки фактов
  // ============================================================
  const facts = [
    { icon: '✨', title: 'Чем ETM отличается от обычного автопоиска',
      text: 'Обычный автопоиск (ATS) смотрит только на силу сигнала: громкий шум он тоже запишет. Умный поиск ETM смотрит ещё и на «чистоту» сигнала — поэтому находит слабые, но разборчивые станции и пропускает громкие помехи. И главное: ETM не стирает станции, которые вы сохранили сами.' },
    { icon: '🕰️', title: 'Радио помнит, в какое время оно искало станции',
      text: 'На средних, длинных и коротких волнах станции появляются и пропадают в зависимости от времени суток. Поэтому ETM запоминает найденное отдельно для утра, дня, вечера и ночи. Если утром список станций не такой, как вечером, — это не поломка, так и задумано.' },
    { icon: '🌴', title: 'Тропические диапазоны',
      text: 'Диапазоны 120, 90 и 60 метров называют тропическими: в жарких странах короткие волны — единственный способ вещать на всю страну. Слышно их лучше всего, когда ночь и там, и у вас. Если повезёт: Азия — ранним вечером, Африка — ночью, Южная Америка — ранним утром.' },
    { icon: '🇪🇺', title: '49 метров — «европейский» диапазон',
      text: 'Самый популярный диапазон коротких волн. Днём слышны только самые мощные станции, а ночью — десятки станций со всей Европы, одна за другой. Именно с него советуют начинать новичкам.' },
    { icon: '🌍', title: '19 метров — диапазон дальнего приёма',
      text: 'Радиолюбители зовут его DX-диапазоном (от английского «distance» — расстояние). Здесь ловятся станции со всего мира, причём не только ночью, но часто и днём.' },
    { icon: '☀️', title: 'Солнце влияет на радио',
      text: 'Диапазоны 13 и 11 метров зависят от «радиопогоды» — активности пятен на Солнце. В годы, когда пятен много, эти диапазоны на несколько часов днём «открываются», и слышно очень далёкие станции. В остальное время там почти тишина.' },
    { icon: '📟', title: 'Что за цифры dBμ и dB на экране',
      text: 'Первое число (dBμ) — насколько сильный сигнал. Второе (dB, S/N) — насколько он чистый: чем больше, тем разборчивее речь. Такая информация обычно бывает только у профессиональной техники. Обычному слушателю на неё можно не смотреть — просто слушайте.' },
    { icon: '📡', title: 'Внутри две антенны',
      text: 'Телескопическая антенна нужна для FM и коротких волн. А для средних и длинных волн внутри корпуса спрятан ферритовый стержень с катушкой. Поэтому на СВ и ДВ поворачивают не антенну, а весь приёмник.' },
    { icon: '💾', title: 'В памяти помещается 650 станций',
      text: 'FM — 100, длинные волны — 100, средние — 150, короткие — 300. И это не считая отдельной памяти умного поиска ETM: ещё до 100 станций на FM, СВ и ДВ и до 250 на КВ.' },
    { icon: '📏', title: 'Немного цифр',
      text: 'Размер — 139 × 85 × 26 мм, вес — 210 граммов без аккумулятора. Аккумулятор BL-5C на 3,7 В заряжается от любой USB-зарядки для телефона. Российская версия ловит FM от 64 до 108 МГц.' },
  ];

  views.facts = {
    id: 'facts', icon: '💡', title: 'А вы знали?',
    render() {
      return `<p class="lead">Короткие факты о приёмнике и радиоволнах — из официального руководства. Листайте не спеша.</p>
      <div class="cards">${facts.map((f) => `
        <section class="card stg">
          <div class="card-head"><span class="card-icon" aria-hidden="true">${f.icon}</span><h3>${esc(f.title)}</h3></div>
          <p>${esc(f.text)}</p>
        </section>`).join('')}
      </div>`;
    },
  };

  // ============================================================
  // 2. Круг суток: какие волны слушать сейчас (таблица стр. 34)
  // ============================================================
  const periods = [
    { id: 'morning', label: 'Утро',  hours: 'с 6 до 12', from: 6,  to: 12, angle: 135, icon: '🌅',
      best: ['120 м', '90 м', '75 м', '60 м'], ok: ['49 м', '41 м', '31 м', '25 м', '22 м', '19 м'],
      tip: 'Ранним утром на тропических диапазонах иногда слышна Южная Америка. Средние волны ещё хорошо ловятся, пока не рассвело окончательно.' },
    { id: 'day', label: 'День', hours: 'с 12 до 18', from: 12, to: 18, angle: 225, icon: '☀️',
      best: ['25 м', '22 м', '19 м', '16 м', '15 м'], ok: ['49 м', '41 м', '31 м'],
      tip: 'Днём лучше всего «высокие» диапазоны: на 19 м ловится весь мир. Диапазоны 13 и 11 м — как повезёт с солнечной погодой.' },
    { id: 'evening', label: 'Вечер', hours: 'с 18 до 22', from: 18, to: 22, angle: 300, icon: '🌇',
      best: ['120 м', '90 м', '75 м', '60 м'], ok: ['49 м', '41 м', '31 м', '25 м', '22 м'],
      tip: 'После захода солнца оживают 49 и 41 м. Ранним вечером на тропических диапазонах можно поймать станции из Азии.' },
    { id: 'night', label: 'Ночь', hours: 'с 22 до 6', from: 22, to: 6, angle: 30, icon: '🌙',
      best: ['120 м', '90 м', '75 м', '60 м', '49 м', '41 м'], ok: ['31 м', '25 м', '22 м', '19 м'],
      tip: 'Лучшее время для коротких волн. На 49 м — десятки станций со всей Европы. Средние волны ночью тоже слышны намного дальше — запустите ETM заново.' },
  ];

  function periodForHour(h) {
    if (h >= 6 && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'day';
    if (h >= 18 && h < 22) return 'evening';
    return 'night';
  }

  // сектор кольца часов: от часа a до часа b (по 24-часовому кругу, 0 сверху)
  function arc(a, b, r, w) {
    const toXY = (h, rr) => {
      const t = (h / 24) * 2 * Math.PI - Math.PI / 2;
      return [150 + rr * Math.cos(t), 150 + rr * Math.sin(t)];
    };
    if (b < a) b += 24;
    const large = (b - a) > 12 ? 1 : 0;
    const [x1, y1] = toXY(a, r), [x2, y2] = toXY(b, r);
    const [x3, y3] = toXY(b, r - w), [x4, y4] = toXY(a, r - w);
    return `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r - w} ${r - w} 0 ${large} 0 ${x4} ${y4} Z`;
  }

  views.bands = {
    id: 'bands', icon: '🕓', title: 'Какие волны слушать сейчас',
    render() {
      const ticks = [];
      for (let h = 0; h < 24; h++) {
        const t = (h / 24) * 2 * Math.PI - Math.PI / 2;
        const major = h % 6 === 0;
        const r1 = major ? 96 : 102, r2 = 108;
        ticks.push(`<line class="ctick${major ? ' major' : ''}" x1="${150 + r1 * Math.cos(t)}" y1="${150 + r1 * Math.sin(t)}" x2="${150 + r2 * Math.cos(t)}" y2="${150 + r2 * Math.sin(t)}"/>`);
        if (major) {
          const lr = 84;
          ticks.push(`<text class="cnum" x="${150 + lr * Math.cos(t)}" y="${150 + lr * Math.sin(t) + 5}" text-anchor="middle">${h === 0 ? 24 : h}</text>`);
        }
      }
      const sectors = periods.map((p) =>
        `<path class="sector sector-${p.id}" data-period="${p.id}" d="${arc(p.from, p.to, 140, 26)}" role="button" tabindex="0" aria-label="${p.label}, ${p.hours}"><title>${p.label}</title></path>`).join('');
      const labels = periods.map((p) => {
        const t = (p.angle * Math.PI) / 180 - Math.PI / 2;
        return `<text class="clabel" x="${150 + 127 * Math.cos(t)}" y="${150 + 127 * Math.sin(t) + 5}" text-anchor="middle">${p.icon}</text>`;
      }).join('');

      return `
      <p class="lead">Короткие волны слышно по-разному в разное время суток. Круг покажет, какие диапазоны пробовать сейчас. Нажмите на время дня, чтобы посмотреть другое.</p>
      <div class="clock-wrap stg">
        <svg class="clock" viewBox="0 0 300 300" role="img" aria-label="Круг суток с четырьмя периодами: утро, день, вечер, ночь">
          <circle class="cface" cx="150" cy="150" r="112"/>
          ${sectors}
          <g class="sweep" aria-hidden="true"><path d="M150 150 L150 12 A138 138 0 0 1 220 30 Z"/></g>
          ${ticks}
          ${labels}
          <g class="hand" id="clockHand" aria-hidden="true">
            <line x1="150" y1="150" x2="150" y2="58"/>
            <circle cx="150" cy="150" r="7"/>
          </g>
        </svg>
      </div>
      <div class="period-btns stg" role="tablist" aria-label="Время суток">
        ${periods.map((p) => `<button type="button" class="pbtn" role="tab" data-period="${p.id}" aria-selected="false"><span aria-hidden="true">${p.icon}</span> ${p.label}</button>`).join('')}
      </div>
      <section class="period-info stg" id="periodInfo" aria-live="polite"></section>
      <div class="note stg">Чтобы выбрать диапазон на приёмнике: включите короткие волны кнопками <span class="key">&lt;</span> и <span class="key">&gt;</span> — на экране будет подписано, например «49 mb» (mb — это метры). Дальше крутите колесо <span class="wheel">TUNING</span> или запустите <span class="key">ETM</span>.</div>`;
    },
    init(el) {
      const hand = el.querySelector('#clockHand');
      const info = el.querySelector('#periodInfo');
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      let current = periodForHour(now.getHours());

      function show(id, fromUser) {
        const p = periods.find((x) => x.id === id);
        current = id;
        const angle = fromUser ? p.angle : (hour / 24) * 360;
        hand.style.transform = `rotate(${angle}deg)`;
        el.querySelectorAll('.pbtn').forEach((b) => {
          const on = b.dataset.period === id;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        el.querySelectorAll('.sector').forEach((s) => s.classList.toggle('active', s.dataset.period === id));
        const isNow = periodForHour(now.getHours()) === id;
        info.className = `period-info stg p-${id}`;
        info.innerHTML = `
          <div class="period-head"><span class="period-icon" aria-hidden="true">${p.icon}</span>
            <div><h3>${p.label} <small>${p.hours}</small></h3>${isNow ? '<span class="now">сейчас</span>' : ''}</div></div>
          <div class="bandrow"><span class="bandlbl good">Хорошо слышно</span><div class="chips">${p.best.map((b) => `<span class="chip good">${b}</span>`).join('')}</div></div>
          <div class="bandrow"><span class="bandlbl ok">Средне</span><div class="chips">${p.ok.map((b) => `<span class="chip">${b}</span>`).join('')}</div></div>
          <p class="period-tip">${esc(p.tip)}</p>
          <p class="period-fm">📻 <b>FM</b> и <b>средние волны</b> на местные станции слушать можно в любое время.</p>`;
        // перезапуск анимации появления
        info.classList.remove('pop'); void info.offsetWidth; info.classList.add('pop');
      }

      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-period]');
        if (b) show(b.dataset.period, true);
      });
      el.addEventListener('keydown', (e) => {
        const s = e.target.closest('.sector');
        if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(s.dataset.period, true); }
      });
      show(current, false);
    },
  };

  // ============================================================
  // 3. Что в коробке (стр. 2 и 38)
  // ============================================================
  const kit = [
    { icon: '📻', name: 'Радио\u00ADприёмник PL-330', note: 'сам приёмник' },
    { icon: '🔋', name: 'Аккуму\u00ADлятор BL-5C', note: 'стоит в отсеке сзади, 3,7 В' },
    { icon: '🎧', name: 'Наушники', note: 'стерео, 32 Ом' },
    { icon: '🔌', name: 'USB-кабель', note: 'разъём micro-USB, для зарядки' },
    { icon: '👝', name: 'Чехол', note: 'мягкий, для переноски' },
    { icon: '📖', name: 'Руководство пользо\u00ADвателя', note: 'на русском языке' },
    { icon: '📄', name: 'Гарантийный талон', note: 'сохраните вместе с чеком' },
  ];
  views.kit = {
    id: 'kit', icon: '📦', title: 'Что должно быть в коробке',
    render() {
      return `<p class="lead">Проверьте комплект. Если чего-то не хватает — загляните под картонный вкладыш коробки, мелкие вещи часто лежат под ним.</p>
      <ul class="kit">${kit.map((k) => `
        <li class="kit-item stg"><span class="kit-icon" aria-hidden="true">${k.icon}</span>
          <div><div class="kit-name">${esc(k.name)}</div><div class="kit-note">${esc(k.note)}</div></div>
          <span class="kit-check" aria-hidden="true">✓</span></li>`).join('')}
      </ul>
      <div class="note stg">Аккумулятор BL-5C — обычный, такой же продаётся в магазинах электроники. Если через несколько лет он станет быстро садиться, его можно просто заменить.</div>`;
    },
  };

  // ============================================================
  // 4. Что внутри — авторская схема (SVG), без чужих фото
  // ============================================================
  const parts = [
    { n: 1, id: 'p-ant',   name: 'Телеско\u00ADпическая антенна', text: 'Для FM и коротких волн. Выдвигается и поворачивается.' },
    { n: 2, id: 'p-lcd',   name: 'Дисплей с подсветкой', text: 'Показывает частоту, время, заряд и значки режимов.' },
    { n: 3, id: 'p-fer',   name: 'Ферри\u00ADтовая антенна', text: 'Стержень с катушкой внутри корпуса — ловит средние и длинные волны.' },
    { n: 4, id: 'p-pcb',   name: 'Плата с микросхемой DSP', text: '«Мозг» приёмника: цифровая обработка сигнала, умный поиск ETM, память станций.' },
    { n: 5, id: 'p-spk',   name: 'Динамик', text: 'Небольшой, 8 Ом, мощность 0,25 Вт — этого хватает для комнаты.' },
    { n: 6, id: 'p-bat',   name: 'Аккуму\u00ADлятор BL-5C', text: 'В отсеке сзади под крышкой. Съёмный, 3,7 В.' },
    { n: 7, id: 'p-usb',   name: 'Разъём зарядки и наушников', text: 'Сбоку: micro-USB для зарядки и гнездо 3,5 мм для наушников.' },
    { n: 8, id: 'p-whl',   name: 'Колёсики TUNING и VOLUME', text: 'Справа сбоку: верхнее — настройка, нижнее — громкость.' },
  ];
  views.inside = {
    id: 'inside', icon: '🔧', title: 'Что внутри приёмника',
    render() {
      return `<p class="lead">Схема, а не фото: так проще увидеть главное. Нажмите на пункт в списке — деталь подсветится на схеме.</p>
      <div class="inside-wrap stg">
      <svg class="inside" viewBox="0 0 420 300" role="img" aria-label="Схема устройства приёмника: антенна, дисплей, ферритовая антенна, плата, динамик, аккумулятор, разъёмы, колёсики">
        <defs>
          <pattern id="grille" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2.2" fill="#8AA4B8"/></pattern>
        </defs>
        <!-- корпус (полупрозрачный) -->
        <rect class="case" x="40" y="70" width="340" height="200" rx="18"/>
        <!-- 1 антенна -->
        <g class="part" id="p-ant">
          <line x1="352" y1="72" x2="410" y2="8" stroke="#C9D6E2" stroke-width="7" stroke-linecap="round"/>
          <line x1="352" y1="72" x2="384" y2="37" stroke="#E9F0F6" stroke-width="10" stroke-linecap="round"/>
          <circle cx="410" cy="8" r="5" fill="#E9F0F6"/>
          <circle class="dot" cx="380" cy="42" r="12"/><text class="num" x="380" y="47">1</text>
        </g>
        <!-- 3 ферритовая антенна -->
        <g class="part" id="p-fer">
          <rect x="70" y="86" width="230" height="14" rx="7" fill="#5A4636"/>
          <g stroke="#E8951B" stroke-width="2"><line x1="120" y1="84" x2="120" y2="102"/><line x1="126" y1="84" x2="126" y2="102"/><line x1="132" y1="84" x2="132" y2="102"/><line x1="138" y1="84" x2="138" y2="102"/><line x1="144" y1="84" x2="144" y2="102"/><line x1="150" y1="84" x2="150" y2="102"/></g>
          <circle class="dot" cx="70" cy="93" r="12"/><text class="num" x="70" y="98">3</text>
        </g>
        <!-- 4 плата -->
        <g class="part" id="p-pcb">
          <rect x="160" y="112" width="200" height="120" rx="6" fill="#1F5A3A" stroke="#3E8F5E" stroke-width="2"/>
          <rect x="250" y="150" width="44" height="44" rx="4" fill="#111" stroke="#666"/>
          <text x="272" y="176" text-anchor="middle" fill="#FFB443" font-size="11" font-weight="700" font-family="inherit">DSP</text>
          <g fill="#3E8F5E"><rect x="176" y="126" width="26" height="8" rx="2"/><rect x="176" y="140" width="40" height="8" rx="2"/><rect x="176" y="200" width="60" height="8" rx="2"/><rect x="310" y="126" width="30" height="8" rx="2"/><rect x="310" y="200" width="30" height="20" rx="2"/></g>
          <circle class="dot" cx="345" cy="120" r="12"/><text class="num" x="345" y="125">4</text>
        </g>
        <!-- 2 дисплей -->
        <g class="part" id="p-lcd">
          <rect x="180" y="118" width="120" height="30" rx="4" fill="#0A141C" stroke="#33495C" stroke-width="2"/>
          <rect x="182" y="120" width="116" height="26" rx="3" fill="#C7D6A8" opacity=".9"/>
          <text x="292" y="140" text-anchor="end" fill="#1B2E3D" font-size="16" font-weight="700" font-family="inherit">100.8</text>
          <circle class="dot" cx="180" cy="118" r="12"/><text class="num" x="180" y="123">2</text>
        </g>
        <!-- 5 динамик -->
        <g class="part" id="p-spk">
          <circle cx="105" cy="170" r="46" fill="#1B2E3D" stroke="#5B7891" stroke-width="3"/>
          <circle cx="105" cy="170" r="40" fill="url(#grille)"/>
          <circle cx="105" cy="170" r="14" fill="#0E1A24" stroke="#8AA4B8" stroke-width="2"/>
          <circle class="dot" cx="66" cy="136" r="12"/><text class="num" x="66" y="141">5</text>
        </g>
        <!-- 6 аккумулятор -->
        <g class="part" id="p-bat">
          <rect x="190" y="238" width="120" height="26" rx="5" fill="#2B4459" stroke="#8AA4B8" stroke-width="2"/>
          <rect x="310" y="245" width="6" height="12" rx="1" fill="#8AA4B8"/>
          <text x="250" y="256" text-anchor="middle" fill="#F4EFE4" font-size="12" font-weight="700" font-family="inherit">BL-5C · 3,7 V</text>
          <circle class="dot" cx="190" cy="238" r="12"/><text class="num" x="190" y="243">6</text>
        </g>
        <!-- 7 разъёмы -->
        <g class="part" id="p-usb">
          <rect x="30" y="226" width="14" height="10" rx="2" fill="#8AA4B8"/>
          <circle cx="37" cy="250" r="5" fill="#0A141C" stroke="#8AA4B8" stroke-width="2"/>
          <circle class="dot" cx="24" cy="208" r="12"/><text class="num" x="24" y="213">7</text>
        </g>
        <!-- 8 колёсики -->
        <g class="part" id="p-whl">
          <rect x="378" y="150" width="14" height="36" rx="5" fill="#0E1A24" stroke="#FFB443" stroke-width="3"/>
          <rect x="378" y="200" width="14" height="36" rx="5" fill="#0E1A24" stroke="#FFB443" stroke-width="3"/>
          <circle class="dot" cx="400" cy="140" r="12"/><text class="num" x="400" y="145">8</text>
        </g>
      </svg>
      </div>
      <ol class="parts">${parts.map((p) => `
        <li class="part-item stg"><button type="button" class="part-btn" data-part="${p.id}" aria-pressed="false">
          <span class="part-num" aria-hidden="true">${p.n}</span>
          <span class="part-txt"><b>${esc(p.name)}</b><br>${esc(p.text)}</span></button></li>`).join('')}
      </ol>
      <div class="note stg">Разбирать приёмник самому не нужно — все детали спрятаны в корпусе и не требуют обслуживания. Единственное, что открывается, — крышка аккумулятора сзади.</div>`;
    },
    init(el) {
      let active = null;
      el.addEventListener('click', (e) => {
        const b = e.target.closest('.part-btn');
        if (!b) return;
        const id = b.dataset.part;
        el.querySelectorAll('.part').forEach((p) => p.classList.remove('hl'));
        el.querySelectorAll('.part-btn').forEach((x) => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
        if (active === id) { active = null; return; }
        active = id;
        b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
        const part = el.querySelector('#' + id);
        if (part) { part.classList.add('hl'); }
      });
    },
  };

  // ============================================================
  // 5. Викторина
  // ============================================================
  const quiz = [
    { q: 'Какая кнопка сама находит станции и сразу запоминает их?',
      a: ['ETM', 'TIME', 'DELETE'], c: 0,
      why: 'ETM — умный поиск: одно нажатие, потом подержать — и все станции в памяти.' },
    { q: 'Какая антенна ловит средние волны (СВ)?',
      a: ['Телескопическая, которую выдвигают', 'Ферритовый стержень внутри корпуса', 'Провод наушников'], c: 1,
      why: 'На средних и длинных волнах работает стержень внутри — поэтому поворачивают весь приёмник.' },
    { q: 'Когда на 49-метровом диапазоне слышно больше всего станций?',
      a: ['Днём', 'Ночью', 'Одинаково всегда'], c: 1,
      why: 'Ночью на 49 м — десятки станций со всей Европы. Днём только самые мощные.' },
    { q: 'Что показывает число dB (S/N) на экране?',
      a: ['Насколько чистый сигнал', 'Заряд батареи', 'Громкость'], c: 0,
      why: 'Чем больше это число, тем разборчивее слышно. Заряд показывает значок батареи.' },
    { q: 'Будильник звонит, а хочется ещё 5 минут поспать. Что нажать?',
      a: ['POWER два раза', 'DISPLAY', 'Крутить TUNING'], c: 1,
      why: 'DISPLAY откладывает будильник на 5 минут. POWER дважды выключит его совсем.' },
    { q: 'Сколько станций помещается в память приёмника (не считая ETM)?',
      a: ['10', '650', '5000'], c: 1,
      why: '650: по 100 на FM и ДВ, 150 на СВ и 300 на КВ.' },
  ];

  views.quiz = {
    id: 'quiz', icon: '🎯', title: 'Небольшая викторина',
    render() {
      return `<p class="lead">Шесть простых вопросов по мотивам фактов. Без таймера и без оценок — просто для интереса.</p>
      <div class="quiz" id="quiz"></div>`;
    },
    init(el) {
      const box = el.querySelector('#quiz');
      let i = 0, score = 0;

      function question() {
        const q = quiz[i];
        box.innerHTML = `
          <div class="q-progress" aria-label="Вопрос ${i + 1} из ${quiz.length}">${quiz.map((_, k) => `<span class="${k < i ? 'done' : k === i ? 'cur' : ''}"></span>`).join('')}</div>
          <div class="q-num">Вопрос ${i + 1} из ${quiz.length}</div>
          <h3 class="q-text">${esc(q.q)}</h3>
          <div class="q-answers">${q.a.map((a, k) => `<button type="button" class="q-btn stg" data-k="${k}">${esc(a)}</button>`).join('')}</div>
          <div class="q-feedback" aria-live="polite"></div>`;
        box.querySelectorAll('.stg').forEach((n, k) => n.style.setProperty('--i', k));
        box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
      }

      function answer(k) {
        const q = quiz[i];
        const btns = box.querySelectorAll('.q-btn');
        btns.forEach((b) => { b.disabled = true; });
        const right = k === q.c;
        if (right) score++;
        btns[k].classList.add(right ? 'right' : 'wrong');
        btns[q.c].classList.add('right');
        const fb = box.querySelector('.q-feedback');
        fb.className = `q-feedback show ${right ? 'ok' : 'no'}`;
        fb.innerHTML = `<div class="fb-head">${right ? '✅ Верно!' : '💡 Не совсем.'}</div><p>${esc(q.why)}</p>
          <button type="button" class="btn" data-next>${i + 1 < quiz.length ? 'Дальше →' : 'Посмотреть результат'}</button>`;
        fb.querySelector('[data-next]').focus({ preventScroll: true });
      }

      function result() {
        const msg = score === quiz.length ? 'Отлично! Вы знаете приёмник лучше многих.'
          : score >= quiz.length - 2 ? 'Очень хорошо! Остальное всегда можно подсмотреть в инструкции.'
          : 'Хорошее начало. Загляните в раздел «А вы знали?» — и попробуйте ещё раз.';
        box.innerHTML = `
          <div class="q-result pop">
            <div class="q-result-icon" aria-hidden="true">${score === quiz.length ? '🏆' : '📻'}</div>
            <h3>Правильных ответов: ${score} из ${quiz.length}</h3>
            <p>${msg}</p>
            <button type="button" class="btn" data-restart>Пройти ещё раз</button>
          </div>`;
      }

      box.addEventListener('click', (e) => {
        const a = e.target.closest('.q-btn');
        if (a && !a.disabled) { answer(Number(a.dataset.k)); return; }
        if (e.target.closest('[data-next]')) { i++; if (i < quiz.length) question(); else result(); return; }
        if (e.target.closest('[data-restart]')) { i = 0; score = 0; question(); }
      });
      question();
    },
  };
})();
