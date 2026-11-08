(function () {
  "use strict";
  /* El Filo Barbería · main.js (IIFE, sin módulos) */
  var WA = "51999999999";
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[init] " + name, e); } }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var canHover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Horario: 0 = domingo ... 6 = sábado, [abre, cierra] en horas
  var HOURS = { 0: [10, 15], 1: [10, 21], 2: [10, 21], 3: [10, 21], 4: [10, 21], 5: [10, 21], 6: [10, 21] };
  function limaNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
      return { day: day, h: (parseInt(o.hour, 10) % 24) + parseInt(o.minute, 10) / 60 };
    } catch (e) { var d = new Date(); return { day: d.getDay(), h: d.getHours() + d.getMinutes() / 60 }; }
  }

  function initHero() {
    var go = function () { document.documentElement.classList.add("is-in"); };
    requestAnimationFrame(function () { setTimeout(go, 120); });
    setTimeout(go, 1500);
  }

  function initStatus() {
    var el = $("[data-status]"); if (!el) return;
    var n = limaNow(), r = HOURS[n.day], open = n.h >= r[0] && n.h < r[1];
    el.classList.toggle("open", open);
    $("span", el).textContent = open ? "Abierto ahora · hasta las " + r[1] + ":00" : "Cerrado · abrimos a las " + (n.h < r[0] ? r[0] : HOURS[(n.day + 1) % 7][0]) + ":00";
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
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible"); });
    }, 6000);
  }

  function initGallery() {
    var track = $("[data-track]"); if (!track) return;
    $$("[data-dir]").forEach(function (b) {
      if (b.dataset.bound) return; b.dataset.bound = "1";
      b.addEventListener("click", function () {
        var card = $(".shot", track), step = card ? card.getBoundingClientRect().width + 22 : 300;
        track.scrollBy({ left: step * parseInt(b.dataset.dir, 10), behavior: "smooth" });
      });
    });
  }

  function initTilt() {
    if (!canHover) return;
    $$("[data-tilt]").forEach(function (c) {
      if (c.dataset.tiltBound) return; c.dataset.tiltBound = "1";
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", (x * 100) + "%"); c.style.setProperty("--my", (y * 100) + "%");
        c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 7).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 7).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseout", function (e) { if (!c.contains(e.relatedTarget)) c.style.transform = ""; });
    });
  }

  function initBooking() {
    var f = $("[data-book]"); if (!f || f.dataset.bound) return; f.dataset.bound = "1";
    var day = $("#b-dia", f), hour = $("#b-hora", f), name = $("#b-nombre", f), serv = $("#b-servicio", f), barb = $("#b-barbero", f);
    var sum = $("[data-summary]", f), err = $("[data-err]", f), ok = $("[data-ok]"), okLink = $("[data-oklink]"), btn = $("button[type=submit]", f);
    var names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    var now = limaNow();
    day.innerHTML = "";
    for (var k = 0; k < 7; k++) {
      var d = (now.day + k) % 7, label = k === 0 ? "Hoy (" + names[d].toLowerCase() + ")" : k === 1 ? "Mañana (" + names[d].toLowerCase() + ")" : names[d];
      var o = document.createElement("option"); o.value = d + "|" + k; o.textContent = label; day.appendChild(o);
    }
    function fillHours() {
      var parts = day.value.split("|"), d = +parts[0], isToday = parts[1] === "0", r = HOURS[d], prev = hour.value;
      hour.innerHTML = "";
      for (var h = r[0]; h < r[1]; h += 0.5) {
        if (isToday && h <= now.h + 0.25) continue;
        var t = Math.floor(h) + ":" + (h % 1 ? "30" : "00"), o = document.createElement("option");
        o.value = t; o.textContent = t; hour.appendChild(o);
      }
      if (!hour.options.length) { var o2 = document.createElement("option"); o2.value = ""; o2.textContent = "Sin turnos hoy, elige otro día"; hour.appendChild(o2); }
      if (prev) hour.value = prev;
      if (!hour.value && hour.options.length) hour.selectedIndex = 0;
      update();
    }
    function message() {
      return "Hola, quiero reservar en El Filo.%0A" +
        "Servicio: " + encodeURIComponent(serv.value) + "%0A" +
        "Barbero: " + encodeURIComponent(barb.value) + "%0A" +
        "Día: " + encodeURIComponent(day.options[day.selectedIndex].textContent) + " a las " + encodeURIComponent(hour.value) + "%0A" +
        "Nombre: " + encodeURIComponent(name.value.trim());
    }
    function update() {
      sum.innerHTML = "<b>" + serv.value + "</b> con " + barb.value.toLowerCase() + ", " + day.options[day.selectedIndex].textContent.toLowerCase() + (hour.value ? " a las <b>" + hour.value + "</b>" : "") + ".";
    }
    day.addEventListener("change", fillHours);
    [hour, serv, barb].forEach(function (el) { el.addEventListener("change", update); });
    name.addEventListener("input", function () { name.removeAttribute("aria-invalid"); err.textContent = ""; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (name.value.trim().length < 2) { name.setAttribute("aria-invalid", "true"); err.textContent = "Escribe tu nombre para que el barbero sepa a quién esperar."; name.focus(); return; }
      if (!hour.value) { err.textContent = "Ese día ya no quedan turnos. Elige otro día."; day.focus(); return; }
      btn.disabled = true; var txt = btn.innerHTML; btn.textContent = "Preparando tu reserva…";
      var url = "https://wa.me/" + WA + "?text=" + message();
      setTimeout(function () {
        btn.disabled = false; btn.innerHTML = txt;
        okLink.href = url; ok.classList.add("show");
        try { window.open(url, "_blank", "noopener"); } catch (x) {}
      }, 900);
    });
    fillHours();
  }

  function boot() {
    safe(initHero, "hero");
    safe(initStatus, "status");
    safe(initNav, "nav");
    safe(initReveal, "reveal");
    safe(initGallery, "galeria");
    safe(initTilt, "tilt");
    safe(initBooking, "reserva");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
