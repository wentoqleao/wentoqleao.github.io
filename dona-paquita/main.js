/* Doña Paquita · main.js (IIFE, sin módulos) */
(function () {
  "use strict";
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[init] " + name, e); } }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var canHover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  function openPage() { document.documentElement.classList.add("is-open"); startHero(); }
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) { openPage(); return; }
    var bar = $(".splash-bar i", splash);
    var pct = $("[data-pct]", splash), t0 = Date.now(), MIN = 2300, done = false, loaded = document.readyState === "complete";
    (function tick() {
      if (done) return;
      var p = Math.min(100, Math.round(100 * (1 - Math.pow(1 - Math.min(1, (Date.now() - t0 - 200) / 2000), 3))));
      if (pct) pct.textContent = Math.max(0, p) + "%";
      if (bar) { bar.style.animation = "none"; bar.style.transform = "scaleX(" + Math.max(0, p) / 100 + ")"; }
      if (p >= 100 && loaded) return hide();
      requestAnimationFrame(tick);
    })();
    window.addEventListener("load", function () { loaded = true; });
    function hide() {
      if (done) return; done = true;
      if (pct) pct.textContent = "100%";
      splash.classList.add("is-out");
      setTimeout(openPage, 250);
    }
    setTimeout(function () { loaded = true; }, MIN + 400);
    setTimeout(hide, 4000);
  }

  function escHTML(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var wordIndex = 0;
  function wrapWords(text) {
    return text.split(/(\s+)/).map(function (w) {
      if (!w) return "";
      if (/^\s+$/.test(w)) return " ";
      return '<span class="split-word" aria-hidden="true" style="--i:' + (wordIndex++) + '">' + escHTML(w) + "</span>";
    }).join("");
  }
  function initSplit() {
    $$("[data-split]").forEach(function (el) {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = "1";
      el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
      wordIndex = 0;
      el.innerHTML = Array.prototype.map.call(el.childNodes, function (n) {
        if (n.nodeType === 3) return wrapWords(n.textContent);
        if (n.nodeName === "BR") return "<br>";
        if (n.nodeType === 1) { var t = n.tagName.toLowerCase(); return "<" + t + ">" + wrapWords(n.textContent) + "</" + t + ">"; }
        return "";
      }).join("");
    });
    setTimeout(openPage, 4300); // seguro por si el splash no avisa
  }
  function startHero() { $$("[data-split]").forEach(function (el) { el.classList.add("is-in"); }); }

  function initReveal() {
    var els = $$(".reveal:not([data-split])");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  function initNav() {
    var nav = $("[data-nav]"), bar = $("[data-progress]"), hero = $(".hero-bg");
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle("is-solid", y > 40);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      if (hero && y < window.innerHeight) hero.style.translate = "0 " + Math.round(y * 0.08) + "px";
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function initFilters() {
    var buttons = $$(".filtro"), dishes = $$(".dish");
    buttons.forEach(function (b) {
      if (b.dataset.bound) return; b.dataset.bound = "1";
      b.addEventListener("click", function () {
        var cat = b.dataset.cat;
        buttons.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        dishes.forEach(function (d) { d.hidden = !(cat === "todo" || d.dataset.cat === cat); });
      });
    });
  }

  function initTilt() {
    if (!canHover) return;
    $$("[data-tilt]").forEach(function (card) {
      if (card.dataset.tiltBound) return; card.dataset.tiltBound = "1";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseout", function (e) {
        if (!card.contains(e.relatedTarget)) card.style.transform = "";
      });
    });
  }

  function initCursor() {
    if (!canHover) return;
    var c = $("[data-cursor]"); if (!c) return;
    var dot = $(".dot", c), ring = $(".ring", c);
    var mx = 0, my = 0, rx = 0, ry = 0, first = false;
    window.addEventListener("mousemove", function (e) {
      if (!first && e.clientX === 0 && e.clientY === 0) return;
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      if (!first) { first = true; rx = mx; ry = my; c.classList.add("is-ready"); loop(); }
    });
    function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(loop);
    }
    document.addEventListener("mouseover", function (e) {
      c.classList.toggle("is-hover", !!(e.target.closest && e.target.closest("a,button,[data-tilt]")));
    });
  }

  function initCount() {
    var els = $$("[data-count]");
    if (!els.length) return;
    var run = function (el) {
      if (el.dataset.counted) return; el.dataset.counted = "1";
      var end = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length, t0 = null;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1400), v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec).replace(".", ",") + (el.dataset.suffix || "");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }); }, { threshold: 0.01 });
    els.forEach(function (e) { io.observe(e); });
  }

  function initReviews() {
    var box = $("[data-reviews]"); if (!box) return;
    var items = $$("blockquote", box), dots = $("[data-dots]");
    if (items.length < 2 || !dots || dots.children.length > 0) return;
    var i = 0, timer;
    items.forEach(function (_, k) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Ver reseña " + (k + 1));
      b.addEventListener("click", function () { show(k); restart(); });
      dots.appendChild(b);
    });
    function show(k) {
      i = k;
      items.forEach(function (q, n) { q.classList.toggle("is-on", n === k); q.setAttribute("aria-hidden", String(n !== k)); });
      Array.prototype.forEach.call(dots.children, function (d, n) { d.setAttribute("aria-current", String(n === k)); });
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { show((i + 1) % items.length); }, 6000); }
    document.documentElement.classList.add("js-rot");
    show(0); restart();
  }

  function initTabbar() {
    var links = $$(".tabbar a[href^='#']");
    var secs = links.map(function (a) { return $(a.getAttribute("href")); });
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = secs.indexOf(e.target);
        links.forEach(function (a, n) { a.classList.toggle("activo", n === k); });
      });
    }, { threshold: 0.01, rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { if (s) io.observe(s); });
  }

  function boot() {
    safe(initSplit, "split");
    safe(initSplash, "splash");
    safe(initReveal, "reveal");
    safe(initNav, "nav");
    safe(initFilters, "filtros");
    safe(initTilt, "tilt");
    safe(initCursor, "cursor");
    safe(initCount, "count");
    safe(initReviews, "reviews");
    safe(initTabbar, "tabbar");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
