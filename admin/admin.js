// ==========================================
// 1. CONFIGURACION Y LOGIN
// ==========================================

let GITHUB_TOKEN = ""; 
const PASSWORD_SECRETA = "marketing2026"; 

// ERROR DETECTADO: El nombre del repo debe ser el nuevo
const REPO_OWNER_AND_NAME = "abarbera16-art/about_marketing_final_version"; 

// Verificad que la carpeta "Datos" empiece por mayúscula como en vuestra captura
const FILE_PATH = "Datos/speakers.json";

const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const loginContainer = document.getElementById('login-container');
const panelContainer = document.getElementById('panel-container');

// Evento Login modificado para el Modal del Token
loginBtn.addEventListener('click', () => {
    if (passwordInput.value === PASSWORD_SECRETA) {
        
        // 1. Mostramos el modal del Token en lugar del prompt
        const modalToken = document.getElementById('token-modal');
        const inputToken = document.getElementById('token-input-field');
        const btnConfirmar = document.getElementById('confirm-token-btn');

        modalToken.style.display = 'flex';
        inputToken.focus(); 

        // 2. Al hacer clic en confirmar dentro del modal
        btnConfirmar.onclick = () => {
            const valorToken = inputToken.value.trim();
            
            if (!valorToken) {
                alert("Por favor, introduce el token para continuar.");
                return;
            }

            GITHUB_TOKEN = valorToken; // Guardamos el token privado
            modalToken.style.display = 'none';

            // 3. Cambio de panel instantáneo
            loginContainer.style.display = 'none';
            panelContainer.style.display = 'flex'; // Usamos flex para las dos columnas del panel
            
            cargarLista(); 
        };

    } else {
        alert("Contrasena incorrecta");
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.admin-logo-header');
    const loginBox = document.getElementById('login-container');

    // Mantenemos tus tiempos de entrada si quieres, pero sin el prompt estorbando
    setTimeout(() => {
        if(logo) logo.classList.add('entrada-suave');
        if(loginBox) loginBox.classList.add('entrada-suave');
    }, 100);
});

// ==========================================
// 2. CARGAR Y MOSTRAR PONENTES
// ==========================================
async function cargarLista() {
    const listContainer = document.getElementById('speakers-list');
    listContainer.innerHTML = "Conectando con GitHub...";

    try {
        const cacheBuster = "?t=" + new Date().getTime();
        const apiUrl = "https://api.github.com/repos/" + REPO_OWNER_AND_NAME + "/contents/" + FILE_PATH + cacheBuster;
        
        const res = await fetch(apiUrl, { 
            headers: { "Authorization": "Bearer " + GITHUB_TOKEN }
        });

        if (!res.ok) throw new Error("Error en la respuesta de GitHub.");

        const data = await res.json();
        const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));

        listContainer.innerHTML = ""; 

        content.forEach(p => {
            const item = document.createElement('div');
            // Mantenemos tu estilo de item
            item.style = "background: #fff; padding: 15px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; color: black;";
            item.innerHTML = `
                <div>
                    <strong style="color: #e63946;">${p.nombre}</strong><br>
                    <small style="color: #666;">${p.rol}</small>
                </div>
                <button onclick="eliminarPonente(${p.id})" style="background:#ff4d4d; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px; font-weight:bold;">Eliminar</button>
            `;
            listContainer.appendChild(item);
        });
    } catch (e) {
        console.error(e);
        listContainer.innerHTML = "Error al cargar lista. Revisa el Token.";
    }
}

// ==========================================
// 3. ANADIR PONENTE
// ==========================================
// ==========================================
// 3. AÑADIR PONENTE (CON SUBIDA DE IMAGEN)
// ==========================================
document.getElementById('add-speaker-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Subiendo imagen y datos...";
    btn.disabled = true;

    try {
        // --- PARTE 1: SUBIR LA IMAGEN A GITHUB ---
        const fileInput = document.getElementById('imagenFondo');
        const file = fileInput.files[0];
        let rutaImagenFinal = "";

        if (file) {
            // 1.1 Convertir la imagen a Base64 (El idioma que entiende la API de GitHub)
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]); 
                reader.readAsDataURL(file);
            });

            // 1.2 Limpiar el nombre (quita espacios y añade fecha para que no se repitan)
            const nombreSeguro = file.name.replace(/\s+/g, '-').toLowerCase();
            const fileName = `ponente-${Date.now()}-${nombreSeguro}`;
            const imageApiUrl = `https://api.github.com/repos/${REPO_OWNER_AND_NAME}/contents/Imagenes/${fileName}`;

            // 1.3 Enviar la imagen a la carpeta Imagenes/
            const imgRes = await fetch(imageApiUrl, {
                method: "PUT",
                headers: { "Authorization": "token " + GITHUB_TOKEN, "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Subida automática de foto: ${fileName}`,
                    content: base64
                })
            });

            if (!imgRes.ok) throw new Error("Fallo al subir la imagen a GitHub.");
            
            // 1.4 Si la imagen se sube bien, guardamos la ruta perfecta para el JSON
            rutaImagenFinal = `Imagenes/${fileName}`;
        }

        // --- PARTE 2: ACTUALIZAR EL JSON CON LOS DATOS ---
        const apiUrl = "https://api.github.com/repos/" + REPO_OWNER_AND_NAME + "/contents/" + FILE_PATH;
        const getRes = await fetch(apiUrl, { headers: { "Authorization": "token " + GITHUB_TOKEN } });
        const fileData = await getRes.json();
        let ponentes = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));

        const nuevoId = ponentes.length > 0 ? Math.max(...ponentes.map(p => p.id)) + 1 : 1;
        
        const nuevoPonente = {
            id: nuevoId,
            nombre: document.getElementById('nombre').value,
            rol: document.getElementById('rol').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            imagenFondo: rutaImagenFinal, // <-- AQUÍ PONEMOS LA RUTA AUTOMÁTICA
            video: document.getElementById('video').value,
            etiquetas: document.getElementById('etiquetas').value.split(',').map(t => t.trim()),
            bio: document.getElementById('bio').value,
            redes: {
                linkedin: document.getElementById('linkedin').value.trim(),
                instagram: document.getElementById('instagram').value.trim()
            }
        };

        ponentes.push(nuevoPonente);
        const nuevoContenidoBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(ponentes, null, 2))));

        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: { "Authorization": "token " + GITHUB_TOKEN, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Añadido ponente: " + nuevoPonente.nombre,
                content: nuevoContenidoBase64,
                sha: fileData.sha
            })
        });

        if (putRes.ok) {
            alert("¡Éxito! Ponente e Imagen añadidos correctamente.");
            this.reset();
            cargarLista(); 
        } else {
            throw new Error("Error al guardar en el JSON.");
        }
    } catch (error) {
        alert("Error de red: " + error.message);
    } finally {
        btn.innerText = "Subir a GitHub";
        btn.disabled = false;
    }
});
