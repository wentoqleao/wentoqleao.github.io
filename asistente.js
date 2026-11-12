(function () {
  /* Asistente del portafolio de Jose Aylas Gutierrez · responde dudas y arma la solicitud por WhatsApp. Sin servidor: nada sale de la página hasta que el visitante toca "Enviar por WhatsApp". */
  "use strict";

  var WA = "51933952330";
  if (!/^519\d{8}$/.test(WA)) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Datos del negocio ---------- */
  var P = {
    basico: { n: "Básico", p: 350, d: "Una página con tus servicios o productos, fotos, horario, mapa y botón de WhatsApp. Lista en 3 a 4 días." },
    negocio: { n: "Negocio", p: 700, d: "Todo lo del Básico, más catálogo o carta, galería, reseñas, dominio propio el primer año y ficha en Google Maps." },
    pro: { n: "Pro", p: 1100, d: "Todo lo de Negocio, más pedidos o reservas que llegan a tu WhatsApp, respuesta automática en WhatsApp Business y 1 mes de mantenimiento gratis." }
  };
  Object.keys(P).forEach(function (k) { P[k].f = P[k].p.toLocaleString("en-US"); });
  var DEMOS = [
    { t: "Restaurante · Doña Paquita", href: "dona-paquita-pro/" },
    { t: "Barbería · El Filo", href: "el-filo-barberia/" },
    { t: "Farmacia · Botica Alivio", href: "botica-alivio/" },
    { t: "Bot de WhatsApp (demo)", href: "bot-whatsapp/" }
  ];

  /* ---------- Interfaz ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var fab = el("button", "as-fab");
  fab.type = "button";
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "as-panel");
  var dot = el("span", "dot", "💬"); dot.setAttribute("aria-hidden", "true");
  fab.appendChild(dot); fab.appendChild(document.createTextNode("¿Dudas? Pregúntame"));

  var panel = el("div", "as-panel"); panel.id = "as-panel"; panel.hidden = true;
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Asistente de Jose Aylas Gutierrez");
  var head = el("div", "as-head");
  var av = el("span", "av", "JA"); av.setAttribute("aria-hidden", "true");
  var hd = el("div"); hd.appendChild(el("b", null, "Asistente de Jose")); var st = el("span", null, "Responde al instante"); hd.appendChild(st);
  var close = el("button", null, "×"); close.type = "button"; close.setAttribute("aria-label", "Cerrar el chat");
  head.appendChild(av); head.appendChild(hd); head.appendChild(close);
  var chat = el("div", "as-chat"); chat.setAttribute("role", "log"); chat.setAttribute("aria-live", "polite");
  var chipsBox = el("div", "as-chips");
  var form = el("form", "as-form"); form.setAttribute("autocomplete", "off");
  var lab = el("label", "as-sr", "Escribe tu pregunta"); lab.htmlFor = "as-input";
  var input = el("input"); input.id = "as-input"; input.type = "text"; input.maxLength = 200; input.placeholder = "Escribe tu pregunta";
  var send = el("button", null, "➤"); send.type = "submit"; send.setAttribute("aria-label", "Enviar");
  form.appendChild(lab); form.appendChild(input); form.appendChild(send);
  panel.appendChild(head); panel.appendChild(chat); panel.appendChild(chipsBox); panel.appendChild(form);
  document.body.appendChild(fab); document.body.appendChild(panel);

  var started = false;
  function open() {
    panel.hidden = false; fab.setAttribute("aria-expanded", "true");
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
    var m = el("div", "as-msg " + kind, text);
    if (links && links.length) {
      var box = el("div", "as-links");
      links.forEach(function (l) {
        var a = el("a", l.wa ? "wa" : "", l.t);
        a.href = l.href;
        if (/^https:/.test(l.href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        box.appendChild(a);
      });
      m.appendChild(box);
    }
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
  }
  function chips(list) {
    chipsBox.textContent = "";
    (list || []).forEach(function (label) {
      var b = el("button", null, label); b.type = "button";
      b.addEventListener("click", function () { user(label); });
      chipsBox.appendChild(b);
    });    chat.scrollTop = chat.scrollHeight;
  }
  /* say([texto | {t, links}], chips) */
  function say(items, next) { queue.push({ items: [].concat(items), chips: next }); if (!busy) pump(); }
  function pump() {
    var job = queue.shift();
    if (!job) { busy = false; return; }
    busy = true; chips([]);
    var i = 0;
    (function step() {
      if (i >= job.items.length) { chips(job.chips); pump(); return; }
      var it = job.items[i++], txt = typeof it === "string" ? it : it.t;
      var ty = el("div", "as-typing"); ty.setAttribute("aria-hidden", "true");
      ty.appendChild(el("i")); ty.appendChild(el("i")); ty.appendChild(el("i"));
      chat.appendChild(ty); chat.scrollTop = chat.scrollHeight;
      st.textContent = "escribiendo…";
      setTimeout(function () {
        ty.remove(); st.textContent = "Responde al instante";
        addMsg("in", txt, typeof it === "string" ? null : it.links);
        step();
      }, reduce ? 120 : Math.min(1200, 400 + txt.length * 5));
    })();
  }

  /* ---------- Utilidades ---------- */
  function norm(t) {
    return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:]/g, " ").replace(/\s+/g, " ").trim();
  }
  function has(t, words) {
    for (var i = 0; i < words.length; i++) if (new RegExp("(^|\\s)" + words[i]).test(t)) return true;
    return false;
  }
  function clean(s, max) { return String(s).replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max); }
  function waLink(text) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); }

  /* ---------- Conversación ---------- */
  var MENU = ["Ver precios", "Quiero mi página", "Ver ejemplos", "¿Cómo trabajas?", "Hablar con Jose"];
  var S = { state: "menu", lead: {}, misses: 0 };

  function welcome() {
    say(["¡Hola! Soy el asistente de Jose 👋 Te ayudo a elegir la página para tu negocio.", "¿Qué te gustaría saber?"], MENU);
  }
  function more(extra) {
    S.state = "menu";
    say([(extra ? extra + "\n\n" : "") + "¿Te ayudo con algo más?"], MENU);
  }
  function precios() {
    S.state = "menu";
    say(["Precio fijo, pago único:\n• Básico: S/ " + P.basico.f + "\n• Negocio: S/ " + P.negocio.f + "\n• Pro: S/ " + P.pro.f,
      "Para restaurantes hay 2: Negocio (carta con carrito que arma el pedido) y Pro (además reservas, carta QR y apps de delivery).",
      "Pagas 50% al empezar y 50% al entregar, por Yape, Plin o transferencia. Todos incluyen 5 rondas de cambios."],
      ["¿Qué incluye cada uno?", "Quiero mi página", "Mantenimiento", "Ver ejemplos"]);
  }
  function incluye() {
    more("• Básico (S/ " + P.basico.f + "): " + P.basico.d + "\n\n• Negocio (S/ " + P.negocio.f + "): " + P.negocio.d + "\n\n• Pro (S/ " + P.pro.f + "): " + P.pro.d);
  }
  function ejemplos() {
    S.state = "menu";
    say([{ t: "Estos son ejemplos de lo que hago (los negocios son de muestra). Ábrelos en tu celular:", links: DEMOS.map(function (d) { return { t: d.t, href: d.href }; }) }], ["Ver precios", "Quiero mi página", "Hablar con Jose"]);
  }
  function proceso() {
    more("Así trabajo:\n1. Conversamos y eliges el paquete.\n2. Me pasas fotos, carta o precios, horario y dirección.\n3. Te muestro el avance y pides cambios.\n4. Publicamos y te enseño a compartirla.\n\nNormalmente tu página está lista en 5 a 10 días, según el paquete; el Básico, en 3 a 4 días.");
  }
  function mantenimiento() {
    more("El mantenimiento es opcional: S/ 60 al mes, con hosting, dominio y hasta 2 cambios al mes (precios, fotos, horarios).");
  }
  function botInfo() {
    S.state = "menu";
    say([{ t: "El paquete Pro incluye respuestas automáticas en WhatsApp Business. Si quieres un bot que lea y conteste cada pedido solo, se agrega aparte con una mensualidad. Pruébalo:", links: [{ t: "Probar el bot de WhatsApp", href: "bot-whatsapp/" }] }], ["Ver precios", "Quiero mi página", "Hablar con Jose"]);
  }
  function dominio() {
    more("El paquete Negocio y el Pro incluyen tu dominio propio (tunegocio.com o .pe) el primer año. Después lo renueva el mantenimiento o lo pagas tú directamente.");
  }
  function contacto(prefill) {
    S.state = "menu";
    say([{ t: "Escríbele directo a Jose por WhatsApp; responde el mismo día.", links: [{ t: "Escribir a Jose por WhatsApp", href: waLink(prefill || "Hola Jose, vi tu portafolio y quiero información sobre una página web."), wa: true }] }], ["Volver al inicio"]);
  }

  /* Solicitud: nombre → negocio → rubro → objetivo → resumen → WhatsApp */
  function startLead() {
    S.lead = {}; S.state = "l_name";
    say(["¡Genial! Te hago 4 preguntas rápidas y se lo paso a Jose por WhatsApp.", "¿Cómo te llamas?"], []);
  }
  function rec(goal, rubro) {
    if (goal === "pedidos") return "pro";
    if (goal === "catalogo") return "negocio";
    return rubro === "Restaurante" ? "negocio" : "basico";
  }
  function summary() {
    var L = S.lead, k = rec(L.goal, L.rubro), pk = P[k];
    L.pack = pk.n;
    S.state = "l_done";
    var goalTxt = { presencia: "que me encuentren en internet", catalogo: "mostrar mis productos o mi carta", pedidos: "recibir pedidos o reservas" }[L.goal];
    var msg = "Hola Jose, soy " + L.name + ". Tengo " + L.biz + " (" + L.rubro.toLowerCase() + ")" + (L.place ? " en " + L.place : "") +
      ". Quiero una página para " + goalTxt + ". El asistente me recomendó el paquete " + pk.n + " (S/ " + pk.f + "). ¿Conversamos?";
    say(["Te recomiendo el paquete " + pk.n + " (S/ " + pk.f + "): " + pk.d,
      { t: "Listo, " + L.name + ". Toca el botón y se abre WhatsApp con tu mensaje para Jose (puedes editarlo antes de enviarlo):", links: [{ t: "Enviar a Jose por WhatsApp", href: waLink(msg), wa: true }] }],
      ["Ver ejemplos", "Volver al inicio"]);
  }

  function brain(raw) {
    var t = norm(raw);
    if (!t) return;
    if (has(t, ["volver al inicio", "inicio", "menu"]) && t.length < 20) { S.state = "menu"; S.misses = 0; welcome(); return; }
    if (has(t, ["cancelar"])) { S.lead = {}; more("Listo, lo dejamos ahí."); return; }

    switch (S.state) {
      case "l_name":
        var n = clean(raw, 40).replace(/^(me llamo|soy|mi nombre es)\s+/i, "");
        if (n.length >= 2) { S.lead.name = n; S.state = "l_biz"; say(["Mucho gusto, " + n + ". ¿Cómo se llama tu negocio?"], []); return; }
        say(["¿Me dices tu nombre?"], []); return;
      case "l_biz":
        var b = clean(raw, 60);
        if (b.length >= 2) { S.lead.biz = b; S.state = "l_rubro"; say(["¿De qué rubro es?"], ["Restaurante", "Barbería o salón", "Farmacia o botica", "Tienda", "Otro"]); return; }
        say(["¿Cómo se llama tu negocio?"], []); return;
      case "l_rubro":
        var r = has(t, ["restaur", "cevich", "polleria", "anticuch", "comida", "cafe", "chifa", "menu"]) ? "Restaurante" :
          has(t, ["barber", "salon", "peluq", "spa", "unas"]) ? "Barbería o salón" :
          has(t, ["farmac", "botica"]) ? "Farmacia o botica" :
          has(t, ["tienda", "bodega", "minimarket", "ropa"]) ? "Tienda" : clean(raw, 40) || "Otro";
        S.lead.rubro = r; S.state = "l_goal";
        say(["¿Qué es lo más importante que haga tu página?"], ["Que me encuentren", "Mostrar productos o carta", "Recibir pedidos o reservas", "No sé, recomiéndame"]);
        return;
      case "l_goal":
        if (has(t, ["pedido", "reserva", "citas", "turno", "vender"])) S.lead.goal = "pedidos";
        else if (has(t, ["producto", "carta", "catalogo", "servicios", "precios"])) S.lead.goal = "catalogo";
        else S.lead.goal = "presencia";
        S.state = "l_place";
        say(["Última: ¿en qué distrito o ciudad está tu negocio?"], ["Prefiero no decir"]);
        return;
      case "l_place":
        if (!has(t, ["prefiero no", "no decir", "omitir"])) S.lead.place = clean(raw, 40);
        summary(); return;
    }

    if (has(t, ["quiero mi pagina", "quiero una pagina", "cotiz", "contratar", "me interesa", "quiero una web", "empezar"])) { S.misses = 0; startLead(); return; }
    if (has(t, ["que incluye", "incluye", "diferencia", "cada uno"])) { S.misses = 0; incluye(); return; }
    if (has(t, ["manten", "mensual", "hosting"])) { S.misses = 0; mantenimiento(); return; }
    if (has(t, ["bot", "chatbot", "automatic", "respuesta automatica", "inteligencia"])) { S.misses = 0; botInfo(); return; }
    if (has(t, ["dominio", ".com", ".pe"])) { S.misses = 0; dominio(); return; }
    if (has(t, ["cuanto demora", "cuanto tiempo", "demora", "en cuantos dias", "que tan rapido"])) { S.misses = 0; proceso(); return; }
    if (has(t, ["precio", "cuanto", "costo", "cuesta", "tarifa", "paquete", "plan", "pago", "yape", "plin"])) { S.misses = 0; precios(); return; }
    if (has(t, ["ejemplo", "demo", "trabajos", "portafolio", "muestra"])) { S.misses = 0; ejemplos(); return; }
    if (has(t, ["como trabajas", "proceso", "pasos", "cuanto demora", "demora", "tiempo", "dias", "rapido", "cuando"])) { S.misses = 0; proceso(); return; }
    if (has(t, ["hablar", "jose", "whatsapp", "contacto", "llamar", "persona", "numero"])) { S.misses = 0; contacto(); return; }
    if (has(t, ["restaur", "barber", "farmac", "botica", "tienda"])) { S.misses = 0; more("¡Sí trabajo con ese tipo de negocio! Puedes ver ejemplos o pedirme una propuesta con \"Quiero mi página\"."); return; }
    if (has(t, ["gracias", "genial", "chevere", "ok", "listo"])) { more("¡Con gusto! 😊"); return; }
    if (has(t, ["hola", "buenas", "buenos", "hey", "alo"])) { S.misses = 0; welcome(); return; }

    S.misses++;
    if (S.misses >= 2) { S.misses = 0; contacto("Hola Jose, vi tu portafolio y tengo una consulta: " + clean(raw, 150)); return; }
    say(["No te entendí bien 😅 Puedo ayudarte con estas opciones, o escribe \"hablar con Jose\"."], MENU);
  }

  function user(text) {
    text = String(text).slice(0, 200);
    if (!text.trim()) return;
    addMsg("out", text);
    chips([]);
    brain(text);
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); var v = input.value; input.value = ""; user(v); });
})();
