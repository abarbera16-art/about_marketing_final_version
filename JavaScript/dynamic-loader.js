const container = document.getElementById('speakers-container');

async function initApp() {
    try {
        const cacheBuster = "?t=" + new Date().getTime();
        const response = await fetch('../Datos/speakers.json' + cacheBuster);
        
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

function createSpeakerCard(p) {
    const etiquetas = p.etiquetas || [];
    const tagsHTML = etiquetas.map(t => `<li class="tag">${t}</li>`).join('');

    // Comprobamos si existen las redes y si no están vacías
    const linkIn = p.redes?.linkedin;
    const linkIg = p.redes?.instagram;

    // Si hay enlace, mostramos el botón. Si está vacío o no existe, lo ocultamos ('none')
    const displayIn = (linkIn && linkIn !== "") ? "inline-block" : "none";
    const displayIg = (linkIg && linkIg !== "") ? "inline-block" : "none";
    
    // Si no tiene ninguna red social en absoluto, ocultamos todo el contenedor
    const mostrarContenedorRedes = (displayIn === "none" && displayIg === "none") ? "none" : "block";

    return `
        <article class="speaker-card">
            <div class="speaker-visual">
                <img src="${p.imagenFondo}" alt="${p.nombre}" class="aesthetic-img" loading="lazy" onerror="this.src='https://via.placeholder.com/300x400?text=Error+de+Imagen'">
            </div>

            <div class="speaker-video">
                <div class="phone-mockup-container">
                    <video autoplay loop muted playsinline controls class="vertical-video mockup-video video-ponente">
                        <source src="${p.video}" type="video/mp4">
                    </video>
                    <img src="../Imagenes/depositphotos_166282680-stock-photo-new-modern-frameless-smartphone-mockup-removebg-preview.png" class="phone-frame" alt="Móvil">
                </div>
            </div>

            <div class="speaker-info">
                <h3 class="speaker-name">${p.nombre}</h3>
                <p class="speaker-role">${p.rol}</p>
                <ul class="speaker-tags">${tagsHTML}</ul>
                <p class="speaker-bio">${p.bio}</p>
                
                <div class="speaker-socials" style="display: ${mostrarContenedorRedes}; margin-top: 15px;">
                    <a href="${linkIn}" target="_blank" class="social-link" style="display: ${displayIn}; margin-right: 10px;">LinkedIn</a>
                    <a href="${linkIg}" target="_blank" class="social-link" style="display: ${displayIg};">Instagram</a>
                </div>
            </div>
        </article>
    `;
}

initApp();