(function () {
  /* Demo de bot de WhatsApp para restaurantes · simulación local, sin red */
  "use strict";

  var chat = document.querySelector("[data-chat]");
  var chipsBox = document.querySelector("[data-chips]");
  var form = document.querySelector("[data-form]");
  var input = document.querySelector("[data-input]");
  var statusEl = document.querySelector("[data-status]");
  if (!chat || !chipsBox || !form || !input) return;

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Datos del restaurante de ejemplo ---------- */
  var NEGOCIO = "Doña Paquita";
  var DIRECCION = "Av. Principal 123, frente al parque";
  var DELIVERY = 5;
  var MENU = [
    { id: "lomo", n: "Lomo saltado", p: 28, a: ["lomo"] },
    { id: "aji", n: "Ají de gallina", p: 22, a: ["aji de gallina", "aji"] },
    { id: "ceviche", n: "Ceviche de pescado", p: 30, a: ["ceviche", "cebiche"] },
    { id: "arroz", n: "Arroz con pollo", p: 20, a: ["arroz con pollo", "arroz"] },
    { id: "seco", n: "Seco de res", p: 24, a: ["seco"] },
    { id: "tallarin", n: "Tallarines verdes con bistec", p: 25, a: ["tallarin"] },
    { id: "huancaina", n: "Papa a la huancaína", p: 12, a: ["huancaina"] },
    { id: "causa", n: "Causa limeña", p: 14, a: ["causa"] },
    { id: "anticucho", n: "Anticuchos (2 palitos)", p: 16, a: ["anticucho"] },
    { id: "chicha", n: "Chicha morada (1 L)", p: 10, a: ["chicha"] },
    { id: "maracuya", n: "Maracuyá (1 L)", p: 10, a: ["maracuya"] },
    { id: "limonada", n: "Limonada frozen", p: 8, a: ["limonada"] }
  ];
  /* Horario: [abre, cierra] en horas; 0 = domingo */
  var HOURS = { 0: [12, 15.5], 1: [12, 16], 2: [12, 16], 3: [12, 16], 4: [12, 16], 5: [12, 16], 6: [12, 17] };
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var NUM = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 };

  /* ---------- Estado ---------- */
  var S;
  function fresh() {
    S = { state: "menu", cart: {}, order: {}, res: {}, misses: 0 };
  }

  /* ---------- Utilidades ---------- */
  function norm(t) {
    return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;]/g, " ").replace(/\s+/g, " ").trim();
  }
  function has(t, words) {
    for (var i = 0; i < words.length; i++) if (new RegExp("(^|\\s)" + words[i]).test(t)) return true;
    return false;
  }
  function soles(n) { return "S/ " + n.toFixed(2); }
  function hhmm(h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    var ap = hh >= 12 ? "pm" : "am", h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ":" + (mm < 10 ? "0" : "") + mm + " " + ap;
  }
  function now() {
    var d = new Date();
    return (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
  }

  /* ---------- Pintar mensajes ---------- */
  var queue = [], busy = false, gen = 0;
  function add(kind, text) {
    var el = document.createElement("div");
    el.className = "msg " + kind;
    el.textContent = text;
    if (kind !== "sys") {
      var t = document.createElement("time");
      t.textContent = now();
      el.appendChild(t);
    }
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }
  function chips(list) {
    chipsBox.textContent = "";
    (list || []).forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", function () { user(label); });
      chipsBox.appendChild(b);
    });
  }
  /* El bot responde con una pausa corta, como si escribiera */
  function say(texts, nextChips) {
    queue.push({ texts: [].concat(texts), chips: nextChips });
    if (!busy) pump();
  }
  function pump() {
    var job = queue.shift();
    if (!job) { busy = false; return; }
    busy = true;
    chips([]);
    var i = 0, g = gen;
    (function step() {
      if (g !== gen) return;
      if (i >= job.texts.length) { chips(job.chips); pump(); return; }
      var txt = job.texts[i++];
      var typing = document.createElement("div");
      typing.className = "typing";
      typing.setAttribute("aria-hidden", "true");
      typing.innerHTML = "<i></i><i></i><i></i>";
      chat.appendChild(typing);
      chat.scrollTop = chat.scrollHeight;
      if (statusEl) statusEl.textContent = "escribiendo…";
      setTimeout(function () {
        typing.remove();
        if (g !== gen) return;
        if (statusEl) statusEl.textContent = "en línea";
        add("in", txt);
        step();
      }, reduce ? 150 : Math.min(1400, 450 + txt.length * 6));
    })();
  }

  /* ---------- Respuestas ---------- */
  var MENU_CHIPS = ["1 Ver la carta", "2 Hacer un pedido", "3 Reservar mesa", "4 Horario y ubicación", "5 Delivery y pagos", "0 Hablar con alguien"];
  var PLATO_CHIPS = ["Lomo saltado", "Ají de gallina", "Ceviche", "Arroz con pollo", "Chicha morada", "Listo, es todo"];

  function welcome() {
    S.state = "menu";
    say(["¡Hola! Bienvenido a " + NEGOCIO + " 🍲\nComida criolla hecha en casa.",
      "¿Qué se te antoja hoy? Responde con un número:\n1 Ver la carta\n2 Hacer un pedido\n3 Reservar mesa\n4 Horario y ubicación\n5 Delivery y pagos\n0 Hablar con alguien"], MENU_CHIPS);
  }
  function backToMenu(extra) {
    S.state = "menu";
    say([(extra ? extra + "\n\n" : "") + "¿Te ayudo con algo más?"], MENU_CHIPS);
  }
  function carta() {
    var fondos = MENU.slice(0, 6).map(function (m) { return "• " + m.n + " · S/ " + m.p; }).join("\n");
    var otros = MENU.slice(6).map(function (m) { return "• " + m.n + " · S/ " + m.p; }).join("\n");
    S.state = "menu";
    say(["Esta es nuestra carta 👇\n\nFONDOS\n" + fondos, "ENTRADAS Y BEBIDAS\n" + otros, "¿Te animas a pedir? Escríbeme el plato y la cantidad, por ejemplo: \"2 lomos saltados\"."],
      ["2 Hacer un pedido", "3 Reservar mesa", "Volver al menú"]);
  }
  function horario() {
    backToMenu("Atendemos:\n• Lunes a viernes: 12:00 pm a 4:00 pm\n• Sábado: 12:00 pm a 5:00 pm\n• Domingo: 12:00 pm a 3:30 pm\n\nEstamos en " + DIRECCION + ". 📍");
  }
  function delivery() {
    backToMenu("Hacemos delivery hasta 3 km a la redonda por S/ " + DELIVERY + " y llega en unos 35 a 45 minutos.\nPagas con Yape, Plin o efectivo (te llevamos vuelto).");
  }
  function pagos() {
    backToMenu("Aceptamos Yape, Plin y efectivo. Al confirmar tu pedido te paso el número para el Yape/Plin.");
  }
  function handoff(reason) {
    S.state = "human";
    say([reason || "Te paso con alguien del local para ayudarte mejor.", "En la vida real, aquí el bot marca el chat como \"Atender\" y avisa al personal, que responde en unos minutos. 🙋"], ["Volver al menú"]);
    S.misses = 0;
  }
  function fallback() {
    S.misses++;
    if (S.misses >= 2) { handoff("Disculpa, no logré entenderte. Te paso con una persona del local."); return; }
    say(["No te entendí bien 😅 ¿Quieres alguna de estas opciones? También puedes escribir 0 para hablar con alguien."], MENU_CHIPS);
  }

  /* ---------- Pedido ---------- */
  function findDishes(t) {
    var found = [];
    MENU.forEach(function (m) {
      for (var i = 0; i < m.a.length; i++) {
        var idx = t.indexOf(m.a[i]);
        if (idx === -1) continue;
        var before = t.slice(Math.max(0, idx - 18), idx).trim().split(" ");
        var q = 1;
        for (var j = before.length - 1; j >= 0 && j >= before.length - 3; j--) {
          if (/^\d{1,2}$/.test(before[j])) { q = parseInt(before[j], 10); break; }
          if (NUM[before[j]]) { q = NUM[before[j]]; break; }
        }
        found.push({ m: m, q: Math.max(1, Math.min(q, 20)) });
        break;
      }
    });
    return found;
  }
  function cartLines() {
    var lines = [], total = 0;
    MENU.forEach(function (m) {
      var q = S.cart[m.id];
      if (!q) return;
      lines.push("• " + q + " x " + m.n + " · " + soles(q * m.p));
      total += q * m.p;
    });
    return { text: lines.join("\n"), total: total };
  }
  function startOrder() {
    S.state = "items";
    say(["¡Claro! ¿Qué te provoca? Escríbeme el plato y la cantidad (ej.: \"2 ají de gallina y una chicha\") o toca una opción."], PLATO_CHIPS);
  }
  function addDishes(list) {
    list.forEach(function (f) { S.cart[f.m.id] = (S.cart[f.m.id] || 0) + f.q; });
    S.state = "items";
    var c = cartLines();
    say(["Anotado ✍️\n" + c.text + "\nSubtotal: " + soles(c.total), "¿Algo más o es todo?"], PLATO_CHIPS);
  }
  function askMode() {
    if (!cartLines().total) { say(["Aún no tienes platos en tu pedido. ¿Qué te provoca?"], PLATO_CHIPS); return; }
    S.state = "mode";
    say(["¿Es para delivery o para recoger en el local?"], ["Delivery", "Recojo en el local"]);
  }
  function askPay() {
    S.state = "pay";
    say(["¿Cómo vas a pagar?"], ["Yape", "Plin", "Efectivo"]);
  }
  function confirmOrder() {
    S.state = "confirm";
    var c = cartLines(), envio = S.order.mode === "delivery" ? DELIVERY : 0;
    var txt = "Tu pedido:\n" + c.text +
      (envio ? "\n• Delivery · " + soles(envio) : "") +
      "\nTotal: " + soles(c.total + envio) +
      "\n\n" + (S.order.mode === "delivery" ? "Entrega en: " + S.order.addr : "Recojo en el local") +
      "\nPago: " + S.order.pay;
    say([txt, "¿Confirmo tu pedido?"], ["Sí, confirmar", "Cambiar algo"]);
  }
  function doneOrder() {
    var mins = S.order.mode === "delivery" ? "35 a 45 minutos" : "20 minutos";
    var pay = S.order.pay === "Efectivo" ? "" : "\nYapea o plinea al 999 999 999 (número de ejemplo) y envíanos la captura.";
    S.cart = {}; S.order = {};
    backToMenu("¡Listo! Tu pedido ya está en la cocina 🔥 Estará en unos " + mins + "." + pay + "\n\n(En el negocio real, el pedido le llega al personal con la etiqueta \"Pedido nuevo\").");
  }

  /* ---------- Reserva ---------- */
  function parsePeople(t) {
    var re = /(?:para|somos|mesa de|de)\s+(\d{1,2}|[a-z]+)|(\d{1,2})\s*(?:personas|pers|adultos)/g, m;
    while ((m = re.exec(t))) {
      var w = m[1] || m[2];
      var v = /^\d+$/.test(w) ? parseInt(w, 10) : (NUM[w] || 0);
      if (v > 0 && v <= 60) return v;
    }
    return 0;
  }
  function parseDay(t) {
    var today = new Date().getDay();
    if (/(^|\s)hoy(\s|$)/.test(t)) return today;
    if (/manana/.test(t) && !/en la manana/.test(t)) return (today + 1) % 7;
    var names = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    for (var i = 0; i < 7; i++) if (t.indexOf(names[i]) !== -1) return i;
    return -1;
  }
  function parseTime(t) {
    var h, ap, m = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
    if (m) { h = +m[1] + (+m[2]) / 60; ap = m[3] || ""; }
    else {
      m = t.match(/(?:a las|a la|tipo|las|la)\s+(\d{1,2})\s*(am|pm)?(\s|$)/);
      if (!m) return -1;
      h = +m[1]; ap = m[2] || "";
    }
    if (ap === "pm" && h < 12) h += 12;
    else if (!ap && h >= 1 && h < 7) h += 12;
    return h;
  }
  function slots(day) {
    var r = HOURS[day], out = [];
    for (var h = r[0]; h <= r[1] - 1; h++) out.push(h);
    return out;
  }
  function dayName(d) {
    var today = new Date().getDay();
    return d === today ? "hoy" : d === (today + 1) % 7 ? "mañana" : "el " + DIAS[d];
  }
  function nextRes() {
    var R = S.res;
    if (!R.people) { S.state = "res_people"; say(["¿Para cuántas personas?"], ["2", "4", "6", "Más de 10"]); return; }
    if (R.people > 15) { handoff("Para grupos de más de 15 personas lo coordina directamente el local. Te paso con una persona."); return; }
    if (R.day === undefined || R.day < 0) { S.state = "res_day"; say(["¿Para qué día?"], ["Hoy", "Mañana", "Sábado", "Domingo"]); return; }
    if (R.time === undefined || R.time < 0) {
      S.state = "res_time";
      var sl = slots(R.day);
      var nowH = new Date().getHours() + new Date().getMinutes() / 60;
      if (R.day === new Date().getDay()) sl = sl.filter(function (h) { return h > nowH + 0.5; });
      if (!sl.length) { R.day = -1; say(["Para hoy ya no nos quedan horarios 😕 ¿Te parece otro día?"], ["Mañana", "Sábado", "Domingo"]); S.state = "res_day"; return; }
      say(["¿A qué hora? " + dayName(R.day).replace(/^./, function (c) { return c.toUpperCase(); }) + " atendemos de " + hhmm(HOURS[R.day][0]) + " a " + hhmm(HOURS[R.day][1]) + "."], sl.map(hhmm));
      return;
    }
    if (!R.name) { S.state = "res_name"; say(["¿A nombre de quién la separo?"], []); return; }
    S.state = "res_confirm";
    say(["Mesa para " + R.people + ", " + dayName(R.day) + " a las " + hhmm(R.time) + ", a nombre de " + R.name + ". ¿Confirmo?"], ["Sí, confirmar", "Cambiar algo"]);
  }
  function setTime(h) {
    var r = HOURS[S.res.day];
    if (h < r[0] || h > r[1] - 1) {
      S.res.time = -1;
      say(["A esa hora estamos cerrados. " + dayName(S.res.day).replace(/^./, function (c) { return c.toUpperCase(); }) + " atendemos de " + hhmm(r[0]) + " a " + hhmm(r[1]) + "."], []);
    } else S.res.time = h;
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

  /* ---------- Cerebro: intención primero, respuesta después ---------- */
  function brain(raw) {
    var t = norm(raw);
    if (!t) return;

    if (has(t, ["menu", "inicio", "volver al menu"]) && t.length < 20) { S.misses = 0; welcome(); return; }
    if (has(t, ["cancelar", "cancela"])) { S.cart = {}; S.order = {}; S.res = {}; backToMenu("Listo, lo cancelé."); return; }
    if (has(t, ["queja", "reclamo", "llego frio", "frio", "falto", "faltaba", "me cobraron", "demasiado tarde", "pesimo", "malogr"])) {
      handoff("Uy, lo sentimos mucho. Ya le paso tu mensaje a la persona encargada para solucionarlo al toque.");
      return;
    }
    if (t === "0" || has(t, ["hablar con alguien", "una persona", "asesor", "humano", "encargad"])) { handoff(); return; }

    /* Pasos que esperan un dato */
    switch (S.state) {
      case "items":
        if (has(t, ["listo", "es todo", "nada mas", "eso es todo", "solo eso", "nada"])) { S.misses = 0; askMode(); return; }
        break;
      case "mode":
        if (has(t, ["deliv", "envio", "a mi casa", "a domicilio", "lleven", "traigan"])) { S.order.mode = "delivery"; S.state = "addr"; say(["Perfecto. Envíame tu dirección con una referencia (ej.: \"Jr. Las Flores 245, portón verde\")."], []); return; }
        if (has(t, ["recojo", "recoger", "paso", "local", "para llevar"])) { S.order.mode = "recojo"; askPay(); return; }
        break;
      case "addr":
        if (raw.trim().length >= 6) { S.order.addr = raw.trim().slice(0, 120); askPay(); return; }
        say(["¿Me pasas la dirección completa con una referencia?"], []); return;
      case "pay":
        if (has(t, ["yape"])) { S.order.pay = "Yape"; confirmOrder(); return; }
        if (has(t, ["plin"])) { S.order.pay = "Plin"; confirmOrder(); return; }
        if (has(t, ["efectivo", "cash", "billete", "sencillo"])) { S.order.pay = "Efectivo"; confirmOrder(); return; }
        if (has(t, ["tarjeta", "visa", "pos"])) { say(["Por ahora no tenemos POS para delivery 🙏 ¿Puede ser Yape, Plin o efectivo?"], ["Yape", "Plin", "Efectivo"]); return; }
        break;
      case "confirm":
        if (has(t, ["si", "confirm", "ok", "dale", "listo", "claro", "de una"])) { doneOrder(); return; }
        if (has(t, ["no", "cambiar", "cambio"])) { S.cart = {}; S.state = "items"; say(["Sin problema, armemos el pedido de nuevo. ¿Qué te provoca?"], PLATO_CHIPS); return; }
        break;
      case "res_people":
        if (has(t, ["mas de 10"])) { S.res.people = 11; nextRes(); return; }
        var p = parsePeople(t) || (/^\d{1,2}$/.test(t) ? parseInt(t, 10) : NUM[t] || 0);
        if (p > 0) { S.res.people = p; nextRes(); return; }
        break;
      case "res_day":
        var d = parseDay(t);
        if (d >= 0) { S.res.day = d; var h0 = parseTime(t); if (h0 >= 0) { setTime(h0); return; } nextRes(); return; }
        break;
      case "res_time":
        var h = parseTime(t);
        if (h < 0) { var m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/); if (m) h = parseTime("a las " + t); }
        if (h >= 0) { setTime(h); return; }
        break;
      case "res_name":
        var name = raw.replace(/[<>]/g, "").trim().slice(0, 40);
        if (name.length >= 2) { S.res.name = name.replace(/^(a nombre de|es|soy)\s+/i, ""); nextRes(); return; }
        break;
      case "res_confirm":
        if (has(t, ["si", "confirm", "ok", "dale", "listo", "claro"])) {
          var R = S.res; S.res = {};
          backToMenu("¡Separado! ✅ Te esperamos " + dayName(R.day) + " a las " + hhmm(R.time) + ". Te guardamos la mesa 15 minutos.\n\n(En el negocio real, la reserva le llega al personal con la etiqueta \"Reserva\").");
          return;
        }
        if (has(t, ["no", "cambiar", "cambio"])) { startRes(""); return; }
        break;
    }

    /* Intenciones generales */
    var dishes = findDishes(t);
    if (dishes.length && has(t, ["cuanto", "precio", "cuesta", "a como", "vale"])) {
      S.misses = 0;
      var info = dishes.map(function (f) { return "• " + f.m.n + " · S/ " + f.m.p; }).join("\n");
      say(["Aquí tienes 👇\n" + info, "¿Te lo anoto?"], dishes.slice(0, 3).map(function (f) { return "Quiero 1 " + f.m.n; }).concat(["Volver al menú"]));
      return;
    }
    if (dishes.length) { S.misses = 0; addDishes(dishes); return; }
    if (S.state === "menu" && /^[1-5]\b/.test(t)) {
      S.misses = 0;
      ({ 1: carta, 2: startOrder, 3: function () { startRes(""); }, 4: horario, 5: delivery })[t[0]]();
      return;
    }
    if (has(t, ["reserv", "mesa", "separar"])) { S.misses = 0; startRes(t); return; }
    if (has(t, ["carta", "que tienen", "que hay", "platos", "precio", "cuanto esta", "cuanto cuesta", "menu del dia"])) { S.misses = 0; carta(); return; }
    if (has(t, ["pedir", "pedido", "quiero", "me mandas", "me envias", "ordenar"])) { S.misses = 0; startOrder(); return; }
    if (has(t, ["deliv", "envio", "reparto", "llegan a", "hasta donde"])) { S.misses = 0; delivery(); return; }
    if (has(t, ["horario", "hora", "abren", "abierto", "atienden", "cierran"])) { S.misses = 0; horario(); return; }
    if (has(t, ["donde", "direccion", "ubicacion", "ubicados", "como llego", "mapa"])) { S.misses = 0; horario(); return; }
    if (has(t, ["yape", "plin", "pago", "pagar", "tarjeta", "efectivo"])) { S.misses = 0; pagos(); return; }
    if (has(t, ["gracias", "genial", "chevere", "perfecto"])) { backToMenu("¡A ti! Que lo disfrutes 😊"); return; }
    if (has(t, ["hola", "buenas", "buenos", "buen dia", "alo", "hey"])) { S.misses = 0; welcome(); return; }
    fallback();
  }

  function user(text) {
    text = String(text).slice(0, 200);
    if (!text.trim()) return;
    add("out", text);
    chips([]);
    brain(text);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = "";
    user(v);
  });
  var resetBtn = document.querySelector("[data-reset]");
  if (resetBtn) resetBtn.addEventListener("click", function () {
    gen++; queue = []; busy = false; chat.textContent = ""; chips([]); start();
  });

  function start() {
    fresh();
    add("sys", "Simulación · los mensajes no salen de esta página");
    say(["¡Hola! Bienvenido a " + NEGOCIO + " 🍲\nComida criolla hecha en casa.",
      "¿Qué se te antoja hoy? Responde con un número:\n1 Ver la carta\n2 Hacer un pedido\n3 Reservar mesa\n4 Horario y ubicación\n5 Delivery y pagos\n0 Hablar con alguien"], MENU_CHIPS);
  }
  start();
})();
