
document.addEventListener("DOMContentLoaded", () => { 
    const fechaInput = document.getElementById("fecha");
    const horaRange = document.getElementById("horaRange");
    const horaSeleccionadaText = document.getElementById("horaSeleccionada");
    const contenedorPeliculas = document.getElementById("contenedorPeliculas");
    const mapaSeccion = document.getElementById("mapaSeccion");
    const mapaAsientos = document.getElementById("mapaAsientos");
    const agregarCarritoBtn = document.getElementById("agregarCarrito");

    // Modal de Bootstrap para la selección de boletos 
    const modal = new bootstrap.Modal(document.getElementById("modalBoletos"));

    let boletosSeleccionados = 1;
    let asientosSeleccionados = [];
    let peliculaSeleccionada = null;
    let funcionSeleccionada = null;
    let fechaSelecionada = new Date();
    let maxDias = 7;
    let asientosTotales = [];
    let mapa = {
        "Mon":"Lunes","Tue":"Martes","Wed":"Miércoles",
        "Thu":"Jueves","Fri":"Viernes","Sat":"Sábado","Sun":"Domingo"
    };
    fechaSelecionada = toDateInputValue(new Date());
    let asientosOcupados = JSON.parse(localStorage.getItem('asientosOcupados')) || {};

    // Fecha actual y máximo 7 días
    const hoy = new Date();
    const max = new Date();
    max.setDate(hoy.getDate() + maxDias);
    fechaInput.value = toDateInputValue(hoy);
    fechaInput.min = toDateInputValue(hoy);
    fechaInput.max = toDateInputValue(max);

    // Función para generar horarios aleatorios
    function generarHorariosDia() {
        const cantidad = Math.floor(Math.random()*3)+2; // 2 a 4 horarios
        const horarios = [];
        for(let i=0;i<cantidad;i++){
            const hora = Math.floor(Math.random()*9)+12; // entre 12 y 20
            const minuto = Math.random()<0.5?"00":"30";
            horarios.push(`${hora}:${minuto}`);
        }
        horarios.sort();
        return horarios;
    }

    // Base de películas simple
    const peliculasSimples = [
        { id: 1, titulo: "IT", info: "Terror - 2h 50m", poster: "img/posters/it.jpg" },
        { id: 2, titulo: "Avengers: Endgame", info: "Superhéroes, Acción - 3h 6m", poster: "img/posters/endgame.jpg" },
        { id: 3, titulo: "Avatar", info: "Acción, Fantasía - 2h 42min", poster: "img/posters/avatar.jpg" },
        { id: 4, titulo: "Harry Potter y el Cáliz de Fuego", info: "Fantasía, Acción - 2h 38min", poster: "img/posters/harrypotter.jpg" },
        { id: 5, titulo: "The Whale", info: "Drama - 1h 56min", poster: "img/posters/ballena.jpg" },
        { id: 6, titulo: "Pokémon: Detective Pikachu", info: "Familiar, Acción - 1h 45min", poster: "img/posters/pikachu.jpg" },
        { id: 7, titulo: "Spider-Man: No Way Home", info: "Superhéroes, Acción - 2h 28min", poster: "img/posters/spiderman.jpg" },
        { id: 8, titulo: "Pixeles", info: "Comedia, Familiar - 1h 46min", poster: "img/posters/pixeles.jpg" }
    ];

    // Horarios fijos
    let peliculas;
    const horariosGuardados = JSON.parse(localStorage.getItem("horariosPeliculas"));
    if(horariosGuardados){
        // Si ya existen horarios guardados, los usamos
        peliculas = horariosGuardados;
    } else {
        // Si no existen, generamos horarios y los guardamos
        peliculas = peliculasSimples.map(peli=>{
            const horariosPorFecha = {};
            for(let i=0;i<=maxDias;i++){
                const fecha = new Date();
                fecha.setDate(hoy.getDate()+i);
                const fechaStr = toDateInputValue(fecha);  // <-- usar local
                horariosPorFecha[fechaStr] = generarHorariosDia();
            }
            return {...peli, horarios: horariosPorFecha};
        });
        localStorage.setItem("horariosPeliculas", JSON.stringify(peliculas));
    }

  // Leer parámetro de URL
    const params = new URLSearchParams(window.location.search);
    const peliculaParam = params.get('pelicula');

    function mostrarAlerta(mensaje, tipo="success"){
        if(!mensaje) return;
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show text-center`;
        alertDiv.innerHTML = `${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        alertDiv.style.position='fixed';
        alertDiv.style.top='20px';
        alertDiv.style.left='50%';
        alertDiv.style.transform='translateX(-50%)';
        alertDiv.style.zIndex='1050';
        alertDiv.style.width='90%';
        alertDiv.style.maxWidth='600px';
        document.body.appendChild(alertDiv);
        setTimeout(()=>{if(alertDiv.parentNode)new bootstrap.Alert(alertDiv).close();},5000);
    }

    // Función para mostrar películas filtradas por hora y fecha
    function mostrarPeliculas(filtroHora=null, fecha=null){
        contenedorPeliculas.innerHTML="";
       const fechaKey = fecha ? fecha : toDateInputValue(new Date());

        peliculas.forEach(peli=>{
            if(peliculaParam && peli.titulo!==peliculaParam) return; // Filtra si hay parámetro

            const funcionesDia = peli.horarios[fechaKey]||[];
            const funcionesFiltradas = filtroHora!==null ? funcionesDia.filter(f=>parseInt(f.split(":")[0])>=filtroHora) : funcionesDia;
            if(funcionesFiltradas.length===0) return;

            // Se crea cada elemento de lista de película      
            const li=document.createElement("li");
            li.className="list-group-item d-flex flex-column flex-md-row align-items-md-start justify-content-between mb-3";
               // HTML interno de cada película   
            li.innerHTML=`<div class="d-flex align-items-start gap-3">
                <img src="${peli.poster}" alt="${peli.titulo}" class="img-fluid rounded" style="width:150px; height:auto;">
                <div>
                    <h4>${peli.titulo}</h4>
                    <p class="text-muted">${peli.info}</p>
                    <div class="d-flex flex-wrap gap-2 mt-2" id="funciones-${peli.id}"></div>
                </div>
            </div>`;
            contenedorPeliculas.appendChild(li);

            // Filtrar funciones según la hora seleccionada    
            const listaFunciones = li.querySelector(`#funciones-${peli.id}`);

             // botones para cada función
            funcionesFiltradas.forEach(hora=>{
                const btn = document.createElement("button");
                btn.className="btn btn-outline-primary btn-sm";
                btn.textContent=hora;
                btn.addEventListener("click",()=>seleccionarFuncion(peli,hora,fechaKey));
                listaFunciones.appendChild(btn);
            });
        });
    }

    // Mostrar películas iniciales
    const horaActual=new Date().getHours();
    horaRange.value=horaActual;
    horaSeleccionadaText.textContent=`Desde las ${horaActual}:00`;
    mostrarPeliculas(horaActual, toDateInputValue(new Date()));

    // Evento cambio barra hora
    horaRange.addEventListener("input",()=>{
        const hora=parseInt(horaRange.value);
        horaSeleccionadaText.textContent=hora===0?"Todas las horas":`Desde las ${hora}:00`;
        mostrarPeliculas(hora===0?null:hora, fechaSelecionada);
    });

   /** 
   * Función para seleccionar una Funcion
   * Se ejecuta al seleccionar una función de una película.
   * Inicializa los boletos, limpia asientos seleccionados
   * y muestra el modal con información de la película.
   */

    function seleccionarFuncion(peli,hora,fecha){

    /*Crear div donde se pondra esto,  */
        peliculaSeleccionada=peli;
        funcionSeleccionada=hora;
        fechaSelecionada=fecha;
        asientosSeleccionados=[];
        mostrarAlerta("", ""); 
        document.getElementById("infoPeliculaModal").innerHTML=`<strong>Fecha:</strong> ${fechaSelecionada} <br>
        <strong>Película:</strong> ${peli.titulo} <br>
        <strong>Función:</strong> ${hora} <br>`;
        mapaSeccion.style.display="none";
        modal.show();
        mostrarMapaAsientos();
    }

    //Muestra el mapa de asientos con Boostrap Grid
    function mostrarMapaAsientos(){
        mapaAsientos.innerHTML=""; // Limpiar mapa
        mapaSeccion.style.display="block"; // Mostrar sección de mapa
        asientosSeleccionados=[];
        if(!asientosOcupados[peliculaSeleccionada.id]) asientosOcupados[peliculaSeleccionada.id]={};
        if(!asientosOcupados[peliculaSeleccionada.id][funcionSeleccionada]) asientosOcupados[peliculaSeleccionada.id][funcionSeleccionada]=[];
        const ocupados = asientosOcupados[peliculaSeleccionada.id][funcionSeleccionada];

        for(let f=0;f<6;f++){
            const rowDiv=document.createElement("div");
            rowDiv.className="row mb-2"; // Cada fila con margen inferior
            for(let c=0;c<8;c++){
                const colDiv=document.createElement("div");
                colDiv.className="col-auto"; // Ajusta al ancho del contenido
                const asiento=document.createElement("button");
                const nombreAsiento=`${String.fromCharCode(65+f)}${c+1}`;
                asiento.textContent=nombreAsiento;
                asiento.style.width="50px";
                asiento.style.height="40px";
                if(ocupados.includes(nombreAsiento)){
                    asiento.className="btn btn-danger";
                    asiento.disabled=true;
                }else{
                    asiento.className="btn btn-outline-success";
                }
                asiento.addEventListener("click",()=>seleccionarAsiento(asiento));
                colDiv.appendChild(asiento);
                rowDiv.appendChild(colDiv);
                asientosTotales.push(asiento);
            }
            mapaAsientos.appendChild(rowDiv);
        }
    }

  //Permite seleccionar o deseleccionar un asiento
    function seleccionarAsiento(asiento) {
      boletosSeleccionados+=1;
      if (asiento.classList.contains("btn-primary")) {
        asiento.classList.replace("btn-primary", "btn-outline-success");
        asientosSeleccionados = asientosSeleccionados.filter(a => a !== asiento.textContent);
      } else if (asiento.classList.contains("btn-outline-success") && asientosSeleccionados.length < boletosSeleccionados) {
        asiento.classList.replace("btn-outline-success", "btn-selected");
        asientosSeleccionados.push(asiento.textContent);
      }
    }

    //Al hacer click en el botoón agregar Carrito
    agregarCarritoBtn.addEventListener("click",()=>{
        if(!peliculaSeleccionada || asientosSeleccionados.length===0){
            mostrarAlerta("Selecciona al menos un asiento","danger");
            return;
        }
        // Obtiene el carrito actual desde localStorage; si no existe, se inicializa como un arreglo vacío
        const carrito=JSON.parse(localStorage.getItem("carrito"))||[];
        //Agrega la compra actual al carrito
        // Buscar si ya existe una ficha con misma película, función y fecha
        const existente = carrito.find(boleto =>
            boleto.idPelicula === peliculaSeleccionada.id &&
            boleto.funcion === funcionSeleccionada &&
            boleto.fechaSelecionada === fechaSelecionada
        );
        if (existente) {
            // Evitar duplicar asientos, solo agregar los nuevos
            const nuevosAsientos = asientosSeleccionados.filter(a => !existente.asientos.includes(a));
            existente.asientos.push(...nuevosAsientos);
            existente.cantidad = existente.asientos.length; // actualizar cantidad
        } else {
            // Crear ficha nueva
            carrito.push({
                pelicula: peliculaSeleccionada.titulo,
                idPelicula: peliculaSeleccionada.id,
                funcion: funcionSeleccionada,
                asientos:[...asientosSeleccionados],
                cantidad: asientosSeleccionados.length,
                fechaSelecionada
            });
        }
        // Guarda el carrito actualizado en localStorage
        localStorage.setItem("carrito",JSON.stringify(carrito));
        // Actualiza los asientos ocupados para la película y función correspondiente
        asientosOcupados[peliculaSeleccionada.id][funcionSeleccionada].push(...asientosSeleccionados);
        // Guarda los asientos ocupados actualizados en localStorage
        localStorage.setItem("asientosOcupados",JSON.stringify(asientosOcupados));

        mostrarAlerta(`Se agregaron ${boletosSeleccionados} boletos de "${peliculaSeleccionada.titulo}" (${funcionSeleccionada}) con asientos: ${asientosSeleccionados.join(", ")}`);

        if(!document.getElementById("btnVerCarrito")){
            //Crear botón ver carrito
            const btnCarrito=document.createElement("a");
            btnCarrito.id="btnVerCarrito";
            btnCarrito.href="carrito.html";
            btnCarrito.className="btn btn-info mt-3";
            btnCarrito.textContent="Ver carrito";
              // Agrega el botón al cuerpo del modal de boletos
            document.querySelector("#modalBoletos .modal-body").appendChild(btnCarrito);
        }
      // Oculta la sección del mapa de asientos después de agregar los boletos al carrito
        mapaSeccion.style.display="none";
    });

    // Crear botones de fechas dinámicamente
    const contenedorFechas=document.querySelector(".scroll-container");
    const btnScrollDerecha=document.querySelector(".btnPosterior");
    const btnScrollIzquierda=document.querySelector(".btnPrevio");
    const scrollContainer=document.querySelector('.scroll-container');
    btnScrollDerecha.addEventListener("click",()=>{
        scrollContainer.scrollLeft+=250;
    });
    btnScrollIzquierda.addEventListener("click", () => {
        scrollContainer.scrollLeft-=250;
    });

    /*Obtiene el contenedor de fechas*/
    let btns=[];
    const fechaActual=new Date();
    for(let i=0;i<=maxDias;i++){
        const fecha = new Date();
        fecha.setDate(fechaActual.getDate()+i);
        const fechaStr = toDateInputValue(fecha);
        let fechaLegible = fecha.toDateString().replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/g,m=>mapa[m]);

        const btn=document.createElement("button");
        btn.textContent=fechaLegible;
        btn.className="btn-fecha item";
        btn.dataset.fecha = fechaStr;
        btn.addEventListener('click',()=>{
            //fechaInputPoner.setDate(fechaInputPoner.getDate()-1);
            fechaInput.value = toDateInputValue(fecha);
            btns.forEach(b=>b.classList.remove("activo"));
            btn.classList.add("activo");
            fechaSelecionada=fechaStr;
            const horaActual=new Date().getHours();
            if(i===0){ // si es hoy
                horaRange.value=horaActual;
                horaSeleccionadaText.textContent=`Desde las ${horaActual}:00`;
                mostrarPeliculas(horaActual,fechaStr);
            }else{
                horaRange.value=0;
                horaSeleccionadaText.textContent="Todas las horas";
                mostrarPeliculas(null,fechaStr);
            }
        });
        contenedorFechas.appendChild(btn);
        btns.push(btn);
    }

    fechaInput.addEventListener("change",()=>{
        //quitar el estado de activo del boton seleccionado si lo hay
        btns.forEach(b=>b.classList.remove("activo"));

        // obtener fecha actual
        const hoyStr = toDateInputValue(hoy);
        const horaActual = new Date().getHours();

        //obtener la fecha del input 
        const fechaStr = fechaInput.value; 
        fechaSelecionada = fechaStr;

        //control de fecha puesta en el calendario
        if(fechaStr===hoyStr){ // si es hoy
            horaRange.value=horaActual;
            horaSeleccionadaText.textContent=`Desde las ${horaActual}:00`;
            mostrarPeliculas(horaActual,fechaStr);
            btns[0].classList.add("activo");
        }else{
            btns.forEach(b=>{
                if(b.dataset.fecha === fechaStr){
                    b.classList.add("activo");
                }
            });
            horaRange.value=0;
            horaSeleccionadaText.textContent="Todas las horas";
            mostrarPeliculas(null,fechaStr);
        }

    });
    function toDateInputValue(date) {
        const offset = date.getTimezoneOffset(); // minutos de desfase
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
}

});
