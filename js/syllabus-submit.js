document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("[data-syllabus-submit-form]");
  if (!form) return;

  const courseSelect = form.querySelector("[data-course-select]");
  const yearSelect = form.querySelector("[data-year-select]");
  const fileInput = form.querySelector('input[name="file"]');
  const submitButton = form.querySelector("[data-submit-button]");
  const message = form.querySelector("[data-form-message]");
  let submissionCourses = [];

  const normalize = (value = "") => value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const escapeHtml = (value = "") => value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const isElectiveBlock = (course) => /electiv/i.test(`${course?.type || ""} ${course?.name || ""}`);

  const setMessage = (text, type = "") => {
    message.textContent = text;
    message.className = `form-message form-field-full ${type ? `is-${type}` : ""}`;
  };

  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = Array.from({ length: 12 }, (_, index) => currentYear - index)
    .map((year) => `<option value="${year}">${year}</option>`).join("");

  try {
    const response = await fetch("/data/courses.json");
    const data = await response.json();
    const rawCourses = (data.cycles || []).flatMap((cycle) =>
      (cycle.courses || []).map((course) => ({ ...course, cycle: cycle.cycle }))
    );

    const courseMap = new Map();

    rawCourses.forEach((course) => {
      if (!isElectiveBlock(course)) {
        const key = `regular:${course.id}`;
        courseMap.set(key, {
          key,
          id: course.id,
          courseId: course.id,
          courseCode: course.code || "",
          courseName: course.name,
          cycle: course.cycle,
          cycles: [course.cycle],
          electiveName: null
        });
        return;
      }

      (course.options || []).forEach((option) => {
        if (!option?.name) return;
        const normalizedName = normalize(option.name);
        const key = `course:${normalizedName}`;
        const existing = courseMap.get(key);

        if (existing) {
          if (!existing.cycles.includes(course.cycle)) existing.cycles.push(course.cycle);
          existing.sources.push({
            courseId: course.id,
            courseCode: course.code || "",
            cycle: course.cycle
          });
          return;
        }

        courseMap.set(key, {
          key,
          id: key,
          courseId: course.id,
          courseCode: option.code || course.code || "",
          courseName: option.name,
          cycle: course.cycle,
          cycles: [course.cycle],
          electiveName: option.name,
          sources: [{ courseId: course.id, courseCode: course.code || "", cycle: course.cycle }]
        });
      });
    });

    submissionCourses = Array.from(courseMap.values()).sort((a, b) =>
      a.courseName.localeCompare(b.courseName, "es", { sensitivity: "base" })
    );

    courseSelect.innerHTML = '<option value="">Selecciona un curso</option>' + submissionCourses.map((course) => {
      const cycleLabel = course.cycles.length === 1 ? `Ciclo ${course.cycles[0]}` : `Ciclos ${course.cycles.join(" · ")}`;
      const codeLabel = course.courseCode ? ` · ${course.courseCode}` : "";
      return `<option value="${escapeHtml(course.key)}">${escapeHtml(cycleLabel)}${escapeHtml(codeLabel)} · ${escapeHtml(course.courseName)}</option>`;
    }).join("");

    // Compatibilidad con los enlaces "Aportar este sílabo" de la sección pública.
    // Los parámetros siguen usando la clasificación interna, pero nunca se muestran al usuario.
    const params = new URLSearchParams(window.location.search);
    const requestedCourse = params.get("course");
    const requestedCourseName = params.get("elective");

    if (requestedCourseName) {
      const match = submissionCourses.find((course) =>
        normalize(course.courseName) === normalize(requestedCourseName)
      );
      if (match) courseSelect.value = match.key;
    } else if (requestedCourse) {
      const match = submissionCourses.find((course) =>
        course.courseId === requestedCourse && !course.electiveName
      );
      if (match) courseSelect.value = match.key;
    }
  } catch (error) {
    console.error(error);
    courseSelect.innerHTML = '<option value="">No se pudieron cargar los cursos</option>';
    setMessage("No pudimos cargar la lista de cursos. Intenta recargar la página.", "error");
  }

  const withTimeout = async (promise, milliseconds, label) => {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} tardó demasiado. Comprueba tu conexión e inténtalo nuevamente.`));
      }, milliseconds);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("");

    if (!window.CEFUNT_SUPABASE_CONFIGURED || !window.CEFUNT_SUPABASE) {
      setMessage("El formulario todavía no está conectado a Supabase. Revisa js/supabase-config.js.", "error");
      return;
    }

    if (!form.reportValidity()) return;
    const selectedCourse = submissionCourses.find((course) => course.key === courseSelect.value);
    const file = fileInput.files?.[0];
    if (!selectedCourse || !file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setMessage("El archivo debe ser un PDF.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("El PDF supera el límite de 10 MB.", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Enviando…";

    const client = window.CEFUNT_SUPABASE;
    const id = crypto.randomUUID();
    const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
    const filePath = `${id}/${safeName}`;
    const payload = {
      id,
      course_id: selectedCourse.courseId,
      course_code: selectedCourse.courseCode,
      course_name: selectedCourse.electiveName ? selectedCourse.courseName : selectedCourse.courseName,
      cycle: selectedCourse.cycle,
      elective_name: selectedCourse.electiveName,
      year: Number(form.elements.year.value),
      semester: form.elements.semester.value,
      original_filename: file.name,
      submission_path: filePath,
      contact_email: form.elements.contact_email.value.trim() || null,
      status: "pending"
    };

    try {
      setMessage("Subiendo el PDF…");
      const uploadResult = await withTimeout(
        client.storage.from("syllabus-submissions").upload(filePath, file, {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: false
        }),
        30000,
        "La subida del PDF"
      );
      if (uploadResult.error) throw uploadResult.error;

      setMessage("PDF recibido. Registrando el sílabo…");
      const insertResult = await withTimeout(
        client.from("syllabi").insert(payload),
        15000,
        "El registro del sílabo"
      );

      if (insertResult.error) {
        try {
          await client.storage.from("syllabus-submissions").remove([filePath]);
        } catch (cleanupError) {
          console.warn("No se pudo limpiar el PDF después del error:", cleanupError);
        }
        throw insertResult.error;
      }

      form.reset();
      yearSelect.value = String(currentYear);
      setMessage("¡Listo! Recibimos el sílabo. Quedó pendiente de revisión y todavía no es público.", "success");
    } catch (error) {
      console.error("Error al enviar sílabo:", error);
      const detail = error?.message ? ` ${error.message}` : "";
      setMessage(`No se pudo enviar el sílabo.${detail}`, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Enviar para revisión <span aria-hidden="true">↗</span>';
    }
  });
});
