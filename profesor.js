
import { supabase } from './supabase.js';

// Elementos del panel
const contenido = document.getElementById('seccionContenido');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

const btnMaterias = document.getElementById('btnMaterias');
const btnClases = document.getElementById('btnClases');
const btnCuestionarios = document.getElementById('btnCuestionarios');
const btnResultados = document.getElementById('btnResultados');
const btnConfiguracion = document.getElementById('btnConfiguracion');

// Usuario actual
let profesorActual = null;

// Mostrar una sección
function mostrarSeccion(titulo, descripcion) {
    contenido.innerHTML = `
        <h2 class="text-2xl font-bold mb-2">${titulo}</h2>
        <p class="text-slate-400">${descripcion}</p>
    `;
}

// Verificar que exista una sesión de profesor activa

async function verificarProfesor() {
    try {
        const { data: { session }, error: errorSesion } =
            await supabase.auth.getSession();

        if (errorSesion || !session) {
            window.location.href = 'login.html';
            return;
        }

        const { data: perfil, error } = await supabase
            .from('perfiles')
            .select('id, nombre, correo, rol, activo')
            .eq('id', session.user.id)
            .single();

        if (
            error ||
            !perfil ||
            perfil.rol !== 'profesor' ||
            !perfil.activo
        ) {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
            return;
        }

        profesorActual = perfil;

        mostrarSeccion(
            `¡Bienvenido, ${perfil.nombre || 'profesor'}!`,
            'Selecciona una sección para comenzar a administrar tus clases y cuestionarios.'
        );

    } catch (error) {
        console.error('Error al verificar el profesor:', error);
        window.location.href = 'login.html';
    }
}


// Botón de materias
// Consultar materias disponibles
btnMaterias.addEventListener('click', async () => {
    contenido.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Mis materias</h2>
        <p class="text-slate-400">Cargando materias...</p>
    `;

    const { data: materias, error } = await supabase
        .from('materias')
        .select('id, nombre, creada_en')
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error al consultar materias:', error);

        contenido.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Mis materias</h2>
            <p class="text-red-400">No fue posible cargar las materias.</p>
        `;
        return;
    }

    if (!materias || materias.length === 0) {
        contenido.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Mis materias</h2>
            <p class="text-slate-400">Todavía no hay materias registradas.</p>
        `;
        return;
    }

    contenido.innerHTML = `
        <h2 class="text-2xl font-bold mb-5">Mis materias</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${materias.map(materia => `
                <div class="glass-card rounded-xl p-5">
                    <div class="text-3xl mb-3">📚</div>
                    <h3 class="text-lg font-semibold">
                        ${escaparHTML(materia.nombre)}
                    </h3>
                    <p class="text-xs text-slate-500 mt-2">
                        Materia disponible
                    </p>
                </div>
            `).join('')}
        </div>
    `;
});

// Evitar que los nombres de materias inserten HTML
function escaparHTML(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caracter]);
}

// Botón de clases

// Consultar, mostrar y crear clases
btnClases.addEventListener('click', async () => {
    contenido.innerHTML = `
        <h2 class="text-2xl font-bold mb-5">Mis clases</h2>
        <p class="text-slate-400">Cargando información...</p>
    `;

    const { data: materias, error: errorMaterias } = await supabase
        .from('materias')
        .select('id, nombre')
        .order('nombre');

    if (errorMaterias) {
        console.error(errorMaterias);
        contenido.innerHTML = `
            <p class="text-red-400">No fue posible cargar las materias.</p>
        `;
        return;
    }

    const { data: clases, error: errorClases } = await supabase
        .rpc('listar_mis_clases_con_materia');

    if (errorClases) {
        console.error(errorClases);
        contenido.innerHTML = `
            <p class="text-red-400">No fue posible cargar tus clases.</p>
        `;
        return;
    }

    
contenido.innerHTML = `

    <div class="mb-8 flex items-center justify-between">
        <div>
            <h2 class="text-2xl font-bold mb-2">Mis clases</h2>
            <p class="text-slate-400">
                Administra tus grupos y materias.
            </p>
        </div>

        <button
            type="button"
            id="btnMostrarNuevaClase"
            title="Crear nueva clase"
            class="w-9 h-9 flex items-center justify-center rounded-lg
                   border border-slate-600 text-purple-300
                   hover:bg-slate-800 hover:border-purple-400 transition">
            <span class="text-xl font-medium leading-none">+</span>
        </button>
    </div>

    <form id="formNuevaClase"
        class="glass-card rounded-2xl p-6 mb-8 hidden">

        <h3 class="text-xl font-semibold mb-5">Crear nueva clase</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
                <label class="block text-sm mb-2">Materia</label>
                <select id="materiaClase" required
                    class="w-full p-3 rounded-xl bg-slate-800 border border-slate-600 text-white">
                    <option value="">Selecciona una materia</option>
                    ${materias.map(m => `
                        <option value="${m.id}">
                            ${escaparHTML(m.nombre)}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div>
                <label class="block text-sm mb-2">Nombre del grupo</label>
                <input id="nombreClase" type="text" required
                    placeholder="Ej. 4A"
                    class="w-full p-3 rounded-xl bg-slate-800 border border-slate-600 text-white">
            </div>

            <div class="md:col-span-2">
                <label class="block text-sm mb-2">Descripción (opcional)</label>
                <textarea id="descripcionClase" rows="2"
                    placeholder="Descripción del grupo..."
                    class="w-full p-3 rounded-xl bg-slate-800 border border-slate-600 text-white"></textarea>
            </div>

            <div class="md:col-span-2">
                <label class="block text-sm mb-2">Contraseña para los alumnos</label>
                <input id="contrasenaClase" type="password" required
                    minlength="8" maxlength="72"
                    placeholder="Mínimo 8 caracteres"
                    class="w-full p-3 rounded-xl bg-slate-800 border border-slate-600 text-white">
            </div>
        </div>

        <div class="flex gap-3 mt-5">
            <button type="submit"
                class="bg-sparkle-gradient px-6 py-3 rounded-xl font-semibold">
                Crear clase
            </button>

            <button type="button" id="btnCancelarNuevaClase"
                class="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600">
                Cancelar
            </button>
        </div>

        <p id="mensajeClase" class="mt-4 text-sm"></p>
    </form>

    <h3 class="text-xl font-semibold mb-4">Grupos registrados</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${clases.length === 0 ? `
            <p class="text-slate-400">
                Todavía no has creado clases.
            </p>
        ` : clases.map(clase => `
            <div class="glass-card rounded-2xl p-5">
                <span class="text-xs text-purple-300">
                    ${escaparHTML(clase.materia_nombre || 'Sin materia')}
                </span>

                <h4 class="text-xl font-bold mt-2">
                    ${escaparHTML(clase.nombre)}
                </h4>

                <p class="text-sm text-slate-400 mt-2">
                    ${escaparHTML(clase.descripcion || 'Sin descripción')}
                </p>

                <div class="mt-4 p-3 rounded-xl bg-slate-900/70">
                    <p class="text-xs text-slate-400">Código de acceso</p>
                    <p class="font-mono text-lg text-purple-300">
                        ${escaparHTML(clase.codigo_acceso)}
                    </p>
                </div>

                <p class="text-sm mt-3 ${clase.activa ? 'text-green-400' : 'text-red-400'}">
                    ${clase.activa ? 'Clase activa' : 'Clase inactiva'}
                </p>

                <button type="button"
                    data-editar-clase="${clase.id}"
                    class="mt-4 mr-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">
                    <i class="fas fa-edit mr-2"></i>
                    Editar clase
                </button>

                <button type="button"
                    data-eliminar-clase="${clase.id}"
                    class="mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">
                    <i class="fas fa-trash-alt mr-2"></i>
                    Eliminar clase
                </button>
            </div>
        `).join('')}
    </div>
`;

// Mostrar y ocultar formulario de nueva clase
const formularioNuevaClase = document.getElementById('formNuevaClase');
const btnMostrarNuevaClase = document.getElementById('btnMostrarNuevaClase');
const btnCancelarNuevaClase = document.getElementById('btnCancelarNuevaClase');

btnMostrarNuevaClase.addEventListener('click', () => {
    formularioNuevaClase.classList.toggle('hidden');
});

btnCancelarNuevaClase.addEventListener('click', () => {
    formularioNuevaClase.classList.add('hidden');
    formularioNuevaClase.reset();
});

    // Registrar una nueva clase
    document.getElementById('formNuevaClase')
        .addEventListener('submit', async (event) => {
            event.preventDefault();

            const boton = event.currentTarget.querySelector('button[type="submit"]');
            const mensaje = document.getElementById('mensajeClase');

            boton.disabled = true;
            boton.textContent = 'Creando clase...';

            try {
                const materiaId = Number(
                    document.getElementById('materiaClase').value
                );

                const nombre = document.getElementById('nombreClase').value.trim();
                const descripcion = document.getElementById('descripcionClase').value.trim();
                const contrasena = document.getElementById('contrasenaClase').value;

                const { data, error } = await supabase.rpc(
                    'crear_clase_con_materia',
                    {
                        p_materia_id: materiaId,
                        p_nombre: nombre,
                        p_descripcion: descripcion,
                        p_contrasena: contrasena
                    }
                );

                if (error) throw error;
                if (!data?.exito) {
                    throw new Error(data?.mensaje || 'No fue posible crear la clase.');
                }

                alert(
                    `¡Clase creada correctamente!\n\nCódigo de acceso: ${data.codigo_acceso}\n\nGuarda este código para compartirlo con tus alumnos.`
                );

                // Volver a cargar las clases
                btnClases.click();

            } catch (error) {
                console.error('Error al crear clase:', error);
                mensaje.textContent = error.message || 'Ocurrió un error.';
                mensaje.className = 'mt-4 text-sm text-red-400';

                boton.disabled = false;
                boton.textContent = 'Crear clase';
            }
        });
        // Editar una clase
contenido.querySelectorAll('[data-editar-clase]').forEach(boton => {
    boton.addEventListener('click', () => {
        const claseId = boton.dataset.editarClase;

        const clase = clases.find(c => c.id === claseId);

        if (!clase) {
            alert('No se encontró la clase.');
            return;
        }

        contenido.innerHTML = `
            <div class="glass-card rounded-2xl p-6 max-w-2xl">
                <h2 class="text-2xl font-bold mb-5">Editar clase</h2>

                <form id="formEditarClase">
                    <div class="mb-4">
                        <label class="block text-sm mb-2">Materia</label>
                        <select id="editarMateria" required
                            class="w-full p-3 rounded-xl bg-slate-800 border border-slate-600 text-white">
                            ${materias.map(m => `
                                <option value="${m.id}"
                                    ${Number(m.id) === Number(clase.materia_id) ? 'selected' : ''}>
                                    ${escaparHTML(m.nombre)}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm mb-2">Nombre del grupo</label>
                        <input id="editarNombre" type="text" required
                            value="${escaparHTML(clase.nombre)}"
                            class="w-full p-3 rounded-xl bg-slate-800 border border-slate-600 text-white">
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm mb-2">Descripción</label>
                        <textarea id="editarDescripcion" rows="3"
                            class="w-full p-3 rounded-xl bg-slate-800 border border-slate-600 text-white">${escaparHTML(clase.descripcion || '')}</textarea>
                    </div>

                    <button type="submit"
                        class="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl font-semibold">
                        Guardar cambios
                    </button>

                    <button type="button" id="cancelarEdicion"
                        class="ml-2 bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl">
                        Cancelar
                    </button>

                    <p id="mensajeEdicion" class="mt-4 text-sm"></p>
                </form>
            </div>
        `;

        document.getElementById('cancelarEdicion')
            .addEventListener('click', () => btnClases.click());

        document.getElementById('formEditarClase')
            .addEventListener('submit', async (event) => {
                event.preventDefault();

                const guardar = event.currentTarget.querySelector('button[type="submit"]');
                const mensaje = document.getElementById('mensajeEdicion');

                guardar.disabled = true;
                guardar.textContent = 'Guardando...';

                try {
                    const { data, error } = await supabase.rpc('editar_clase_con_materia', {
                        p_clase_id: claseId,
                        p_materia_id: Number(document.getElementById('editarMateria').value),
                        p_nombre: document.getElementById('editarNombre').value.trim(),
                        p_descripcion: document.getElementById('editarDescripcion').value.trim()
                    });

                    if (error) throw error;

                    if (data && data.exito === false) {
                        throw new Error(data.mensaje || 'No fue posible editar la clase.');
                    }

                    alert('Clase actualizada correctamente.');
                    btnClases.click();

                } catch (error) {
                    console.error('Error al editar clase:', error);
                    mensaje.textContent = error.message || 'Ocurrió un error.';
                    mensaje.className = 'mt-4 text-sm text-red-400';

                    guardar.disabled = false;
                    guardar.textContent = 'Guardar cambios';
                }
            });
    });
});
        // Eliminar una clase
contenido.querySelectorAll('[data-eliminar-clase]').forEach(boton => {
    boton.addEventListener('click', async () => {
        const claseId = boton.dataset.eliminarClase;

        const confirmar = confirm(
            '¿Deseas eliminar esta clase? Esta acción no se puede deshacer.'
        );

        if (!confirmar) return;

        boton.disabled = true;
        boton.textContent = 'Eliminando...';

        try {
            const { data, error } = await supabase.rpc(
                'eliminar_clase',
                { p_clase_id: claseId }
            );

            if (error) throw error;

            if (!data?.exito) {
                throw new Error(data?.mensaje || 'No fue posible eliminar la clase.');
            }

            alert(data.mensaje);
            btnClases.click();

        } catch (error) {
            console.error('Error al eliminar clase:', error);
            alert(error.message || 'Ocurrió un error al eliminar la clase.');

            boton.disabled = false;
            boton.textContent = 'Eliminar clase';
        }
    });
});
});



// Botón de cuestionarios
btnCuestionarios.addEventListener('click', async () => {
    contenido.innerHTML = `
        <h2 class="text-2xl font-bold mb-2">Mis cuestionarios</h2>
        <p class="text-slate-400">Cargando información...</p>
    `;

    // Consultar materias
    const { data: materias, error: errorMaterias } = await supabase
        .from('materias')
        .select('id, nombre')
        .order('nombre');

    if (errorMaterias) {
        console.error('Error al consultar materias:', errorMaterias);
        contenido.innerHTML = `
            <p class="text-red-400">No fue posible cargar las materias.</p>
        `;
        return;
    }

    // Consultar clases del profesor
    const { data: clases, error: errorClases } = await supabase
        .rpc('listar_mis_clases_con_materia');

    if (errorClases) {
        console.error('Error al consultar clases:', errorClases);
        contenido.innerHTML = `
            <p class="text-red-400">No fue posible cargar las clases.</p>
        `;
        return;
    }
    // Consultar cuestionarios creados por el profesor
const { data: cuestionarios, error: errorCuestionarios } = await supabase
    .from('cuestionarios')
    .select(`
        id,
        titulo,
        tema,
        nivel_educativo,
        estado,
        tiempo_limite_minutos,
        metodo_creacion,
        creado_en
    `)
    .eq('profesor_id', profesorActual.id)
    .order('creado_en', { ascending: false });

if (errorCuestionarios) {
    console.error('Error al consultar cuestionarios:', errorCuestionarios);

    contenido.innerHTML = `
        <p class="text-red-400">
            No fue posible cargar los cuestionarios.
        </p>
    `;

    return;
}

    contenido.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold">Mis cuestionarios</h2>
                <p class="text-slate-400 mt-1">
                    Administra y crea tus cuestionarios.
                </p>
            </div>

            <button type="button"
                id="btnMostrarNuevoCuestionario"
                title="Crear cuestionario"
                class="w-9 h-9 flex items-center justify-center rounded-lg
                       border border-slate-600 text-purple-300
                       hover:bg-slate-800 hover:border-purple-400 transition">
                <span class="text-xl font-medium leading-none">+</span>
            </button>
        </div>

        <form id="formNuevoCuestionario"
              class="glass-card rounded-2xl p-6 mb-8 hidden">

            <h3 class="text-lg font-semibold mb-5">
                Crear nuevo cuestionario
            </h3>

            <div class="mb-4">
                <label class="block text-sm text-slate-300 mb-2">
                    Materia
                </label>
                <select id="materiaCuestionario" required
                    class="w-full bg-slate-800 border border-slate-700
                           rounded-lg px-4 py-3 text-white">
                    <option value="">Selecciona una materia</option>
                    ${materias.map(materia => `
                        <option value="${materia.id}">
                            ${escaparHTML(materia.nombre)}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div class="mb-4">
                <label class="block text-sm text-slate-300 mb-2">
                    Clase
                </label>
                <select id="claseCuestionario" required
                    disabled
                    class="w-full bg-slate-800 border border-slate-700
                           rounded-lg px-4 py-3 text-white">
                    <option value="">Primero selecciona una materia</option>
                </select>
            </div>
            <!-- Nivel educativo -->
<div class="mb-4">
    <label class="block text-sm text-slate-300 mb-2">
        Nivel educativo y grado
    </label>

    <select id="nivelEducativoCuestionario" required
        class="w-full bg-slate-800 border border-slate-700
               rounded-lg px-4 py-3 text-white">

        <option value="">Selecciona el nivel educativo</option>

        <optgroup label="Primaria">
            <option value="Primaria 1">1.º de primaria</option>
            <option value="Primaria 2">2.º de primaria</option>
            <option value="Primaria 3">3.º de primaria</option>
            <option value="Primaria 4">4.º de primaria</option>
            <option value="Primaria 5">5.º de primaria</option>
            <option value="Primaria 6">6.º de primaria</option>
        </optgroup>

        <optgroup label="Secundaria">
            <option value="Secundaria 1">1.º de secundaria</option>
            <option value="Secundaria 2">2.º de secundaria</option>
            <option value="Secundaria 3">3.º de secundaria</option>
        </optgroup>

        <optgroup label="Otros niveles">
            <option value="Preparatoria">Preparatoria</option>
            <option value="Universidad">Universidad</option>
        </optgroup>
    </select>
</div>

            <div class="mb-4">
                <label class="block text-sm text-slate-300 mb-2">
                    Título del cuestionario
                </label>
                <input type="text" id="tituloCuestionario" required
                    placeholder="Ej. Fundamentos de C#"
                    class="w-full bg-slate-800 border border-slate-700
                           rounded-lg px-4 py-3 text-white">
            </div>

            <div class="mb-5">
                <label class="block text-sm text-slate-300 mb-2">
                    Tema
                </label>
                <input type="text" id="temaCuestionario" required
                    placeholder="Escribe el tema del cuestionario"
                    class="w-full bg-slate-800 border border-slate-700
                           rounded-lg px-4 py-3 text-white">
            </div>

<!-- Tiempo límite del cuestionario -->
<div class="mb-5">
    <label class="block text-sm text-slate-300 mb-2">
        Tiempo para realizar el examen (minutos)
    </label>

    <input
        type="number"
        id="tiempoLimiteCuestionario"
        min="1"
        max="300"
        value="30"
        required
        class="w-full bg-slate-800 border border-slate-700
               rounded-lg px-4 py-3 text-white">

    <p class="text-xs text-slate-400 mt-2">
        El alumno tendrá este tiempo para completar el cuestionario.
    </p>
</div>


            
<div class="mb-5">
    <label class="block text-sm text-slate-300 mb-2">
        Método de creación
    </label>

    <select
        id="metodoCreacionCuestionario"
        required
        class="w-full bg-slate-800 border border-slate-700
               rounded-lg px-4 py-3 text-white">

        <option value="">Selecciona una modalidad</option>
        <option value="manual">Crear preguntas manualmente</option>
        <option value="ia">Generar preguntas con inteligencia artificial</option>
    </select>

<!-- Opciones para creación manual -->
<div id="opcionesCreacionManual" class="hidden mb-5">
    <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
        <h4 class="font-semibold text-purple-300 mb-2">
            Creación manual
        </h4>
        <p class="text-sm text-slate-400">
            Podrás escribir tus preguntas, respuestas y opciones
            personalmente.
        </p>
    </div>
</div>

<!-- Opciones para creación con IA -->
<div id="opcionesCreacionIA" class="hidden mb-5">
    <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
        <h4 class="font-semibold text-purple-300 mb-2">
            Generación con inteligencia artificial
        </h4>
        <p class="text-sm text-slate-400">
            La IA propondrá preguntas a partir del tema indicado.
            Podrás revisarlas y modificarlas antes de guardarlas.
        </p>

<div class="mt-4 space-y-4">

    <!-- Cantidad de preguntas -->
    <div>
        <label class="block text-sm text-slate-300 mb-2">
            Cantidad de preguntas
        </label>
        <input
            type="number"
            id="cantidadPreguntasIA"
            min="1"
            max="50"
            value="10"
            required
            class="w-full bg-slate-800 border border-slate-700
                   rounded-lg px-4 py-3 text-white">
    </div>

    <!-- Dificultad -->
    <div>
        <label class="block text-sm text-slate-300 mb-2">
            Dificultad
        </label>
        <select
            id="dificultadPreguntasIA"
            required
            class="w-full bg-slate-800 border border-slate-700
                   rounded-lg px-4 py-3 text-white">

            <option value="">Selecciona la dificultad</option>
            <option value="facil">Fácil</option>
            <option value="media">Media</option>
            <option value="dificil">Difícil</option>
        </select>
    </div>

</div>

    </div>
</div>

</div>

            
<div class="flex justify-end gap-3">

    <button type="button"
        id="btnCancelarNuevoCuestionario"
        class="px-4 py-2 rounded-lg bg-slate-700
               hover:bg-slate-600 transition">
        Cancelar
    </button>

    <button type="submit"
        id="btnGuardarCuestionario"
        class="px-5 py-2 rounded-lg bg-sparkle-gradient
               hover:opacity-90 transition font-semibold">
        Crear cuestionario
    </button>

</div>

        </form>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

    ${cuestionarios.length === 0 ? `
        <div class="glass-card rounded-2xl p-8 text-center md:col-span-2">
            <p class="text-slate-400">
                Todavía no has creado cuestionarios.
            </p>
        </div>
    ` : cuestionarios.map(cuestionario => `
        <div class="glass-card rounded-2xl p-5">
    <div class="flex items-start justify-between gap-3">
        <h3 class="text-lg font-bold">
            ${escaparHTML(cuestionario.titulo)}
        </h3>

        <div class="flex items-center gap-2">
            <span class="inline-block mt-2 text-xs px-3 py-1 rounded-full border font-semibold
    ${cuestionario.estado === 'borrador'
        ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
        : cuestionario.estado === 'archivado'
            ? 'bg-slate-500/20 text-slate-300 border-slate-400/30'
            : 'bg-green-500/30 text-green-200 border-green-400/60 shadow-sm shadow-green-500/10'}">
    ${escaparHTML(cuestionario.estado)}
</span>

           <button
    type="button"
    data-toggle-acciones
    aria-expanded="false"
    title="Mostrar acciones del cuestionario"
    class="w-8 h-8 shrink-0 flex items-center justify-center
           rounded-lg border border-slate-700/50
           bg-slate-800/30 text-slate-400
           hover:bg-slate-700/60 hover:text-white
           transition">
    <span class="text-xl font-normal leading-none">+</span>
</button>
        </div>
    </div>

            <p class="text-sm text-slate-400 mt-2">
                Tema: ${escaparHTML(cuestionario.tema || 'Sin tema')}
            </p>

            <p class="text-sm text-slate-400 mt-1">
    <i class="fas fa-graduation-cap mr-1"></i>
    Nivel: ${escaparHTML(cuestionario.nivel_educativo || 'No especificado')}
</p>

            <div data-menu-acciones class="hidden mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm text-slate-300">
                <p>
                    Tiempo: ${cuestionario.tiempo_limite_minutos} minutos
                </p>

                <p>
                    Método: ${cuestionario.metodo_creacion === 'ia'
                        ? 'Inteligencia artificial'
                        : 'Manual'}
                </p>

                <p class="text-xs text-slate-500">
                    Creado: ${new Date(cuestionario.creado_en).toLocaleDateString('es-MX')}
                </p>
                <button
    type="button"
    data-abrir-preguntas="${cuestionario.id}"
    class="mt-5 w-full px-4 py-2.5 rounded-xl
           bg-slate-800/60 hover:bg-slate-700/70
           border border-slate-700/60
           text-slate-300 hover:text-white
           text-sm font-medium transition">
    <i class="fas fa-list-ul mr-2"></i>
    Ver y editar preguntas
</button>
${cuestionario.estado === 'publicado' ? `
    <button
        type="button"
        data-despublicar-cuestionario="${cuestionario.id}"
        class="mt-2 w-full px-4 py-2.5 rounded-xl
               bg-yellow-900/30 hover:bg-yellow-800/50
border border-yellow-600/50
text-yellow-300 hover:text-yellow-200
               text-sm font-medium transition">
        <i class="fas fa-undo mr-2"></i>
        Despublicar cuestionario
    </button>
    <button
    type="button"
    data-detener-cuestionario="${cuestionario.id}"
    class="mt-2 w-full px-4 py-2.5 rounded-xl
           bg-blue-900/30 hover:bg-blue-800/50
border border-blue-600/50
text-blue-300 hover:text-blue-200
           text-sm font-medium transition">
    <i class="fas fa-stop-circle mr-2"></i>
    Detener cuestionario
</button>
` : `
    <button
        type="button"
        data-publicar-cuestionario="${cuestionario.id}"
        class="mt-2 w-full px-4 py-2.5 rounded-xl
               bg-emerald-900/30 hover:bg-emerald-800/50
               border border-emerald-700/50
               text-emerald-300 hover:text-emerald-200
               text-sm font-medium transition">
        <i class="fas fa-check-circle mr-2"></i>
        Publicar cuestionario
    </button>
`}
<button
    type="button"
    data-eliminar-cuestionario="${cuestionario.id}"
    class="mt-2 w-full px-4 py-2.5 rounded-xl
           bg-red-900/30 hover:bg-red-800/50
           border border-red-700/50
           text-red-300 hover:text-red-200
           text-sm font-medium transition">
    <i class="fas fa-trash-alt mr-2"></i>
    Eliminar cuestionario
</button>
            </div>

        </div>
    `).join('')}

</div>
        
    `;
// Mostrar y ocultar las acciones de cada cuestionario
contenido.querySelectorAll('[data-toggle-acciones]').forEach(boton => {
    boton.addEventListener('click', () => {
        const tarjeta = boton.closest('.glass-card');
        const menu = tarjeta.querySelector('[data-menu-acciones]');

        const estaOculto = menu.classList.toggle('hidden');

        boton.querySelector('span').textContent = estaOculto ? '+' : '−';
        boton.setAttribute('aria-expanded', String(!estaOculto));
    });
});
    // Eliminar cuestionarios
contenido.querySelectorAll('[data-eliminar-cuestionario]').forEach(boton => {
    boton.addEventListener('click', async () => {

        const cuestionarioId = boton.dataset.eliminarCuestionario;

        const confirmar = confirm(
            '¿Seguro que deseas eliminar este cuestionario? Esta acción no se puede deshacer.'
        );

        if (!confirmar) return;

        boton.disabled = true;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Verificando...';

        try {
            // Verificar si existen intentos de alumnos
            const { data: intentos, error: errorIntentos } = await supabase
                .from('intentos')
                .select('id')
                .eq('cuestionario_id', cuestionarioId)
                .limit(1);

            if (errorIntentos) {
                throw errorIntentos;
            }

            // Proteger los resultados de los alumnos
            if (intentos && intentos.length > 0) {
                alert(
                    'No se puede eliminar este cuestionario porque ya tiene intentos de alumnos. Se conservarán sus resultados y calificaciones.'
                );

                boton.disabled = false;
                boton.innerHTML = '<i class="fas fa-trash-alt mr-2"></i>Eliminar cuestionario';
                return;
            }

            // Eliminar únicamente un cuestionario del profesor actual
            const { error: errorEliminar } = await supabase
                .from('cuestionarios')
                .delete()
                .eq('id', cuestionarioId)
                .eq('profesor_id', profesorActual.id);

            if (errorEliminar) {
                throw errorEliminar;
            }

            alert('Cuestionario eliminado correctamente.');

            // Actualizar la lista
            btnCuestionarios.click();

        } catch (error) {
            console.error('Error al eliminar cuestionario:', error);

            alert(
                'No se pudo eliminar el cuestionario: ' + error.message
            );

            boton.disabled = false;
            boton.innerHTML = '<i class="fas fa-trash-alt mr-2"></i>Eliminar cuestionario';
        }
    });
});

// Publicar cuestionarios
contenido.querySelectorAll('[data-publicar-cuestionario]').forEach(boton => {
    boton.addEventListener('click', async () => {

        const cuestionarioId = boton.dataset.publicarCuestionario;

        const confirmar = confirm(
            '¿Deseas publicar este cuestionario? Los alumnos podrán acceder a él.'
        );

        if (!confirmar) return;

        boton.disabled = true;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Publicando...';

        try {
            // Comprobar que el cuestionario tenga preguntas
            const { count, error: errorPreguntas } = await supabase
                .from('preguntas')
                .select('id', { count: 'exact', head: true })
                .eq('cuestionario_id', cuestionarioId);

            if (errorPreguntas) throw errorPreguntas;

            if (!count || count === 0) {
                alert('No puedes publicar un cuestionario sin preguntas.');
                return;
            }

            // Publicar únicamente un cuestionario del profesor actual
            const { error: errorPublicar } = await supabase
                .from('cuestionarios')
                .update({
                    estado: 'publicado',
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', cuestionarioId)
                .eq('profesor_id', profesorActual.id);

            if (errorPublicar) throw errorPublicar;

            alert('¡Cuestionario publicado correctamente!');

            // Actualizar la lista
            btnCuestionarios.click();

        } catch (error) {
            console.error('Error al publicar cuestionario:', error);
            alert('No se pudo publicar: ' + error.message);
        } finally {
            if (boton.isConnected) {
                boton.disabled = false;
                boton.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Publicar cuestionario';
            }
        }
    });
});

contenido.querySelectorAll('[data-despublicar-cuestionario]').forEach(boton => {
    boton.addEventListener('click', async () => {

        const cuestionarioId = boton.dataset.despublicarCuestionario;

        const confirmar = confirm(
            '¿Deseas despublicar este cuestionario? Los alumnos dejarán de tener acceso mientras esté en borrador.'
        );

        if (!confirmar) return;

        boton.disabled = true;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Despublicando...';

        try {
            const { error } = await supabase
                .from('cuestionarios')
                .update({
                    estado: 'borrador',
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', cuestionarioId)
                .eq('profesor_id', profesorActual.id);

            if (error) throw error;

            alert('Cuestionario despublicado correctamente.');

            btnCuestionarios.click();

        } catch (error) {
            console.error('Error al despublicar:', error);
            alert('No se pudo despublicar el cuestionario: ' + error.message);

            boton.disabled = false;
            boton.innerHTML = '<i class="fas fa-undo mr-2"></i>Despublicar cuestionario';
        }
    });
});

// Detener cuestionarios
contenido.querySelectorAll('[data-detener-cuestionario]').forEach(boton => {
    boton.addEventListener('click', async () => {

        const cuestionarioId = boton.dataset.detenerCuestionario;

        const confirmar = confirm(
            '¿Deseas detener este cuestionario? Los alumnos ya no podrán iniciar nuevos intentos. Los resultados existentes se conservarán.'
        );

        if (!confirmar) return;

        boton.disabled = true;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Deteniendo...';

        try {
            const { error } = await supabase
                .from('cuestionarios')
                .update({
                    estado: 'archivado',
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', cuestionarioId)
                .eq('profesor_id', profesorActual.id)
                .eq('estado', 'publicado');

            if (error) throw error;

            alert('Cuestionario detenido correctamente.');

            btnCuestionarios.click();

        } catch (error) {
            console.error('Error al detener cuestionario:', error);

            alert('No se pudo detener el cuestionario: ' + error.message);

            boton.disabled = false;
            boton.innerHTML = '<i class="fas fa-stop-circle mr-2"></i>Detener cuestionario';
        }
    });
});

// Abrir el editor de preguntas de un cuestionario
contenido.querySelectorAll('[data-abrir-preguntas]').forEach(boton => {
    boton.addEventListener('click', async () => {

        const cuestionarioId = boton.dataset.abrirPreguntas;

        const cuestionario = cuestionarios.find(
            q => q.id === cuestionarioId
        );

        contenido.innerHTML = `
            <div class="mb-6">
                <button
                    id="btnVolverCuestionarios"
                    class="mb-4 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Volver a cuestionarios
                </button>

                <h2 class="text-2xl font-bold text-white">
                    ${escaparHTML(cuestionario.titulo)}
                </h2>

                <p class="text-slate-400 mt-2">
                    Editor de preguntas y respuestas
                </p>
                <button
    type="button"
    id="btnMostrarFormularioPregunta"
    class="mt-5 px-4 py-2.5 rounded-xl
           bg-slate-800/60 hover:bg-slate-700/70
           border border-slate-700/60
           text-slate-300 hover:text-white
           text-sm font-medium transition">
    <i class="fas fa-plus mr-2"></i>
    Agregar pregunta
</button>
<div id="contenedorFormularioPregunta"></div>
            </div>

            <div id="contenedorPreguntas" class="space-y-4">
                <p class="text-slate-400">Cargando preguntas...</p>
            </div>
        `;

        document
            .getElementById('btnVolverCuestionarios')
            .addEventListener('click', () => {
                btnCuestionarios.click();
            });

        const contenedorPreguntas =
            document.getElementById('contenedorPreguntas');
            const btnMostrarFormularioPregunta =
    document.getElementById('btnMostrarFormularioPregunta');

const contenedorFormularioPregunta =
    document.getElementById('contenedorFormularioPregunta');

btnMostrarFormularioPregunta.addEventListener('click', () => {

    contenedorFormularioPregunta.innerHTML = `
        <div class="glass-card rounded-2xl p-5 border border-slate-700">
            <h3 class="text-lg font-bold text-white mb-4">
                Nueva pregunta
            </h3>

            <form id="formNuevaPregunta" class="space-y-4">

                <div>
                    <label class="block text-sm text-slate-300 mb-2">
                        Tipo de pregunta
                    </label>

                    <select
                        id="tipoNuevaPregunta"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                        <option value="opcion_multiple">Opción múltiple</option>
                        <option value="abierta">Respuesta abierta</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm text-slate-300 mb-2">
                        Enunciado
                    </label>

                    <textarea
                        id="enunciadoNuevaPregunta"
                        rows="3"
                        required
                        placeholder="Escribe tu pregunta..."
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500"></textarea>
                </div>

                <div>
                    <label class="block text-sm text-slate-300 mb-2">
                        Puntos máximos
                    </label>

                    <input
                        type="number"
                        id="puntosNuevaPregunta"
                        min="0.1"
                        step="0.1"
                        value="1"
                        required
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                </div>
                <div id="camposOpcionesNuevaPregunta"></div>

                <div class="flex gap-3 justify-end">
                    <button
                        type="button"
                        id="btnCancelarPregunta"
                        class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm">
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
                        Continuar
                    </button>
                </div>

            </form>
        </div>
    `;
    const tipoNuevaPregunta =
    document.getElementById('tipoNuevaPregunta');

const camposOpciones =
    document.getElementById('camposOpcionesNuevaPregunta');

function actualizarCamposOpciones() {

    if (tipoNuevaPregunta.value === 'opcion_multiple') {

        camposOpciones.innerHTML = `
            <div class="space-y-3">
                <label class="block text-sm text-slate-300">
                    Opciones de respuesta
                </label>

                <p class="text-xs text-slate-400">
                    Escribe las cuatro opciones y marca la respuesta correcta.
                </p>

                ${[0, 1, 2, 3].map(i => `
                    <div class="flex items-center gap-3">
                        <input
                            type="radio"
                            name="respuestaCorrecta"
                            value="${i}"
                            ${i === 0 ? 'checked' : ''}
                            class="accent-indigo-500"
                            aria-label="Marcar opción ${i + 1} como correcta">

                        <input
                            type="text"
                            class="opcion-nueva flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500"
                            placeholder="Opción ${i + 1}"
                            required>
                    </div>
                `).join('')}
            </div>
        `;

    } else {

        camposOpciones.innerHTML = `
            <div>
                <label class="block text-sm text-slate-300 mb-2">
                    Respuesta esperada (opcional)
                </label>

                <textarea
                    id="respuestaEsperadaNueva"
                    rows="3"
                    placeholder="Describe qué respuesta se espera del alumno..."
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500"></textarea>
            </div>
        `;
    }
}

tipoNuevaPregunta.addEventListener(
    'change',
    actualizarCamposOpciones
);

actualizarCamposOpciones();
    document.getElementById('btnCancelarPregunta')
        .addEventListener('click', () => {
            contenedorFormularioPregunta.innerHTML = '';
        });

    document.getElementById('formNuevaPregunta')
    .addEventListener('submit', async (evento) => {

        evento.preventDefault();

        const tipo = document.getElementById('tipoNuevaPregunta').value;
        const enunciado = document.getElementById('enunciadoNuevaPregunta').value.trim();
        const puntos = Number(document.getElementById('puntosNuevaPregunta').value);

        if (!enunciado || !Number.isFinite(puntos) || puntos <= 0) {
            alert('Verifica el enunciado y los puntos de la pregunta.');
            return;
        }

        let opciones = [];
        let respuestaCorrecta = null;
        let respuestaEsperada = null;
        let metodoCalificacion = 'automatica';

        if (tipo === 'opcion_multiple') {

            opciones = Array.from(
                document.querySelectorAll('.opcion-nueva')
            ).map(input => input.value.trim());

            if (opciones.some(opcion => !opcion)) {
                alert('Completa las cuatro opciones.');
                return;
            }

            const seleccionada = document.querySelector(
                'input[name="respuestaCorrecta"]:checked'
            );

            if (!seleccionada) {
                alert('Selecciona la respuesta correcta.');
                return;
            }

            respuestaCorrecta = Number(seleccionada.value);

        } else {

            metodoCalificacion = 'manual';

            respuestaEsperada = document
                .getElementById('respuestaEsperadaNueva')
                .value.trim() || null;
        }

        const ordenSiguiente = Math.max(
            0,
            ...(preguntas || []).map(p => Number(p.orden) || 0)
        ) + 1;

        const nuevaPregunta = {
            cuestionario_id: cuestionarioId,
            enunciado,
            opciones,
            respuesta_correcta: respuestaCorrecta,
            respuesta_esperada: respuestaEsperada,
            tipo,
            rubrica: [],
            puntos_maximos: puntos,
            metodo_calificacion: metodoCalificacion,
            orden: ordenSiguiente
        };

        let resultado;

if (preguntaEditandoId) {

    resultado = await supabase
        .from('preguntas')
        .update(nuevaPregunta)
        .eq('id', preguntaEditandoId)
        .eq('cuestionario_id', cuestionarioId);

} else {

    resultado = await supabase
        .from('preguntas')
        .insert(nuevaPregunta);
}

if (resultado.error) {
    alert('No se pudo guardar la pregunta: ' + resultado.error.message);
    console.error(resultado.error);
    return;
}

const estabaEditando = Boolean(preguntaEditandoId);
preguntaEditandoId = null;

alert(
    estabaEditando
        ? '¡Pregunta actualizada correctamente!'
        : '¡Pregunta guardada correctamente!'
);

boton.click();
    });
});

        const { data: preguntas, error } = await supabase
            .from('preguntas')
            .select('*')
            .eq('cuestionario_id', cuestionarioId)
            .order('orden', { ascending: true });

        if (error) {
            contenedorPreguntas.innerHTML = `
                <p class="text-red-400">
                    No se pudieron cargar las preguntas:
                    ${escaparHTML(error.message)}
                </p>
            `;
            return;
        }

        if (!preguntas || preguntas.length === 0) {
            contenedorPreguntas.innerHTML = `
                <div class="glass-card rounded-2xl p-6 text-center">
                    <i class="fas fa-circle-question text-4xl text-indigo-400 mb-4"></i>
                    <p class="text-white font-semibold">
                        Este cuestionario todavía no tiene preguntas.
                    </p>
                    <p class="text-slate-400 text-sm mt-2">
                        Aquí podrás agregarlas y administrar sus respuestas.
                    </p>
                </div>
            `;
            return;
        }

let preguntaEditandoId = null;

contenedorPreguntas.innerHTML = preguntas.map((pregunta, indice) => `
    <div class="glass-card rounded-2xl p-5">

        <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
                <h3 class="text-lg font-bold text-white">
                    Pregunta ${indice + 1}
                </h3>

                <p class="text-white mt-3">
                    ${escaparHTML(pregunta.enunciado)}
                </p>

                <span class="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                    ${pregunta.tipo === 'opcion_multiple' ? 'Opción múltiple' : 'Respuesta abierta'}
                </span>
            </div>
        </div>

        <div class="mt-4 space-y-2 text-sm text-slate-300">
            ${
                pregunta.tipo === 'opcion_multiple'
                    ? (pregunta.opciones || []).map((opcion, i) => `
                        <p class="p-2 rounded-lg ${
                            Number(pregunta.respuesta_correcta) === i
                                ? 'bg-green-500/10 text-green-300'
                                : 'bg-slate-800/50'
                        }">
                            ${String.fromCharCode(65 + i)}.
                            ${escaparHTML(opcion)}
                            ${
                                Number(pregunta.respuesta_correcta) === i
                                    ? ' ✓ Respuesta correcta'
                                    : ''
                            }
                        </p>
                    `).join('')
                    : `
                        <p>
                            Respuesta esperada:
                            ${escaparHTML(pregunta.respuesta_esperada || 'No especificada')}
                        </p>
                    `
            }

            <p class="text-slate-400 mt-3">
                Puntos: ${pregunta.puntos_maximos}
            </p>
        </div>

        <div class="flex gap-2 mt-5">
            <button
                type="button"
                data-editar-pregunta="${pregunta.id}"
                class="flex-1 px-4 py-2 rounded-xl bg-blue-900/30 hover:bg-blue-800/50 border border-blue-700/50 text-blue-300 text-sm transition">
                <i class="fas fa-edit mr-2"></i>
                Editar
            </button>

            <button
                type="button"
                data-eliminar-pregunta="${pregunta.id}"
                class="flex-1 px-4 py-2 rounded-xl bg-red-900/30 hover:bg-red-800/50 border border-red-700/50 text-red-300 text-sm transition">
                <i class="fas fa-trash-alt mr-2"></i>
                Eliminar
            </button>
        </div>

    </div>
`).join('');

contenedorPreguntas
    .querySelectorAll('[data-eliminar-pregunta]')
    .forEach(botonEliminar => {

        botonEliminar.addEventListener('click', async () => {

            const preguntaId = botonEliminar.dataset.eliminarPregunta;

            if (!confirm('¿Seguro que deseas eliminar esta pregunta?')) {
                return;
            }

            const { error } = await supabase
                .from('preguntas')
                .delete()
                .eq('id', preguntaId)
                .eq('cuestionario_id', cuestionarioId);

            if (error) {
                alert('No se pudo eliminar la pregunta: ' + error.message);
                console.error(error);
                return;
            }

            alert('Pregunta eliminada correctamente.');

            boton.click();
        });
    });
    // Conectar botones para editar preguntas
contenedorPreguntas
    .querySelectorAll('[data-editar-pregunta]')
    .forEach(botonEditar => {

        botonEditar.addEventListener('click', () => {

            const preguntaId = botonEditar.dataset.editarPregunta;

            const pregunta = preguntas.find(
                p => p.id === preguntaId
            );

            if (!pregunta) return;

            preguntaEditandoId = pregunta.id;

            // Abrir el formulario
            btnMostrarFormularioPregunta.click();

            // Cargar los datos
            document.getElementById('tipoNuevaPregunta').value =
                pregunta.tipo;

            document.getElementById('enunciadoNuevaPregunta').value =
                pregunta.enunciado;

            document.getElementById('puntosNuevaPregunta').value =
                pregunta.puntos_maximos;

            // Actualizar los campos según el tipo
            document.getElementById('tipoNuevaPregunta')
                .dispatchEvent(new Event('change'));

            if (pregunta.tipo === 'opcion_multiple') {

                const opciones = document.querySelectorAll('.opcion-nueva');

                (pregunta.opciones || []).forEach((opcion, i) => {
                    if (opciones[i]) {
                        opciones[i].value = opcion;
                    }
                });

                const correcta = document.querySelector(
                    `input[name="respuestaCorrecta"][value="${pregunta.respuesta_correcta}"]`
                );

                if (correcta) correcta.checked = true;

            } else {

                document.getElementById('respuestaEsperadaNueva').value =
                    pregunta.respuesta_esperada || '';
            }

            document.getElementById('contenedorFormularioPregunta')
                .scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    });
});

const formulario = document.getElementById('formNuevoCuestionario');

const selectorMetodo = document.getElementById('metodoCreacionCuestionario');
const opcionesManual = document.getElementById('opcionesCreacionManual');
const opcionesIA = document.getElementById('opcionesCreacionIA');
const cantidadIA = document.getElementById('cantidadPreguntasIA');
const dificultadIA = document.getElementById('dificultadPreguntasIA');

function actualizarOpcionesMetodo() {
    const esManual = selectorMetodo.value === 'manual';
    const esIA = selectorMetodo.value === 'ia';

    opcionesManual.classList.toggle('hidden', !esManual);
    opcionesIA.classList.toggle('hidden', !esIA);

    cantidadIA.disabled = !esIA;
    dificultadIA.disabled = !esIA;

    cantidadIA.required = esIA;
    dificultadIA.required = esIA;
}

selectorMetodo.addEventListener('change', actualizarOpcionesMetodo);

actualizarOpcionesMetodo();

    const selectorMateria = document.getElementById('materiaCuestionario');
    const selectorNivel = document.getElementById('nivelEducativoCuestionario');
    const selectorClase = document.getElementById('claseCuestionario');

    // Mostrar y ocultar formulario
    document.getElementById('btnMostrarNuevoCuestionario')
        .addEventListener('click', () => {
            formulario.classList.toggle('hidden');
        });

    // Cancelar creación
    document.getElementById('btnCancelarNuevoCuestionario')
        .addEventListener('click', () => {
            formulario.classList.add('hidden');
            formulario.reset();
            selectorClase.innerHTML =
                '<option value="">Primero selecciona una materia</option>';
            selectorClase.disabled = true;
        });
 // Guardar el cuestionario en Supabase

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const botonGuardar = document.getElementById('btnGuardarCuestionario');
    botonGuardar.disabled = true;
    botonGuardar.textContent = 'Guardando...';

    let cuestionarioCreado = false;
    let metodoSeleccionado = '';

    try {
        // Obtener profesor autenticado
        const { data: { user }, error: errorUsuario } =
            await supabase.auth.getUser();

        if (errorUsuario || !user) {
            throw new Error('No se pudo identificar al profesor.');
        }

        // Obtener materia y clase seleccionadas
        const materiaId = Number(selectorMateria.value);
        const materia = materias.find(m =>
            Number(m.id) === materiaId
        );

        const claseId = selectorClase.value;

        if (!materia || !claseId) {
    throw new Error('Selecciona una materia y una clase.');
}

if (!selectorNivel.value) {
    throw new Error('Selecciona el nivel educativo y grado.');
}

        // Obtener modalidad
        const metodo = selectorMetodo.value;
        metodoSeleccionado = metodo;

        if (!metodo) {
            throw new Error('Selecciona un método de creación.');
        }

        // Preparar información del cuestionario
        const nuevoCuestionario = {
            profesor_id: user.id,
            nivel_educativo: selectorNivel.value,
            materia_id: materia.id,
            materia_nombre: materia.nombre,
            clase_id: claseId,
            titulo: document.getElementById('tituloCuestionario').value.trim(),
            tema: document.getElementById('temaCuestionario').value.trim(),
            tiempo_limite_minutos: Number(
                document.getElementById('tiempoLimiteCuestionario').value
            ),
            metodo_creacion: metodo,
            cantidad_preguntas: metodo === 'ia'
                ? Number(cantidadIA.value)
                : 10,
            dificultad: metodo === 'ia'
                ? dificultadIA.value
                : 'media',
            origen: 'tema',
            estado: 'borrador',
            permite_ia: false
        };

        // Guardar cuestionario en Supabase
        const { data, error } = await supabase
            .from('cuestionarios')
            .insert(nuevoCuestionario)
            .select('id')
            .single();

        if (error) {
            throw error;
        }

        cuestionarioCreado = true;

        // Si se eligió IA, generar las preguntas automáticamente
        if (metodo === 'ia') {
            botonGuardar.textContent = 'Generando preguntas con IA...';

            const { data: resultadoIA, error: errorIA } =
                await supabase.functions.invoke(
                    'generar-cuestionario-ia',
                    {
                        body: {
                            cuestionario_id: data.id
                        }
                    }
                );

            if (errorIA) {
    let detalle = errorIA.message;

    try {
        const respuestaError = await errorIA.context.json();

        if (respuestaError?.error) {
            detalle = respuestaError.error;
        }
    } catch (e) {
        console.error('No se pudo leer el detalle del error:', e);
    }

    throw new Error(detalle);
}

            if (!resultadoIA || resultadoIA.exito !== true) {
                throw new Error(
                    resultadoIA?.error ||
                    'Gemini no pudo generar las preguntas.'
                );
            }

            alert(
                '¡Cuestionario creado y generado correctamente!\n\n' +
                'Preguntas generadas: ' + resultadoIA.cantidad + '\n' +
                'Estado: Borrador\n' +
                'ID: ' + data.id
            );

        } else {
            // Creación manual: conservar el comportamiento anterior
            alert(
                '¡Cuestionario creado correctamente!\n' +
                'Se guardó como borrador.\n' +
                'ID: ' + data.id
            );
        }

        formulario.reset();

        selectorClase.innerHTML =
            '<option value="">Primero selecciona una materia</option>';

        selectorClase.disabled = true;

        opcionesManual.classList.add('hidden');
        opcionesIA.classList.add('hidden');

        formulario.classList.add('hidden');

    } catch (error) {
        console.error('Error al crear cuestionario:', error);

        if (cuestionarioCreado && metodoSeleccionado === 'ia') {
            alert(
                'El cuestionario se guardó como borrador, pero no se pudieron generar las preguntas.\n\n' +
                'Detalle: ' + error.message
            );
        } else {
            alert('No se pudo crear el cuestionario: ' + error.message);
        }

    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = 'Crear cuestionario';
    }
});

    // Mostrar solamente las clases de la materia seleccionada
    selectorMateria.addEventListener('change', () => {
       
        const materiaId = Number(selectorMateria.value);

        const clasesMateria = clases.filter(clase =>
            Number(clase.materia_id) === materiaId
        );

        selectorClase.innerHTML = `
            <option value="">Selecciona una clase</option>
            ${clasesMateria.map(clase => `
                <option value="${clase.id}">
                    ${escaparHTML(clase.nombre)}
                </option>
            `).join('')}
        `;

        selectorClase.disabled = clasesMateria.length === 0;

        if (clasesMateria.length === 0) {
            selectorClase.innerHTML =
                '<option value="">No hay clases para esta materia</option>';
        }
    });
});


// Botón de resultados
btnResultados.addEventListener('click', async () => {
    contenido.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-white">
                Resultados de cuestionarios
            </h2>
            <p class="text-slate-400 mt-2">
                Consulta los intentos y las calificaciones de tus alumnos.
            </p>
        </div>

        <div id="contenedorResultados">
            <p class="text-slate-400">Cargando resultados...</p>
        </div>
    `;

    const contenedor = document.getElementById('contenedorResultados');

    try {
        // Obtener los cuestionarios del profesor
        const { data: cuestionarios, error: errorCuestionarios } =
            await supabase
                .from('cuestionarios')
                .select('id, titulo')
                .order('creado_en', { ascending: false });

        if (errorCuestionarios) throw errorCuestionarios;

        if (!cuestionarios || cuestionarios.length === 0) {
            contenedor.innerHTML = `
                <div class="glass-card rounded-2xl p-6 text-center">
                    <p class="text-slate-300">
                        Todavía no tienes cuestionarios registrados.
                    </p>
                </div>
            `;
            return;
        }

        const idsCuestionarios = cuestionarios.map(c => c.id);

        // Obtener los intentos de esos cuestionarios
        const { data: intentos, error: errorIntentos } =
            await supabase
                .from('intentos')
                .select(`
                    id,
                    cuestionario_id,
                    nombre_alumno,
                    matricula,
                    grupo,
                    iniciado_en,
                    finalizado_en,
                    estado,
                    total_preguntas,
                    respuestas_correctas,
                    calificacion,
                    estado_calificacion
                `)
                .in('cuestionario_id', idsCuestionarios)
                .order('iniciado_en', { ascending: false });

        if (errorIntentos) throw errorIntentos;

        if (!intentos || intentos.length === 0) {
            contenedor.innerHTML = `
                <div class="glass-card rounded-2xl p-6 text-center">
                    <i class="fas fa-chart-bar text-4xl text-indigo-400 mb-4"></i>
                    <p class="text-white font-semibold">
                        Todavía no hay intentos de alumnos.
                    </p>
                    <p class="text-slate-400 text-sm mt-2">
                        Cuando tus alumnos contesten los cuestionarios,
                        sus resultados aparecerán aquí.
                    </p>
                </div>
            `;
            return;
        }

        const nombresCuestionarios = Object.fromEntries(
            cuestionarios.map(c => [c.id, c.titulo])
        );

        contenedor.innerHTML = intentos.map(intento => {
            const fecha = intento.iniciado_en
                ? new Date(intento.iniciado_en).toLocaleString('es-MX')
                : 'No disponible';

            const calificacion = intento.calificacion !== null
                ? `${intento.calificacion}`
                : 'Pendiente';

            return `
                <div class="glass-card rounded-2xl p-5 mb-4">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 class="text-lg font-bold text-white">
                                ${escaparHTML(intento.nombre_alumno || 'Alumno sin nombre')}
                            </h3>

                            <p class="text-sm text-slate-400 mt-1">
                                Matrícula: ${escaparHTML(intento.matricula || 'No registrada')}
                            </p>

                            <p class="text-sm text-slate-400">
                                Grupo: ${escaparHTML(intento.grupo || 'No especificado')}
                            </p>
                        </div>

                        <span class="px-3 py-1 rounded-full text-xs font-semibold
                            ${intento.estado_calificacion === 'pendiente'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-green-500/20 text-green-300'}">
                            ${escaparHTML(intento.estado_calificacion || intento.estado || 'Sin estado')}
                        </span>
                    </div>

                    <div class="mt-4 pt-4 border-t border-slate-700">
                        <p class="text-sm text-indigo-300 font-semibold">
                            ${escaparHTML(nombresCuestionarios[intento.cuestionario_id] || 'Cuestionario')}
                        </p>

                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            <div class="bg-slate-800/50 rounded-xl p-3">
                                <p class="text-xs text-slate-400">Calificación</p>
                                <p class="text-xl font-bold text-white">${escaparHTML(calificacion)}</p>
                            </div>

                            <div class="bg-slate-800/50 rounded-xl p-3">
                                <p class="text-xs text-slate-400">Respuestas correctas</p>
                                <p class="text-xl font-bold text-white">
                                    ${intento.respuestas_correctas ?? 0} / ${intento.total_preguntas ?? 0}
                                </p>
                            </div>

                            <div class="bg-slate-800/50 rounded-xl p-3 col-span-2 md:col-span-1">
                                <p class="text-xs text-slate-400">Fecha de inicio</p>
                                <p class="text-sm font-semibold text-white">${escaparHTML(fecha)}</p>
                            </div>
                        </div>
                        <button
    type="button"
    data-ver-respuestas="${intento.id}"
    class="mt-4 w-full px-4 py-2.5 rounded-xl
           bg-indigo-900/30 hover:bg-indigo-800/50
           border border-indigo-700/50
           text-indigo-300 hover:text-indigo-200
           text-sm font-medium transition">
    <i class="fas fa-eye mr-2"></i>
    Ver respuestas del alumno
</button>
                    </div>
                </div>
            `;
        }).join('');

   
        // Abrir el detalle de las respuestas de cada alumno
        contenedor.querySelectorAll('[data-ver-respuestas]').forEach(boton => {
            boton.addEventListener('click', async () => {
                const intentoId = boton.dataset.verRespuestas;

                boton.disabled = true;
                boton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Cargando respuestas...';

                try {
                    const { data: respuestas, error: errorRespuestas } =
                        await supabase
                            .from('respuestas')
                            .select('*')
                            .eq('intento_id', intentoId)
                            .order('respondida_en', { ascending: true });

                    if (errorRespuestas) throw errorRespuestas;

                    if (!respuestas || respuestas.length === 0) {
                        alert('Este alumno todavía no tiene respuestas registradas.');
                        return;
                    }

                    const idsPreguntas = [
                        ...new Set(respuestas.map(r => r.pregunta_id))
                    ];

                    const { data: preguntas, error: errorPreguntas } =
                        await supabase
                            .from('preguntas')
                            .select('*')
                            .in('id', idsPreguntas);

                    if (errorPreguntas) throw errorPreguntas;

                    const preguntasPorId = Object.fromEntries(
                        preguntas.map(p => [p.id, p])
                    );

                    const detalle = respuestas.map((respuesta, indice) => {
                        const pregunta = preguntasPorId[respuesta.pregunta_id];

                        if (!pregunta) {
                            return `
                                <div class="glass-card rounded-xl p-4">
                                    <p class="text-slate-400">
                                        No se encontró la pregunta ${indice + 1}.
                                    </p>
                                </div>
                            `;
                        }

                        let respuestaAlumno = 'Sin respuesta registrada';
                        let respuestaCorrecta = '';

                        if (pregunta.tipo === 'opcion_multiple') {
                            const opciones = pregunta.opciones || [];
                            const seleccion = respuesta.opcion_seleccionada;

                            respuestaAlumno =
                                seleccion !== null && opciones[seleccion] !== undefined
                                    ? opciones[seleccion]
                                    : 'No seleccionó una opción';

                            respuestaCorrecta =
                                opciones[pregunta.respuesta_correcta] || 'No disponible';
                        } else {
                            respuestaAlumno =
                                respuesta.texto_respuesta || 'Sin respuesta escrita';

                            respuestaCorrecta =
                                pregunta.respuesta_esperada || 'No especificada';
                        }

                        return `
                            <div class="glass-card rounded-xl p-4">
                                <h4 class="font-semibold text-white">
                                    Pregunta ${indice + 1}
                                </h4>

                                <p class="text-slate-300 mt-2">
                                    ${escaparHTML(pregunta.enunciado)}
                                </p>

                                <div class="mt-3 p-3 rounded-lg bg-slate-800/60">
                                    <p class="text-xs text-slate-400 mb-1">
                                        Respuesta del alumno
                                    </p>
                                    <p class="text-white">
                                        ${escaparHTML(String(respuestaAlumno))}
                                    </p>
                                </div>

                                <div class="mt-2 p-3 rounded-lg bg-green-900/20">
                                    <p class="text-xs text-green-400 mb-1">
                                        ${pregunta.tipo === 'opcion_multiple'
                                            ? 'Respuesta correcta'
                                            : 'Respuesta esperada'}
                                    </p>
                                    <p class="text-green-200">
                                        ${escaparHTML(String(respuestaCorrecta))}
                                    </p>
                                </div>

                                <div class="flex flex-wrap justify-between gap-2 mt-3 text-sm">
                                    <span class="text-slate-400">
                                        Puntos: ${respuesta.puntos_obtenidos ?? 'Pendientes'}
                                        / ${pregunta.puntos_maximos}
                                    </span>

                                    <span class="${
                                        respuesta.estado_calificacion === 'pendiente'
                                            ? 'text-yellow-300'
                                            : 'text-green-300'
                                    }">
                                        ${escaparHTML(respuesta.estado_calificacion || 'Sin estado')}
                                    </span>
                                </div>

                                ${respuesta.retroalimentacion ? `
                                    <p class="text-sm text-slate-400 mt-3">
                                        Retroalimentación:
                                        ${escaparHTML(respuesta.retroalimentacion)}
                                    </p>
                                ` : ''}

                                ${pregunta.tipo === 'abierta' ? `
                                    <form data-calificar-respuesta="${respuesta.id}"
                                          class="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-700/40">

                                        <h5 class="text-white font-semibold mb-3">
                                            Calificación manual
                                        </h5>

                                        <label class="block text-sm text-slate-300 mb-2">
                                            Puntos obtenidos (máximo: ${Number(pregunta.puntos_maximos)})
                                        </label>

                                        <input
                                            type="number"
                                            name="puntos"
                                            min="0"
                                            max="${Number(pregunta.puntos_maximos)}"
                                            step="0.01"
                                            value="${respuesta.puntos_obtenidos ?? ''}"
                                            required
                                            class="w-full rounded-lg bg-slate-800 border border-slate-600 text-white p-3 mb-3">

                                        <label class="block text-sm text-slate-300 mb-2">
                                            Retroalimentación para el alumno
                                        </label>

                                        <textarea
                                            name="retroalimentacion"
                                            rows="3"
                                            class="w-full rounded-lg bg-slate-800 border border-slate-600 text-white p-3 mb-3"
                                            placeholder="Escribe tus observaciones...">${escaparHTML(respuesta.retroalimentacion || '')}</textarea>

                                        <button
                                            type="submit"
                                            class="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 transition">
                                            Guardar calificación
                                        </button>

                                        <p data-mensaje-calificacion
                                           class="text-sm mt-3"
                                           aria-live="polite"></p>
                                    </form>
                                ` : ''}
                            </div>
                        `;
                    }).join('');

                    const ventana = document.createElement('div');

                    ventana.className =
                        'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4';

                    ventana.innerHTML = `
                        <div class="glass-card w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6">

                            <div class="flex items-center justify-between gap-3 mb-5">
                                <h3 class="text-xl font-bold text-white">
                                    Respuestas del alumno
                                </h3>

                                <button
                                    type="button"
                                    data-cerrar-detalle
                                    class="text-slate-400 hover:text-white text-2xl">
                                    &times;
                                </button>
                            </div>

                            <div class="space-y-4">
                                ${detalle}
                            </div>
                        </div>
                    `;

                    document.body.appendChild(ventana);

                    ventana.querySelector('[data-cerrar-detalle]')
                        .addEventListener('click', () => ventana.remove());

                    ventana.addEventListener('click', evento => {
                        if (evento.target === ventana) ventana.remove();
                    });

                    // Guardar calificaciones manuales
                    ventana.querySelectorAll('[data-calificar-respuesta]')
                        .forEach(formulario => {

                            formulario.addEventListener('submit', async evento => {
                                evento.preventDefault();

                                const botonGuardar =
                                    formulario.querySelector('button[type="submit"]');

                                const mensaje =
                                    formulario.querySelector('[data-mensaje-calificacion]');

                                const inputPuntos =
                                    formulario.querySelector('[name="puntos"]');

                                const textarea =
                                    formulario.querySelector('[name="retroalimentacion"]');

                                const puntos = Number(inputPuntos.value);
                                const maximo = Number(inputPuntos.max);
                                const retroalimentacion = textarea.value.trim();

                                if (
                                    inputPuntos.value === '' ||
                                    !Number.isFinite(puntos) ||
                                    puntos < 0 ||
                                    puntos > maximo
                                ) {
                                    mensaje.textContent =
                                        `Los puntos deben estar entre 0 y ${maximo}.`;
                                    mensaje.className = 'text-sm mt-3 text-red-300';
                                    return;
                                }

                                botonGuardar.disabled = true;
                                botonGuardar.textContent = 'Guardando...';

                                try {
                                    const { data, error } = await supabase.rpc(
                                        'calificar_respuesta_abierta',
                                        {
                                            p_respuesta_id: formulario.dataset.calificarRespuesta,
                                            p_puntos: puntos,
                                            p_retroalimentacion: retroalimentacion
                                        }
                                    );

                                    if (error) throw error;

                                    mensaje.textContent =
                                        data?.mensaje || 'Calificación guardada correctamente.';

                                    mensaje.className =
                                        'text-sm mt-3 text-green-300';

                                    botonGuardar.textContent = 'Calificación guardada';

                                    // Actualizar el estado visual de la respuesta.
                                    const tarjeta = formulario.closest('.glass-card');

                                    if (tarjeta) {
                                        const estado = tarjeta.querySelector('.flex.flex-wrap span:last-child');

                                        if (estado) {
                                            estado.textContent = 'calificada';
                                            estado.className = 'text-green-300';
                                        }
                                    }

                                } catch (error) {
                                    console.error('Error al guardar calificación:', error);

                                    mensaje.textContent =
                                        'No se pudo guardar: ' + error.message;

                                    mensaje.className =
                                        'text-sm mt-3 text-red-300';

                                    botonGuardar.disabled = false;
                                    botonGuardar.textContent = 'Guardar calificación';
                                }
                            });
                        });

                } catch (error) {
                    console.error('Error al consultar respuestas:', error);

                    alert('No se pudieron cargar las respuestas: ' + error.message);

                } finally {
                    if (boton.isConnected) {
                        boton.disabled = false;
                        boton.innerHTML =
                            '<i class="fas fa-eye mr-2"></i>Ver respuestas del alumno';
                    }
                }
            });
        });

    } catch (error) {

        console.error('Error al cargar resultados:', error);

        contenedor.innerHTML = `
            <div class="glass-card rounded-2xl p-5 border border-red-500/30">
                <p class="text-red-300 font-semibold">
                    No se pudieron cargar los resultados.
                </p>
                <p class="text-sm text-slate-400 mt-2">
                    ${escaparHTML(error.message)}
                </p>
            </div>
        `;
    }
});



// Botón de configuración

btnConfiguracion.addEventListener('click', async () => {
    contenido.innerHTML = `
        <div class="space-y-6">

            <div>
                <h2 class="text-2xl font-bold text-white">
                    Configuración
                </h2>
                <p class="text-slate-400 mt-1">
                    Administra tu cuenta y personaliza tus preferencias.
                </p>
            </div>

            <!-- SEGURIDAD -->
            <section class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div class="flex items-center gap-3 mb-4">
                    <i class="fa-solid fa-shield-halved text-indigo-400 text-xl"></i>
                    <div>
                        <h3 class="text-lg font-semibold text-white">
                            Seguridad de la cuenta
                        </h3>
                        <p class="text-sm text-slate-400">
                            Administra tu contraseña y acceso.
                        </p>
                    </div>
                </div>

                <form id="formCambiarContrasena" class="space-y-4">
                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Contraseña actual
                        </label>
                        <input
                            type="password"
                            name="contrasenaActual"
                            required
                            autocomplete="current-password"
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        >
                    </div>

                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            name="nuevaContrasena"
                            required
                            minlength="8"
                            autocomplete="new-password"
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        >
                    </div>

                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Confirmar nueva contraseña
                        </label>
                        <input
                            type="password"
                            name="confirmarContrasena"
                            required
                            minlength="8"
                            autocomplete="new-password"
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        >
                    </div>

                    <button
                        type="submit"
                        class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition"
                    >
                        Cambiar contraseña
                    </button>

                    <p id="mensajeContrasena" class="text-sm"></p>
                </form>

                <div class="border-t border-slate-700 mt-5 pt-4">
                    <button
                        id="btnCerrarSesionConfiguracion"
                        type="button"
                        class="text-red-400 hover:text-red-300 font-medium"
                    >
                        <i class="fa-solid fa-right-from-bracket mr-2"></i>
                        Cerrar sesión
                    </button>
                </div>
            </section>

            <!-- PERFIL -->
            <section class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div class="flex items-center gap-3 mb-4">
                    <i class="fa-solid fa-user text-indigo-400 text-xl"></i>
                    <div>
                        <h3 class="text-lg font-semibold text-white">
                            Información del profesor
                        </h3>
                        <p class="text-sm text-slate-400">
                            Consulta y modifica tu información personal.
                        </p>
                    </div>
                </div>

                <form id="formPerfilProfesor" class="space-y-4">
                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Nombre de visualización
                        </label>
                        <input
                            type="text"
                            name="nombreProfesor"
                            id="nombreProfesorConfiguracion"
                            required
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        >
                    </div>

                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            id="correoProfesorConfiguracion"
                            disabled
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed"
                        >
                    </div>

                    <button
                        type="submit"
                        class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition"
                    >
                        Guardar información
                    </button>

                    <p id="mensajePerfilProfesor" class="text-sm"></p>
                </form>
            </section>

            <!-- PREFERENCIAS -->
            <section class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div class="flex items-center gap-3 mb-4">
                    <i class="fa-solid fa-sliders text-indigo-400 text-xl"></i>
                    <div>
                        <h3 class="text-lg font-semibold text-white">
                            Preferencias de cuestionarios
                        </h3>
                        <p class="text-sm text-slate-400">
                            Define los valores iniciales para tus nuevos cuestionarios.
                        </p>
                    </div>
                </div>

                <form id="formPreferenciasProfesor" class="space-y-4">

                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Tiempo predeterminado (minutos)
                        </label>
                        <input
                            type="number"
                            name="tiempoPredeterminado"
                            min="1"
                            max="300"
                            value="30"
                            required
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        >
                    </div>

                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Dificultad predeterminada
                        </label>
                        <select
                            name="dificultadPredeterminada"
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        >
                            <option value="facil">Fácil</option>
                            <option value="media" selected>Media</option>
                            <option value="dificil">Difícil</option>
                            <option value="mixta">Mixta</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Nivel educativo predeterminado
                        </label>
                        <select
                            name="nivelEducativoPredeterminado"
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        >
                            <option value="">Seleccionar nivel</option>
                            <option value="Primaria 1">Primaria 1</option>
                            <option value="Primaria 2">Primaria 2</option>
                            <option value="Primaria 3">Primaria 3</option>
                            <option value="Primaria 4">Primaria 4</option>
                            <option value="Primaria 5">Primaria 5</option>
                            <option value="Primaria 6">Primaria 6</option>
                            <option value="Secundaria 1">Secundaria 1</option>
                            <option value="Secundaria 2">Secundaria 2</option>
                            <option value="Secundaria 3">Secundaria 3</option>
                            <option value="Preparatoria">Preparatoria</option>
                            <option value="Universidad">Universidad</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm text-slate-300 mb-1">
                            Calificación de preguntas abiertas
                        </label>
                        <select
                            name="metodoCalificacion"
                            class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        >
                            <option value="manual">Manual</option>
                            <option value="ia">Asistida por inteligencia artificial</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition"
                    >
                        Guardar preferencias
                    </button>

                    <p id="mensajePreferenciasProfesor" class="text-sm"></p>
                </form>
            </section>

            <!-- AYUDA -->
            <section class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div class="flex items-center gap-3 mb-4">
                    <i class="fa-solid fa-circle-info text-indigo-400 text-xl"></i>
                    <div>
                        <h3 class="text-lg font-semibold text-white">
                            Ayuda e información
                        </h3>
                        <p class="text-sm text-slate-400">
                            Información general de la plataforma.
                        </p>
                    </div>
                </div>

                <div class="space-y-3 text-sm text-slate-300">
                    <div>
                        <h4 class="font-semibold text-white">Instrucciones de uso</h4>
                        <p class="text-slate-400">
                            Desde el panel puedes administrar tus clases,
                            crear cuestionarios, agregar preguntas y consultar resultados.
                        </p>
                    </div>

                    <div>
                        <h4 class="font-semibold text-white">Acerca de la plataforma</h4>
                        <p class="text-slate-400">
                            Plataforma educativa para la creación, aplicación y evaluación
                            de cuestionarios con apoyo de inteligencia artificial.
                        </p>
                    </div>

                    <div>
                        <h4 class="font-semibold text-white">Versión del sistema</h4>
                        <p class="text-slate-400">Versión 1.0</p>
                    </div>
                </div>
            </section>

        </div>
    `;

    // Cargar información actual del profesor
    const inputNombre = document.getElementById('nombreProfesorConfiguracion');
    const inputCorreo = document.getElementById('correoProfesorConfiguracion');

    const formPerfil = document.getElementById('formPerfilProfesor');
    const mensajePerfil = document.getElementById('mensajePerfilProfesor');

    if (profesorActual) {
        inputNombre.value = profesorActual.nombre || '';
        inputCorreo.value = profesorActual.correo || '';
    }

    // Guardar cambios del perfil
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoNombre = inputNombre.value.trim();

        if (nuevoNombre.length < 2 || nuevoNombre.length > 80) {
            mensajePerfil.textContent = 'El nombre debe tener entre 2 y 80 caracteres.';
            mensajePerfil.className = 'text-sm text-red-400';
            return;
        }

        const botonGuardar = formPerfil.querySelector('button[type="submit"]');
        botonGuardar.disabled = true;
        botonGuardar.textContent = 'Guardando...';

        try {
            const { data, error } = await supabase.rpc(
                'actualizar_nombre_profesor',
                {
                    p_nombre: nuevoNombre
                }
            );

            if (error) throw error;

            if (!data || !data.exito) {
                throw new Error('No se pudo actualizar el nombre.');
            }

            // Actualizar los datos locales
            profesorActual.nombre = nuevoNombre;

            mensajePerfil.textContent = 'Nombre actualizado correctamente.';
            mensajePerfil.className = 'text-sm text-green-400';

        } catch (error) {
            console.error('Error al actualizar el perfil:', error);

            mensajePerfil.textContent =
                error.message || 'No se pudo actualizar el nombre.';

            mensajePerfil.className = 'text-sm text-red-400';

        } finally {
            botonGuardar.disabled = false;
            botonGuardar.textContent = 'Guardar información';
        }
    });

    // Cambiar contraseña del profesor
    const formContrasena = document.getElementById('formCambiarContrasena');
    const mensajeContrasena = document.getElementById('mensajeContrasena');

    formContrasena.addEventListener('submit', async (e) => {
        e.preventDefault();

        const contrasenaActual =
            formContrasena.elements.contrasenaActual.value;

        const nuevaContrasena =
            formContrasena.elements.nuevaContrasena.value;

        const confirmarContrasena =
            formContrasena.elements.confirmarContrasena.value;

        if (nuevaContrasena.length < 8) {
            mensajeContrasena.textContent =
                'La nueva contraseña debe tener al menos 8 caracteres.';
            mensajeContrasena.className = 'text-sm text-red-400';
            return;
        }

        if (nuevaContrasena !== confirmarContrasena) {
            mensajeContrasena.textContent =
                'Las nuevas contraseñas no coinciden.';
            mensajeContrasena.className = 'text-sm text-red-400';
            return;
        }

        if (contrasenaActual === nuevaContrasena) {
            mensajeContrasena.textContent =
                'La nueva contraseña debe ser diferente a la actual.';
            mensajeContrasena.className = 'text-sm text-red-400';
            return;
        }

        const boton = formContrasena.querySelector('button[type="submit"]');
        boton.disabled = true;
        boton.textContent = 'Verificando...';

        try {
            // Obtener el correo de la sesión actual
            const { data: { user }, error: errorUsuario } =
                await supabase.auth.getUser();

            if (errorUsuario || !user || !user.email) {
                throw new Error('No se pudo verificar la sesión del profesor.');
            }

            // Comprobar la contraseña actual
            const { error: errorVerificacion } =
                await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: contrasenaActual
                });

            if (errorVerificacion) {
                throw new Error('La contraseña actual es incorrecta.');
            }

            boton.textContent = 'Actualizando...';

            // Guardar la nueva contraseña
            const { error: errorActualizacion } =
                await supabase.auth.updateUser({
                    password: nuevaContrasena
                });

            if (errorActualizacion) {
                throw errorActualizacion;
            }

            mensajeContrasena.textContent =
                'Contraseña actualizada correctamente.';

            mensajeContrasena.className = 'text-sm text-green-400';

            formContrasena.reset();

        } catch (error) {
            console.error('Error al cambiar contraseña:', error);

            mensajeContrasena.textContent =
                error.message || 'No se pudo cambiar la contraseña.';

            mensajeContrasena.className = 'text-sm text-red-400';

        } finally {
            boton.disabled = false;
            boton.textContent = 'Cambiar contraseña';
        }
    });
    // Cerrar sesión desde Configuración
const btnCerrarSesionConfiguracion = document.getElementById(
    'btnCerrarSesionConfiguracion'
);

btnCerrarSesionConfiguracion.addEventListener('click', async () => {
    btnCerrarSesionConfiguracion.disabled = true;
    btnCerrarSesionConfiguracion.textContent = 'Cerrando sesión...';

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Error al cerrar sesión:', error);
        alert('No fue posible cerrar la sesión.');

        btnCerrarSesionConfiguracion.disabled = false;
        btnCerrarSesionConfiguracion.textContent = 'Cerrar sesión';
        return;
    }

    window.location.href = 'login.html';
});
// Preferencias del profesor
const formPreferencias = document.getElementById('formPreferenciasProfesor');

const inputTiempo = formPreferencias.elements.namedItem('tiempoPredeterminado');
const inputDificultad = formPreferencias.elements.namedItem('dificultadPredeterminada');
const inputNivel = formPreferencias.elements.namedItem('nivelEducativoPredeterminado');
const inputMetodo = formPreferencias.elements.namedItem('metodoCalificacion');

const mensajePreferencias = document.getElementById('mensajePreferenciasProfesor');
// Cargar preferencias guardadas
try {
    const { data: preferencias, error } = await supabase
        .from('preferencias_profesor')
        .select(`
            tiempo_predeterminado_minutos,
            dificultad_predeterminada,
            nivel_educativo_predeterminado,
            metodo_calificacion_abiertas
        `)
        .eq('profesor_id', profesorActual.id)
        .maybeSingle();

    if (error) throw error;

    if (preferencias) {
        inputTiempo.value = preferencias.tiempo_predeterminado_minutos;
        inputDificultad.value = preferencias.dificultad_predeterminada;
        inputNivel.value = preferencias.nivel_educativo_predeterminado || '';
        inputMetodo.value = preferencias.metodo_calificacion_abiertas;
    }

} catch (error) {
    console.error('Error al cargar las preferencias:', error);

    mensajePreferencias.textContent =
        'Error: ' + (error.message || 'Error desconocido');

    mensajePreferencias.className = 'text-sm text-red-400';
}

// Guardar preferencias
formPreferencias.addEventListener('submit', async (e) => {
    e.preventDefault();

    const tiempo = Number(inputTiempo.value);
    const dificultad = inputDificultad.value;
    const nivel = inputNivel.value;
    const metodo = inputMetodo.value;

    if (!Number.isInteger(tiempo) || tiempo < 1 || tiempo > 300) {
        mensajePreferencias.textContent =
            'El tiempo debe estar entre 1 y 300 minutos.';
        mensajePreferencias.className = 'text-sm text-red-400';
        return;
    }

    const boton = formPreferencias.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = 'Guardando...';

    try {
        const { error } = await supabase
            .from('preferencias_profesor')
            .upsert({
                profesor_id: profesorActual.id,
                tiempo_predeterminado_minutos: tiempo,
                dificultad_predeterminada: dificultad,
                nivel_educativo_predeterminado: nivel || null,
                metodo_calificacion_abiertas: metodo,
                actualizado_en: new Date().toISOString()
            }, {
                onConflict: 'profesor_id'
            });

        if (error) throw error;

        mensajePreferencias.textContent =
            'Preferencias guardadas correctamente.';
        mensajePreferencias.className = 'text-sm text-green-400';

    } catch (error) {
        console.error('Error al guardar las preferencias:', error);

        mensajePreferencias.textContent =
            error.message || 'No se pudieron guardar las preferencias.';
        mensajePreferencias.className = 'text-sm text-red-400';

    } finally {
        boton.disabled = false;
        boton.textContent = 'Guardar preferencias';
    }
});
});


// Cerrar sesión
btnCerrarSesion.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Error al cerrar sesión:', error);
        alert('No fue posible cerrar la sesión.');
        return;
    }

    window.location.href = 'login.html';
});

// Iniciar verificación
verificarProfesor();