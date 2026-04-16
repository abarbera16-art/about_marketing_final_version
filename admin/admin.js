// ==========================================
// 1. CONFIGURACION Y LOGIN
// ==========================================
const PASSWORD_SECRETA = "marketing2026"; 
const GITHUB_TOKEN = prompt("Por seguridad, pega tu GitHub Token:");
const REPO_OWNER_AND_NAME = "abarbera16-art/About_marketing_prueba";
const FILE_PATH = "Datos/speakers.json";

const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const loginContainer = document.getElementById('login-container');
const panelContainer = document.getElementById('panel-container');

// Evento Login
loginBtn.addEventListener('click', () => {
    if (passwordInput.value === PASSWORD_SECRETA) {
        if (!GITHUB_TOKEN) {
            alert("No has introducido el Token. Refresca la pagina.");
            return;
        }
        loginContainer.style.display = 'none';
        panelContainer.style.display = 'block';
        cargarLista(); 
    } else {
        alert("Contrasena incorrecta");
    }
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
            headers: { "Authorization": "token " + GITHUB_TOKEN } 
        });

        if (!res.ok) throw new Error("Error en la respuesta de GitHub.");

        const data = await res.json();
        const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));

        listContainer.innerHTML = ""; 

        content.forEach(p => {
            const item = document.createElement('div');
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
document.getElementById('add-speaker-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Subiendo...";
    btn.disabled = true;

    try {
        const apiUrl = "https://api.github.com/repos/" + REPO_OWNER_AND_NAME + "/contents/" + FILE_PATH;
        const getRes = await fetch(apiUrl, { headers: { "Authorization": "token " + GITHUB_TOKEN } });
        const fileData = await getRes.json();
        let ponentes = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));

        const nuevoId = ponentes.length > 0 ? Math.max(...ponentes.map(p => p.id)) + 1 : 1;
        
        const nuevoPonente = {
            id: nuevoId,
            nombre: document.getElementById('nombre').value,
            rol: document.getElementById('rol').value,
            imagenFondo: document.getElementById('imagenFondo').value,
            video: document.getElementById('video').value,
            etiquetas: document.getElementById('etiquetas').value.split(',').map(t => t.trim()),
            bio: document.getElementById('bio').value,
            // 👇 AÑADIMOS EL BLOQUE DE REDES AQUÍ 👇
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
                message: "Anadido ponente: " + nuevoPonente.nombre,
                content: nuevoContenidoBase64,
                sha: fileData.sha
            })
        });

        if (putRes.ok) {
            alert("Exito! Ponente anadido a GitHub.");
            this.reset();
            cargarLista(); 
        } else {
            const err = await putRes.json();
            alert("Error de GitHub al guardar: " + err.message);
        }
    } catch (error) {
        alert("Error de red: " + error.message);
    } finally {
        btn.innerText = "Subir a GitHub";
        btn.disabled = false;
    }
});

// ==========================================
// 4. ELIMINAR PONENTE
// ==========================================
window.eliminarPonente = async function(id) {
    if (!confirm("Seguro que quieres eliminar este ponente?")) return;

    try {
        const apiUrl = "https://api.github.com/repos/" + REPO_OWNER_AND_NAME + "/contents/" + FILE_PATH;
        const getRes = await fetch(apiUrl, { headers: { "Authorization": "token " + GITHUB_TOKEN } });
        const fileData = await getRes.json();
        let ponentes = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));

        const nuevosPonentes = ponentes.filter(p => p.id !== id);
        const nuevoContenidoBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(nuevosPonentes, null, 2))));

        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: { "Authorization": "token " + GITHUB_TOKEN, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Eliminado ID: " + id,
                content: nuevoContenidoBase64,
                sha: fileData.sha
            })
        });

        if (putRes.ok) {
            alert("Ponente eliminado.");
            cargarLista();
        } else {
            const err = await putRes.json();
            alert("No se pudo eliminar: " + err.message);
        }
    } catch (e) {
        alert("Error de red al eliminar.");
    }
};