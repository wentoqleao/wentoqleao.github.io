/* Amore · sede.js: la sede elegida decide a qué WhatsApp llegan reservas y pedidos */
(function () {
  "use strict";
  var SEDES = {"miraflores": {"n": "Miraflores", "dir": "Calle Atahualpa 175, Miraflores", "wa": "51963801913", "tel": "963 801 913", "maps": "https://www.google.com/maps/search/?api=1&query=Amore+Miraflores,+Calle+Atahualpa+175,+Miraflores"}, "lamolina": {"n": "La Molina", "dir": "Av. La Fontana 1125, La Molina", "wa": "51940210318", "tel": "940 210 318", "maps": "https://www.google.com/maps/search/?api=1&query=Amore+La+Molina,+Av.+La+Fontana+1125,+La+Molina"}}, KEY = "amore-sede", cur = "miraflores", subs = [];
  try { var s = localStorage.getItem(KEY); if (SEDES[s]) cur = s; } catch (e) {}
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function apply() {
    var S = SEDES[cur];
    each("a[data-wa]", function (a) { a.href = a.href.replace(/wa\.me\/\d+/, "wa.me/" + S.wa); });
    each("[data-sede-btn]", function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-sede-btn") === cur)); });
    each("[data-sede-name]", function (x) { x.textContent = S.n; });
    each("[data-sede-addr]", function (x) { x.textContent = S.dir; });
    each("[data-sede-tel]", function (x) { x.textContent = S.tel; });
    each("select[name=sede]", function (x) { x.value = cur; });
    subs.forEach(function (f) { try { f(api.get()); } catch (e) {} });
  }
  var api = {
    list: SEDES,
    get: function () { var S = SEDES[cur]; return { k: cur, n: S.n, dir: S.dir, wa: S.wa, tel: S.tel, maps: S.maps }; },
    set: function (k) { if (!SEDES[k] || k === cur) return; cur = k; try { localStorage.setItem(KEY, k); } catch (e) {} apply(); },
    on: function (f) { subs.push(f); }
  };
  window.AmoreSede = api;
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-sede-btn]");
    if (b) api.set(b.getAttribute("data-sede-btn"));
  });
  document.addEventListener("change", function (ev) { if (ev.target.name === "sede") api.set(ev.target.value); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
