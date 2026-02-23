// assets/js/app.js
(function(){
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));
  const fmtMoney = (n) => new Intl.NumberFormat("ru-RU").format(Math.round(n));

  // ===== Mobile nav toggle =====
  const navToggle = qs("#navToggle");
  const mobileNav = qs("#mobileNav");
  function closeMobileNav(){
    if(mobileNav) mobileNav.style.display = "none";
    if(navToggle) navToggle.textContent = "Меню";
  }
  if(navToggle && mobileNav){
    navToggle.addEventListener("click", ()=>{
      const isOpen = mobileNav.style.display === "block";
      mobileNav.style.display = isOpen ? "none" : "block";
      navToggle.textContent = isOpen ? "Меню" : "Закрыть";
    });
    qsa("a", mobileNav).forEach(a=>{
      a.addEventListener("click", closeMobileNav);
    });
    window.addEventListener("resize", ()=>{
      if(window.innerWidth > 720) closeMobileNav();
    });
  }

  // ===== date helpers (UTC-safe) =====
  function parseISO(iso){
    const [y,m,d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m-1, d));
  }
  function toISO(date){
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth()+1).padStart(2,"0");
    const d = String(date.getUTCDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }
  function addDays(date, days){
    const d = new Date(date.getTime());
    d.setUTCDate(d.getUTCDate()+days);
    return d;
  }
  function startOfMonth(date){
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }
  function endOfMonth(date){
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth()+1, 0));
  }
  function daysInMonth(date){
    return endOfMonth(date).getUTCDate();
  }
  function dowMonFirst(date){
    const d = date.getUTCDay();
    return (d + 6) % 7;
  }
  function todayUTC(){
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  function monthName(date){
    const m = date.getUTCMonth();
    const y = date.getUTCFullYear();
    const names = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
    return `${names[m]} ${y}`;
  }

  // ===== Active nav =====
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  qsa("nav a[data-page]").forEach(a => {
    if(a.dataset.page === path) a.classList.add("active");
  });

  // Footer year
  const y = qs("#year");
  if(y) y.textContent = String(new Date().getFullYear());

  // ===== Booking modal elements =====
  const modal = qs("#modal");
  const closeBtn = qs("#closeModal");
  const openers = qsa("[data-open-booking]");

  const houseSelect = qs("#houseSelect");
  const checkIn = qs("#checkIn");
  const checkOut = qs("#checkOut");

  const summaryTitle = qs("#summaryTitle");
  const summaryPill = qs("#summaryPill");
  const summaryGuests = qs("#summaryGuests");
  const summaryArea = qs("#summaryArea");
  const summaryPrice = qs("#summaryPrice");
  const summaryImg = qs("#summaryImg");

  const calGrid = qs("#calGrid");
  const calTitle = qs("#calTitle");
  const calPrev = qs("#calPrev");
  const calNext = qs("#calNext");

  const nightsOut = qs("#nightsOut");
  const baseOut = qs("#baseOut");
  const modsOut = qs("#modsOut");
  const totalOut = qs("#totalOut");
  const breakdownOut = qs("#breakdownOut");

  // ===== Scroll lock (stable on iOS) =====
  let scrollY = 0;
  function lockScroll(lock){
    if(lock){
      scrollY = window.scrollY || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }else{
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    }
  }

  function getHouse(id){
    return (window.HOUSES || []).find(h => h.id === id) || (window.HOUSES || [])[0];
  }

  function fillHouseSelect(){
    if(!houseSelect || !window.HOUSES) return;
    houseSelect.innerHTML = window.HOUSES.map(h => `<option value="${h.id}">${h.title}</option>`).join("");
  }

  function setSummary(houseId){
    const h = getHouse(houseId);
    if(!h) return;
    if(summaryTitle) summaryTitle.textContent = h.title;
    if(summaryPill) summaryPill.textContent = `от ${fmtMoney(h.price)} ₽/ночь`;
    if(summaryGuests) summaryGuests.textContent = `до ${h.guests}`;
    if(summaryArea) summaryArea.textContent = `${h.area} м²`;
    if(summaryPrice) summaryPrice.textContent = `${fmtMoney(h.price)} ₽/ночь`;
    if(summaryImg) summaryImg.style.backgroundImage = `url('${h.images?.[0] || ""}')`;
  }

  // ===== Availability =====
  function isBookedDate(house, iso){
    const d = parseISO(iso).getTime();
    return (house.bookings || []).some(([s,e])=>{
      const st = parseISO(s).getTime();
      const en = parseISO(e).getTime();
      return d >= st && d < en;
    });
  }

  function isRangeValid(house, startISO, endISO){
    if(!startISO || !endISO) return false;
    const start = parseISO(startISO);
    const end = parseISO(endISO);
    if(end.getTime() <= start.getTime()) return false;

    let cur = start;
    while(cur.getTime() < end.getTime()){
      const iso = toISO(cur);
      if(isBookedDate(house, iso)) return false;
      cur = addDays(cur, 1);
    }
    return true;
  }

  // ===== Pricing =====
  function seasonMultiplier(iso){
    const rules = window.PRICE_RULES;
    if(!rules?.seasons?.length) return 1;
    const d = parseISO(iso).getTime();
    for(const s of rules.seasons){
      const st = parseISO(s.start).getTime();
      const en = parseISO(s.end).getTime();
      if(d >= st && d < en) return s.multiplier;
    }
    return 1;
  }

  function isWeekendNight(iso){
    const rules = window.PRICE_RULES;
    const d = parseISO(iso);
    const day = d.getUTCDay();
    return (rules?.weekendDays || [5,6]).includes(day);
  }

  function nightlyRate(house, nightISO){
    const base = house.price;
    const sMul = seasonMultiplier(nightISO);
    const wMul = isWeekendNight(nightISO) ? (window.PRICE_RULES?.weekendMultiplier || 1) : 1;
    const rate = base * sMul * wMul;
    return { rate, base, sMul, wMul };
  }

  function computeStay(house, startISO, endISO){
    if(!startISO || !endISO) return null;
    const start = parseISO(startISO);
    const end = parseISO(endISO);
    if(end.getTime() <= start.getTime()) return null;

    const nights = [];
    let cur = start;
    while(cur.getTime() < end.getTime()){
      const iso = toISO(cur);
      nights.push({ iso, ...nightlyRate(house, iso) });
      cur = addDays(cur, 1);
    }
    const total = nights.reduce((sum,n)=>sum+n.rate,0);
    return { nights, total };
  }

  // ===== Calendar state =====
  let calMonth = startOfMonth(todayUTC());
  let selStart = null;
  let selEnd = null;

  function syncCalendarStateFromInputs(){
    const s = checkIn?.value || "";
    const e = checkOut?.value || "";
    selStart = s || null;
    selEnd = e || null;
    const base = selStart ? startOfMonth(parseISO(selStart)) : startOfMonth(todayUTC());
    calMonth = base;
  }

  function setInputsFromSelection(){
    if(checkIn) checkIn.value = selStart || "";
    if(checkOut) checkOut.value = selEnd || "";
    if(checkIn && checkIn.value && checkOut) checkOut.min = checkIn.value;
  }

  function renderCalendar(){
    if(!calGrid || !houseSelect) return;
    const house = getHouse(houseSelect.value);
    if(!house) return;

    calGrid.innerHTML = "";
    if(calTitle) calTitle.textContent = `Доступность: ${monthName(calMonth)}`;

    const dows = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
    for(const d of dows){
      const el = document.createElement("div");
      el.className = "cal-dow";
      el.textContent = d;
      calGrid.appendChild(el);
    }

    const first = startOfMonth(calMonth);
    const offset = dowMonFirst(first);
    const dim = daysInMonth(calMonth);
    const today = todayUTC().getTime();

    for(let i=0;i<offset;i++){
      const el = document.createElement("div");
      el.className = "cal-day muted";
      el.textContent = "";
      calGrid.appendChild(el);
    }

    for(let day=1; day<=dim; day++){
      const date = new Date(Date.UTC(calMonth.getUTCFullYear(), calMonth.getUTCMonth(), day));
      const iso = toISO(date);

      const el = document.createElement("div");
      el.className = "cal-day";
      el.textContent = String(day);

      const isPast = date.getTime() < today;
      const booked = isBookedDate(house, iso);

      if(isPast){
        el.classList.add("muted");
        el.style.cursor = "not-allowed";
        el.style.opacity = "0.35";
      }
      if(booked) el.classList.add("booked");

      if(selStart && iso === selStart) el.classList.add("selected");
      if(selEnd && iso === selEnd) el.classList.add("selected");

      if(selStart && selEnd){
        const t = date.getTime();
        const sT = parseISO(selStart).getTime();
        const eT = parseISO(selEnd).getTime();
        if(t > sT && t < eT) el.classList.add("in-range");
      }

      el.addEventListener("click", ()=>{
        if(isPast || booked) return;

        if(!selStart || (selStart && selEnd)){
          selStart = iso;
          selEnd = null;
          setInputsFromSelection();
          renderCalendar();
          updatePriceBox();
          return;
        }

        const s = parseISO(selStart);
        const e = parseISO(iso);

        if(e.getTime() <= s.getTime()){
          selStart = iso;
          selEnd = null;
          setInputsFromSelection();
          renderCalendar();
          updatePriceBox();
          return;
        }

        selEnd = iso;

        if(!isRangeValid(house, selStart, selEnd)){
          selEnd = null;
          alert("Выбранный период пересекается с занятыми датами. Выберите другие даты.");
        }

        setInputsFromSelection();
        renderCalendar();
        updatePriceBox();
      });

      calGrid.appendChild(el);
    }
  }

  function updatePriceBox(){
    if(!nightsOut || !baseOut || !modsOut || !totalOut || !breakdownOut) return;

    const house = getHouse(houseSelect?.value);
    if(!house){
      nightsOut.textContent = baseOut.textContent = modsOut.textContent = totalOut.textContent = "—";
      breakdownOut.textContent = "";
      return;
    }

    const s = checkIn?.value || selStart;
    const e = checkOut?.value || selEnd;

    if(!s || !e){
      nightsOut.textContent = "—";
      baseOut.textContent = `${fmtMoney(house.price)} ₽/ночь`;
      modsOut.textContent = "—";
      totalOut.textContent = "—";
      breakdownOut.textContent = "Выберите даты заезда и выезда, чтобы увидеть стоимость.";
      return;
    }

    if(!isRangeValid(house, s, e)){
      nightsOut.textContent = "—";
      baseOut.textContent = `${fmtMoney(house.price)} ₽/ночь`;
      modsOut.textContent = "—";
      totalOut.textContent = "—";
      breakdownOut.textContent = "Период недоступен: есть занятые даты.";
      return;
    }

    const stay = computeStay(house, s, e);
    if(!stay || stay.nights.length === 0){
      breakdownOut.textContent = "Проверьте даты: выезд должен быть позже заезда.";
      return;
    }

    nightsOut.textContent = String(stay.nights.length);
    baseOut.textContent = `${fmtMoney(house.price)} ₽/ночь`;

    const anySeason = stay.nights.some(n => n.sMul !== 1);
    const anyWeekend = stay.nights.some(n => n.wMul !== 1);
    const mods = [
      anySeason ? "сезон" : null,
      anyWeekend ? "выходные" : null
    ].filter(Boolean).join(" + ") || "нет";
    modsOut.textContent = mods;

    totalOut.textContent = `${fmtMoney(stay.total)} ₽`;

    const lines = stay.nights.slice(0, 6).map(n => {
      const parts = [];
      if(n.sMul !== 1) parts.push(`сезон×${n.sMul}`);
      if(n.wMul !== 1) parts.push(`вых×${n.wMul}`);
      const suffix = parts.length ? ` (${parts.join(", ")})` : "";
      return `${n.iso}: ${fmtMoney(n.rate)} ₽${suffix}`;
    });
    const more = stay.nights.length > 6 ? `… и ещё ${stay.nights.length - 6} ноч.` : "";
    breakdownOut.textContent = `Разбивка по ночам: ${lines.join(" • ")} ${more}`.trim();
  }

  function onDatesChanged(){
    const house = getHouse(houseSelect?.value);
    if(!house) return;

    if(checkIn?.value && checkOut?.value && checkOut.value <= checkIn.value){
      checkOut.value = "";
      selEnd = null;
    }
    selStart = checkIn?.value || null;
    selEnd = checkOut?.value || null;

    if(selStart && selEnd && !isRangeValid(house, selStart, selEnd)){
      alert("Период пересекается с занятыми датами. Выберите другие даты.");
      checkOut.value = "";
      selEnd = null;
    }

    renderCalendar();
    updatePriceBox();
  }

  // ===== Modal open/close =====
  function openModal(houseId){
    closeMobileNav();
    if(!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    lockScroll(true);

    if(houseSelect){
      if(houseId) houseSelect.value = houseId;
      setSummary(houseSelect.value);

      const t = todayUTC();
      const minISO = toISO(t);
      if(checkIn) checkIn.min = minISO;
      if(checkOut) checkOut.min = minISO;

      syncCalendarStateFromInputs();
      renderCalendar();
      updatePriceBox();
      setTimeout(()=>houseSelect.focus(), 40);
    }
  }

  function closeModal(){
    if(!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    lockScroll(false);
  }

  if(closeBtn) closeBtn.addEventListener("click", closeModal);
  if(modal){
    modal.addEventListener("click",(e)=>{ if(e.target===modal) closeModal(); });
    document.addEventListener("keydown",(e)=>{ if(e.key==="Escape" && modal.classList.contains("open")) closeModal(); });
  }

  qsa("[data-open-booking]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.houseId || null;
      openModal(id);
    });
  });

  if(calPrev){
    calPrev.addEventListener("click", ()=>{
      calMonth = startOfMonth(new Date(Date.UTC(calMonth.getUTCFullYear(), calMonth.getUTCMonth()-1, 1)));
      renderCalendar();
    });
  }
  if(calNext){
    calNext.addEventListener("click", ()=>{
      calMonth = startOfMonth(new Date(Date.UTC(calMonth.getUTCFullYear(), calMonth.getUTCMonth()+1, 1)));
      renderCalendar();
    });
  }

  if(houseSelect){
    fillHouseSelect();
    setSummary(houseSelect.value);

    houseSelect.addEventListener("change", ()=>{
      setSummary(houseSelect.value);
      if(checkIn) checkIn.value = "";
      if(checkOut) checkOut.value = "";
      selStart = selEnd = null;
      syncCalendarStateFromInputs();
      renderCalendar();
      updatePriceBox();
    });
  }
  if(checkIn) checkIn.addEventListener("change", onDatesChanged);
  if(checkOut) checkOut.addEventListener("change", onDatesChanged);

  // ===== Catalog list rendering =====
  const listEl = qs("#list");
  function typeLabel(t){
    if(t==="chalet") return "шале";
    if(t==="dome") return "купол";
    if(t==="river") return "у воды";
    return "домик";
  }

  function renderList(items){
    if(!listEl) return;
    if(!items.length){
      listEl.innerHTML = `<div class="card" style="background: rgba(255,255,255,.65); color:#0b120d;">
        Ничего не найдено. Попробуйте изменить фильтры.
      </div>`;
      return;
    }

    listEl.innerHTML = items.map(h => `
      <article class="listing">
        <div class="listing-info">
          <div>
            <h3>
              <a href="house.html?id=${encodeURIComponent(h.id)}" style="text-decoration:underline; text-underline-offset:3px;">
                ${h.title}
              </a>
            </h3>
            <p class="desc">${h.desc}</p>
          </div>

          <div class="chips">${(h.tags||[]).slice(0,6).map(t=>`<span class="chip">${t}</span>`).join("")}</div>

          <div class="meta">
            <div>до <b>${h.guests}</b> гостей</div>
            <div>площадь: <b>${h.area} м²</b></div>
            <div>тип: <b>${typeLabel(h.type)}</b></div>
          </div>

          <div class="price-row">
            <div><span class="price">${fmtMoney(h.price)} ₽</span><span class="per">/ ночь</span></div>
            <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
              <a class="btn" href="house.html?id=${encodeURIComponent(h.id)}">Подробнее</a>
              <button class="btn-apply" type="button" data-open-booking data-house-id="${h.id}">Оставить заявку</button>
            </div>
          </div>
        </div>

        <div class="media" aria-hidden="true">
          <div class="img" style="background-image:url('${h.images?.[0] || ""}')"></div>
          <div class="shade"></div>
        </div>
      </article>
    `).join("");

    qsa("[data-open-booking]", listEl).forEach(btn=>{
      btn.addEventListener("click", ()=>openModal(btn.dataset.houseId || null));
    });
  }

  const qEl = qs("#q");
  const typeEl = qs("#type");
  const guestsEl = qs("#guests");
  const maxPriceEl = qs("#maxPrice");
  const resetEl = qs("#reset");

  function applyFilters(){
    if(!listEl || !window.HOUSES) return;
    const q = (qEl?.value || "").trim().toLowerCase();
    const type = typeEl?.value || "all";
    const minGuests = Number(guestsEl?.value || 0);
    const maxPrice = Number(maxPriceEl?.value || 0);

    const filtered = window.HOUSES.filter(h => {
      const hay = [h.title, h.subtitle, h.desc, ...(h.tags||[])].join(" ").toLowerCase();
      const matchesQ = !q || hay.includes(q);
      const matchesType = type==="all" ? true : h.type===type;
      const matchesGuests = h.guests >= minGuests;
      const matchesPrice = !maxPrice ? true : h.price <= maxPrice;
      return matchesQ && matchesType && matchesGuests && matchesPrice;
    });

    renderList(filtered);
  }

  if(listEl && window.HOUSES){
    renderList(window.HOUSES);
    if(qEl) qEl.addEventListener("input", applyFilters);
    if(typeEl) typeEl.addEventListener("change", applyFilters);
    if(guestsEl) guestsEl.addEventListener("change", applyFilters);
    if(maxPriceEl) maxPriceEl.addEventListener("input", applyFilters);
    if(resetEl) resetEl.addEventListener("click", ()=>{
      qEl.value=""; typeEl.value="all"; guestsEl.value="0"; maxPriceEl.value="";
      applyFilters();
    });
  }

  // ===== House page render =====
  const houseRoot = qs("#houseRoot");
  if(houseRoot && window.HOUSES){
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || window.HOUSES[0].id;
    const h = getHouse(id);

    houseRoot.innerHTML = `
      <div class="gallery">
        <div class="main"><div class="img" style="background-image:url('${h.images?.[0]||""}')"></div></div>
        <div class="side">
          <div class="thumb"><div class="img" style="background-image:url('${h.images?.[1]||h.images?.[0]||""}')"></div></div>
          <div class="thumb"><div class="img" style="background-image:url('${h.images?.[2]||h.images?.[0]||""}')"></div></div>
        </div>
      </div>

      <div class="section" style="padding:18px 0 0; border-top:none;">
        <div class="grid-2">
          <div class="card">
            <h2 style="margin:0 0 8px;">${h.title}</h2>
            <div style="color: rgba(238,242,238,.78); margin-bottom:10px;">${h.subtitle || ""}</div>
            <p style="margin:0; color: rgba(238,242,238,.86); line-height:1.55;">${h.desc}</p>
            <div class="chips" style="margin-top:12px;">
              ${(h.tags||[]).map(t=>`<span class="chip" style="border-color:rgba(255,255,255,.12); background:rgba(255,255,255,.06); color:rgba(238,242,238,.86);">${t}</span>`).join("")}
            </div>
          </div>

          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:12px; flex-wrap:wrap;">
              <div>
                <div style="color: rgba(238,242,238,.78); font-size: 13px;">Стоимость</div>
                <div style="font-size: 26px; font-weight: 800; letter-spacing:-.2px;">
                  ${fmtMoney(h.price)} ₽ <span style="font-size:13px; font-weight:700; color: rgba(238,242,238,.78)">/ ночь</span>
                </div>
              </div>
              <button class="btn btn-primary" type="button" data-open-booking data-house-id="${h.id}">Забронировать</button>
            </div>
          </div>
        </div>
      </div>
    `;

    qsa('[data-open-booking][data-house-id]').forEach(btn=>{
      btn.addEventListener("click", ()=>openModal(btn.dataset.houseId));
    });
  }

  // ===== Form submit demo =====
  const form = qs("#bookingForm");
  if(form){
    form.addEventListener("submit", (e)=>{
      e.preventDefault();

      const payload = Object.fromEntries(new FormData(form).entries());
      const h = getHouse(payload.houseId);

      if(!payload.checkIn || !payload.checkOut){
        alert("Выберите даты заезда и выезда.");
        return;
      }
      if(!isRangeValid(h, payload.checkIn, payload.checkOut)){
        alert("Нельзя отправить заявку: период недоступен (есть занятые даты).");
        return;
      }

      const stay = computeStay(h, payload.checkIn, payload.checkOut);
      alert(
        "Заявка отправлена!\n\n" +
        `Домик: ${h.title}\n` +
        `Даты: ${payload.checkIn} — ${payload.checkOut}\n` +
        `Ночей: ${stay?.nights?.length || "—"}\n` +
        `Итого: ${stay ? fmtMoney(stay.total) + " ₽" : "—"}\n\n` +
        `Контакт: ${payload.name}, ${payload.phone}\n\n` +
        "Мы свяжемся с вами для подтверждения."
      );

      form.reset();
      selStart = selEnd = null;
      syncCalendarStateFromInputs();
      renderCalendar();
      updatePriceBox();
      closeModal();
    });
  }

  // Init
  if(modal && houseSelect){
    fillHouseSelect();
    setSummary(houseSelect.value);
    syncCalendarStateFromInputs();
    renderCalendar();
    updatePriceBox();
  }
})();