const container = document.getElementById('speakers-container');

async function initApp() {
    try {
        const cacheBuster = "?t=" + new Date().getTime();
        // Quitamos el "../" asumiendo que "Datos" está en la raíz junto a index.html
        const response = await fetch('Datos/speakers.json' + cacheBuster);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        container.innerHTML = ''; 

        data.forEach(ponente => {
            const card = createSpeakerCard(ponente);
            container.insertAdjacentHTML('beforeend', card);
        });

    } catch (error) {
        console.error("Error al cargar los ponentes:", error);
        container.innerHTML = `<h2 style="color: red; text-align: center;">Error: No se encuentra el JSON.</h2>`;
    }
}


    // 2. Construimos el HTML con la estructura EXACTA del CSS antiguo
function createSpeakerCard(p) {
    const linkIn = p.redes?.linkedin || "#";
    const linkIg = p.redes?.instagram || "#";

    // 1. Gestionar la HORA dinámica
    const horaVisual = p.hora || '18:45'; 

    // 2. Gestionar la FECHA dinámica
    let diaVisual = "26";
    let mesVisual = ".03";

    if (p.fecha) {
        // p.fecha viene como "2026-03-28" -> lo dividimos
        const partes = p.fecha.split('-'); 
        diaVisual = partes[2];      // "28"
        mesVisual = "." + partes[1]; // ".03"
    }

    return `
        <article class="expert-row">
            <div class="expert-info">
                <h3 class="expert-name">${p.nombre.replace(' ', '<br> ')}</h3>
                <p class="expert-subtitle">${p.rol}</p>
                <p class="expert-desc">${p.bio}</p>
                <div class="expert-socials">
                    <a href="${linkIg}" class="social-btn" target="_blank">INSTAGRAM</a>
                    <a href="${linkIn}" class="social-btn" target="_blank">LINKEDIN</a>
                </div>
            </div>
            
            <div class="expert-visual">
                <div class="date-side">
                    <span class="date-time">${horaVisual}</span>
                    <span class="date-day">${diaVisual}</span>
                    <span class="date-month">${mesVisual}</span>
                </div>
                <img src="${p.imagenFondo}" alt="${p.nombre}" class="expert-poster">
            </div>
        </article>
    `;
}

initApp();
