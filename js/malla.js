const opcionesElectivas = {
  "Taller I": [
    { nombre: "Taller de Técnicas de Comunicación Eficaz", creditos: 1, prereqs: [] },
    { nombre: "Taller de Música", creditos: 1, prereqs: [] },
    { nombre: "Taller de Liderazgo y Trabajo en Equipo", creditos: 1, prereqs: [] }
  ],

  "Taller II": [
    { nombre: "Taller de Manejo de TIC", creditos: 1, prereqs: [] },
    { nombre: "Taller de Danza Folklórica", creditos: 1, prereqs: [] },
    { nombre: "Taller de Deporte", creditos: 1, prereqs: [] }
  ],

  "EE1": [
    { nombre: "Astronomía", creditos: 3, prereqs: ["Física III", "Física Experimental III"] },
    { nombre: "Gestión de Proyectos Científicos", creditos: 3, prereqs: [] },
    { nombre: "Teoría de la Información", creditos: 3, prereqs: ["Física Computacional", "Mecánica Cuántica I"] }
  ],

  "EE2": [
    { nombre: "Electrónica II", creditos: 4, prereqs: ["Electrónica I"] },
    { nombre: "Dinámica de Fluidos", creditos: 4, prereqs: ["Mecánica Clásica"] }
  ],

  "EE3": [
    { nombre: "Teoría de la Relatividad", creditos: 4, prereqs: ["Mecánica Clásica", "Física Matemática III", "Electromagnetismo II"] },
    { nombre: "Biofísica", creditos: 4, prereqs: ["Física IV", "Física Experimental IV"] }
  ],

  "Electivos IX-X": [
    { nombre: "Introducción a la Teoría Cuántica de Campo", creditos: 4, prereqs: ["Física Matemática III", "Electromagnetismo II", "Mecánica Cuántica II"] },
    { nombre: "Física de la Materia Condensada", creditos: 4, prereqs: ["Mecánica Estadística y Termodinámica", "Mecánica Cuántica II", "Física del Estado Sólido"] },
    { nombre: "Física de Nanoestructuras", creditos: 4, prereqs: ["Mecánica Estadística y Termodinámica", "Física del Estado Sólido"] },
    { nombre: "Películas Delgadas", creditos: 4, prereqs: ["Mecánica Clásica", "Mecánica Cuántica I"] },
    { nombre: "Espectroscopia Láser", creditos: 4, prereqs: ["Mecánica Cuántica II", "Física del Estado Sólido"] },
    { nombre: "Biomateriales", creditos: 4, prereqs: ["Física de Materiales I"] },
    { nombre: "Física de la Energía Solar Fotovoltaica", creditos: 4, prereqs: ["Mecánica Estadística y Termodinámica", "Física del Estado Sólido"] },
    { nombre: "Electrónica III", creditos: 4, prereqs: ["Electrónica II"] },
    { nombre: "Física de Materiales II", creditos: 4, prereqs: ["Física de Materiales I"] },
    { nombre: "Física Forense", creditos: 4, prereqs: ["Física IV"] },
    { nombre: "Meteorología y Climatología", creditos: 4, prereqs: ["Mecánica Estadística y Termodinámica"] },
    { nombre: "Filosofía de la Física", creditos: 4, prereqs: ["Mecánica Cuántica I", "Historia de la Física"] },
    { nombre: "Tópicos Avanzados de Física", creditos: 4, prereqs: ["Física de Materiales I", "Física del Estado Sólido", "Física Nuclear"] },
    { nombre: "Física de Partículas", creditos: 4, prereqs: ["Introducción a la Teoría Cuántica de Campo"] },
    { nombre: "Física Médica", creditos: 4, prereqs: ["Física Nuclear"] }
  ]
};

const mallaCurricular = {
  "I Ciclo": {
    "Introducción al Análisis Matemático": { creditos: 4, prereqs: [] },
    "Álgebra y Geometría": { creditos: 4, prereqs: [] },
    "Física General": { creditos: 4, prereqs: [] },
    "Pensamiento Lógico Matemático": { creditos: 3, prereqs: [] },
    "Lectura Crítica y Redacción de Textos Académicos": { creditos: 3, prereqs: [] },
    "Desarrollo Personal": { creditos: 3, prereqs: [] },
    "Taller I": { tipo: "electivo", grupo: "Taller I", creditos: 1, descripcion: "Elige 1 de 3 talleres" }
  },

  "II Ciclo": {
    "Análisis Matemático": { creditos: 4, prereqs: ["Introducción al Análisis Matemático"] },
    "Estadística General": { creditos: 4, prereqs: [] },
    "Física I": { creditos: 3, prereqs: ["Introducción al Análisis Matemático"] },
    "Física Experimental I": { creditos: 2, prereqs: [] },
    "Sociedad, Cultura y Ecología": { creditos: 3, prereqs: [] },
    "Ética, Convivencia Humana y Ciudadanía": { creditos: 3, prereqs: [] },
    "Cultura Investigativa y Pensamiento Crítico": { creditos: 3, prereqs: [] },
    "Taller II": { tipo: "electivo", grupo: "Taller II", creditos: 1, descripcion: "Elige 1 de 3 talleres" }
  },

  "III Ciclo": {
    "Análisis Matemático I": { creditos: 5, prereqs: ["Análisis Matemático"] },
    "Álgebra Lineal": { creditos: 5, prereqs: ["Álgebra y Geometría"] },
    "Física II": { creditos: 5, prereqs: ["Análisis Matemático", "Física I"] },
    "Física Experimental II": { creditos: 2, prereqs: ["Física I", "Física Experimental I"] },
    "Química": { creditos: 5, prereqs: [] }
  },

  "IV Ciclo": {
    "Análisis Matemático II": { creditos: 5, prereqs: ["Análisis Matemático I"] },
    "Física Matemática I": { creditos: 5, prereqs: ["Análisis Matemático I", "Álgebra Lineal"] },
    "Física III": { creditos: 5, prereqs: ["Análisis Matemático I", "Física II"] },
    "Física Experimental III": { creditos: 2, prereqs: ["Física II", "Física Experimental II"] },
    "Introducción a la Programación": { creditos: 5, prereqs: [] }
  },

  "V Ciclo": {
    "Física Matemática II": { creditos: 5, prereqs: ["Análisis Matemático II", "Física Matemática I"] },
    "Mecánica Clásica": { creditos: 6, prereqs: ["Física Matemática I", "Física III"] },
    "Física IV": { creditos: 5, prereqs: ["Análisis Matemático II", "Física III"] },
    "Física Experimental IV": { creditos: 2, prereqs: ["Física III", "Física Experimental III"] },
    "Física Computacional": { creditos: 5, prereqs: ["Física III", "Introducción a la Programación"] }
  },

  "VI Ciclo": {
    "Física Matemática III": { creditos: 5, prereqs: ["Física Matemática II"] },
    "Electromagnetismo I": { creditos: 5, prereqs: ["Física Matemática II", "Mecánica Clásica"] },
    "Mecánica Cuántica I": { creditos: 5, prereqs: ["Física Matemática II", "Física IV"] },
    "Electrónica I": { creditos: 5, prereqs: ["Física III", "Física Experimental III"] },
    "Historia de la Física": { creditos: 2, prereqs: [] }
  },

  "VII Ciclo": {
    "Mecánica Estadística y Termodinámica": { creditos: 5, prereqs: ["Mecánica Cuántica I"] },
    "Electromagnetismo II": { creditos: 5, prereqs: ["Electromagnetismo I"] },
    "Mecánica Cuántica II": { creditos: 5, prereqs: ["Mecánica Cuántica I"] },
    "EE2": { tipo: "electivo", grupo: "EE2", creditos: 4, descripcion: "Elige 1 de 2" },
    "EE1": { tipo: "electivo", grupo: "EE1", creditos: 3, descripcion: "Elige 1 de 3" }
  },

  "VIII Ciclo": {
    "Física de Materiales I": { creditos: 5, prereqs: ["Mecánica Estadística y Termodinámica", "Electromagnetismo II"] },
    "Física del Estado Sólido": { creditos: 5, prereqs: ["Mecánica Estadística y Termodinámica"] },
    "Física Nuclear": { creditos: 5, prereqs: ["Electromagnetismo II", "Mecánica Cuántica II"] },
    "Instrumentación Científica": { creditos: 4, prereqs: ["Física Experimental IV", "Física Computacional", "Electrónica I"] },
    "EE3": { tipo: "electivo", grupo: "EE3", creditos: 4, descripcion: "Elige 1 de 2" }
  },

  "IX Ciclo": {
    "Tesis I": { creditos: 6, prereqs: ["Física de Materiales I", "Física del Estado Sólido", "Física Nuclear"] },
    "Didáctica de la Física": { creditos: 3, prereqs: ["Física IV", "Física Experimental IV"] },
    "EE4": { tipo: "electivo", grupo: "Electivos IX-X", creditos: 4, descripcion: "Elige 1 electivo" },
    "EE5": { tipo: "electivo", grupo: "Electivos IX-X", creditos: 4, descripcion: "Elige 1 electivo" },
    "Electivo Libre 1": { tipo: "electivo", grupo: "Electivos IX-X", creditos: 4, descripcion: "Elige 1 electivo" }
  },

  "X Ciclo": {
    "Tesis II": { creditos: 8, prereqs: ["Tesis I"] },
    "Electivo Libre 2": { tipo: "electivo", grupo: "Electivos IX-X", creditos: 4, descripcion: "Elige 1 electivo" },
    "Práctica Pre Profesional": { creditos: 10, prereqs: [] }
  }
};

const TOTAL_CREDITOS = 222;

let estadoCursos = JSON.parse(localStorage.getItem("estadoCursos") || "{}");

let manejadorCierreElectivo = null;
let manejadorEscapeElectivo = null;

function guardarEstado() {
  localStorage.setItem("estadoCursos", JSON.stringify(estadoCursos));
}

function obtenerCurso(nombreCurso) {
  for (const ciclo in mallaCurricular) {
    if (mallaCurricular[ciclo][nombreCurso]) {
      return mallaCurricular[ciclo][nombreCurso];
    }
  }

  return null;
}

function obtenerOpcionElectiva(nombreOpcion) {
  for (const grupo in opcionesElectivas) {
    const opcion = opcionesElectivas[grupo].find(item => item.nombre === nombreOpcion);

    if (opcion) {
      return opcion;
    }
  }

  return null;
}

function obtenerTodosLosEspacios() {
  const espacios = [];

  for (const ciclo in mallaCurricular) {
    for (const nombre in mallaCurricular[ciclo]) {
      espacios.push(nombre);
    }
  }

  return espacios;
}

function obtenerEspaciosElectivos() {
  const espacios = [];

  for (const ciclo in mallaCurricular) {
    for (const nombre in mallaCurricular[ciclo]) {
      const curso = mallaCurricular[ciclo][nombre];

      if (curso.tipo === "electivo") {
        espacios.push(nombre);
      }
    }
  }

  return espacios;
}

function cursoAprobado(nombreCurso) {
  if (estadoCursos[nombreCurso] === true) {
    return true;
  }

  return Object.values(estadoCursos).some(valor => valor === nombreCurso);
}

function prerequisitosCumplidos(prereqs) {
  return prereqs.every(pre => cursoAprobado(pre));
}

function obtenerPrereqsPendientes(prereqs) {
  return prereqs.filter(pre => !cursoAprobado(pre));
}

function opcionYaElegidaEnOtroEspacio(nombreOpcion, espacioActual) {
  return obtenerEspaciosElectivos().some(espacio => {
    return espacio !== espacioActual && estadoCursos[espacio] === nombreOpcion;
  });
}

function puedeDesbloquear(nombreCurso) {
  const curso = obtenerCurso(nombreCurso);

  if (!curso) return false;
  if (curso.tipo === "electivo") return true;

  return prerequisitosCumplidos(curso.prereqs);
}

function obtenerMensajeBloqueo(nombreCurso) {
  const curso = obtenerCurso(nombreCurso);

  if (!curso || curso.tipo === "electivo") return "";

  const pendientes = obtenerPrereqsPendientes(curso.prereqs);

  if (pendientes.length > 0) {
    return `Requisitos pendientes: ${pendientes.join(", ")}`;
  }

  return "";
}

function deseleccionarDependientes(cursoBase) {
  for (const ciclo in mallaCurricular) {
    for (const nombre in mallaCurricular[ciclo]) {
      const curso = mallaCurricular[ciclo][nombre];

      if (curso.tipo === "electivo") {
        const seleccion = estadoCursos[nombre];

        if (!seleccion) continue;

        const opcion = obtenerOpcionElectiva(seleccion);

        if (opcion && opcion.prereqs.includes(cursoBase)) {
          delete estadoCursos[nombre];
          deseleccionarDependientes(seleccion);
        }
      } else if (estadoCursos[nombre] && curso.prereqs.includes(cursoBase)) {
        estadoCursos[nombre] = false;
        deseleccionarDependientes(nombre);
      }
    }
  }
}

function seleccionarCursoNormal(nombreCurso) {
  const curso = obtenerCurso(nombreCurso);

  if (!curso || curso.tipo === "electivo") return;

  if (estadoCursos[nombreCurso]) {
    estadoCursos[nombreCurso] = false;
    deseleccionarDependientes(nombreCurso);
    return;
  }

  if (!prerequisitosCumplidos(curso.prereqs)) return;

  estadoCursos[nombreCurso] = true;
}

function seleccionarOpcionElectiva(nombreEspacio, nombreOpcion) {
  const espacio = obtenerCurso(nombreEspacio);

  if (!espacio || espacio.tipo !== "electivo") return;

  const opcion = opcionesElectivas[espacio.grupo].find(item => item.nombre === nombreOpcion);

  if (!opcion) return;
  if (!prerequisitosCumplidos(opcion.prereqs)) return;
  if (opcionYaElegidaEnOtroEspacio(nombreOpcion, nombreEspacio)) return;

  const seleccionAnterior = estadoCursos[nombreEspacio];

  if (seleccionAnterior && seleccionAnterior !== nombreOpcion) {
    deseleccionarDependientes(seleccionAnterior);
  }

  estadoCursos[nombreEspacio] = nombreOpcion;
}

function quitarSeleccionElectiva(nombreEspacio) {
  const seleccionAnterior = estadoCursos[nombreEspacio];

  if (seleccionAnterior) {
    delete estadoCursos[nombreEspacio];
    deseleccionarDependientes(seleccionAnterior);
  }
}

function obtenerCreditosDelEspacio(nombreEspacio) {
  const curso = obtenerCurso(nombreEspacio);

  if (!curso) return 0;

  if (curso.tipo !== "electivo") {
    return curso.creditos;
  }

  const seleccion = estadoCursos[nombreEspacio];
  const opcion = obtenerOpcionElectiva(seleccion);

  return opcion ? opcion.creditos : curso.creditos;
}

function contarCreditos() {
  let aprobados = 0;

  for (const ciclo in mallaCurricular) {
    for (const nombre in mallaCurricular[ciclo]) {
      const curso = mallaCurricular[ciclo][nombre];

      if (curso.tipo === "electivo") {
        if (estadoCursos[nombre]) {
          aprobados += obtenerCreditosDelEspacio(nombre);
        }
      } else if (estadoCursos[nombre]) {
        aprobados += curso.creditos;
      }
    }
  }

  let contador = document.getElementById("contadorCreditos");

  if (!contador) {
    contador = document.createElement("div");
    contador.id = "contadorCreditos";
    contador.className = "contador-creditos";

    const h1 = document.querySelector("h1");
    h1.insertAdjacentElement("afterend", contador);
  }

  contador.textContent = `Créditos aprobados: ${aprobados} / ${TOTAL_CREDITOS}`;
}

function cerrarSelectorElectivo() {
  const popover = document.getElementById("popoverElectivos");

  if (popover) {
    popover.remove();
  }

  if (manejadorCierreElectivo) {
    document.removeEventListener("mousedown", manejadorCierreElectivo);
    manejadorCierreElectivo = null;
  }

  if (manejadorEscapeElectivo) {
    document.removeEventListener("keydown", manejadorEscapeElectivo);
    manejadorEscapeElectivo = null;
  }
}

function abrirSelectorElectivo(nombreEspacio, botonOrigen) {
  cerrarSelectorElectivo();

  const espacio = obtenerCurso(nombreEspacio);
  const opciones = opcionesElectivas[espacio.grupo] || [];
  const seleccionActual = estadoCursos[nombreEspacio];

  const popover = document.createElement("div");
  popover.id = "popoverElectivos";
  popover.className = "popover-electivos";

  const encabezado = document.createElement("div");
  encabezado.className = "popover-electivos-header";

  const titulo = document.createElement("h3");
  titulo.textContent = `Selecciona ${nombreEspacio}`;

  const cerrar = document.createElement("button");
  cerrar.className = "popover-cerrar";
  cerrar.type = "button";
  cerrar.textContent = "×";

  cerrar.onclick = evento => {
    evento.stopPropagation();
    cerrarSelectorElectivo();
  };

  encabezado.appendChild(titulo);
  encabezado.appendChild(cerrar);

  const ayuda = document.createElement("p");
  ayuda.className = "popover-ayuda";
  ayuda.textContent = espacio.descripcion || "Elige una opción para este electivo.";

  const lista = document.createElement("div");
  lista.className = "lista-opciones-electivas";

  opciones.forEach(opcion => {
    const pendientes = obtenerPrereqsPendientes(opcion.prereqs);
    const yaElegida = opcionYaElegidaEnOtroEspacio(opcion.nombre, nombreEspacio);
    const estaSeleccionada = seleccionActual === opcion.nombre;
    const bloqueada = pendientes.length > 0 || yaElegida;

    const item = document.createElement("button");
    item.className = "opcion-electiva";
    item.type = "button";

    if (estaSeleccionada) item.classList.add("seleccionada");
    if (bloqueada) item.classList.add("opcion-bloqueada");

    const nombre = document.createElement("strong");
    nombre.textContent = opcion.nombre;

    const creditos = document.createElement("span");
    creditos.textContent = `${opcion.creditos} créditos`;

    const detalle = document.createElement("small");

    if (pendientes.length > 0) {
      detalle.textContent = `Pendiente: ${pendientes.join(", ")}`;
    } else if (yaElegida) {
      detalle.textContent = "Ya elegiste este curso en otro espacio.";
    } else if (estaSeleccionada) {
      detalle.textContent = "Seleccionado actualmente.";
    } else if (opcion.prereqs.length > 0) {
      detalle.textContent = "Requisitos cumplidos.";
    } else {
      detalle.textContent = "Sin requisitos.";
    }

    item.appendChild(nombre);
    item.appendChild(creditos);
    item.appendChild(detalle);

    item.onclick = evento => {
      evento.stopPropagation();

      if (bloqueada) return;

      seleccionarOpcionElectiva(nombreEspacio, opcion.nombre);
      guardarEstado();
      cerrarSelectorElectivo();
      renderMalla();
    };

    lista.appendChild(item);
  });

  popover.appendChild(encabezado);
  popover.appendChild(ayuda);
  popover.appendChild(lista);

  if (seleccionActual) {
    const quitar = document.createElement("button");
    quitar.className = "quitar-electivo";
    quitar.type = "button";
    quitar.textContent = "Quitar selección";

    quitar.onclick = evento => {
      evento.stopPropagation();

      quitarSeleccionElectiva(nombreEspacio);
      guardarEstado();
      cerrarSelectorElectivo();
      renderMalla();
    };

    popover.appendChild(quitar);
  }

  document.body.appendChild(popover);

  const rectBoton = botonOrigen.getBoundingClientRect();
  const rectPopover = popover.getBoundingClientRect();

  let left = rectBoton.left + rectBoton.width / 2 - rectPopover.width / 2;
  let top = rectBoton.bottom + 10;

  const margen = 12;

  if (left < margen) {
    left = margen;
  }

  if (left + rectPopover.width > window.innerWidth - margen) {
    left = window.innerWidth - rectPopover.width - margen;
  }

  if (top + rectPopover.height > window.innerHeight - margen) {
    top = rectBoton.top - rectPopover.height - 10;
  }

  if (top < margen) {
    top = margen;
  }

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;

  setTimeout(() => {
    manejadorCierreElectivo = evento => {
      if (!popover.contains(evento.target) && !botonOrigen.contains(evento.target)) {
        cerrarSelectorElectivo();
      }
    };

    manejadorEscapeElectivo = evento => {
      if (evento.key === "Escape") {
        cerrarSelectorElectivo();
      }
    };

    document.addEventListener("mousedown", manejadorCierreElectivo);
    document.addEventListener("keydown", manejadorEscapeElectivo);
  }, 0);
}

function renderMalla() {
  const tablaCiclos = document.getElementById("tablaCiclos");
  const scrollX = tablaCiclos.scrollLeft;

  tablaCiclos.innerHTML = "";

  for (const ciclo in mallaCurricular) {
    const columna = document.createElement("div");
    columna.classList.add("columna-ciclo");

    const titulo = document.createElement("h2");
    titulo.textContent = ciclo;
    titulo.className = "ciclo";
    columna.appendChild(titulo);

    for (const nombre in mallaCurricular[ciclo]) {
      const curso = mallaCurricular[ciclo][nombre];
      const btn = document.createElement("div");
      btn.classList.add("curso");

      const esElectivo = curso.tipo === "electivo";
      const seleccionElectiva = esElectivo ? estadoCursos[nombre] : null;

      if (esElectivo) {
        btn.classList.add("electivo");

        if (seleccionElectiva) {
          btn.classList.add("aprobado");
        }
      } else if (estadoCursos[nombre]) {
        btn.classList.add("aprobado");
      } else if (!puedeDesbloquear(nombre)) {
        btn.classList.add("bloqueado");
        btn.title = obtenerMensajeBloqueo(nombre);
      }

      const nombreEl = document.createElement("div");
      nombreEl.className = "nombre-curso";
      nombreEl.textContent = seleccionElectiva || nombre;

      const creditosEl = document.createElement("div");
      creditosEl.className = "creditos";

      if (esElectivo) {
        creditosEl.textContent = seleccionElectiva
          ? `${obtenerCreditosDelEspacio(nombre)} créditos`
          : `${curso.creditos} créditos`;
      } else {
        creditosEl.textContent = `${curso.creditos} créditos`;
      }

      btn.appendChild(nombreEl);
      btn.appendChild(creditosEl);

      if (esElectivo) {
        const estadoEl = document.createElement("div");
        estadoEl.className = "estado-electivo";
        estadoEl.textContent = seleccionElectiva ? `${nombre} seleccionado` : curso.descripcion;
        btn.appendChild(estadoEl);
      }

      btn.onmousedown = e => e.preventDefault();

      btn.onclick = () => {
        if (esElectivo) {
          abrirSelectorElectivo(nombre, btn);
          return;
        }

        if (btn.classList.contains("bloqueado")) return;

        seleccionarCursoNormal(nombre);
        guardarEstado();
        renderMalla();
      };

      columna.appendChild(btn);
    }

    tablaCiclos.appendChild(columna);
  }

  requestAnimationFrame(() => {
    tablaCiclos.scrollLeft = scrollX;
  });

  contarCreditos();
}

function migrarEstadoAntiguo() {
  const espaciosValidos = new Set(obtenerTodosLosEspacios());
  const espaciosElectivos = obtenerEspaciosElectivos();

  for (const clave in estadoCursos) {
    if (espaciosValidos.has(clave)) continue;

    if (estadoCursos[clave] === true) {
      for (const espacio of espaciosElectivos) {
        const curso = obtenerCurso(espacio);
        const opciones = opcionesElectivas[curso.grupo] || [];
        const existeEnGrupo = opciones.some(opcion => opcion.nombre === clave);

        if (existeEnGrupo && !estadoCursos[espacio]) {
          estadoCursos[espacio] = clave;
          break;
        }
      }
    }

    delete estadoCursos[clave];
  }

  for (const espacio of espaciosElectivos) {
    const seleccion = estadoCursos[espacio];

    if (!seleccion) continue;

    const curso = obtenerCurso(espacio);
    const existe = opcionesElectivas[curso.grupo].some(opcion => opcion.nombre === seleccion);

    if (!existe) {
      delete estadoCursos[espacio];
    }
  }

  guardarEstado();
}

migrarEstadoAntiguo();
renderMalla();

function aplicarTema(tema) {
  document.body.classList.remove(
    "tema-rosa",
    "tema-amarillo",
    "tema-verde",
    "tema-celeste",
    "tema-rojo"
  );

  document.body.classList.add(`tema-${tema}`);

  localStorage.setItem("temaMalla", tema);

  document.querySelectorAll(".btn-tema").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.tema === tema);
  });
}

function inicializarSelectorTema() {
  const temaGuardado = localStorage.getItem("temaMalla") || "rosa";

  aplicarTema(temaGuardado);

  document.querySelectorAll(".btn-tema").forEach(btn => {
    btn.addEventListener("click", () => {
      aplicarTema(btn.dataset.tema);
    });
  });
}

inicializarSelectorTema();
