document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const normalize = (value = "") => value.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const escapeHtml = (value = "") => value.toString().replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);

  const isRealUrl = (url) => url && url !== "#";

  // Las páginas principales del sitio se navegan en la misma pestaña.
  // Todo recurso/documento/enlace externo se abre en una pestaña nueva.
  const mainSitePages = new Set([
    "/",
    "/carrera/",
    "/academico/",
    "/comunidad/",
    "/biblioteca/",
    "/oportunidades/",
    "/eventos/",
    "/contacto/"
  ]);

  const shouldOpenNewTab = (url) => {
    if (!isRealUrl(url) || url.startsWith("#")) return false;

    try {
      const parsed = new URL(url, window.location.href);
      const isSameSite = parsed.origin === window.location.origin;
      const cleanPath = parsed.pathname.replace(/\/+$/, "") || "/";

      // Las rutas internas limpias permanecen en la misma pestaña.
      if (isSameSite && (mainSitePages.has(cleanPath) || !cleanPath.split("/").pop().includes("."))) return false;

      return true;
    } catch {
      return true;
    }
  };

  const linkTargetAttrs = (url) => shouldOpenNewTab(url)
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";

  const safeHref = (url) => isRealUrl(url) ? escapeHtml(url) : "#";
  const placeholderAttrs = (url) => isRealUrl(url) ? "" : ' aria-disabled="true" data-placeholder-link';
  const isPublished = (item) => item?.published !== false;

  const menuButton = document.getElementById("hamburguesa");
  const menu = document.getElementById("nav-links");

  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menu.classList.remove("active");
    menuButton.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    document.body.style.overflow = "";
  };

  if (menuButton && menu) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "nav-links");
    menuButton.addEventListener("click", () => {
      const isOpen = !menu.classList.contains("active");
      menu.classList.toggle("active", isOpen);
      menuButton.classList.toggle("is-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  }

  document.addEventListener("click", (event) => {
    const placeholder = event.target.closest("[data-placeholder-link]");
    if (placeholder) event.preventDefault();
  });

  // Aplica la misma regla a enlaces escritos directamente en los HTML.
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!isRealUrl(href)) return;

    if (shouldOpenNewTab(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    } else {
      link.removeAttribute("target");
      // Conservamos rel si tuviera otros usos; solo no necesitamos forzar nueva pestaña.
    }
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const dialog = document.getElementById("lightbox");
  if (dialog) {
    const dialogImage = dialog.querySelector("img");
    const closeButton = dialog.querySelector(".lightbox-close");
    document.querySelectorAll(".clickable").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const source = trigger.dataset.full || trigger.currentSrc || trigger.src || trigger.querySelector("img")?.src;
        if (!source || !dialogImage) return;
        dialogImage.src = source;
        dialog.showModal();
      });
    });
    closeButton?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  }

  document.querySelectorAll("main.comunidad > .tarjeta, section.comunidad > .tarjeta").forEach((card) => {
    const handler = card.getAttribute("onclick") || "";
    const match = handler.match(/toggleSubseccion\(['\"](.+?)['\"]\)/);
    if (!match) return;
    const target = document.getElementById(match[1]);
    card.removeAttribute("onclick");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-expanded", "false");
    if (target) card.setAttribute("aria-controls", target.id);
    const toggle = () => {
      if (!target) return;
      const willOpen = target.style.display === "none" || getComputedStyle(target).display === "none";
      target.style.display = willOpen ? "block" : "none";
      card.classList.toggle("is-expanded", willOpen);
      card.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30);
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
    });
  });

  document.querySelectorAll(".carrusel-container").forEach((container) => {
    const slides = [...container.querySelectorAll(".slide")];
    if (slides.length < 2) return;
    const nextButton = container.querySelector(".next");
    const previousButton = container.querySelector(".prev");
    let dots = container.querySelector(".dots");
    let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
    if (!dots) { dots = document.createElement("div"); dots.className = "dots"; container.appendChild(dots); }
    dots.innerHTML = "";
    const dotButtons = slides.map((_, index) => {
      const dot = document.createElement("span");
      dot.setAttribute("role", "button");
      dot.setAttribute("tabindex", "0");
      dot.setAttribute("aria-label", `Ir a imagen ${index + 1}`);
      dot.addEventListener("click", () => show(index));
      dot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); show(index); }
      });
      dots.appendChild(dot);
      return dot;
    });
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      dotButtons.forEach((dot, i) => dot.classList.toggle("active", i === current));
    }
    nextButton?.addEventListener("click", () => show(current + 1));
    previousButton?.addEventListener("click", () => show(current - 1));
    show(current);
  });

  const dataSources = {
    courses: "/data/courses.json",
    resources: "/data/resources.json",
    events: "/data/events.json",
    opportunities: "/data/opportunities.json",
    faculty: "/data/faculty.json",
    alumni: "/data/alumni.json"
  };

  const loadJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
    return response.json();
  };

  Promise.allSettled(Object.entries(dataSources).map(async ([key, url]) => [key, await loadJson(url)]))
    .then((results) => {
      const data = {};
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const [key, value] = result.value;
          data[key] = value;
        }
      });

      if (data.courses) { renderCourses(data.courses); renderAcademic(data.courses); renderApplicants(data.courses); }
      if (data.resources) renderResources(data.resources);
      if (data.events) renderEvents(data.events);
      if (data.opportunities) renderOpportunities(data.opportunities);
      if (data.faculty) renderFaculty(data.faculty);
      if (data.alumni) renderAlumni(data.alumni);
      setupSiteSearch(data);

      const missing = Object.keys(dataSources).filter((key) => !data[key]);
      if (missing.length) console.warn("No se pudieron cargar algunos datos del sitio:", missing.join(", "));
    });

  function flattenCourses(courseData) {
    return (courseData?.cycles || []).flatMap((cycle) => cycle.courses.map((course) => ({ ...course, cycle: cycle.cycle })));
  }

  function renderCourses(courseData) {
    const allCourses = flattenCourses(courseData);
    const notice = $("[data-courses-notice]");
    if (notice && courseData?.notice) notice.textContent = courseData.notice;

    const preview = $("[data-curriculum-preview]");
    if (preview) {
      preview.innerHTML = (courseData?.cycles || []).slice(0, 5).map((cycle) => `
        <article class="preview-cycle">
          <h3>Ciclo ${escapeHtml(cycle.cycle)}</h3>
          <ul>
            ${cycle.courses.slice(0, 3).map((course) => `<li>${escapeHtml(course.name)}</li>`).join("")}
          </ul>
        </article>
      `).join("");
    }

    const grid = $("[data-curriculum-grid]");
    const detail = $("[data-course-detail]");
    const detailBackdrop = $("[data-course-detail-backdrop]");
    if (!grid || !detail || !detailBackdrop) return;

    grid.innerHTML = (courseData?.cycles || []).map((cycle) => `
      <section class="cycle-column">
        <h3>Ciclo ${escapeHtml(cycle.cycle)}</h3>
        <div class="cycle-course-list">
          ${cycle.courses.map((course) => `
            <button class="course-button" type="button" data-course-id="${escapeHtml(course.id)}" aria-pressed="false">
              <strong>${escapeHtml(course.name)}</strong>
              <span>${escapeHtml(course.code)} · ${escapeHtml(course.credits)} créditos · ${escapeHtml(course.type)}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `).join("");

    let lastCourseButton = null;

    const closeCourseDetail = () => {
      detail.classList.remove("is-open");
      detail.setAttribute("aria-hidden", "true");
      document.body.classList.remove("course-detail-open");
      grid.querySelectorAll(".course-button").forEach((button) => {
        button.classList.remove("is-active");
        button.setAttribute("aria-pressed", "false");
      });
      window.setTimeout(() => {
        detail.hidden = true;
        detailBackdrop.hidden = true;
        detail.innerHTML = "";
      }, 280);
      lastCourseButton?.focus({ preventScroll: true });
    };

    const showCourse = (courseId, triggerButton) => {
      const course = allCourses.find((item) => item.id === courseId);
      if (!course) return;
      lastCourseButton = triggerButton || grid.querySelector(`[data-course-id="${CSS.escape(course.id)}"]`);
      grid.querySelectorAll(".course-button").forEach((button) => {
        const active = button.dataset.courseId === course.id;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      const displayValue = (value, fallback = "Según elección") =>
        value === null || value === undefined || value === "" ? fallback : value;

      const optionsMarkup = (course.options || []).length ? `
        <h4>Opciones disponibles</h4>
        <ul class="bibliography-list">
          ${course.options.map((option) => `
            <li>
              <strong>${escapeHtml(option.code ? `${option.code} · ${option.name}` : option.name)}</strong>
              · ${escapeHtml(option.credits)} créditos
              · HT ${escapeHtml(displayValue(option.theoryHours))}
              · HP ${escapeHtml(displayValue(option.practiceHours))}
              · Prerrequisitos: ${escapeHtml((option.prerequisites || []).join(", ") || "Ninguno")}
            </li>
          `).join("")}
        </ul>
      ` : "";

      const bibliographyMarkup = (course.bibliography || []).length ? `
        <h4>Bibliografía sugerida</h4>
        <ul class="bibliography-list">${course.bibliography.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      ` : "";

      const curriculumUrl = courseData?.curriculumUrl || "docs/curriculo/curriculo-fisica-2018.pdf";

      detail.innerHTML = `
        <button class="course-detail-close" type="button" data-course-detail-close aria-label="Cerrar detalle del curso">×</button>
        <p class="eyebrow dark"><span></span> ${escapeHtml(course.code)} · Ciclo ${escapeHtml(course.cycle)}</p>
        <h3>${escapeHtml(course.name)}</h3>
        <p>${escapeHtml(course.description)}</p>
        <div class="course-meta">
          <div><span>Créditos</span><strong>${escapeHtml(course.credits)}</strong></div>
          <div><span>Tipo</span><strong>${escapeHtml(course.type)}</strong></div>
          <div><span>Horas teóricas</span><strong>${escapeHtml(displayValue(course.theoryHours))}</strong></div>
          <div><span>Horas prácticas</span><strong>${escapeHtml(displayValue(course.practiceHours))}</strong></div>
          <div><span>Horas por semana</span><strong>${escapeHtml(displayValue(course.weeklyHours))}</strong></div>
          <div><span>Departamento</span><strong>${escapeHtml(course.department || "Por confirmar")}</strong></div>
          <div><span>Prerrequisitos</span><strong>${escapeHtml((course.prerequisites || []).join(", ") || "Ninguno")}</strong></div>
          <div><span>Fuente</span><strong>${escapeHtml(course.status || "Currículo 2018")}</strong></div>
        </div>
        ${optionsMarkup}
        ${bibliographyMarkup}
        <div class="course-actions">
          <a class="button button-primary" href="${safeHref(curriculumUrl)}" target="_blank" rel="noopener">Ver currículo 2018 <span aria-hidden="true">↗</span></a>
          <a class="button button-secondary" href="/biblioteca/">Ir a Biblioteca <span aria-hidden="true">↗</span></a>
        </div>
      `;

      detail.hidden = false;
      detailBackdrop.hidden = false;
      detail.setAttribute("aria-hidden", "false");
      document.body.classList.add("course-detail-open");
      requestAnimationFrame(() => {
        detail.classList.add("is-open");
        detail.scrollTop = 0;
        detail.querySelector("[data-course-detail-close]")?.focus({ preventScroll: true });
      });
    };

    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-course-id]");
      if (button) showCourse(button.dataset.courseId, button);
    });

    detail.addEventListener("click", (event) => {
      if (event.target.closest("[data-course-detail-close]")) closeCourseDetail();
    });
    detailBackdrop.addEventListener("click", closeCourseDetail);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !detail.hidden) closeCourseDetail();
    });
  }

  function renderAcademic(courseData) {
    const allCourses = flattenCourses(courseData);
    renderSyllabi(courseData, allCourses);
    renderSchedule(courseData);
    renderCalendar(courseData);
    renderLinkCards("[data-thesis-list]", courseData?.thesis || []);
    renderLinkCards("[data-practice-list]", courseData?.practices || []);
    renderProcedures(courseData?.procedures || []);
  }

  async function renderSyllabi(courseData, allCourses) {
    const list = $("[data-syllabus-list]");
    const cycleSelect = $("[data-syllabus-cycle]");
    const searchInput = $("[data-syllabus-search]");
    if (!list || !cycleSelect) return;

    let approvedSyllabi = [];
    if (window.CEFUNT_SUPABASE_CONFIGURED && window.CEFUNT_SUPABASE) {
      const { data, error } = await window.CEFUNT_SUPABASE
        .from("syllabi")
        .select("course_id,elective_name,year,semester,public_url,status")
        .eq("status", "approved")
        .order("year", { ascending: false });
      if (!error) approvedSyllabi = data || [];
      else console.warn("No se pudieron cargar los sílabos aprobados:", error.message);
    }

    const isElectiveBlock = (course) => /electiv/i.test(`${course?.type || ""} ${course?.name || ""}`);
    const publicCourseMap = new Map();

    allCourses.forEach((course) => {
      if (!isElectiveBlock(course)) {
        const key = `regular:${course.id}`;
        publicCourseMap.set(key, {
          ...course,
          cycles: [course.cycle],
          sourceCourseIds: [course.id],
          electiveName: null,
          submissionCourseId: course.id
        });
        return;
      }

      (course.options || []).forEach((option) => {
        if (!option?.name) return;
        const key = `option:${normalize(option.name)}`;
        const existing = publicCourseMap.get(key);
        if (existing) {
          if (!existing.cycles.includes(course.cycle)) existing.cycles.push(course.cycle);
          if (!existing.sourceCourseIds.includes(course.id)) existing.sourceCourseIds.push(course.id);
          return;
        }

        publicCourseMap.set(key, {
          id: key,
          code: option.code || course.code || "",
          name: option.name,
          type: "",
          description: option.description || "",
          cycle: course.cycle,
          cycles: [course.cycle],
          sourceCourseIds: [course.id],
          electiveName: option.name,
          submissionCourseId: course.id,
          syllabusUrl: ""
        });
      });
    });

    const publicCourses = Array.from(publicCourseMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );

    cycleSelect.innerHTML = '<option value="all">Todos</option>' + (courseData?.cycles || []).map((cycle) => `<option value="${escapeHtml(cycle.cycle)}">Ciclo ${escapeHtml(cycle.cycle)}</option>`).join("");

    const update = () => {
      const term = normalize(searchInput?.value || "");
      const selectedCycle = cycleSelect.value;
      const filtered = publicCourses.filter((course) => {
        const matchesCycle = selectedCycle === "all" || course.cycles.includes(selectedCycle);
        const searchable = normalize(`${course.name} ${course.code} ${course.description}`);
        return matchesCycle && (!term || searchable.includes(term));
      });

      list.innerHTML = filtered.map((course) => {
        const dynamicDocs = approvedSyllabi.filter((item) => {
          if (!item.public_url || !course.sourceCourseIds.includes(item.course_id)) return false;
          if (!course.electiveName) return !item.elective_name;
          return normalize(item.elective_name || "") === normalize(course.electiveName);
        });
        const legacyDoc = !course.electiveName && course.syllabusUrl ? [{ year: "", semester: "", public_url: course.syllabusUrl }] : [];
        const docs = dynamicDocs.length ? dynamicDocs : legacyDoc;

        const documentsMarkup = docs.length ? `
          <div class="syllabus-documents">
            ${docs.map((doc) => `
              <div class="syllabus-document-row">
                <span>
                  <strong>${doc.year ? `${escapeHtml(doc.year)}-${escapeHtml(doc.semester)}` : "Sílabo"}</strong><small>✓ Verificado</small>
                </span>
                <span class="syllabus-document-actions">
                  <a class="mini-button" href="${safeHref(doc.public_url)}" target="_blank" rel="noopener noreferrer">Ver</a>
                  <a class="mini-button" href="${safeHref(doc.public_url)}" target="_blank" rel="noopener noreferrer" download>Descargar</a>
                </span>
              </div>`).join("")}
          </div>` : `
          <p class="syllabus-empty">Sílabo aún no disponible.</p>
          <div class="card-actions"><a class="mini-button" href="/enviar-silabo/?course=${encodeURIComponent(course.submissionCourseId)}${course.electiveName ? `&elective=${encodeURIComponent(course.electiveName)}` : ""}">Aportar este sílabo</a></div>`;

        const cycleLabel = course.cycles.length === 1
          ? `Ciclo ${escapeHtml(course.cycles[0])}`
          : `Ciclos ${course.cycles.map(escapeHtml).join(" · ")}`;
        const codeLabel = course.code ? ` · ${escapeHtml(course.code)}` : "";

        return `
          <article class="syllabus-card">
            <span class="card-kicker">${cycleLabel}${codeLabel}</span>
            <h3>${escapeHtml(course.name)}</h3>
            ${documentsMarkup}
          </article>`;
      }).join("") || '<p class="data-note">No hay cursos que coincidan con la búsqueda.</p>';
    };

    cycleSelect.addEventListener("change", update);
    searchInput?.addEventListener("input", update);
    update();
  }

  function renderSchedule(courseData) {
    const holder = $("[data-schedule-list]");
    const select = $("[data-schedule-cycle]");
    if (!holder || !select) return;
    const cycles = [...new Set((courseData?.schedule || []).map((item) => item.cycle))];
    select.innerHTML = '<option value="all">Todos</option>' + cycles.map((cycle) => `<option value="${escapeHtml(cycle)}">Ciclo ${escapeHtml(cycle)}</option>`).join("");
    const update = () => {
      const showingAll = select.value === "all";
      const rows = (courseData?.schedule || []).filter((item) => showingAll || item.cycle === select.value);

      // En la vista "Todos" limitamos la altura para evitar que 60+ filas
      // empujen el resto del hub demasiado hacia abajo.
      holder.classList.toggle("is-all", showingAll);

      holder.innerHTML = `
        <table>
          <thead><tr><th>Curso</th><th>Docente</th><th>Día</th><th>Hora</th><th>Aula/lab.</th><th>Estado</th></tr></thead>
          <tbody>
            ${rows.map((item) => `
              <tr>
                <td>${escapeHtml(item.course)}</td>
                <td>${escapeHtml(item.teacher)}</td>
                <td>${escapeHtml(item.day)}</td>
                <td>${escapeHtml(item.time)}</td>
                <td>${escapeHtml(item.room)}</td>
                <td>${escapeHtml(item.status)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    };
    select.addEventListener("change", update);
    update();
  }

  function renderCalendar(courseData) {
    const list = $("[data-calendar-list]");
    if (!list) return;
    list.innerHTML = (courseData?.academicCalendar || []).map((item) => `
      <article class="timeline-card">
        <time>${escapeHtml(item.date)}</time>
        <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>
        <span class="status-chip">${escapeHtml(item.status)}</span>
      </article>
    `).join("");
  }

  function renderLinkCards(selector, items) {
    const holder = $(selector);
    if (!holder) return;
    holder.innerHTML = items.map((item) => {
      const resources = Array.isArray(item.resources) ? item.resources : [];
      const actions = resources.length
        ? resources.map((resource) => `
            <a class="mini-button" href="${safeHref(resource.url)}"${linkTargetAttrs(resource.url)}${placeholderAttrs(resource.url)}>
              ${escapeHtml(resource.label || "Abrir recurso")}
            </a>
          `).join("")
        : `
            <a class="mini-button" href="${safeHref(item.url)}"${linkTargetAttrs(item.url)}${placeholderAttrs(item.url)}>
              ${escapeHtml(item.actionLabel || "Abrir documento")}
            </a>
          `;

      return `
        <article class="resource-link-card">
          <span class="card-kicker">${escapeHtml(item.status || "Por confirmar")}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          <div class="card-actions">
            ${actions}
          </div>
        </article>
      `;
    }).join("");
  }

  function renderProcedures(items) {
    const holder = $("[data-procedures-list]");
    if (!holder) return;
    holder.innerHTML = items.map((item) => `
      <article class="procedure-card">
        <span class="card-kicker">${escapeHtml(item.status || "Información")}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        ${item.url ? `
          <div class="card-actions">
            <a class="mini-button" href="${safeHref(item.url)}"${linkTargetAttrs(item.url)}>
              ${escapeHtml(item.actionLabel || "Abrir")}
            </a>
          </div>
        ` : `
          <div class="card-actions">
            <span class="mini-button is-disabled" aria-disabled="true">No disponible</span>
          </div>
        `}
      </article>
    `).join("");
  }

  function renderResources(resourceData) {
    const notice = $("[data-resources-notice]");
    if (notice && resourceData?.notice) notice.textContent = resourceData.notice;

    const preview = $("[data-resource-preview]");
    if (preview) {
      preview.innerHTML = (resourceData?.categories || []).slice(0, 4).map((category) => `
        <article class="resource-mini-card">
          <span class="card-kicker">${escapeHtml(category.items?.[0]?.type || "Recursos")}</span>
          <h3>${escapeHtml(category.name)}</h3>
          <p>${escapeHtml(category.summary)}</p>
        </article>
      `).join("");
    }

    const list = $("[data-resource-list]");
    const search = $("[data-resource-search]");
    const typeSelect = $("[data-resource-type]");
    if (!list || !typeSelect) return;

    const types = [...new Set((resourceData?.categories || []).flatMap((category) => category.items.map((item) => item.type)))].sort();
    typeSelect.innerHTML = '<option value="all">Todos</option>' + types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");

    const update = () => {
      const term = normalize(search?.value || "");
      const selectedType = typeSelect.value;
      const categories = (resourceData?.categories || []).map((category) => {
        const items = category.items.filter((item) => {
          const matchesType = selectedType === "all" || item.type === selectedType;
          const searchable = normalize(`${category.name} ${category.summary} ${item.title} ${item.type} ${item.description}`);
          return matchesType && (!term || searchable.includes(term));
        });
        return { ...category, items };
      }).filter((category) => category.items.length);

      list.innerHTML = categories.map((category) => `
        <article class="resource-category-card">
          <h3>${escapeHtml(category.name)}</h3>
          <p>${escapeHtml(category.summary)}</p>
          <div class="resource-items">
            ${category.items.map((item) => `
              <div class="resource-item">
                <span class="card-kicker">${escapeHtml(item.type)} · ${escapeHtml(item.status)}</span>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.description)}</p>
                <a href="${safeHref(item.url)}"${linkTargetAttrs(item.url)}${placeholderAttrs(item.url)}>Abrir recurso <span aria-hidden="true">↗</span></a>
              </div>
            `).join("")}
          </div>
        </article>
      `).join("") || '<p class="data-note invert">No hay recursos que coincidan con la búsqueda.</p>';
    };

    typeSelect.addEventListener("change", update);
    search?.addEventListener("input", update);
    update();
  }

  function renderEvents(eventData) {
    const notice = $("[data-events-notice]");
    if (notice && eventData?.notice) notice.textContent = eventData.notice;

    const preview = $("[data-event-preview]");
    const publishedEvents = (eventData?.events || []).filter(isPublished);
    if (preview) {
      preview.innerHTML = publishedEvents.slice(0, 3).map((event) => miniEventMarkup(event)).join("") ||
        '<div class="empty-state compact"><strong>Sin eventos publicados</strong><p>La próxima actividad aparecerá aquí cuando esté confirmada.</p></div>';
    }

    const filters = $("[data-event-filters]");
    const lists = $$("[data-event-list]");
    if (!filters || !lists.length) return;
    const categories = ["Todas", ...new Set(publishedEvents.map((event) => event.category))];
    let active = "Todas";
    const drawFilters = () => {
      filters.innerHTML = categories.map((category) => `<button class="filter-pill${category === active ? " is-active" : ""}" type="button" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("");
    };
    const drawLists = () => {
      lists.forEach((list) => {
        const status = list.dataset.eventList;
        const events = publishedEvents.filter((event) => event.status === status && (active === "Todas" || event.category === active));
        list.innerHTML = events.map((event) => eventMarkup(event)).join("") || '<div class="empty-state"><strong>Sin eventos por ahora</strong><p>Publicaremos aquí las actividades cuando estén confirmadas.</p></div>';
      });
    };
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      active = button.dataset.filter;
      drawFilters();
      drawLists();
    });
    drawFilters();
    drawLists();
  }

  function miniEventMarkup(event) {
    return `
      <article class="mini-event-card">
        <span class="card-kicker">${escapeHtml(event.category)} · ${escapeHtml(event.date)}</span>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
      </article>
    `;
  }

  function eventMarkup(event) {
    return `
      <article class="event-card">
        <img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}" loading="lazy">
        <div>
          <div class="event-meta"><span>${escapeHtml(event.category)}</span><span>${escapeHtml(event.date)}</span><span>${escapeHtml(event.time)}</span></div>
          <h4>${escapeHtml(event.title)}</h4>
          <p>${escapeHtml(event.description)}</p>
          <p><strong>Lugar:</strong> ${escapeHtml(event.place)} · <strong>Ponente:</strong> ${escapeHtml(event.speaker)}</p>
          <p><strong>Organiza:</strong> ${escapeHtml(event.organizer)}</p>
          ${isRealUrl(event.url) ? `<div class="card-actions"><a class="mini-button" href="${safeHref(event.url)}"${linkTargetAttrs(event.url)}>Ver evento</a></div>` : ""}
        </div>
      </article>
    `;
  }

  function renderOpportunities(opportunityData) {
    const notice = $("[data-opportunities-notice]");
    if (notice && opportunityData?.notice) notice.textContent = opportunityData.notice;

    const preview = $("[data-opportunity-preview]");
    const publishedOpportunities = (opportunityData?.opportunities || []).filter(isPublished);
    if (preview) {
      preview.innerHTML = publishedOpportunities.slice(0, 3).map((item) => opportunityMarkup(item)).join("") ||
        '<div class="empty-state compact"><strong>Sin convocatorias vigentes</strong><p>Publicaremos oportunidades aquí cuando estén verificadas.</p></div>';
    }

    const filters = $("[data-opportunity-filters]");
    const list = $("[data-opportunity-list]");
    if (!filters || !list) return;
    const defaultFilters = ["Todas", "Becas", "Prácticas", "Congresos", "Investigación", "Internacional"];
    let active = "Todas";
    const drawFilters = () => {
      filters.innerHTML = defaultFilters.map((filter) => `<button class="filter-pill${filter === active ? " is-active" : ""}" type="button" data-filter="${escapeHtml(filter)}">${escapeHtml(filter)}</button>`).join("");
    };
    const drawList = () => {
      const items = publishedOpportunities.filter((item) => active === "Todas" || item.type === active);
      list.innerHTML = items.map((item) => opportunityMarkup(item)).join("") || '<div class="empty-state"><strong>Sin convocatorias vigentes</strong><p>Cuando haya una oportunidad verificada aparecerá en esta sección.</p></div>';
    };
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      active = button.dataset.filter;
      drawFilters();
      drawList();
    });
    drawFilters();
    drawList();
  }

  function opportunityMarkup(item) {
    return `
      <article class="opportunity-card">
        <span class="card-kicker">${escapeHtml(item.type)} · ${escapeHtml(item.status)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <dl>
          <dt>Organización</dt><dd>${escapeHtml(item.organization)}</dd>
          <dt>Fecha límite</dt><dd>${escapeHtml(item.deadline)}</dd>
          <dt>Modalidad</dt><dd>${escapeHtml(item.modality)}</dd>
          <dt>País</dt><dd>${escapeHtml(item.country)}</dd>
        </dl>
        <div class="card-actions"><a class="mini-button" href="${safeHref(item.url)}"${linkTargetAttrs(item.url)}${placeholderAttrs(item.url)}>Abrir enlace</a></div>
      </article>
    `;
  }

  function renderFaculty(facultyData) {
    const notice = $("[data-faculty-notice]");
    if (notice && facultyData?.notice) notice.textContent = facultyData.notice;

    const areaHolder = $("[data-research-areas]");
    if (areaHolder) areaHolder.innerHTML = (facultyData?.researchAreas || []).map((area) => `<span>${escapeHtml(area)}</span>`).join("");

    const list = $("[data-faculty-list]");
    if (list) list.innerHTML = (facultyData?.faculty || []).map((person) => facultyMarkup(person)).join("");

    const preview = $("[data-faculty-preview]");
    if (preview) preview.innerHTML = (facultyData?.faculty || []).slice(0, 3).map((person) => facultyMarkup(person)).join("");
  }

  function facultyMarkup(person) {
    return `
      <article class="faculty-card">
        <img class="faculty-photo" src="${escapeHtml(person.photo)}" alt="" loading="lazy">
        <div>
          <span class="card-kicker">${escapeHtml(person.area)} · ${escapeHtml(person.status)}</span>
          <h3>${escapeHtml(person.name)}</h3>
          <p>${escapeHtml(person.degree)}</p>
          <p><strong>Línea:</strong> ${escapeHtml(person.researchLine)}</p>
        </div>
        <ul>${(person.courses || []).map((course) => `<li>${escapeHtml(course)}</li>`).join("")}</ul>
        <div class="faculty-links">
          <a href="mailto:${escapeHtml(person.email)}">Correo</a>
          <a href="${safeHref(person.orcid)}"${linkTargetAttrs(person.orcid)}${placeholderAttrs(person.orcid)}>ORCID</a>
          <a href="${safeHref(person.scholar)}"${linkTargetAttrs(person.scholar)}${placeholderAttrs(person.scholar)}>Scholar</a>
        </div>
      </article>
    `;
  }

  function renderApplicants(courseData) {
    const faq = $("[data-applicant-faq]");
    if (!faq) return;
    faq.innerHTML = (courseData?.applicantFaq || []).map((item) => `
      <article class="faq-item">
        <h3>${escapeHtml(item.question)}</h3>
        <p>${escapeHtml(item.answer)}</p>
      </article>
    `).join("");
  }

  function renderAlumni(alumniData) {
    const notice = $("[data-alumni-notice]");
    if (notice && alumniData?.notice) notice.textContent = alumniData.notice;
    const categories = $("[data-alumni-categories]");
    if (categories) categories.innerHTML = (alumniData?.categories || []).map((category) => `<span>${escapeHtml(category)}</span>`).join("");
    const list = $("[data-alumni-list]");
    if (!list) return;
    const publishedAlumni = (alumniData?.alumni || []).filter(isPublished);
    list.innerHTML = publishedAlumni.map((item) => `
      <article class="alumni-card">
        <span class="card-kicker">${escapeHtml(item.area)} · ${escapeHtml(item.status)}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p><strong>${escapeHtml(item.classYear)}</strong></p>
        <p>${escapeHtml(item.role)} · ${escapeHtml(item.organization)}</p>
        <blockquote>${escapeHtml(item.quote)}</blockquote>
      </article>
    `).join("") || '<div class="empty-state"><strong>Perfiles próximamente</strong><p>Esta sección crecerá con historias reales de egresados de Física UNT.</p></div>';
  }

  function setupSiteSearch(data) {
    const input = $("[data-site-search]");
    const results = $("[data-search-results]");
    const form = $("[data-site-search-form]");
    if (!input || !results) return;

    const courses = flattenCourses(data.courses).map((course) => ({
      type: "Curso",
      title: `${course.name} (${course.code})`,
      description: `Ciclo ${course.cycle}. ${course.description}`,
      url: `/carrera/#malla`,
      text: `${course.name} ${course.code} ${course.description} ${course.type} ${course.prerequisites?.join(" ")}`
    }));
    const resources = (data.resources?.categories || []).flatMap((category) => category.items.map((item) => ({
      type: `Biblioteca · ${category.name}`,
      title: item.title,
      description: item.description,
      url: isRealUrl(item.url) ? item.url : "/biblioteca/",
      text: `${category.name} ${category.summary} ${item.title} ${item.type} ${item.description}`
    })));
    const events = (data.events?.events || []).filter(isPublished).map((event) => ({
      type: `Evento · ${event.category}`,
      title: event.title,
      description: event.description,
      url: "/eventos/",
      text: `${event.title} ${event.category} ${event.description} ${event.place} ${event.speaker}`
    }));
    const opportunities = (data.opportunities?.opportunities || []).filter(isPublished).map((item) => ({
      type: `Oportunidad · ${item.type}`,
      title: item.title,
      description: item.description,
      url: "/oportunidades/",
      text: `${item.title} ${item.organization} ${item.type} ${item.description} ${item.country}`
    }));
    const faculty = (data.faculty?.faculty || []).map((person) => ({
      type: `Docente · ${person.area}`,
      title: person.name,
      description: `${person.degree}. ${person.researchLine}`,
      url: "/carrera/#investigacion",
      text: `${person.name} ${person.area} ${person.researchLine} ${person.courses?.join(" ")}`
    }));
    const alumni = (data.alumni?.alumni || []).filter(isPublished).map((person) => ({
      type: `Egresados · ${person.area}`,
      title: person.name,
      description: `${person.role}. ${person.quote}`,
      url: "/egresados/",
      text: `${person.name} ${person.area} ${person.role} ${person.organization} ${person.quote}`
    }));
    const index = [...courses, ...resources, ...events, ...opportunities, ...faculty, ...alumni];

    const render = () => {
      const term = normalize(input.value.trim());
      if (term.length < 2) {
        results.innerHTML = '<p class="data-note invert">Escribe al menos dos caracteres para buscar en el hub.</p>';
        return;
      }
      const matches = index.filter((item) => normalize(`${item.title} ${item.description} ${item.text}`).includes(term)).slice(0, 8);
      results.innerHTML = matches.map((item) => `
        <a class="search-result" href="${safeHref(item.url)}"${linkTargetAttrs(item.url)}>
          <div>
            <span>${escapeHtml(item.type)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </div>
          <i aria-hidden="true">↗</i>
        </a>
      `).join("") || '<p class="data-note invert">No encontré resultados con esa búsqueda.</p>';
    };

    form?.addEventListener("submit", (event) => event.preventDefault());
    input.addEventListener("input", render);
    render();
  }
});
