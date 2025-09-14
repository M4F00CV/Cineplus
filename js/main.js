const contenedorLista = document.querySelector(".contenedor-lista");
const btnMostrar = document.querySelector(".btnMostrar");
const peliculas = document.querySelectorAll('[data-genero]');
let btns = []; // lista global de botones

// Obtener géneros únicos
const generosSet = new Set();
peliculas.forEach(p => {
  p.dataset.genero.split(',').forEach(g => generosSet.add(g.trim()));
});
const generosUnicos = Array.from(generosSet);

// Función para crear un solo botón de género
function crearBoton(genero) {
  const boton = document.createElement("button");
  boton.textContent = genero;
  boton.className = "btn btn-outline-dark btn-sm me-2 mb-2";
  return boton;
}

// Función que asigna eventos y agrega el botón al contenedor
function agregarBotonGenero(boton) {
  boton.addEventListener("click", () => {
    boton.classList.toggle("activo");
    filtrarPeliculas();
  });
  btns.push(boton);
  contenedorLista.appendChild(boton);
}

// Función que filtra las películas según los botones activos
function filtrarPeliculas() {
  const activos = btns.filter(b => b.classList.contains("activo"));
  
  peliculas.forEach(p => {
    if (activos.length === 0) {
      p.classList.remove("oculto-filtro");
    } else {
      const cumple = activos.every(b =>
        p.dataset.genero.toLowerCase().includes(b.textContent.toLowerCase())
      );
      p.classList.toggle("oculto-filtro", !cumple);
    }
  });

  // Aplicar búsqueda después del filtro
  aplicarBusqueda(buscarMain.value);
}

// Función para aplicar búsqueda sobre lo que ya pasó el filtro de género
function aplicarBusqueda(texto) {
  const input = texto.toLowerCase().trim();

  peliculas.forEach(pelicula => {
    const btn = pelicula.querySelector("[data-titulo]");
    const titulo = btn.dataset.titulo.toLowerCase();

    if (input === "") {
      // Mostrar solo si pasa filtro de género
      if (!pelicula.classList.contains("oculto-filtro")) {
        pelicula.classList.remove("oculto");
      } else {
        pelicula.classList.add("oculto");
      }
    } else {
      // Mostrar si pasa filtro de género y coincide con búsqueda
      if (!pelicula.classList.contains("oculto-filtro") && titulo.includes(input)) {
        pelicula.classList.remove("oculto");
      } else {
        pelicula.classList.add("oculto");
      }
    }
  });
}

// Función que crea el botón "Ocultar lista"
function btnOcultar() {
  const btn = document.createElement("button");
  btn.className = "btn btn-success btn-sm me-2 mb-2";
  btn.textContent = "Ocultar Lista";
  btn.classList.add("btnOcultar");
  btn.addEventListener("click", () => {
    contenedorLista.innerHTML = "";
    peliculas.forEach(p => {
      p.classList.remove("oculto");
      p.classList.remove("oculto-filtro");
    });
    btns = [];
  });
  contenedorLista.appendChild(btn);
}

// Evento para mostrar la lista de botones
btnMostrar.addEventListener("click", () => {
  contenedorLista.innerHTML = "";
  btns = [];
  generosUnicos.forEach(g => {
    const boton = crearBoton(g);
    agregarBotonGenero(boton);
  });
  btnOcultar();
});

// Modal
const botonesVerMas = document.querySelectorAll('.ver-mas');
const modalTitulo = document.getElementById('modalTitulo');
const modalSinopsis = document.getElementById('modalSinopsis');
const modalTrailer = document.getElementById('modalTrailer');
const modalElement = document.getElementById('modalPelicula');
const modal = new bootstrap.Modal(modalElement);

botonesVerMas.forEach(boton => {
  boton.addEventListener('click', () => {
    const { titulo, sinopsis, trailer } = boton.dataset;

    modalTitulo.textContent = titulo;
    modalSinopsis.textContent = sinopsis;
    modalTrailer.src = trailer;

    modal.show();
  });
});

modalElement.addEventListener('hidden.bs.modal', () => {
  modalTrailer.src = "";
});

// Fecha mínima
window.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById("fecha").min = hoy;
});

// Buscador
const buscarMain = document.getElementById("busquedaTitulo");
buscarMain.addEventListener("input", e => {
  aplicarBusqueda(e.target.value);
});

/*Tema de contacto */
//Validación Formulario
function validarFormulario() {
  let esValido = true;
  
  // Validar nombre
  const nombreInput = document.getElementById('nombre');
  if (nombreInput.value.trim() === '') {
    nombreInput.classList.add('is-invalid');
    esValido = false;
  } else {
    nombreInput.classList.remove('is-invalid');
  }
  
  // Validar email
  const emailInput = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value)) {
    emailInput.classList.add('is-invalid');
    esValido = false;
  } else {
    emailInput.classList.remove('is-invalid');
  }
  
  // Validar mensaje
  const mensajeInput = document.getElementById('mensaje');
  if (mensajeInput.value.trim() === '') {
    mensajeInput.classList.add('is-invalid');
    esValido = false;
  } else {
    mensajeInput.classList.remove('is-invalid');
  }
  
  if (esValido) {
    mostrarAlertaExito();
    document.getElementById('formularioContacto').reset();
  }
  
  return false; 
}

function limpiarError(input) {
  input.classList.remove('is-invalid');
}

// Mostrar alerta de éxito 
function mostrarAlertaExito() {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success alert-dismissible fade show text-center';
  alertDiv.innerHTML = `
    <h4 class="alert-heading mb-3">¡Mensaje Enviado con Éxito!</h4>
    <p class="mb-4">Tu mensaje ha sido enviado correctamente. Te contactaremos pronto.</p>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '50%';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translate(-50%, -50%)';
  alertDiv.style.zIndex = '1050';
  alertDiv.style.width = '80%';
  alertDiv.style.maxWidth = '600px';
  alertDiv.style.padding = '2rem';
  alertDiv.style.fontSize = '1.2rem';
  alertDiv.style.borderRadius = '15px';
  alertDiv.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    if (alertDiv.parentNode) {
      const bsAlert = new bootstrap.Alert(alertDiv);
      bsAlert.close();
    }
  }, 5000);

  /*Actualizar enlaces de "Elegir función" */
const botonesElegir = document.querySelectorAll('.btn-success');
botonesElegir.forEach(boton => {
  const card = boton.closest('.pelicula');
  const titulo = card.querySelector('[data-titulo]').dataset.titulo;
  boton.href = `funciones.html?pelicula=${encodeURIComponent(titulo)}`;
});
}