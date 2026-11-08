/* Doña Paquita · pro.js: pedido con carrito y reserva de mesa por WhatsApp (IIFE, sin módulos) */
(function () {
  "use strict";
  var WA = "51999999999"; // número del restaurante: solo dígitos, con código de país
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[pro] " + name, e); } }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var soles = function (n) { return "S/ " + n.toFixed(2); };
  function waUrl(text) {
    if (!/^519\d{8}$/.test(WA)) throw new Error("Número de WhatsApp no válido");
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
  }
  function clean(s, max) { return String(s).replace(/[\u0000-\u001F\u007F<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max); }

  // Horario (0 = domingo): [abre, cierra] en horas
  var HOURS = { 0: [12, 15.5], 1: [12, 16], 2: [12, 16], 3: [12, 16], 4: [12, 16], 5: [12, 16], 6: [12, 17] };
  function limaNow() {
    try {
      var o = {};
      new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", weekday: "short", hour: "numeric", minute: "numeric", hour12: false })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), h: (parseInt(o.hour, 10) % 24) + parseInt(o.minute, 10) / 60 };
    } catch (e) { var d = new Date(); return { day: d.getDay(), h: d.getHours() + d.getMinutes() / 60 }; }
  }

  /* ---------- Carrito ---------- */
  var cart = {};
  function initCart() {
    var bar = $("[data-cart]"); if (!bar) return;
    var count = $("[data-cart-count]", bar), total = $("[data-cart-total]", bar), link = $("[data-cart-link]", bar);
    function render() {
      var items = 0, sum = 0, lines = [];
      Object.keys(cart).forEach(function (k) {
        var it = cart[k]; items += it.n; sum += it.n * it.price;
        lines.push("• " + it.n + " x " + it.name + " (" + soles(it.n * it.price) + ")");
      });
      bar.classList.toggle("show", items > 0);
      bar.setAttribute("aria-hidden", String(items === 0));
      count.textContent = items + (items === 1 ? " plato" : " platos");
      total.textContent = soles(sum);
      link.href = waUrl("Hola Doña Paquita, quiero hacer este pedido:\n" + lines.join("\n") + "\nTotal referencial: " + soles(sum) + "\nEs para: (delivery / recojo)\nMi dirección es: ");
      $$(".dish").forEach(function (d) {
        var n = cart[d.dataset.id] ? cart[d.dataset.id].n : 0;
        $(".add", d).hidden = n > 0; $(".qty", d).hidden = n === 0; $(".qty output", d).textContent = n;
      });
    }
    function set(d, n) {
      n = Math.max(0, Math.min(20, n));
      if (n === 0) delete cart[d.dataset.id];
      else cart[d.dataset.id] = { name: d.dataset.name, price: parseFloat(d.dataset.price), n: n };
      render();
    }
    function btn(cls, label, text) {
      var b = document.createElement("button"); b.type = "button"; b.className = cls || ""; b.textContent = text;
      if (label) b.setAttribute("aria-label", label); return b;
    }
    $$(".dish").forEach(function (d, i) {
      if (d.dataset.bound) return; d.dataset.bound = "1";
      var name = clean($("h3", d).textContent, 60), price = parseFloat($(".price", d).textContent.replace(/[^\d.]/g, ""));
      if (!name || !(price > 0)) return;
      d.dataset.id = "p" + i; d.dataset.name = name; d.dataset.price = String(price);
      var wrap = document.createElement("div"); wrap.className = "dish-add";
      var add = btn("add", "Agregar " + name + " al pedido", "Agregar");
      var qty = document.createElement("div"); qty.className = "qty"; qty.hidden = true;
      var minus = btn("", "Quitar uno", "−"), out = document.createElement("output"), plus = btn("", "Agregar uno", "+");
      out.setAttribute("aria-live", "polite"); out.textContent = "0";
      qty.appendChild(minus); qty.appendChild(out); qty.appendChild(plus);
      wrap.appendChild(add); wrap.appendChild(qty);
      $(".dish-body", d).appendChild(wrap);
      add.addEventListener("click", function () { set(d, 1); });
      minus.addEventListener("click", function () { set(d, (cart[d.dataset.id] || { n: 0 }).n - 1); });
      plus.addEventListener("click", function () { set(d, (cart[d.dataset.id] || { n: 0 }).n + 1); });
    });
    $("[data-clear]", bar).addEventListener("click", function () { cart = {}; render(); });
    render();
  }

  /* ---------- Reserva de mesa ---------- */
  function initReserva() {
    var f = $("[data-reserva]"); if (!f || f.dataset.bound) return; f.dataset.bound = "1";
    var name = $("#r-nombre", f), day = $("#r-dia", f), hour = $("#r-hora", f), ppl = $("#r-personas", f), err = $("[data-err]", f), ok = $("[data-ok]"), okLink = $("[data-oklink]");
    var names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], now = limaNow();
    function opt(sel, value, text) { var o = document.createElement("option"); o.value = value; o.textContent = text; sel.appendChild(o); }
    for (var k = 0; k < 7; k++) {
      var d = (now.day + k) % 7;
      opt(day, d + "|" + k, k === 0 ? "Hoy" : k === 1 ? "Mañana" : names[d]);
    }
    for (var p = 1; p <= 12; p++) opt(ppl, String(p), p + (p === 1 ? " persona" : " personas"));
    ppl.value = "2";
    function fillHours() {
      var parts = day.value.split("|"), r = HOURS[+parts[0]], today = parts[1] === "0", prev = hour.value;
      hour.textContent = "";
      for (var h = r[0]; h <= r[1] - 1; h += 0.5) {
        if (today && h <= now.h + 0.5) continue;
        var t = Math.floor(h) + ":" + (h % 1 ? "30" : "00"); opt(hour, t, t);
      }
      if (!hour.options.length) opt(hour, "", "Sin horarios, elige otro día");
      hour.value = prev; if (!hour.value) hour.selectedIndex = 0;
    }
    day.addEventListener("change", fillHours);
    name.addEventListener("input", function () { name.removeAttribute("aria-invalid"); err.textContent = ""; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = clean(name.value, 40);
      if (n.length < 2) { name.setAttribute("aria-invalid", "true"); err.textContent = "Escribe tu nombre para la reserva."; name.focus(); return; }
      if (!hour.value) { err.textContent = "Ese día ya no hay horarios. Elige otro día."; day.focus(); return; }
      var dayTxt = day.options[day.selectedIndex].textContent;
      var url = waUrl("Hola Doña Paquita, quiero reservar una mesa.\nNombre: " + n + "\nDía: " + dayTxt + "\nHora: " + hour.value + "\nPersonas: " + ppl.value);
      okLink.href = url; ok.hidden = false;
      var w = window.open(url, "_blank", "noopener,noreferrer"); if (w) w.opener = null;
    });
    fillHours();
  }

  function boot() { safe(initCart, "carrito"); safe(initReserva, "reserva"); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
