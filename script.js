const seccionesInfo = {
  "01": {
    tag: "01 • Conceptos básicos y herramientas",
    titulo: "¿Qué es la IA?",
    texto: "La inteligencia artificial son sistemas capaces de analizar datos, detectar patrones y generar respuestas, textos, código o imágenes. Hoy los jóvenes recurren sobre todo a asistentes conversacionales, herramientas de resumen, traductores y apoyos para estudiar.",
    puntos: [
      "Procesa grandes cantidades de información para generar respuestas o sugerencias.",
      "Las herramientas más usadas por jóvenes incluyen chats de IA, resúmenes rápidos y apoyo en redacción o programación.",
      "No 'piensa' ni siente como una persona: predice patrones a partir de su entrenamiento."
    ],
    ejemplo: "Pedirle a una IA que explique qué es una ecuación diferencial con una analogía sencilla antes de leer el capítulo del libro.",
    consejo: "Úsala para ubicar ideas generales, pero confirma siempre los conceptos base en tus apuntes o fuentes confiables."
  },
  "02": {
    tag: "02 • Causas, necesidades y hábitos",
    titulo: "¿Por qué la utilizan los jóvenes?",
    texto: "La buscan por su rapidez, facilidad de acceso y disponibilidad a cualquier hora. Esto ha cambiado los hábitos escolares: en vez de empezar siempre con búsquedas largas o lecturas extensas, muchos piden primero una explicación breve o un esquema.",
    puntos: [
      "Ahorra tiempo cuando hay varias tareas o entregas cercanas.",
      "Ofrece respuestas inmediatas sin importar la hora.",
      "Cambia el hábito de buscar enlaces a conversar directamente para pedir ejemplos o aclaraciones."
    ],
    ejemplo: "Consultar un tema a las 11 de la noche cuando no quedó claro en clase y pedir tres ejemplos distintos del mismo ejercicio.",
    consejo: "Aprovecha la velocidad de la IA para destrabar dudas, no para saltarte la lectura y el análisis personal."
  },
  "03": {
    tag: "03 • Beneficios, riesgos y consecuencias",
    titulo: "Impactos positivos y negativos",
    texto: "El uso de la IA en la educación tiene dos caras: puede acelerar la comprensión y personalizar el ritmo de estudio, pero si se usa sin criterio puede debilitar la memoria, provocar errores por datos inventados y bajar la tolerancia al esfuerzo.",
    puntos: [
      "Positivo: explicaciones paso a paso, refuerzo de temas difíciles y apoyo para organizar ideas.",
      "Negativo: copiar sin leer impide retener información y expone a respuestas imprecisas ('alucinaciones').",
      "Comportamiento: puede reducir la paciencia ante problemas que requieren prueba y error."
    ],
    ejemplo: "Entregar un resumen generado por IA con un dato histórico inventado porque no se revisó antes de enviarlo.",
    consejo: "Evalúa siempre si lo que obtienes te ayuda a aprender a largo plazo o solo te saca del apuro hoy."
  },
  "04": {
    tag: "04 • Evitar la dependencia",
    titulo: "Pensamiento crítico",
    texto: "El pensamiento crítico consiste en analizar, cuestionar y verificar lo que se lee antes de darlo por bueno. Evitar la dependencia implica intentar resolver primero por tu cuenta y revisar si la respuesta de la IA tiene lógica y sustento.",
    puntos: [
      "Intenta resolver o redactar un borrador antes de pedir ayuda.",
      "Cuestiona el procedimiento: si no entiendes un paso, no lo des por válido.",
      "Contrasta la información con tus notas, libros o criterios de la materia."
    ],
    ejemplo: "Resolver un problema algebraico o de química por tu cuenta y pedirle a la IA solo que revise dónde estuvo tu error.",
    consejo: "Hazte siempre la pregunta: '¿Podría explicar esto yo solo en un examen sin ver la pantalla?'."
  },
  "05": {
    tag: "05 • Recomendaciones y buenas prácticas",
    titulo: "Uso responsable de la IA",
    texto: "Usar la IA de forma responsable significa emplearla como apoyo educativo sin reemplazar tu propio esfuerzo, cuidando tu privacidad y respetando las reglas de cada clase.",
    puntos: [
      "Pide pistas, guías o preguntas de repaso en lugar de pedir la respuesta directa.",
      "No compartas contraseñas, datos personales ni información sensible.",
      "Respeta los lineamientos de integridad académica de tu escuela y docentes."
    ],
    ejemplo: "Pedirle a la IA que te haga 3 preguntas tipo examen para repasar un tema en lugar de que redacte el trabajo final.",
    consejo: "Trata a la IA como un compañero de estudio que te orienta, no como quien hace el trabajo por ti."
  },
  "06": {
    tag: "06 • Cuestionario interactivo",
    titulo: "Pon a prueba tus conocimientos",
    texto: "Este apartado está pensado para que los visitantes midan su comprensión y comparen qué logran resolver de forma autónoma frente a cuando piden apoyo a la IA.",
    puntos: [
      "Permite observar la diferencia entre responder por cuenta propia y apoyarse en asistencia guiada.",
      "Ayuda a detectar temas en los que necesitas reforzar tu razonamiento.",
      "Invita a reflexionar sobre cómo equilibrar rapidez y aprendizaje real."
    ],
    ejemplo: "Intentar responder preguntas de distintas materias primero sin ayuda y anotar en cuáles te apoyaste en la IA.",
    consejo: "Usa el cuestionario como una autoevaluación honesta para mejorar tu forma de estudiar."
  }
};

const preguntasQuiz = [
  {
    id: "q1",
    pregunta: "1. Estás atorado en un ejercicio de matemáticas. ¿Cuál es el uso más útil de la IA?",
    opciones: [
      { texto: "Que resuelva todo el ejercicio y copiar el resultado.", correcta: false },
      { texto: "Que te dé una pista del primer paso y revise tu procedimiento.", correcta: true },
      { texto: "Asumir que su respuesta siempre es exacta sin comprobarla.", correcta: false }
    ],
    explicacion: "Pedir pistas o revisión de tu propio avance mantiene activo tu razonamiento para el examen."
  },
  {
    id: "q2",
    pregunta: "2. ¿Qué riesgo existe al usar IA sin verificar lo que genera?",
    opciones: [
      { texto: "Que puede inventar datos o explicar algo con errores ('alucinaciones').", correcta: true },
      { texto: "Que borra tus apuntes automáticamente.", correcta: false },
      { texto: "Que nunca permite hacer preguntas de seguimiento.", correcta: false }
    ],
    explicacion: "La IA predice patrones de texto, no 'sabe' ni verifica la verdad por sí sola; siempre conviene contrastar."
  }
];

const leidos = new Set();
const respuestasCorrectas = new Set();

function actualizarProgreso() {
  const total = Object.keys(seccionesInfo).length;
  const actual = leidos.size;
  const texto = document.getElementById("texto-progreso");
  const barra = document.getElementById("barra-progreso");

  if (texto) texto.textContent = `${actual} / ${total} leídos`;
  if (barra) barra.style.width = `${(actual / total) * 100}%`;

  document.querySelectorAll(".tarjeta-sec").forEach((btn) => {
    const sec = btn.getAttribute("data-sec");
    const badge = btn.querySelector(".badge-leido");
    if (badge) {
      badge.classList.toggle("hidden", !leidos.has(sec));
    }
  });
}

function abrirModal(id) {
  const data = seccionesInfo[id];
  const modal = document.getElementById("modal");
  if (!data || !modal) return;

  leidos.add(id);
  actualizarProgreso();

  document.getElementById("modal-tag").textContent = data.tag;
  document.getElementById("modal-titulo").textContent = data.titulo;
  document.getElementById("modal-texto").textContent = data.texto;
  document.getElementById("modal-ejemplo").textContent = data.ejemplo;
  document.getElementById("modal-consejo").textContent = data.consejo;

  const lista = document.getElementById("modal-puntos");
  lista.innerHTML = data.puntos.map((punto) => `<li>${punto}</li>`).join("");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function cerrarModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function responderSondeo(opcion) {
  const box = document.getElementById("feedback-sondeo");
  if (!box) return;

  const mensajes = {
    copiar: "<strong>Consejo:</strong> Usar la IA para resolver rápido puede ahorrarte tiempo al momento, pero si no analizas el proceso te costará más en exámenes. Prueba pedirle primero una guía o un ejemplo similar.",
    entender: "<strong>Consejo:</strong> Usar la IA para aclarar dudas es una gran estrategia. Solo asegúrate de verificar sus respuestas con tus apuntes y de intentar resolver el siguiente ejercicio sin ayuda.",
    "casi-no": "<strong>Consejo:</strong> Mantener tu propio criterio es una gran ventaja. Cuando decidas probar la IA, úsala como apoyo para repasar conceptos o generar preguntas de práctica bajo tu control."
  };

  box.innerHTML = mensajes[opcion] || "";
  box.classList.remove("hidden");
}

function renderizarQuiz() {
  const contenedor = document.getElementById("quiz-contenedor");
  if (!contenedor) return;

  contenedor.innerHTML = preguntasQuiz.map((q) => `
    <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/75 border border-slate-800 space-y-3">
      <p class="text-sm sm:text-base font-bold text-white">${q.pregunta}</p>
      <div class="space-y-2">
        ${q.opciones.map((op, idx) => `
          <button
            type="button"
            data-qid="${q.id}"
            data-correcta="${op.correcta}"
            class="opcion-quiz w-full text-left px-4 py-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-xs sm:text-sm text-slate-200 transition-colors cursor-pointer"
          >
            ${String.fromCharCode(65 + idx)}. ${op.texto}
          </button>
        `).join("")}
      </div>
      <p id="exp-${q.id}" class="hidden text-xs text-slate-300 pt-1"></p>
    </div>
  `).join("");

  contenedor.querySelectorAll(".opcion-quiz").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qid = btn.getAttribute("data-qid");
      const esCorrecta = btn.getAttribute("data-correcta") === "true";
      const preguntaObj = preguntasQuiz.find((item) => item.id === qid);
      const exp = document.getElementById(`exp-${qid}`);

      contenedor.querySelectorAll(`.opcion-quiz[data-qid="${qid}"]`).forEach((b) => {
        b.classList.remove("border-emerald-500", "bg-emerald-950/40", "text-emerald-200", "border-rose-500", "bg-rose-950/40", "text-rose-200");
      });

      if (esCorrecta) {
        btn.classList.add("border-emerald-500", "bg-emerald-950/40", "text-emerald-200");
        respuestasCorrectas.add(qid);
        if (exp) {
          exp.textContent = `✓ ¡Bien! ${preguntaObj ? preguntaObj.explicacion : ""}`;
          exp.className = "text-xs text-emerald-300 pt-1";
        }
      } else {
        btn.classList.add("border-rose-500", "bg-rose-950/40", "text-rose-200");
        respuestasCorrectas.delete(qid);
        if (exp) {
          exp.textContent = `✕ Revisa esa idea: ${preguntaObj ? preguntaObj.explicacion : ""}`;
          exp.className = "text-xs text-rose-300 pt-1";
        }
      }

      const puntajeEl = document.getElementById("quiz-puntaje");
      if (puntajeEl) {
        puntajeEl.textContent = `Puntaje: ${respuestasCorrectas.size} / ${preguntasQuiz.length}`;
      }
    });
  });
}

function activarSpotlight() {
  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tarjeta-sec").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-sec");
      if (id) abrirModal(id);
    });
  });

  const modal = document.getElementById("modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) cerrarModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });

  actualizarProgreso();
  renderizarQuiz();
  activarSpotlight();
});

// --- LÓGICA DEL TUTOR IA CON CONTEXTO ---
const estadoBot = {
  esperandoRespuesta: null, // 'ideas_tarea', 'confirmar_reto', 'tema_duda'
  ultimoTema: null
};

function normalizarTexto(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function toggleBot() {
  const ventana = document.getElementById("bot-ventana");
  if (!ventana) return;
  ventana.classList.toggle("hidden");
  ventana.classList.toggle("flex");
}

function obtenerRespuestaBot(textoOriginal) {
  const t = normalizarTexto(textoOriginal);

  // 1. Detectar materias escolares (mate, historia, ciencias, etc.)
  if (/\b(mate|matematicas|algebra|calculo|geometria|trigonometria|ecuaciones|fracciones)\b/.test(t)) {
    estadoBot.esperandoRespuesta = "detalle_materia";
    estadoBot.ultimoTema = "matematicas";
    return "📐 <strong>Matemáticas:</strong> ¡Buen terreno para practicar! Cuéntame qué tema o ejercicio estás viendo (por ejemplo: ecuaciones, fracciones, áreas o funciones) y dime qué ya intentaste hacer.";
  }

  if (/\b(historia|geografia|civica|formacion|sociales|revolucion|independencia|guerra)\b/.test(t)) {
    estadoBot.esperandoRespuesta = "detalle_materia";
    estadoBot.ultimoTema = "historia";
    return "📜 <strong>Historia / Sociales:</strong> Ahí lo clave es no solo memorizar fechas, sino entender causas y consecuencias. ¿Qué época o tema estás trabajando y qué ideas ya tienes?";
  }

  if (/\b(quimica|fisica|biologia|ciencias|ciencia|celula|energia|atomo|fuerza)\b/.test(t)) {
    estadoBot.esperandoRespuesta = "detalle_materia";
    estadoBot.ultimoTema = "ciencias";
    return "🔬 <strong>Ciencias:</strong> Lo mejor es relacionar el concepto con un ejemplo de la vida diaria. ¿Qué tema estás viendo y qué parte te está costando más trabajo?";
  }

  if (/\b(espanol|literatura|redaccion|ortografia|ensayo|gramatica|lectura)\b/.test(t)) {
    estadoBot.esperandoRespuesta = "detalle_materia";
    estadoBot.ultimoTema = "espanol";
    return "✍️ <strong>Español / Redacción:</strong> Escribir con tus propias palabras es lo que más ayuda. ¿De qué trata tu texto o ensayo y qué llevas escrito hasta ahora?";
  }

  if (/\b(ingles|english|vocabulario|gramatica en ingles|verbos)\b/.test(t)) {
    estadoBot.esperandoRespuesta = "detalle_materia";
    estadoBot.ultimoTema = "ingles";
    return "🌎 <strong>Inglés:</strong> Podemos revisar tiempos verbales, vocabulario o cómo armar una oración. ¿Qué frase o regla estás practicando?";
  }

  if (/\b(programacion|codigo|programar|html|css|js|javascript|sql|base de datos|redes)\b/.test(t)) {
    estadoBot.esperandoRespuesta = "detalle_materia";
    estadoBot.ultimoTema = "programacion";
    return "💻 <strong>Programación / Sistemas:</strong> Para depurar o armar lógica, sirve mucho dividir el problema en pasos pequeños. ¿Qué estás intentando hacer o qué error te marca?";
  }

  // 2. Si el bot venía esperando el tema o ejercicio de una materia
  if (estadoBot.esperandoRespuesta === "detalle_materia") {
    estadoBot.esperandoRespuesta = "ideas_tarea";
    return `Entendido, vamos con <strong>"${textoOriginal}"</strong> en <em>${estadoBot.ultimoTema || "tu materia"}</em>.<br><br>Antes de darte pistas, cuéntame: ¿qué es lo primero que se te ocurre hacer o dónde te atoras exactamente?`;
  }

  // 3. Saludos y cortesía
  if (/^(hola|buenas|hey|que tal|hola bot)/.test(t)) {
    estadoBot.esperandoRespuesta = null;
    return "¡Hola! ¿En qué materia o tema estás trabajando hoy? Puedes decirme por ejemplo <em>matemáticas</em>, <em>historia</em> o pedirme que te haga una tarea.";
  }

  if (/^(gracias|muchas gracias|va|vale|ok|okay|entendido|listo|perfecto)$/.test(t)) {
    const fuePorReto = estadoBot.esperandoRespuesta === "confirmar_reto";
    estadoBot.esperandoRespuesta = null;
    if (fuePorReto) {
      return "¡Excelente! Escríbeme aquí el tema o el ejercicio que tienes enfrente y arrancamos paso a paso.";
    }
    return "¡A ti! Si te atoras en otro punto o quieres probar otro prompt, aquí sigo.";
  }

  // 4. Si el bot venía esperando un "sí" o "no" ante un reto/propuesta
  if (estadoBot.esperandoRespuesta === "confirmar_reto") {
    if (/^(no|nel|paso|ahorita no|no quiero)/.test(t)) {
      estadoBot.esperandoRespuesta = null;
      return "Sin problema, cero presión 😊. ¿Prefieres que te explique algún tema del proyecto (como alucinaciones, prompts o pensamiento crítico) o hacer el quiz?";
    }
    if (/^(si|simon|dale|va|claro|bueno|me late)/.test(t)) {
      estadoBot.esperandoRespuesta = "ideas_tarea";
      return "¡Súper! Escribe en 1 o 2 frases qué tema es y qué es lo que ya sabes o intentaste.";
    }
  }

  // 5. Si el bot estaba esperando que compartiera sus ideas de tarea
  if (estadoBot.esperandoRespuesta === "ideas_tarea") {
    estadoBot.esperandoRespuesta = null;
    if (/^(no se|no tengo|nada|no)/.test(t)) {
      return "No pasa nada, empezar desde cero es normal. Dime el nombre exacto del tema (por ejemplo: <em>ecuaciones lineales</em>, <em>fotosíntesis</em> o <em>Revolución Mexicana</em>) y te hago 2 preguntas clave para ubicarlo.";
    }
    return `Buen punto de partida. Con base en eso que comentas (<em>"${textoOriginal}"</em>), te sugiero armar tu respuesta en 3 partes:<br>1. <b>Idea principal</b> (qué es).<br>2. <b>Por qué importa</b> o cómo funciona.<br>3. <b>Un ejemplo</b>.<br><br>¿Quieres que revisemos tu primer borrador?`;
  }

  // 6. Respuestas cortas de "no" o "sí" fuera de un reto específico
  if (/^(no|nop|no entendi|no me sirvio|no es eso)/.test(t)) {
    estadoBot.esperandoRespuesta = "confirmar_reto";
    return "Entendido, lo cambiamos. ¿Quieres intentar resolverlo tú con una pista sencilla o prefieres que te dé un ejemplo diferente?";
  }

  if (/^(si|sip|si entendi|claro que si)/.test(t)) {
    const cierre = estadoBot.ultimoTema === "alucinaciones"
      ? "¡Qué bien! Siempre contrasta datos y fechas antes de entregar."
      : "¡Genial! Ese es el punto: que tú tengas el control y la IA solo te acompañe.";
    estadoBot.esperandoRespuesta = null;
    return `${cierre} ¿Probamos con algún ejercicio o duda real?`;
  }

  // 7. Piden que les hagan la tarea / atajo
  if (/(hazme|haz mi|resuelve|ensayo|tarea|copiar|responde todo)/.test(t)) {
    estadoBot.esperandoRespuesta = "confirmar_reto";
    estadoBot.ultimoTema = "atajo";
    return "🚫 <strong>¡Atajo detectado!</strong> Si te entrego el trabajo listo, te ahorras minutos hoy pero pierdes práctica para el examen.<br><br>¿Te animas a intentarlo conmigo paso a paso?";
  }

  // 8. Temas clave del proyecto: prompts, alucinaciones, estudio
  if (/(prompt|preguntar|pedir|como usar)/.test(t)) {
    estadoBot.esperandoRespuesta = null;
    estadoBot.ultimoTema = "prompt";
    return "✨ <strong>Fórmula de un buen prompt:</strong><br>1. <b>Contexto:</b> qué materia y tema es.<br>2. <b>Tu avance:</b> qué ya hiciste o dónde te trabaste.<br>3. <b>Regla:</b> <i>'Dame una pista, no la respuesta completa'</i>.";
  }

  if (/(alucinacion|alucinaciones|mentira|inventa|error|falso)/.test(t)) {
    estadoBot.esperandoRespuesta = null;
    estadoBot.ultimoTema = "alucinaciones";
    return "⚠️ Las <strong>alucinaciones</strong> ocurren cuando una IA inventa datos, citas o fórmulas que suenan creíbles pero son falsas. Por eso nunca conviene copiar sin revisar.<br><br>¿Quedó clara la idea?";
  }

  if (/(estudiar|tip|examen|critico|critico|aprender|repasar)/.test(t)) {
    estadoBot.esperandoRespuesta = "confirmar_reto";
    estadoBot.ultimoTema = "estudio";
    return "🧠 <strong>Tip de estudio activo:</strong> Intenta explicar el tema en voz alta con tus palabras y luego pídele a la IA que te señale qué te faltó.<br><br>¿Quieres practicar así con un tema tuyo?";
  }

  // 9. Respuesta abierta por defecto
  estadoBot.esperandoRespuesta = "confirmar_reto";
  return `Entiendo lo que mencionas sobre <em>"${textoOriginal}"</em>. Si me dices la materia o el tema exacto, podemos armar un plan corto para estudiarlo.<br><br>¿Qué te parece?`;
}

function agregarMensajeBot(html, esUsuario = false) {
  const contenedor = document.getElementById("bot-mensajes");
  if (!contenedor) return;

  const div = document.createElement("div");
  if (esUsuario) {
    div.className = "ml-auto max-w-[82%] p-3 rounded-2xl rounded-tr-none bg-indigo-600 text-white leading-relaxed";
    div.textContent = html;
  } else {
    div.className = "max-w-[88%] p-3 rounded-2xl rounded-tl-none bg-slate-800/90 text-slate-200 border border-slate-700/70 leading-relaxed";
    div.innerHTML = html;
  }

  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;
}

function enviarPreguntaRapida(pregunta) {
  agregarMensajeBot(pregunta, true);
  setTimeout(() => {
    agregarMensajeBot(obtenerRespuestaBot(pregunta), false);
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bot-form");
  const input = document.getElementById("bot-input");
  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = input.value.trim();
      if (!texto) return;
      input.value = "";
      enviarPreguntaRapida(texto);
    });
  }
});