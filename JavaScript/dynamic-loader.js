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
    // 1. Preparamos las redes sociales para que no den error si están vacías
    const linkIn = p.redes?.linkedin || "#";
    const linkIg = p.redes?.instagram || "#";

    // 2. Estructura exacta que pide tu style_antiguo.css
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
                    <span class="date-time">18:45</span>
                    <span class="date-day">26</span>
                    <span class="date-month">.03</span>
                </div>
                <img src="${p.imagenFondo}" alt="${p.nombre}" class="expert-poster" onerror="this.src='https://via.placeholder.com/400x600?text=Imagen+No+Encontrada'">
            </div>
        </article>
    `;
}

initApp();