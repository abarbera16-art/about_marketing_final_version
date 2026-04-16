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
        // 1. CAPTURAR EL ARCHIVO REAL (NO EL FAKEPATH)
        const fileInput = document.getElementById('imagenFondo');
        const file = fileInput.files[0];
        let rutaImagenFinal = "";

        if (!file) {
            alert("Por favor, selecciona una imagen.");
            btn.innerText = "Subir a GitHub";
            btn.disabled = false;
            return;
        }

        // 2. CONVERTIR A BASE64 Y SUBIR FOTO A GITHUB
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]); 
            reader.readAsDataURL(file);
        });

        // Limpiamos el nombre para evitar fallos (quita espacios)
        const nombreLimpio = file.name.replace(/\s+/g, '-').toLowerCase();
        const fileName = `ponente-${Date.now()}-${nombreLimpio}`;
        const imageApiUrl = `https://api.github.com/repos/${REPO_OWNER_AND_NAME}/contents/Imagenes/${fileName}`;

        // Subimos la imagen física
        const imgRes = await fetch(imageApiUrl, {
            method: "PUT",
            headers: { "Authorization": "token " + GITHUB_TOKEN, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: `Sube foto: ${fileName}`,
                content: base64
            })
        });

        if (!imgRes.ok) throw new Error("Fallo al subir la imagen a GitHub.");
        
        // ¡LA RUTA CORRECTA QUE IRÁ AL JSON!
        rutaImagenFinal = `Imagenes/${fileName}`;

        // 3. ACTUALIZAR EL JSON
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
            // 👇 AQUÍ USAMOS LA RUTA REAL GENERADA, NO EL .VALUE DEL INPUT 👇
            imagenFondo: rutaImagenFinal, 
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

        // 4. GUARDAR EL JSON EN GITHUB
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
            alert("¡Éxito! Ponente y foto guardados en la nube.");
            this.reset();
            cargarLista(); 
        } else {
            throw new Error("Error al guardar el JSON.");
        }
    } catch (error) {
        alert("Error de red: " + error.message);
    } finally {
        btn.innerText = "Subir a GitHub";
        btn.disabled = false;
    }
});

// ==========================================
// 4. ELIMINAR PONENTE (CORREGIDO)
// ==========================================
window.eliminarPonente = async function(id) {
    if (!confirm("¿Seguro que quieres eliminar a este ponente de la base de datos?")) return;

    try {
        // Añadimos cacheBuster para leer la versión más reciente antes de borrar
        const cacheBuster = "?t=" + new Date().getTime();
        const apiUrl = "https://api.github.com/repos/" + REPO_OWNER_AND_NAME + "/contents/" + FILE_PATH;
        
        // 1. OBTENER DATOS (Usando Bearer)
        const getRes = await fetch(apiUrl + cacheBuster, { 
            headers: { "Authorization": "Bearer " + GITHUB_TOKEN } 
        });
        
        if (!getRes.ok) throw new Error("No se pudo leer el archivo de GitHub.");
        
        const fileData = await getRes.json();
        let ponentes = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));

        // 2. FILTRAR (Borrar el ID)
        const nuevosPonentes = ponentes.filter(p => p.id !== id);
        
        // 3. ENCRIPTAR
        const nuevoContenidoBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(nuevosPonentes, null, 2))));

        // 4. ENVIAR COMMIT (Usando Bearer)
        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: { 
                "Authorization": "Bearer " + GITHUB_TOKEN, // <--- UNIFICADO A BEARER
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                message: `Admin: Eliminado ponente ID ${id}`,
                content: nuevoContenidoBase64,
                sha: fileData.sha 
            })
        });

        if (putRes.ok) {
            alert("✅ Ponente eliminado correctamente.");
            // Esperamos un segundo para que GitHub procese y luego recargamos
            setTimeout(() => { cargarLista(); }, 1000);
        } else {
            const err = await putRes.json();
            alert("❌ GitHub no permitió el borrado: " + err.message);
        }
    } catch (e) {
        console.error("Error al eliminar:", e);
        alert("Fallo crítico: " + e.message);
    }
};
