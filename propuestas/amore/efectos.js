/* Amore · efectos.js: palabra que rota en el hero y fotos que entran con desenfoque. Sin librerías. */
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 1) Palabra que rota
  Array.prototype.forEach.call(document.querySelectorAll(".rot[data-words]"), function (box) {
    var words = box.getAttribute("data-words").split("|"), i = 0, w = box.querySelector(".rot-w");
    if (reduce || words.length < 2 || !w) return;
    setInterval(function () {
      if (document.hidden) return;
      w.classList.add("out");
      setTimeout(function () { i = (i + 1) % words.length; w.textContent = words[i]; w.classList.remove("out"); w.classList.add("in"); void w.offsetWidth; w.classList.remove("in"); }, 380);
    }, 2600);
  });
  // 2) Fotos con blur-fade al entrar en pantalla
  var imgs = document.querySelectorAll(".dish-img img, .story-photo img");
  if (reduce || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var im = en.target; io.unobserve(im);
      var show = function () { im.classList.add("bf-in"); };
      if (im.complete) setTimeout(show, 60); else { im.addEventListener("load", show); im.addEventListener("error", show); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  Array.prototype.forEach.call(imgs, function (im) { im.classList.add("bf"); io.observe(im); });
})();
