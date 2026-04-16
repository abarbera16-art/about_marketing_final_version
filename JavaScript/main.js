 let fechaSeleccionada = null;



        window.addEventListener('load', () => {

            setTimeout(() => {

                document.getElementById('intro-loader').style.display = 'none';

            }, 3000);

        });



        const btn = document.getElementById('mobile-menu-btn');

        const nav = document.getElementById('main-nav');

       

        btn.onclick = () => {

            nav.classList.toggle('active');

            btn.classList.toggle('active');

        };



        const navLinks = document.querySelectorAll('#main-nav a');

        navLinks.forEach(link => {

            link.addEventListener('click', () => {

                nav.classList.remove('active');

                btn.classList.remove('active');

            });

        });



        const cards = document.querySelectorAll('.video-card');

        const prevBtn = document.getElementById('prevBtn');

        const nextBtn = document.getElementById('nextBtn');

        let currentIndex = 0;



        function updateCarousel() {

            cards.forEach((card, index) => {

                let offset = index - currentIndex;

                const video = card.querySelector('video');

                if (offset !== 0 && !video.paused) video.pause();



                if (Math.abs(offset) > 3) {

                    card.style.opacity = 0;

                    card.style.visibility = 'hidden';

                } else {

                    card.style.opacity = offset === 0 ? 1 : 0.4;

                    card.style.visibility = 'visible';

                    card.style.filter = offset === 0 ? 'none' : 'grayscale(80%) brightness(40%)';

                   

                    let gap = window.innerWidth < 768 ? 40 : 45;

                    let translateX = offset * gap;

                    let translateZ = Math.abs(offset) * -150;

                    let rotateY = offset * -25;



                    card.style.transform = `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;

                    card.style.zIndex = 10 - Math.abs(offset);

                    card.style.pointerEvents = offset === 0 ? 'auto' : 'none';

                }

            });

        }



        nextBtn.onclick = () => { if (currentIndex < cards.length - 1) { currentIndex++; updateCarousel(); } };

        prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; updateCarousel(); } };

        updateCarousel();



        let eventos = JSON.parse(localStorage.getItem("eventos")) || [

            { fecha: "2026-03-26", hora: "18:45", titulo: "Apertura & Registro", lugar: "Recepción de asistentes y bienvenida inmersiva." },

            { fecha: "2026-03-26", hora: "19:15", titulo: "Marketing del Futuro", lugar: "Ponencia magistral sobre IA y psicología del consumidor." },

            { fecha: "2026-03-26", hora: "20:30", titulo: "Workshop: TikTok Ads", lugar: "Taller práctico para escalar marcas en RRSS." },

            { fecha: "2026-03-26", hora: "21:30", titulo: "Networking & Cierre", lugar: "Cóctel y sesión de contactos profesionales." }

        ];



        let mesActual = 2; // marzo (0 = enero)

        let añoActual = 2026;



        function generarCalendario() {

            const calendar = document.getElementById("calendar");

            calendar.innerHTML = "";



            const diasMes = new Date(añoActual, mesActual + 1, 0).getDate();



            for (let i = 1; i <= diasMes; i++) {

                const dia = document.createElement("div");

                dia.classList.add("day");

                dia.textContent = i;



                const fechaActual = `${añoActual}-${String(mesActual + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;



                if (eventos.some(e => e.fecha === fechaActual)) {

                    dia.classList.add("event");

                }

                dia.addEventListener("click", () => {

                    fechaSeleccionada = fechaActual;

                    generarCalendario();

                    renderEventos();

                });

               

                if (fechaSeleccionada === fechaActual) {

                    dia.classList.add("selected");

                }

                calendar.appendChild(dia);

            }

        }



        function renderEventos() {

            const wrapper = document.getElementById("agenda-wrapper");

            wrapper.innerHTML = "";



            let eventosFiltrados = eventos;



            if (fechaSeleccionada) {

                eventosFiltrados = eventos.filter(ev => ev.fecha === fechaSeleccionada);

            }



            if (eventosFiltrados.length === 0) {

                wrapper.innerHTML = "<p style='text-align:center;'>No hay eventos este día</p>";

                return;

            }



            eventosFiltrados.forEach((ev, index) => {

                wrapper.innerHTML += `

                    <article class="agenda-item">

                        <div class="agenda-marker"></div>

                        <div class="agenda-content">

                            <span class="agenda-time">${ev.hora ? ev.hora : ""}</span>

                            <h3>${ev.titulo}</h3>

                            <p>${ev.lugar ? ev.lugar : ""}</p>

                            <button onclick="eliminarEvento(${index})" class="delete-btn">Eliminar</button>

                        </div>

                    </article>

                `;

            });

        }



        function eliminarEvento(index) {

            let eventoAEliminar = null;

            if(fechaSeleccionada) {

               let eventosFiltrados = eventos.filter(ev => ev.fecha === fechaSeleccionada);

               eventoAEliminar = eventosFiltrados[index];

               const realIndex = eventos.indexOf(eventoAEliminar);

               eventos.splice(realIndex, 1);

            } else {

               eventos.splice(index, 1);

            }

           

            localStorage.setItem("eventos", JSON.stringify(eventos));

            generarCalendario();

            renderEventos();

        }



        function agregarEvento() {

            const fecha = document.getElementById("fecha").value;

            const titulo = document.getElementById("titulo").value;

            const hora = document.getElementById("hora").value;

            const lugar = document.getElementById("lugar").value;



            if (!fecha || !titulo) {

                alert("Completa los campos");

                return;

            }



            eventos.push({ fecha, titulo, hora, lugar });

            localStorage.setItem("eventos", JSON.stringify(eventos));



            generarCalendario();

            renderEventos();

        }



        const nombresMes = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];



        function cambiarMes(direccion) {

            mesActual += direccion;



            if (mesActual < 0) {

                mesActual = 11;

                añoActual--;

            }

            if (mesActual > 11) {

                mesActual = 0;

                añoActual++;

            }



            generarCalendario();

            actualizarTextoMes();

        }



        function actualizarTextoMes() {

            document.getElementById("mes-texto").textContent = nombresMes[mesActual] + " " + añoActual;

        }



        generarCalendario();

        renderEventos();

        actualizarTextoMes();
