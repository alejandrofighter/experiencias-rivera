const MIN_PERSONAS = 1;
const MAX_PERSONAS = 10;

const nombresCategoria = {
    naturaleza: "Naturaleza",
    cultura: "Cultura",
    aventura: "Aventura",
    gastronomia: "Gastronomía"
};

const experiencias = [
    { id: 1, nombre: "Cenote Dos Ojos, Tulum", categoria: "naturaleza", precio: 350, icono: "&#127754;" },
    { id: 2, nombre: "Zona arqueológica de Tulum", categoria: "cultura", precio: 480, icono: "&#127963;" },
    { id: 3, nombre: "Tirolesas en Xplor, Playa del Carmen", categoria: "aventura", precio: 750, icono: "&#127796;" },
    { id: 4, nombre: "Santuario de tortugas en Akumal", categoria: "naturaleza", precio: 420, icono: "&#128034;" },
    { id: 5, nombre: "Zona arqueológica de Cobá", categoria: "cultura", precio: 550, icono: "&#127963;" },
    { id: 6, nombre: "Kayak en la Laguna de Bacalar", categoria: "aventura", precio: 680, icono: "&#128758;" },
    { id: 7, nombre: "Snorkel en Puerto Morelos", categoria: "naturaleza", precio: 520, icono: "&#128032;" },
    { id: 8, nombre: "Zona arqueológica de Chacchoben", categoria: "cultura", precio: 390, icono: "&#127994;" },
    { id: 9, nombre: "Bicicleta por la selva de Cobá", categoria: "aventura", precio: 450, icono: "&#128693;" },
    { id: 10, nombre: "Buceo en el Gran Cenote", categoria: "aventura", precio: 1100, icono: "&#129343;" },
    { id: 11, nombre: "Tacos de canasta", categoria: "gastronomia", precio: 100, icono: "&#127790;" },
    { id: 12, nombre: "Cochinita pibil", categoria: "gastronomia", precio: 130, icono: "&#127830;" },
    { id: 13, nombre: "Panuchos yucatecos", categoria: "gastronomia", precio: 90, icono: "&#129369;" },
    { id: 14, nombre: "Marquesitas", categoria: "gastronomia", precio: 60, icono: "&#129374;" },
    { id: 15, nombre: "Sopa de lima", categoria: "gastronomia", precio: 110, icono: "&#127858;" }
];

let reservaciones = [];
let siguienteId = 1;
let cantidades = {};
let categoriaActiva = "todas";
let textoBusqueda = "";
let ordenarPorPrecio = false;
let temporizadorAviso;

const catalogo = document.querySelector("#catalogo");
const contador = document.querySelector("#contador");
const botones = document.querySelectorAll("[data-categoria]");
const buscador = document.querySelector("#buscador");
const botonOrdenar = document.querySelector("#ordenar");
const aviso = document.querySelector("#aviso");
const listaReservaciones = document.querySelector("#lista-reservaciones");
const contadorReservaciones = document.querySelector("#contador-reservaciones");
const contadorEnlace = document.querySelector("#contador-enlace");
const botonEliminarTodas = document.querySelector("#eliminar-todas");

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function coincideConBusqueda(campos) {
    const busqueda = normalizar(textoBusqueda.trim());
    return normalizar(campos.join(" ")).includes(busqueda);
}

function coincideConCategoria(categoria) {
    return categoriaActiva === "todas" || categoria === categoriaActiva;
}

function buscarExperiencia(id) {
    return experiencias.find(experiencia => experiencia.id === id);
}

function obtenerCantidad(id) {
    return cantidades[id] || MIN_PERSONAS;
}

function textoPersonas(cantidad) {
    return `${cantidad} persona${cantidad === 1 ? "" : "s"}`;
}

function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 3000);
}

function mostrarExperiencias(lista) {
    if (lista.length === 0) {
        catalogo.innerHTML = `<p class="sin-resultados">No se encontraron experiencias</p>`;
    } else {
        catalogo.innerHTML = lista.map(experiencia => {
            const cantidad = obtenerCantidad(experiencia.id);
            return `
    <article class="tarjeta" data-id="${experiencia.id}">
      <div class="imagen">${experiencia.icono}</div>
      <div class="informacion">
        <span class="etiqueta">${nombresCategoria[experiencia.categoria]}</span>
        <h3>${experiencia.nombre}</h3>
        <p class="precio">$${experiencia.precio} MXN</p>
        <div class="control-personas">
          <span class="texto-personas">Personas <small>(máx. ${MAX_PERSONAS})</small></span>
          <div class="selector">
            <button type="button" class="menos" aria-label="Quitar una persona"${cantidad <= MIN_PERSONAS ? " disabled" : ""}>&minus;</button>
            <input type="number" class="cantidad" min="${MIN_PERSONAS}" max="${MAX_PERSONAS}" value="${cantidad}" inputmode="numeric" aria-label="Número de personas">
            <button type="button" class="mas" aria-label="Agregar una persona"${cantidad >= MAX_PERSONAS ? " disabled" : ""}>+</button>
          </div>
        </div>
        <button type="button" class="boton-reservar">Reservar</button>
      </div>
    </article>`;
        }).join("");
    }

    contador.textContent = `${lista.length} experiencia${lista.length !== 1 ? "s" : ""}`;
}

function mostrarReservaciones() {
    const total = reservaciones.length;

    if (total === 0) {
        listaReservaciones.innerHTML = `<p class="sin-resultados">Aún no hay reservaciones. Elige el número de personas en una tarjeta y presiona Reservar.</p>`;
    } else {
        listaReservaciones.innerHTML = reservaciones.map(reservacion => {
            const experiencia = buscarExperiencia(reservacion.experienciaId);
            const importe = experiencia.precio * reservacion.personas;
            return `
    <article class="reservacion">
      <div>
        <h3>${experiencia.nombre}</h3>
        <p>${textoPersonas(reservacion.personas)} &times; $${experiencia.precio} MXN</p>
        <p class="total">Total: $${importe} MXN</p>
      </div>
      <button type="button" class="peligro boton-eliminar" data-id="${reservacion.id}">Eliminar</button>
    </article>`;
        }).join("");
    }

    contadorReservaciones.textContent = `${total} ${total === 1 ? "reservación" : "reservaciones"}`;
    contadorEnlace.textContent = total;
    botonEliminarTodas.disabled = total === 0;
}

function actualizarVista() {
    const experienciasFiltradas = experiencias.filter(experiencia =>
        coincideConCategoria(experiencia.categoria) &&
        coincideConBusqueda([experiencia.nombre])
    );

    if (ordenarPorPrecio) {
        experienciasFiltradas.sort((a, b) => a.precio - b.precio);
    }

    mostrarExperiencias(experienciasFiltradas);
}

function cambiarCantidad(id, valor, tarjeta) {
    if (valor > MAX_PERSONAS) {
        mostrarAviso(`El máximo es de ${MAX_PERSONAS} personas por reservación.`);
    }

    const cantidad = Math.min(MAX_PERSONAS, Math.max(MIN_PERSONAS, Math.round(valor) || MIN_PERSONAS));
    cantidades[id] = cantidad;

    tarjeta.querySelector(".cantidad").value = cantidad;
    tarjeta.querySelector(".menos").disabled = cantidad <= MIN_PERSONAS;
    tarjeta.querySelector(".mas").disabled = cantidad >= MAX_PERSONAS;
}

function agregarReservacion(id) {
    const personas = obtenerCantidad(id);
    reservaciones.push({ id: siguienteId++, experienciaId: id, personas });
    mostrarReservaciones();
    mostrarAviso(`Reservación agregada: ${buscarExperiencia(id).nombre} (${textoPersonas(personas)}).`);
}

function eliminarReservacion(id) {
    reservaciones = reservaciones.filter(reservacion => reservacion.id !== id);
    mostrarReservaciones();
}

function eliminarTodasLasReservaciones() {
    if (reservaciones.length === 0) return;
    if (!confirm("¿Seguro que quieres eliminar todas las reservaciones?")) return;
    reservaciones = [];
    mostrarReservaciones();
}

botones.forEach(boton => {
    boton.addEventListener("click", () => {
        categoriaActiva = boton.dataset.categoria;
        botones.forEach(b => b.classList.remove("activo"));
        boton.classList.add("activo");
        actualizarVista();
    });
});

buscador.addEventListener("input", () => {
    textoBusqueda = buscador.value;
    actualizarVista();
});

botonOrdenar.addEventListener("click", () => {
    ordenarPorPrecio = !ordenarPorPrecio;
    botonOrdenar.classList.toggle("activo", ordenarPorPrecio);
    botonOrdenar.setAttribute("aria-pressed", ordenarPorPrecio);
    actualizarVista();
});

catalogo.addEventListener("click", evento => {
    const tarjeta = evento.target.closest(".tarjeta");
    if (!tarjeta) return;
    const id = Number(tarjeta.dataset.id);

    if (evento.target.closest(".mas")) {
        cambiarCantidad(id, obtenerCantidad(id) + 1, tarjeta);
    } else if (evento.target.closest(".menos")) {
        cambiarCantidad(id, obtenerCantidad(id) - 1, tarjeta);
    } else if (evento.target.closest(".boton-reservar")) {
        cambiarCantidad(id, Number(tarjeta.querySelector(".cantidad").value), tarjeta);
        agregarReservacion(id);
    }
});

catalogo.addEventListener("change", evento => {
    if (!evento.target.classList.contains("cantidad")) return;
    const tarjeta = evento.target.closest(".tarjeta");
    cambiarCantidad(Number(tarjeta.dataset.id), Number(evento.target.value), tarjeta);
});

listaReservaciones.addEventListener("click", evento => {
    const boton = evento.target.closest(".boton-eliminar");
    if (!boton) return;
    eliminarReservacion(Number(boton.dataset.id));
});

botonEliminarTodas.addEventListener("click", eliminarTodasLasReservaciones);

actualizarVista();
mostrarReservaciones();
