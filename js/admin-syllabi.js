document.addEventListener("DOMContentLoaded", async () => {
  const client = window.CEFUNT_SUPABASE;
  const loginSection = document.querySelector("[data-admin-login]");
  const dashboard = document.querySelector("[data-admin-dashboard]");
  const loginForm = document.querySelector("[data-admin-login-form]");
  const loginMessage = document.querySelector("[data-admin-login-message]");
  const list = document.querySelector("[data-admin-list]");
  const adminMessage = document.querySelector("[data-admin-message]");
  const adminEmail = document.querySelector("[data-admin-email]");
  let activeStatus = "pending";
  let rows = [];

  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
  const setMessage = (element, text, type = "") => {
    element.textContent = text;
    element.className = `form-message ${type ? `is-${type}` : ""}`;
  };

  if (!window.CEFUNT_SUPABASE_CONFIGURED || !client) {
    setMessage(loginMessage, "Este panel todavía no está conectado. Configura js/supabase-config.js.", "error");
    loginForm.querySelector("button").disabled = true;
    return;
  }

  async function verifyAdmin() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return showLogin();
    const { data, error } = await client.rpc("is_admin");
    if (error || !data) {
      await client.auth.signOut();
      setMessage(loginMessage, "La cuenta inició sesión, pero no está autorizada como administradora.", "error");
      return showLogin();
    }
    showDashboard(session.user.email);
    await loadRows();
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboard.hidden = true;
  }

  function showDashboard(email) {
    loginSection.hidden = true;
    dashboard.hidden = false;
    adminEmail.textContent = email || "Administración";
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(loginMessage, "Ingresando…");
    const { error } = await client.auth.signInWithPassword({
      email: loginForm.elements.email.value.trim(),
      password: loginForm.elements.password.value
    });
    if (error) {
      setMessage(loginMessage, "No se pudo iniciar sesión. Revisa el correo y la contraseña.", "error");
      return;
    }
    await verifyAdmin();
  });

  document.querySelector("[data-admin-logout]").addEventListener("click", async () => {
    await client.auth.signOut();
    showLogin();
  });
  document.querySelector("[data-admin-refresh]").addEventListener("click", loadRows);

  document.querySelectorAll("[data-status-filter]").forEach((button) => button.addEventListener("click", () => {
    activeStatus = button.dataset.statusFilter;
    document.querySelectorAll("[data-status-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
    renderRows();
  }));

  async function loadRows() {
    setMessage(adminMessage, "Cargando…");
    const { data, error } = await client.from("syllabi").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setMessage(adminMessage, "No se pudieron cargar los envíos.", "error");
      return;
    }
    rows = data || [];
    document.querySelector("[data-pending-count]").textContent = rows.filter((row) => row.status === "pending").length;
    document.querySelector("[data-approved-count]").textContent = rows.filter((row) => row.status === "approved").length;
    document.querySelector("[data-rejected-count]").textContent = rows.filter((row) => row.status === "rejected").length;
    setMessage(adminMessage, "");
    renderRows();
  }

  function renderRows() {
    const filtered = rows.filter((row) => row.status === activeStatus);
    list.innerHTML = filtered.map((row) => `
      <article class="admin-submission-card" data-row-id="${row.id}">
        <div class="admin-submission-head">
          <div><span class="card-kicker">Ciclo ${escapeHtml(row.cycle)} · ${escapeHtml(row.course_code)}</span><h2>${escapeHtml(row.course_name)}</h2></div>
          <span class="status-chip">${escapeHtml(row.status)}</span>
        </div>
        <div class="admin-meta">
          ${row.elective_name ? `<div><span>Electivo específico</span><strong>${escapeHtml(row.elective_name)}</strong></div>` : ""}
          <div><span>Periodo</span><strong>${escapeHtml(row.year)}-${escapeHtml(row.semester)}</strong></div>
          <div><span>Archivo</span><strong>${escapeHtml(row.original_filename)}</strong></div>
          <div><span>Recibido</span><strong>${new Date(row.created_at).toLocaleString("es-PE")}</strong></div>
          <div><span>Contacto</span><strong>${escapeHtml(row.contact_email || "No indicado")}</strong></div>
        </div>
        <div class="card-actions">
          ${row.submission_path && row.status === "pending" ? `<button class="mini-button" type="button" data-preview>Ver PDF</button>` : ""}
          ${row.public_url ? `<a class="mini-button" href="${escapeHtml(row.public_url)}" target="_blank" rel="noopener">Ver publicado</a>` : ""}
          ${row.status === "pending" ? '<button class="mini-button approve-button" type="button" data-approve>✓ Aprobar y publicar</button><button class="mini-button reject-button" type="button" data-reject>✕ Rechazar</button>' : ""}
        </div>
      </article>`).join("") || '<p class="data-note">No hay documentos en este estado.</p>';
  }

  list.addEventListener("click", async (event) => {
    const card = event.target.closest("[data-row-id]");
    if (!card) return;
    const row = rows.find((item) => item.id === card.dataset.rowId);
    if (!row) return;

    if (event.target.closest("[data-preview]")) await preview(row);
    if (event.target.closest("[data-approve]")) await approve(row, event.target.closest("[data-approve]"));
    if (event.target.closest("[data-reject]")) await reject(row, event.target.closest("[data-reject]"));
  });

  async function preview(row) {
    const { data, error } = await client.storage.from("syllabus-submissions").createSignedUrl(row.submission_path, 300);
    if (error) return setMessage(adminMessage, "No se pudo abrir el PDF.", "error");
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function approve(row, button) {
    button.disabled = true;
    button.textContent = "Publicando…";
    setMessage(adminMessage, "Aprobando y publicando el documento…");
    let publicPath = null;
    try {
      const { data: blob, error: downloadError } = await client.storage.from("syllabus-submissions").download(row.submission_path);
      if (downloadError) throw downloadError;

      publicPath = `${row.course_id}/${row.year}-${row.semester}/${row.id}.pdf`;
      const { error: uploadError } = await client.storage.from("syllabi-public").upload(publicPath, blob, { contentType: "application/pdf", upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicData } = client.storage.from("syllabi-public").getPublicUrl(publicPath);
      const { data: { user } } = await client.auth.getUser();
      const { error: updateError } = await client.from("syllabi").update({
        status: "approved",
        public_path: publicPath,
        public_url: publicData.publicUrl,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null
      }).eq("id", row.id);
      if (updateError) throw updateError;

      await client.storage.from("syllabus-submissions").remove([row.submission_path]);
      setMessage(adminMessage, "Sílabo aprobado. Ya está publicado en la sección académica.", "success");
      await loadRows();
    } catch (error) {
      console.error(error);
      if (publicPath) await client.storage.from("syllabi-public").remove([publicPath]);
      setMessage(adminMessage, "No se pudo completar la publicación. El documento sigue pendiente.", "error");
      button.disabled = false;
      button.textContent = "✓ Aprobar y publicar";
    }
  }

  async function reject(row, button) {
    const reviewedName = row.elective_name ? `${row.course_name} · ${row.elective_name}` : row.course_name;
    if (!window.confirm(`¿Rechazar el sílabo de ${reviewedName} (${row.year}-${row.semester})?`)) return;
    button.disabled = true;
    const { data: { user } } = await client.auth.getUser();
    const { error } = await client.from("syllabi").update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.id || null }).eq("id", row.id);
    if (error) {
      console.error(error);
      setMessage(adminMessage, "No se pudo rechazar el documento.", "error");
      button.disabled = false;
      return;
    }
    await client.storage.from("syllabus-submissions").remove([row.submission_path]);
    setMessage(adminMessage, "Documento rechazado y retirado de la bandeja pendiente.", "success");
    await loadRows();
  }

  await verifyAdmin();
});
