(function () {
  "use strict";
  /* La Olla Anticuchería · main.js (IIFE, sin módulos) · arquetipo Brutalist Grid */
  var WA = "51975889322"; // solo dígitos, con código de país
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[init] " + name, e); } }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var soles = function (n) { return "S/ " + n.toFixed(2); };
  function waUrl(text) {
    if (!/^519\d{8}$/.test(WA)) throw new Error("Número de WhatsApp no válido");
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
  }
  function clean(s, max) { return String(s).replace(/[\u0000-\u001F\u007F<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max); }

  // Horario (0 = domingo): [abre, cierra] en horas; 24 = medianoche
  var HOURS = { 0: [12, 24], 1: [16.5, 24], 2: [16.5, 24], 3: [16.5, 24], 4: [16.5, 24], 5: [16.5, 24], 6: [16.5, 24] };
  function limaNow() {
    try {
      var o = {};
      new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", weekday: "short", hour: "numeric", minute: "numeric", hour12: false })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (parseInt(o.hour, 10) % 24) + parseInt(o.minute, 10) / 60 };
    } catch (e) { var d = new Date(); return { day: d.getDay(), h: d.getHours() + d.getMinutes() / 60 }; }
  }
  function fmt(h) {
    var hh = Math.floor(h) % 24, mm = h % 1 ? "30" : "00", ap = hh >= 12 ? "pm" : "am", h12 = hh % 12 || 12;
    return h12 + ":" + mm + " " + ap;
  }


  var canHover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  function initSplit() {
    $$("[data-split]").forEach(function (el) {
      if (el.dataset.splitDone) return; el.dataset.splitDone = "1";
      el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
      var lines = [], cur = document.createDocumentFragment();
      Array.prototype.slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeName === "BR") { lines.push(cur); cur = document.createDocumentFragment(); }
        else cur.appendChild(n);
      });
      lines.push(cur);
      el.textContent = "";
      lines.forEach(function (frag, i) {
        var outer = document.createElement("span"), inner = document.createElement("span");
        outer.className = "split-line"; outer.setAttribute("aria-hidden", "true");
        inner.style.setProperty("--d", (i * 110) + "ms"); inner.appendChild(frag);
        outer.appendChild(inner); el.appendChild(outer);
      });
    });
    var go = function () { document.documentElement.classList.add("is-in"); };
    requestAnimationFrame(function () { setTimeout(go, 80); });
    setTimeout(go, 1500);
  }

  function initCount() {
    var els = $$("[data-count]"); if (!els.length || !("IntersectionObserver" in window)) return;
    var run = function (el) {
      var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || "", t0 = null;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1300), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = String(v).padStart(String(end).length, "0") + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }); }, { threshold: 0.01 });
    els.forEach(function (e) { io.observe(e); });
  }

  function initCursor() {
    if (!canHover) return;
    var c = $("[data-xy]"); if (!c) return;
    window.addEventListener("mousemove", function (e) {
      if (e.clientX === 0 && e.clientY === 0) return;
      c.textContent = "[" + String(Math.round(e.clientX)).padStart(3, "0") + ", " + String(Math.round(e.clientY)).padStart(3, "0") + "]";
      c.style.transform = "translate(" + (e.clientX + 16) + "px," + (e.clientY + 18) + "px)";
      c.classList.add("on");
    }, { passive: true });
    document.addEventListener("mouseleave", function () { c.classList.remove("on"); });
  }

  function initStatus() {
    var el = $("[data-status]"); if (!el) return;
    var n = limaNow(), r = HOURS[n.day], open = n.h >= r[0] && n.h < r[1];
    el.classList.add(open ? "open" : "closed");
    $("span", el).textContent = open ? "Abierto ahora · hasta las 12:00 am" : "Cerrado · hoy abrimos a las " + fmt(r[0]);
    if (!open && n.h >= r[1]) $("span", el).textContent = "Cerrado · abrimos mañana a las " + fmt(HOURS[(n.day + 1) % 7][0]);
  }

  function initNav() {
    var nav = $("[data-nav]"), ticking = false;
    function up() { ticking = false; if (nav) nav.classList.toggle("is-solid", (window.scrollY || 0) > 30); }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(up); } }, { passive: true });
    up();
  }

  function initReveal() {
    var els = $$(".reveal:not([data-split])");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { $$(".reveal:not(.is-visible):not([data-split])").forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible"); }); }, 6000);
  }

  function initTabs() {
    var tabs = $$(".tab"), groups = $$(".grp");
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (o) { o.setAttribute("aria-pressed", String(o === t)); });
        groups.forEach(function (g) { g.hidden = g.dataset.cat !== t.dataset.cat; });
      });
    });
  }

  var cart = {};
  function initCart() {
    var bar = $("[data-cart]"); if (!bar) return;
    var count = $("[data-cart-count]", bar), total = $("[data-cart-total]", bar), link = $("[data-cart-link]", bar);
    var items = $$(".item");
    function render() {
      var n = 0, sum = 0, lines = [];
      Object.keys(cart).forEach(function (k) { var it = cart[k]; n += it.n; sum += it.n * it.price; lines.push("• " + it.n + " x " + it.name + " (" + soles(it.n * it.price) + ")"); });
      bar.classList.toggle("show", n > 0); bar.setAttribute("aria-hidden", String(n === 0));
      count.textContent = n + (n === 1 ? " producto" : " productos"); total.textContent = soles(sum);
      link.href = waUrl("Hola La Olla, quiero hacer este pedido:\n" + lines.join("\n") + "\nTotal referencial: " + soles(sum) + "\nEs para: (delivery / recojo)\nMi dirección es: ");
      items.forEach(function (d) {
        var q = cart[d.dataset.id] ? cart[d.dataset.id].n : 0;
        $(".add", d).hidden = q > 0; $(".qty", d).hidden = q === 0; $(".qty output", d).textContent = q;
      });
    }
    function set(d, q) {
      q = Math.max(0, Math.min(20, q));
      if (q === 0) delete cart[d.dataset.id]; else cart[d.dataset.id] = { name: d.dataset.name, price: +d.dataset.price, n: q };
      render();
    }
    function btn(cls, label, text) { var b = document.createElement("button"); b.type = "button"; b.className = cls; b.textContent = text; b.setAttribute("aria-label", label); return b; }
    items.forEach(function (d, i) {
      var name = clean($("h4", d).textContent, 60), price = parseFloat($(".pr", d).textContent.replace(/[^\d.]/g, ""));
      if (!name || !(price > 0)) return;
      d.dataset.id = "i" + i; d.dataset.name = name; d.dataset.price = String(price);
      var wrap = document.createElement("div"); wrap.className = "it-add";
      var add = btn("add", "Agregar " + name + " al pedido", "Agregar");
      var qty = document.createElement("div"); qty.className = "qty"; qty.hidden = true;
      var minus = btn("", "Quitar uno de " + name, "−"), out = document.createElement("output"), plus = btn("", "Agregar uno de " + name, "+");
      out.textContent = "0"; out.setAttribute("aria-live", "polite");
      qty.appendChild(minus); qty.appendChild(out); qty.appendChild(plus); wrap.appendChild(add); wrap.appendChild(qty); d.appendChild(wrap);
      add.addEventListener("click", function () { set(d, 1); });
      minus.addEventListener("click", function () { set(d, (cart[d.dataset.id] || { n: 0 }).n - 1); });
      plus.addEventListener("click", function () { set(d, (cart[d.dataset.id] || { n: 0 }).n + 1); });
    });
    $("[data-clear]", bar).addEventListener("click", function () { cart = {}; render(); });
    render();
  }

  function initReserva() {
    var f = $("[data-reserva]"); if (!f) return;
    var name = $("#r-nombre", f), day = $("#r-dia", f), hour = $("#r-hora", f), ppl = $("#r-personas", f), err = $("[data-err]", f), ok = $("[data-ok]", f), okLink = $("[data-oklink]", f);
    var names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], now = limaNow();
    function opt(sel, v, t) { var o = document.createElement("option"); o.value = v; o.textContent = t; sel.appendChild(o); }
    for (var k = 0; k < 7; k++) { var d = (now.day + k) % 7; opt(day, d + "|" + k, k === 0 ? "Hoy" : k === 1 ? "Mañana" : names[d]); }
    for (var p = 1; p <= 20; p++) opt(ppl, String(p), p + (p === 1 ? " persona" : " personas"));
    ppl.value = "4";
    function fill() {
      var parts = day.value.split("|"), r = HOURS[+parts[0]], today = parts[1] === "0", prev = hour.value;
      hour.textContent = "";
      for (var h = r[0]; h <= r[1] - 1; h += 0.5) { if (today && h <= now.h + 0.5) continue; opt(hour, fmt(h), fmt(h)); }
      if (!hour.options.length) opt(hour, "", "Sin horarios, elige otro día");
      hour.value = prev; if (!hour.value) hour.selectedIndex = 0;
    }
    day.addEventListener("change", fill);
    name.addEventListener("input", function () { name.removeAttribute("aria-invalid"); err.textContent = ""; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = clean(name.value, 40);
      if (n.length < 2) { name.setAttribute("aria-invalid", "true"); err.textContent = "Escribe tu nombre para la reserva."; name.focus(); return; }
      if (!hour.value) { err.textContent = "Ese día ya no hay horarios. Elige otro día."; day.focus(); return; }
      var url = waUrl("Hola La Olla, quiero reservar una mesa.\nNombre: " + n + "\nDía: " + day.options[day.selectedIndex].textContent + "\nHora: " + hour.value + "\nPersonas: " + ppl.value);
      okLink.href = url; ok.hidden = false;
      window.open(url, "_blank", "noopener,noreferrer");
    });
    fill();
  }

  function boot() {
    safe(initSplit, "split"); safe(initStatus, "estado"); safe(initCount, "contador"); safe(initCursor, "cursor"); safe(initNav, "nav"); safe(initReveal, "reveal"); safe(initTabs, "tabs"); safe(initCart, "carrito"); safe(initReserva, "reserva");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
