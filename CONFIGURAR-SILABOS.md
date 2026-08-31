# Configurar el sistema de sílabos de CEFUNT

La interfaz y la lógica ya están incluidas en este proyecto. Para conectarlas a datos reales necesitas crear un proyecto gratuito de Supabase y completar estos pasos.

## 1. Crear el proyecto de Supabase

Crea un proyecto en https://supabase.com y espera a que termine la inicialización.

## 2. Crear tablas, permisos y Storage

En Supabase abre **SQL Editor**, crea una nueva consulta, copia TODO el contenido de:

`supabase/setup.sql`

y ejecútalo.

Ese script crea:

- `syllabi`: envíos y estado de revisión.
- `admin_users`: usuarios autorizados para aprobar/rechazar.
- bucket privado `syllabus-submissions`: PDFs que todavía no han sido aprobados.
- bucket público `syllabi-public`: PDFs verificados y publicados.
- políticas RLS para que un visitante NO pueda aprobar documentos ni ver archivos pendientes.

## 3. Conectar la web

En Supabase busca las credenciales públicas del proyecto y copia:

- Project URL
- Publishable key (o anon key si tu proyecto todavía usa ese nombre)

Abre:

`js/supabase-config.js`

y reemplaza:

```js
const SUPABASE_URL = "PEGA_AQUI_TU_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "PEGA_AQUI_TU_SUPABASE_PUBLISHABLE_KEY";
```

No coloques nunca la `service_role` key en la web.

## 4. Crear tu cuenta administradora

En Supabase crea un usuario para la persona que revisará los sílabos (correo + contraseña).

Después vuelve al SQL Editor y ejecuta:

```sql
insert into public.admin_users (user_id)
select id from auth.users
where email = 'TU_CORREO_ADMIN@EJEMPLO.COM'
on conflict (user_id) do nothing;
```

Cambia el correo por el que acabas de crear.

Repite ese SQL si quieres autorizar a otra persona.

## 5. Probar el flujo

Levanta la web usando un servidor local (no abras los HTML con `file://`, porque `fetch()` necesita un servidor).

Por ejemplo, desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Luego abre:

- `http://localhost:8000/academico.html`
- `http://localhost:8000/enviar-silabo.html`
- `http://localhost:8000/admin-silabos.html`

Prueba en este orden:

1. Enviar un PDF desde `enviar-silabo.html`.
2. Entrar a `admin-silabos.html` con el usuario administrador.
3. Pulsar **Ver PDF** para revisarlo.
4. Pulsar **Aprobar y publicar**.
5. Volver a `academico.html`: el sílabo debe aparecer como **Verificado** y con sus enlaces.

## Flujo implementado

Visitante → formulario → bucket privado → `pending` → revisión CEFUNT → aprobar → bucket público → `approved` → aparece automáticamente en Académico.

Si se rechaza, el registro pasa a `rejected` y el PDF pendiente se elimina del bucket privado.


## Soporte para electivos

Si ya habías ejecutado `supabase/setup.sql` antes de recibir esta versión, ejecuta ahora también:

`supabase/add-elective-support.sql`

Esto agrega la columna `elective_name` sin borrar ni modificar los sílabos que ya existen.

Cuando el usuario elige un bloque como **Electivo de Especialidad 1**, **Electivo Libre 1**, etc., el formulario muestra automáticamente un segundo selector con las opciones oficiales tomadas de `data/courses.json`. Para cursos normales ese campo no aparece.
