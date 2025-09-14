const listaBoletos = document.querySelector('#listaBoletos');
const totalCompraEl = document.querySelector('#totalCompra');
const carritoContenido = document.querySelector('#carritoContenido');
const carritoVacio = document.querySelector('#carritoVacio');

const aplicarCuponBtn = document.querySelector('#aplicarCupon');
const cuponInput = document.querySelector('#cupon');
const confirmarCompraBtn = document.querySelector('#confirmarCompra');
const vaciarCarritoBtn = document.getElementById("vaciarCarrito");

const alertContainer = document.querySelector('#alertContainer');

const PRECIO_BOLETO = 80;  // Precio fijo por boleto
let boletos = JSON.parse(localStorage.getItem('carrito')) || []; //Recupera los boletos guardados en el localStorage que tenga la clave "carrito". Si no hay nada guardado, crea un arreglo vacío []
let descuento = 0;

// Mostrar alerta en la página
function mostrarAlerta(mensaje, tipo='success') {
    if(!alertContainer) return;
    alertContainer.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show mt-3 alerta" role="alert">
        <span>${mensaje}</span>
        <button type="button" class="close" data-bs-dismiss="alert" aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-octagon-fill" viewBox="0 0 16 16">
            <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708"/>
          </svg>
        </button>
      </div>
    `;
}

// Mostrar boletos del carrito
function mostrarCarrito() {
    //Si no hay boletos, se oculta el contenido del carrito y se muestra el mensaje de carrito vacío
    if (boletos.length === 0) {
        carritoContenido.style.display = 'none';
        carritoVacio.style.display = 'block';
        return;
    }

    //Si hay boletos, se muestra el contenido del carrito, se oculta el mensaje de carrito vacío y se limpia la lista de boletos para  volver a llenarla
    carritoContenido.style.display = 'block';
    carritoVacio.style.display = 'none';
    listaBoletos.innerHTML = '';

    //Se recorre el arreglo de boletos   
    boletos.forEach((boleto, index) => {
        //Para cada boleto:
        const li = document.createElement('li'); //Se crea una lista
        li.className = 'list-group-item';  //Se le asigna estilo Boostrap
        //Inserta los datos película,función, asientos, cantidad y subtotal
        li.innerHTML = `
            <strong>${boleto.pelicula}</strong> <br>
            Fecha: ${boleto.fechaSelecionada} <br>
            Función: ${boleto.funcion} <br>
            Asientos: ${boleto.asientos.join(", ")} <br>
            Cantidad: ${boleto.asientos.length} <br>
            Subtotal: $${boleto.asientos.length * PRECIO_BOLETO}
        `;
        listaBoletos.appendChild(li); //Se agrega la lista al contenedor de la lista de boletos
    });
    calcularTotal(); //Se calcula el total de la compra
}

// Calcular total con descuento
function calcularTotal() {
    let total = boletos.reduce((sum, b) => sum + (b.asientos.length * PRECIO_BOLETO), 0); //Suma el precio de todos los asientos seleccionados con "reduce"
    total = total - (total * descuento);
    totalCompraEl.textContent = `$${total.toFixed(2)}`;
}

//Al hacer click en aplicar Cupón
aplicarCuponBtn.addEventListener("click", () => {
    if (cuponInput.value.trim().toUpperCase() === "CINE10") {
        descuento = 0.10;
        mostrarAlerta("Cupón aplicado: 10% de descuento", "success");
    } else {
        descuento = 0;
        mostrarAlerta("Cupón inválido", "danger");
    }
    calcularTotal();
});

//Al hacer click en Confirmar Compra
 confirmarCompraBtn.addEventListener("click", () => {
    if (boletos.length === 0) return;

    const cuponAplicado = descuento > 0 ? cuponInput.value.trim().toUpperCase() : "Ninguno";

    let contenido = "CinePlus - Confirmación de Compra\n\n";

    boletos.forEach((b) => {
        const subtotal = b.asientos.length * PRECIO_BOLETO;
        const subtotalConDescuento = subtotal - (subtotal * descuento);
        contenido += `Fecha: ${b.fechaSelecionada}\n`;
        contenido += `Película: ${b.pelicula}\n`;
        contenido += `Función: ${b.funcion}\n`;
        contenido += `Asientos: ${b.asientos.join(", ")}\n`;
        contenido += `Cantidad: ${b.asientos.length} boletos\n`;
        contenido += `Precio Unitario: $${PRECIO_BOLETO}\n`;
        if (descuento > 0) {
            contenido += `Subtotal antes de descuento: $${subtotal.toFixed(2)}\n`;
            contenido += `Subtotal con descuento: $${subtotalConDescuento.toFixed(2)}\n`;
            contenido += `Cupón aplicado: ${cuponAplicado}\n\n`;
        } else {
            contenido += `Total: $${subtotal.toFixed(2)}\n`;
            contenido += `Cupón aplicado: Ninguno\n\n`;
        }
    });

    // Total general con descuento
    const totalGeneral = boletos.reduce((sum, b) => sum + (b.asientos.length * PRECIO_BOLETO), 0);
    const totalConDescuento = totalGeneral - (totalGeneral * descuento);
    contenido += `Total General: $${totalConDescuento.toFixed(2)}\n`;
    contenido += "\nGracias por su compra en CinePlus.\n";

    const archivo = new Blob([contenido], { type: "text/plain" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "Boletos.txt";
    enlace.click();

    // Limpiar carrito
    boletos = [];
    localStorage.removeItem('carrito');
    mostrarCarrito();
    mostrarAlerta("Compra confirmada, se descargó tu Boleto", "success");
});


vaciarCarritoBtn.addEventListener("click", () => {
  // Recuperar asientos ocupados
  let asientosOcupados = JSON.parse(localStorage.getItem("asientosOcupados")) || {};

  // Quitar del registro de ocupados los asientos que estaban en el carrito
  boletos.forEach(boleto => {
    if (
      asientosOcupados[boleto.idPelicula] && 
      asientosOcupados[boleto.idPelicula][boleto.funcion]
    ) {
      asientosOcupados[boleto.idPelicula][boleto.funcion] = 
        asientosOcupados[boleto.idPelicula][boleto.funcion]
          .filter(a => !boleto.asientos.includes(a));
    }
  });

  // Guardar cambios en localStorage
  localStorage.setItem("asientosOcupados", JSON.stringify(asientosOcupados));

  // Limpiar carrito
  localStorage.removeItem("carrito");
  boletos = [];
  mostrarCarrito();
  mostrarAlerta("🗑️ Carrito vaciado y asientos liberados", "warning");
});


// Mostrar carrito al cargar
mostrarCarrito();
