(function () {
  /* Amore (propuesta) · asistente de pedidos y reservas. Sin servidor: arma el mensaje y lo abre en el WhatsApp del local. */
  "use strict";

  function SD() { return window.AmoreSede ? window.AmoreSede.get() : { k: "miraflores", n: "Miraflores", dir: "Calle Atahualpa 175", wa: "51963801913", maps: "" }; }
  function SN() { return SD().n; }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Datos del local ---------- */
      var HOURS = {0: [12.5, 22.5], 1: [12.5, 22.5], 2: [12.5, 22.5], 3: [12.5, 22.5], 4: [12.5, 22.5], 5: [12.5, 22.5], 6: [12.5, 22.5]};
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var NUM = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, doce: 12, quince: 15, veinte: 20 };
  var MENU = [
    { n: "Spaghetti negro con salsa rosé de langostinos", p: 62, a: ["spaghetti negro con salsa rose de langostinos", "spaghetti negro", "tallarin negro", "pasta negra"] },
    { n: "Ceviche clásico / diabla", p: 62, a: ["ceviche clasico diabla", "ceviche clasico", "ceviche diabla", "ceviche"] },
    { n: "Lomo a las 3 pimientas", p: 69, a: ["lomo a las 3 pimientas", "lomo a las tres pimientas", "tres pimientas", "3 pimientas"] },
    { n: "Ossobuco", p: 66, a: ["ossobuco"] },
    { n: "Hamburguesa de la casa", p: 41, a: ["hamburguesa de la casa", "hamburguesas", "hamburguesa", "burger"] },
    { n: "Pizza margarita", p: 36, a: ["pizza margarita", "margarita"] },
    { n: "Pizza chicken BBQ", p: 47, a: ["pizza chicken bbq", "chicken bbq"] },
    { n: "Lomo saltado tradicional", p: 65, a: ["lomo saltado tradicional", "lomos saltados", "lomo saltado", "lomito saltado"] },
    { n: "Fettuccine a la huancaína con lomo anticuchero", p: 65, a: ["fettuccine a la huancaina con lomo anticuchero", "fettuccine a la huancaina", "fetuccini a la huancaina", "huancaina con lomo"] },
    { n: "Fingers de polenta frita y pomodoro", p: 29, a: ["fingers de polenta frita y pomodoro"] },
    { n: "Ensalada Caesar con pollo", p: 34, a: ["ensalada caesar con pollo"] },
    { n: "Ensalada thai", p: 39, a: ["ensalada thai"] },
    { n: "Berenjena a la parmesana", p: 38, a: ["berenjena a la parmesana"] },
    { n: "Langostinos al brandy", p: 48, a: ["langostinos al brandy"] },
    { n: "Carpaccio de lomo", p: 48, a: ["carpaccio de lomo"] },
    { n: "Causas", p: 49, a: ["causas"] },
    { n: "Burrata rellena", p: 51, a: ["burrata rellena"] },
    { n: "Tartare Amore", p: 63, a: ["tartare amore"] },
    { n: "Pulpo a la parrilla", p: 65, a: ["pulpo a la parrilla"] },
    { n: "Seco borracho", p: 53, a: ["seco borracho"] },
    { n: "Tiradito nikkei", p: 49, a: ["tiradito nikkei"] },
    { n: "Chicharrón de calamar", p: 49, a: ["chicharron de calamar", "chicharron"] },
    { n: "Ceviche carretillero", p: 65, a: ["ceviche carretillero", "carretillero"] },
    { n: "Arroz con pato borracho", p: 73, a: ["arroz con pato borracho"] },
    { n: "Penne primavera", p: 36, a: ["penne primavera"] },
    { n: "Tortellini de ricotta en salsa pesto", p: 44, a: ["tortellini de ricotta en salsa pesto"] },
    { n: "Lasagna de carne", p: 46, a: ["lasagna de carne", "lasagna", "lasana"] },
    { n: "Gnocchis a los 4 quesos", p: 48, a: ["gnocchis a los 4 quesos", "gnocchis", "noquis"] },
    { n: "Pappardelle con ragú de cola de buey", p: 46, a: ["pappardelle con ragu de cola de buey"] },
    { n: "Lasagna de cola de buey", p: 47, a: ["lasagna de cola de buey"] },
    { n: "Fettuccine en salsa de langostinos", p: 62, a: ["fettuccine en salsa de langostinos"] },
    { n: "Fettuccine frutti di mare", p: 66, a: ["fettuccine frutti di mare"] },
    { n: "Spaghetti carbonara estilo Amore", p: 54, a: ["spaghetti carbonara estilo amore", "carbonara"] },
    { n: "Milanesa napolitana", p: 42, a: ["milanesa napolitana"] },
    { n: "Chaufa estilo Amore", p: 44, a: ["chaufa estilo amore"] },
    { n: "Pollo estilo Vietnam", p: 44, a: ["pollo estilo vietnam"] },
    { n: "Yakimeshi", p: 45, a: ["yakimeshi"] },
    { n: "Arroz estilo paella", p: 66, a: ["arroz estilo paella", "paella"] },
    { n: "Codillo de cerdo crocante", p: 69, a: ["codillo de cerdo crocante"] },
    { n: "Costillar a la BBQ", p: 69, a: ["costillar a la bbq"] },
    { n: "Salmón thai", p: 73, a: ["salmon thai"] },
    { n: "Asado de tira", p: 79, a: ["asado de tira"] },
    { n: "Chita crocante al ajo", p: 89, a: ["chita crocante al ajo"] },
    { n: "Arroz marinero Amore", p: 109, a: ["arroz marinero amore"] },
    { n: "Pizza americana", p: 36, a: ["pizza americana", "americana"] },
    { n: "Calzone clásico", p: 36, a: ["calzone clasico"] },
    { n: "Calzone campesino", p: 41, a: ["calzone campesino"] },
    { n: "Pizza internacional", p: 41, a: ["pizza internacional", "internacional"] },
    { n: "Pizza carbonara", p: 43, a: ["pizza carbonara", "carbonara"] },
    { n: "Pizza pepperoni", p: 41, a: ["pizza pepperoni", "pepperoni"] },
    { n: "Pizza hawaiana", p: 41, a: ["pizza hawaiana", "hawaiana"] },
    { n: "Pizza mediterránea", p: 41, a: ["pizza mediterranea", "mediterranea"] },
    { n: "Pizza vegetariana especial", p: 43, a: ["pizza vegetariana especial", "vegetariana especial"] },
    { n: "Pizza Amore", p: 44, a: ["pizza amore"] },
    { n: "Pizza porcón prosciutto", p: 47, a: ["pizza porcon prosciutto", "porcon prosciutto"] },
    { n: "Pizza tres chanchitos", p: 48, a: ["pizza tres chanchitos", "tres chanchitos"] },
    { n: "Pizza ranchera", p: 48, a: ["pizza ranchera", "ranchera"] },
    { n: "Focaccia", p: 18, a: ["focaccia"] },
    { n: "Brownie", p: 26, a: ["brownie"] },
    { n: "Crème brûlée", p: 28, a: ["creme br lee"] },
    { n: "Apple pie", p: 29, a: ["apple pie"] },
    { n: "Panqueque Amore", p: 29, a: ["panqueque amore"] },
    { n: "Merengado de chirimoya", p: 34, a: ["merengado de chirimoya"] },
    { n: "Volcán de chocolate", p: 33, a: ["volcan de chocolate", "volcan"] },
    { n: "Tiramisú", p: 33, a: ["tiramisu", "tiramisu"] },
    { n: "Mousse de lúcuma", p: 33, a: ["mousse de lucuma"] },
    { n: "Sangría de la casa (jarra 1 L)", p: 69, a: ["sangria de la casa", "jarra de sangria", "sangria"] },
    { n: "Pisco sour", p: 35, a: ["pisco sour", "pisco sour"] },
    { n: "Chilcano macerado", p: 36, a: ["chilcano macerado"] },
    { n: "Amore tonic", p: 46, a: ["amore tonic"] },
    { n: "Aperol spritz", p: 34, a: ["aperol spritz"] },
    { n: "Limonada frozen", p: 16, a: ["limonada frozen"] },
    { n: "Dolce Amore", p: 16, a: ["dolce amore"] }
  ];
  MENU.forEach(function (m, i) { m.id = "p" + i; });
  var ALIASES = [];
  MENU.forEach(function (m) { m.a.forEach(function (a) { ALIASES.push({ a: a, m: m }); }); });
  ALIASES.sort(function (x, y) { return y.a.length - x.a.length; });
  var BEBIDAS = /(vino|copa|coctel|cerveza|pilsen|cusquena|corona|gaseosa|agua|chicha|jugo|mojito|gin|maracuya)/;

  /* ---------- Interfaz ---------- */
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var fab = el("button", "ol-fab"); fab.type = "button";
  fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-controls", "ol-panel");
  var dot = el("span", "dot", "🌿"); dot.setAttribute("aria-hidden", "true");
  fab.appendChild(dot); fab.appendChild(document.createTextNode("Reserva o pide aquí"));
  var panel = el("div", "ol-panel"); panel.id = "ol-panel"; panel.hidden = true;
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Asistente de Amore");
  var head = el("div", "ol-head");
  var logo = el("img"); logo.src = "assets/img/logo.webp"; logo.alt = ""; logo.width = 40; logo.height = 40;
  var hd = el("div"); hd.appendChild(el("b", null, "Amore")); var st = el("span", null, ""); hd.appendChild(st);
  var close = el("button", null, "×"); close.type = "button"; close.setAttribute("aria-label", "Cerrar el chat");
  head.appendChild(logo); head.appendChild(hd); head.appendChild(close);
  var chat = el("div", "ol-chat"); chat.setAttribute("role", "log"); chat.setAttribute("aria-live", "polite");
  var chipsBox = el("div", "ol-chips");
  var form = el("form", "ol-form"); form.setAttribute("autocomplete", "off");
  var lab = el("label", "ol-sr", "Escribe tu mensaje"); lab.htmlFor = "ol-input";
  var input = el("input"); input.id = "ol-input"; input.type = "text"; input.maxLength = 200; input.placeholder = "Escribe: \"mesa para 4 el sábado a la 1\"";
  var send = el("button", null, "➤"); send.type = "submit"; send.setAttribute("aria-label", "Enviar");
  form.appendChild(lab); form.appendChild(input); form.appendChild(send);
  panel.appendChild(head); panel.appendChild(chat); panel.appendChild(chipsBox); panel.appendChild(form);
  document.body.appendChild(fab); document.body.appendChild(panel);

  function status() { st.textContent = isOpen() ? "Abierto ahora · responde al instante" : "Cerrado ahora · igual te tomo el pedido"; }
  var started = false;
  function open() {
    panel.hidden = false; fab.setAttribute("aria-expanded", "true"); status();
    if (!started) { started = true; welcome(); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function shut() { panel.hidden = true; fab.setAttribute("aria-expanded", "false"); fab.focus(); }
  fab.addEventListener("click", open);
  close.addEventListener("click", shut);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) shut(); });

  /* ---------- Mensajes ---------- */
  var queue = [], busy = false;
  function addMsg(kind, text, links) {
    var m = el("div", "ol-msg " + kind, text);
    if (links && links.length) {
      var box = el("div", "ol-links");
      links.forEach(function (l) {
        var a = el("a", l.wa ? "wa" : "", l.t);
        a.href = l.href;
        if (/^https:/.test(l.href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        box.appendChild(a);
      });
      m.appendChild(box);
    }
    chat.appendChild(m); chat.scrollTop = chat.scrollHeight;
  }
  function chips(list) {
    chipsBox.textContent = "";
    (list || []).forEach(function (label) {
      var b = el("button", null, label); b.type = "button";
      b.addEventListener("click", function () { user(label); });
      chipsBox.appendChild(b);
    });
    chat.scrollTop = chat.scrollHeight;
  }
  function say(items, next) { queue.push({ items: [].concat(items), chips: next }); if (!busy) pump(); }
  function pump() {
    var job = queue.shift();
    if (!job) { busy = false; return; }
    busy = true; chips([]);
    var i = 0;
    (function step() {
      if (i >= job.items.length) { chips(job.chips); pump(); return; }
      var it = job.items[i++], txt = typeof it === "string" ? it : it.t;
      var ty = el("div", "ol-typing"); ty.setAttribute("aria-hidden", "true");
      ty.appendChild(el("i")); ty.appendChild(el("i")); ty.appendChild(el("i"));
      chat.appendChild(ty); chat.scrollTop = chat.scrollHeight;
      st.textContent = "escribiendo…";
      setTimeout(function () {
        ty.remove(); status();
        addMsg("in", txt, typeof it === "string" ? null : it.links);
        step();
      }, reduce ? 120 : Math.min(1200, 400 + txt.length * 5));
    })();
  }

  /* ---------- Utilidades ---------- */
  function norm(t) { return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;]/g, " ").replace(/\s+/g, " ").trim(); }
  function has(t, words) { for (var i = 0; i < words.length; i++) if (new RegExp("(^|\\s)" + words[i]).test(t)) return true; return false; }
  function clean(s, max) { return String(s).replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max); }
  function soles(n) { return "S/ " + n.toFixed(2); }
  function waLink(text) { return "https://wa.me/" + SD().wa + "?text=" + encodeURIComponent(text); }
  function hhmm(h) {
    if (h >= 24) return "12:00 am";
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60), ap = hh >= 12 ? "pm" : "am", h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ":" + (mm < 10 ? "0" : "") + mm + " " + ap;
  }
  function nowH() { var d = new Date(); return d.getHours() + d.getMinutes() / 60; }
  function isOpen() { var r = HOURS[new Date().getDay()], h = nowH(); return h >= r[0] && h < r[1]; }
  function alas(h) { return (Math.floor(h) % 12 === 1 ? "a la " : "a las ") + hhmm(h); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- Conversación ---------- */
  var MENU_CHIPS = ["Reservar mesa", "Ver la carta", "Hacer un pedido", "Horario y sedes", "Cambiar de sede", "Hablar con alguien"];
  var PLATO_CHIPS = ["Lomo saltado", "Spaghetti negro", "Ceviche clásico", "Pizza margarita", "Listo, es todo"];
  var S;
  function fresh() { S = { state: "menu", cart: {}, notes: [], order: {}, res: {}, misses: 0 }; }
  fresh();

  function welcome() {
    var r = HOURS[new Date().getDay()];
    var aviso = isOpen() ? "" : "\n\nAhorita estamos cerrados. Abrimos a las " + hhmm(r[0]) + ", pero igual te dejo la reserva o el pedido listos.";
    say(["¡Hola! Bienvenido a Amore 🌿 Te atiendo para la sede " + SN() + "." + aviso, "¿En qué te ayudo?"], MENU_CHIPS);
  }
  function more(extra) { S.state = "menu"; say([(extra ? extra + "\n\n" : "") + "¿Te ayudo con algo más?"], MENU_CHIPS); }
  function carta() {
    S.state = "menu";
    say([{ t: "Los favoritos de la casa:\n• Spaghetti negro con salsa rosé de langostinos · S/ 62\n• Ceviche clásico / diabla · S/ 62\n• Lomo a las 3 pimientas · S/ 69\n• Ossobuco · S/ 66\n• Hamburguesa de la casa · S/ 41\n• Pizza margarita · S/ 36", links: [{ t: "Ver la carta completa", href: "carta/" }] },
      "Para pedir, escríbeme el plato y la cantidad, por ejemplo: \"2 lomos saltados y una sangría\"."], ["Hacer un pedido", "Reservar mesa", "Volver al inicio"]);
  }
  function horario() {
    S.state = "menu";
    say([{ t: "Las dos sedes atienden todos los días de 12:30 pm a 10:30 pm.\n\n📍 Miraflores: Calle Atahualpa 175\n📍 La Molina: Av. La Fontana 1125\n\nAhora te atiendo para " + SN() + ".", links: [{ t: "Abrir " + SN() + " en Google Maps", href: SD().maps }] }, "¿Te ayudo con algo más?"], MENU_CHIPS);
  }
  function delivery() {
    more("Atendemos en el restaurante y con recojo en tienda 🛍️ Arma tu pedido aquí, lo envías por WhatsApp a la sede " + SN() + " y pasas a recogerlo.");
  }
  function tragos() {
    more("🍷 Tenemos bar completo: sangría para compartir, vinos y cócteles. Los precios están en la carta o te los pasan por WhatsApp.");
  }
  function handoff(reason, prefill) {
    S.state = "menu"; S.misses = 0;
    say([{ t: reason || "Te paso con alguien del local para ayudarte mejor.", links: [{ t: "Escribir a Amore " + SN() + " por WhatsApp", href: waLink(prefill || "Hola Amore " + SN() + ", tengo una consulta."), wa: true }] }], ["Volver al inicio"]);
  }

  /* Pedido */
  function findDishes(t) {
    var found = [], rest = " " + t + " ";
    ALIASES.forEach(function (x) {
      var re = new RegExp("(\\s)" + x.a.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "(?:s|es)?(?=\\s)");
      var m = re.exec(rest);
      if (!m) return;
      var before = rest.slice(Math.max(0, m.index - 18), m.index).trim().split(" ");
      var q = 1;
      for (var j = before.length - 1; j >= 0 && j >= before.length - 3; j--) {
        if (/^\d{1,2}$/.test(before[j])) { q = parseInt(before[j], 10); break; }
        if (NUM[before[j]]) { q = NUM[before[j]]; break; }
      }
      rest = rest.slice(0, m.index) + " " + new Array(m[0].length).join("_") + rest.slice(m.index + m[0].length);
      var prev = found.filter(function (f) { return f.m === x.m; })[0];
      if (prev) prev.q += q; else found.push({ m: x.m, q: Math.max(1, Math.min(q, 20)) });
    });
    return found;
  }
  function drinkNote(raw) {
    var parts = String(raw).split(/,| y | e | con /i).filter(function (x) { return BEBIDAS.test(norm(x)); });
    return parts.length ? "Bebida: " + clean(parts.join(", "), 60) : "";
  }
  function cartInfo() {
    var lines = [], total = 0;
    MENU.forEach(function (m) { var q = S.cart[m.id]; if (!q) return; lines.push("• " + q + " x " + m.n + " · " + soles(q * m.p)); total += q * m.p; });
    S.notes.forEach(function (n) { lines.push("• " + n + " (precio por confirmar)"); });
    return { text: lines.join("\n"), total: total };
  }
  function startOrder() { S.state = "items"; say(["¡Claro! ¿Qué te provoca? Escríbeme el plato y la cantidad (ej.: \"2 mixtos y una chicha\") o toca una opción."], PLATO_CHIPS); }
  function addDishes(list, raw) {
    list.forEach(function (f) { S.cart[f.m.id] = (S.cart[f.m.id] || 0) + f.q; });
    var note = drinkNote(raw);
    if (note) S.notes.push(note);
    S.state = "items";
    var c = cartInfo();
    say(["Anotado ✍️\n" + c.text + "\nSubtotal: " + soles(c.total), "¿Algo más o es todo?"], PLATO_CHIPS);
  }
  function askMode() {
    var c = cartInfo();
    if (!c.total && !S.notes.length) { say(["Aún no tienes nada en tu pedido. ¿Qué te provoca?"], PLATO_CHIPS); return; }
    S.order.mode = "recojo"; say(["Los pedidos son para recoger en la sede " + SN() + " 🛍️"], []); askPay();
  }
  function askPay() { S.state = "pay"; say(["¿Cómo pagarías al recoger?"], ["Tarjeta", "Efectivo", "Yape"]); }
  function confirmOrder() {
    S.state = "confirm";
    var c = cartInfo();
    say(["Tu pedido:\n" + c.text + "\nTotal referencial: " + soles(c.total) + (S.order.mode === "delivery" ? " + delivery según tu zona" : "") +
      "\n\n" + (S.order.mode === "delivery" ? "Entrega en: " + S.order.addr : "Recojo en el local") + "\nPago: " + S.order.pay, "¿Está todo bien?"], ["Sí, enviar pedido", "Cambiar algo"]);
  }
  function sendOrder() {
    var c = cartInfo();
    var msg = "Hola Amore " + SN() + ", quiero hacer este pedido:\n" + c.text + "\nTotal referencial: " + soles(c.total) +
      "\n" + (S.order.mode === "delivery" ? "Es para delivery a: " + S.order.addr : "Paso a recogerlo al local") + "\nPago con: " + S.order.pay;
    S.cart = {}; S.notes = []; S.order = {}; S.state = "menu";
    say([{ t: "¡Listo! Toca el botón y se abre WhatsApp con tu pedido para Amore " + SN() + ". Ellos te confirman el tiempo" + (msg.indexOf("delivery") > -1 ? " y el costo del delivery" : "") + ".", links: [{ t: "Enviar pedido por WhatsApp", href: waLink(msg), wa: true }] }], ["Volver al inicio"]);
  }

  /* Reserva */
  function parsePeople(t) {
    var re = /(?:para|somos|mesa de|de)\s+(\d{1,2}|[a-z]+)|(\d{1,2})\s*(?:personas|pers|adultos)/g, m;
    while ((m = re.exec(t))) { var w = m[1] || m[2], v = /^\d+$/.test(w) ? parseInt(w, 10) : (NUM[w] || 0); if (v > 0 && v <= 60) return v; }
    return 0;
  }
  function parseDay(t) {
    var today = new Date().getDay();
    if (/(^|\s)hoy(\s|$)/.test(t)) return today;
    if (/manana/.test(t)) return (today + 1) % 7;
    var names = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    for (var i = 0; i < 7; i++) if (t.indexOf(names[i]) !== -1) return i;
    return -1;
  }
  function parseTime(t) {
    var h, ap, m = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
    if (m) { h = +m[1] + (+m[2]) / 60; ap = m[3] || ""; }
    else { m = t.match(/(?:a las|a la|tipo|las|la)\s+(\d{1,2})\s*(am|pm)?(\s|$)/); if (!m) return -1; h = +m[1]; ap = m[2] || ""; }
    if (ap === "pm" && h < 12) h += 12;
    else if (ap === "am" && h === 12) h = 24;
    else if (!ap && h >= 1 && h < 11) h += 12;
    return h;
  }
  function dayName(d) { var today = new Date().getDay(); return d === today ? "hoy" : d === (today + 1) % 7 ? "mañana" : "el " + DIAS[d]; }
  function slotChips(day) {
    var r = HOURS[day], out = [], from = r[0];
    if (day === new Date().getDay()) from = Math.max(from, Math.ceil(nowH() + 0.5));
    [13, 14, 19.5, 20.5, 21].forEach(function (h) { if (h >= from && h <= r[1] - 1 && out.length < 5) out.push(hhmm(h)); });
    return out;
  }
  function nextRes() {
    var R = S.res;
    if (!R.people) { S.state = "res_people"; say(["¿Para cuántas personas?"], ["2", "4", "6", "8", "Más de 15"]); return; }
    if (R.people > 15) { handoff("Para grupos de más de 15 personas lo coordina directamente el local 🙌", "Hola Amore " + SN() + ", quiero reservar para un grupo de " + R.people + " personas."); return; }
    if (R.day === undefined || R.day < 0) { S.state = "res_day"; say(["¿Para qué día?"], ["Hoy", "Mañana", "Viernes", "Sábado", "Domingo"]); return; }
    if (R.time === undefined || R.time < 0) {
      var sl = slotChips(R.day);
      if (!sl.length) { R.day = -1; S.state = "res_day"; say(["Para hoy ya no nos quedan horarios 😕 ¿Te parece otro día?"], ["Mañana", "Sábado", "Domingo"]); return; }
      S.state = "res_time";
      say(["¿A qué hora? " + cap(dayName(R.day)) + " atendemos de " + hhmm(HOURS[R.day][0]) + " a " + hhmm(HOURS[R.day][1]) + "."], sl);
      return;
    }
    if (!R.name) { S.state = "res_name"; say(["¿A nombre de quién la separo?"], []); return; }
    if (R.occasion === undefined) { S.state = "res_occ"; say(["¿Es por alguna ocasión especial?"], ["Cumpleaños", "Aniversario", "Almuerzo de trabajo", "Ninguna"]); return; }
    S.state = "res_confirm";
    say(["Mesa para " + R.people + ", " + dayName(R.day) + " " + alas(R.time) + ", a nombre de " + R.name + (R.occasion ? " (" + R.occasion.toLowerCase() + ")" : "") + ". ¿Está bien?"], ["Sí, enviar reserva", "Cambiar algo"]);
  }
  function setTime(h) {
    var r = HOURS[S.res.day];
    if (h < r[0] || h > r[1] - 1) { S.res.time = -1; say([cap(dayName(S.res.day)) + " a esa hora estamos cerrados. Atendemos de " + hhmm(r[0]) + " a " + hhmm(r[1]) + "."], []); }
    else S.res.time = h;
    nextRes();
  }
  function startRes(t) {
    S.res = {};
    var p = parsePeople(t), d = parseDay(t), h = parseTime(t);
    if (p) S.res.people = p;
    if (d >= 0) S.res.day = d;
    say(["¡Con gusto te separamos una mesa! 🪑"], []);
    if (d >= 0 && h >= 0) { setTime(h); return; }
    nextRes();
  }
  function sendRes() {
    var R = S.res; S.res = {}; S.state = "menu";
    var msg = "Hola Amore " + SN() + ", quiero reservar una mesa.\nNombre: " + R.name + "\nDía: " + cap(dayName(R.day)) + "\nHora: " + hhmm(R.time) + "\nPersonas: " + R.people + (R.occasion ? "\nOcasión: " + R.occasion : "");
    say([{ t: "¡Listo! Toca el botón para enviar tu reserva por WhatsApp. La sede te la confirma por ahí.", links: [{ t: "Enviar reserva por WhatsApp", href: waLink(msg), wa: true }] }], ["Volver al inicio"]);
  }

  /* ---------- Intención primero, respuesta después ---------- */
  function brain(raw) {
    var t = norm(raw);
    if (!t) return;
    if (has(t, ["volver al inicio", "inicio", "menu"]) && t.length < 20) { S.state = "menu"; S.misses = 0; welcome(); return; }
    if (has(t, ["cancelar", "cancela"])) { S.cart = {}; S.notes = []; S.order = {}; S.res = {}; more("Listo, lo cancelé."); return; }
    if (has(t, ["queja", "reclamo", "llego frio", "frio", "falto", "faltaba", "me cobraron", "demoro mucho", "pesimo", "malogr"])) {
      handoff("Uy, lo sentimos mucho. Escríbele directo al local para solucionarlo al toque:", "Hola Amore " + SN() + ", tuve un problema con mi pedido: " + clean(raw, 150));
      return;
    }
    if (has(t, ["hablar con alguien", "una persona", "asesor", "humano", "encargad"])) { handoff(); return; }

    if (S.state === "sede" || S.state === "menu") {
      var pick = has(t, ["molina"]) ? "lamolina" : has(t, ["miraflores"]) ? "miraflores" : "";
      if (pick && window.AmoreSede) { window.AmoreSede.set(pick); more("Listo, ahora te atiendo para la sede " + SN() + " 📍 " + SD().dir + "."); return; }
      if (has(t, ["cambiar de sede", "otra sede", "cambiar sede", "elegir sede"])) { S.state = "sede"; say(["¿Con qué sede quieres hablar?"], ["Miraflores", "La Molina"]); return; }
    }
    switch (S.state) {
      case "items":
        if (has(t, ["listo", "es todo", "nada mas", "eso es todo", "solo eso", "nada"])) { S.misses = 0; askMode(); return; }
        if (BEBIDAS.test(t) && !findDishes(t).length) { S.notes.push(drinkNote(raw) || "Bebida: " + clean(raw, 60)); var c0 = cartInfo(); say(["Anotado ✍️\n" + c0.text, "¿Algo más o es todo?"], PLATO_CHIPS); return; }
        break;
      case "mode":
        if (has(t, ["deliv", "envio", "a mi casa", "a domicilio", "lleven", "traigan"])) { S.order.mode = "delivery"; S.state = "addr"; say(["Perfecto. Envíame tu dirección con una referencia (ej.: \"Sector 3, Grupo 5, Mz. B Lt. 12, frente al parque\")."], []); return; }
        if (has(t, ["recojo", "recoger", "paso", "local", "para llevar"])) { S.order.mode = "recojo"; askPay(); return; }
        break;
      case "addr":
        if (raw.trim().length >= 6) { S.order.addr = clean(raw, 140); askPay(); return; }
        say(["¿Me pasas la dirección completa con una referencia?"], []); return;
      case "pay":
        if (has(t, ["yape"])) { S.order.pay = "Yape"; confirmOrder(); return; }
        if (has(t, ["plin"])) { S.order.pay = "Plin"; confirmOrder(); return; }
        if (has(t, ["efectivo", "cash", "billete", "sencillo"])) { S.order.pay = "Efectivo"; confirmOrder(); return; }
        if (has(t, ["tarjeta", "visa", "pos"])) { S.order.pay = "Tarjeta"; confirmOrder(); return; }
        break;
      case "confirm":
        if (has(t, ["si", "enviar", "confirm", "ok", "dale", "listo", "claro"])) { sendOrder(); return; }
        if (has(t, ["no", "cambiar", "cambio"])) { S.cart = {}; S.notes = []; S.state = "items"; say(["Sin problema, armemos el pedido de nuevo. ¿Qué te provoca?"], PLATO_CHIPS); return; }
        break;
      case "res_people":
        if (has(t, ["mas de 15"])) { S.res.people = 16; nextRes(); return; }
        var p = parsePeople(t) || (/^\d{1,2}$/.test(t) ? parseInt(t, 10) : NUM[t] || 0);
        if (p > 0) { S.res.people = p; nextRes(); return; }
        break;
      case "res_day":
        var d = parseDay(t);
        if (d >= 0) { S.res.day = d; var h0 = parseTime(t); if (h0 >= 0) { setTime(h0); return; } nextRes(); return; }
        break;
      case "res_time":
        var h = parseTime(t);
        if (h < 0 && /^\d{1,2}(:\d{2})?\s*(am|pm)?$/.test(t)) h = parseTime("a las " + t);
        if (h >= 0) { setTime(h); return; }
        break;
      case "res_name":
        var name = clean(raw, 40).replace(/^(a nombre de|es|soy|de)\s+/i, "");
        if (name.length >= 2) { S.res.name = name; nextRes(); return; }
        break;
      case "res_occ":
        S.res.occasion = has(t, ["ninguna", "no", "nada"]) ? "" : clean(raw, 40);
        nextRes(); return;
      case "res_confirm":
        if (has(t, ["si", "enviar", "confirm", "ok", "dale", "listo", "claro"])) { sendRes(); return; }
        if (has(t, ["no", "cambiar", "cambio"])) { startRes(""); return; }
        break;
    }

    var dishes = findDishes(t);
    if (dishes.length && has(t, ["cuanto", "precio", "cuesta", "a como", "vale", "esta el", "esta la"])) {
      S.misses = 0;
      say(["Aquí tienes 👇\n" + dishes.map(function (f) { return "• " + f.m.n + " · S/ " + f.m.p; }).join("\n"), "¿Te lo anoto?"],
        dishes.slice(0, 3).map(function (f) { return "Quiero 1 " + f.m.n; }).concat(["Volver al inicio"]));
      return;
    }
    if (dishes.length) { S.misses = 0; addDishes(dishes, raw); return; }
    if (has(t, ["reserv", "mesa", "separar", "cumple"])) { S.misses = 0; startRes(t); return; }
    if (has(t, ["carta", "que tienen", "que hay", "platos", "precio", "menu del dia", "recomienda"])) { S.misses = 0; carta(); return; }
    if (has(t, ["pedir", "pedido", "quiero", "me mandas", "me envias", "ordenar"])) { S.misses = 0; startOrder(); return; }
    if (has(t, ["deliv", "envio", "reparto", "llegan a", "hasta donde", "yape", "plin", "pago", "pagar", "tarjeta", "efectivo"])) { S.misses = 0; delivery(); return; }
    if (has(t, ["trago", "bebida", "bar", "vino", "sangria", "coctel", "pisco"])) { S.misses = 0; tragos(); return; }
    if (has(t, ["sedes", "horario", "hora", "abren", "abierto", "atienden", "cierran", "donde", "direccion", "ubicacion", "como llego", "mapa"])) { S.misses = 0; horario(); return; }
    if (has(t, ["gracias", "genial", "chevere", "perfecto"])) { more("¡A ti! Te esperamos 🌿"); return; }
    if (has(t, ["hola", "buenas", "buenos", "buen dia", "alo", "hey"])) { S.misses = 0; welcome(); return; }

    S.misses++;
    if (S.misses >= 2) { handoff("Disculpa, no logré entenderte 😅 Mejor escríbele directo al local:", "Hola Amore " + SN() + ", " + clean(raw, 150)); return; }
    say(["No te entendí bien 😅 ¿Quieres alguna de estas opciones?"], MENU_CHIPS);
  }

  function user(text) {
    text = String(text).slice(0, 200);
    if (!text.trim()) return;
    addMsg("out", text); chips([]);
    brain(text);
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); var v = input.value; input.value = ""; user(v); });
})();
