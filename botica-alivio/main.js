(function () {
  "use strict";
  /* Botica Alivio · main.js (IIFE, sin módulos) */
  var WA = "51999999999";
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[init] " + name, e); } }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var canHover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var soles = function (n) { return "S/ " + n.toFixed(2); };
  var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };

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

  function initNavPill() {
    var box = $(".nav-links"), pill = $(".nav-pill"); if (!box || !pill) return;
    $$("a", box).forEach(function (a) {
      a.addEventListener("mouseover", function () {
        pill.style.width = a.offsetWidth + "px";
        pill.style.transform = "translateX(" + a.offsetLeft + "px)";
        pill.style.opacity = "1";
      });
    });
    box.addEventListener("mouseout", function (e) { if (!box.contains(e.relatedTarget)) pill.style.opacity = "0"; });
  }

  function initMagnetic() {
    if (!canHover) return;
    $$("[data-magnetic]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + "px)";
      });
      b.addEventListener("mouseout", function (e) { if (!b.contains(e.relatedTarget)) b.style.transform = ""; });
    });
  }

  var cart = {};
  var state = { cat: "todo", q: "" };

  function applyFilter() {
    var shown = 0, q = norm(state.q.trim());
    $$(".prod").forEach(function (p) {
      var ok = (state.cat === "todo" || p.dataset.cat === state.cat) && (!q || norm(p.dataset.q).indexOf(q) !== -1);
      p.hidden = !ok; if (ok) shown++;
    });
    var empty = $("[data-empty]");
    if (empty) empty.hidden = shown > 0;
  }

  function initCatalog() {
    var cats = $$(".cat");
    cats.forEach(function (c) {
      if (c.dataset.bound) return; c.dataset.bound = "1";
      c.addEventListener("click", function () {
        cats.forEach(function (o) { o.setAttribute("aria-pressed", String(o === c)); });
        state.cat = c.dataset.cat; applyFilter();
      });
    });
    var inputs = $$("[data-search]");
    inputs.forEach(function (inp) {
      inp.addEventListener("input", function () {
        state.q = inp.value;
        inputs.forEach(function (o) { if (o !== inp) o.value = inp.value; });
        applyFilter();
      });
    });
    var heroForm = $("[data-hero-search]");
    if (heroForm) heroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      cats.forEach(function (o) { o.setAttribute("aria-pressed", String(o.dataset.cat === "todo")); });
      state.cat = "todo"; applyFilter();
      var t = $("#productos"); if (t) t.scrollIntoView({ behavior: "smooth" });
    });

    $$(".prod").forEach(function (p) {
      if (p.dataset.bound) return; p.dataset.bound = "1";
      var add = $(".add", p), qty = $(".qty", p), out = $("output", qty);
      function render() {
        var n = cart[p.dataset.id] ? cart[p.dataset.id].n : 0;
        add.hidden = n > 0; qty.hidden = n === 0; out.textContent = n;
        renderCart();
      }
      function set(n) {
        if (n <= 0) delete cart[p.dataset.id];
        else cart[p.dataset.id] = { name: p.dataset.name, price: parseFloat(p.dataset.price), n: Math.min(n, 20) };
        render();
      }
      add.addEventListener("click", function () { set(1); });
      $("[data-minus]", qty).addEventListener("click", function () { set((cart[p.dataset.id] || { n: 0 }).n - 1); });
      $("[data-plus]", qty).addEventListener("click", function () { set((cart[p.dataset.id] || { n: 0 }).n + 1); });
      render();
    });
    var clear = $("[data-clear]");
    if (clear) clear.addEventListener("click", function () {
      cart = {};
      $$(".prod").forEach(function (p) { $(".add", p).hidden = false; $(".qty", p).hidden = true; });
      renderCart();
    });
  }

  function renderCart() {
    var bar = $("[data-cart]"); if (!bar) return;
    var ids = Object.keys(cart), items = 0, total = 0, lines = [];
    ids.forEach(function (id) {
      var it = cart[id]; items += it.n; total += it.n * it.price;
      lines.push("• " + it.n + " x " + it.name + " (" + soles(it.n * it.price) + ")");
    });
    bar.classList.toggle("show", items > 0);
    $("[data-cart-count]", bar).textContent = items + (items === 1 ? " producto" : " productos");
    $("[data-cart-total]", bar).textContent = soles(total);
    var msg = "Hola, quiero hacer este pedido en Botica Alivio:\n" + lines.join("\n") + "\nTotal referencial: " + soles(total) + "\nMi dirección es: ";
    $("[data-cart-link]", bar).href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  }

  function boot() {
    safe(initReveal, "reveal");
    safe(initNavPill, "nav");
    safe(initMagnetic, "magnetic");
    safe(initCatalog, "catalogo");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
