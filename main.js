const faceio = new faceIO("fioa1eb9"); // Tu publicId real

// Inicialización de Firebase v8
const firebaseConfig = {
  apiKey: "AIzaSyCbOcnU3qBFWW3Wel_b3gWGJSlohGeOeUM",
  authDomain: "iot-data-e9f1c.firebaseapp.com",
  databaseURL: "https://iot-data-e9f1c-default-rtdb.firebaseio.com",
  projectId: "iot-data-e9f1c",
  storageBucket: "iot-data-e9f1c.appspot.com",
  messagingSenderId: "837221265238",
  appId: "1:837221265238:web:f9685073239f582f60f0f7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let rol = "hijos";
let cerraduraActiva = false;

function registrarUsuarioFaceIO() {
  faceio.enroll({ locale: "auto" })
    .then(userInfo => {
      log("🆕 Usuario registrado con FaceIO: " + userInfo.facialId);
    })
    .catch(err => {
      log("❌ Error al registrar usuario FaceIO: " + (err.code || "sin código"));
    });
}


// 🔁 Cambiar de rol
function cambiarRol() {
  if (rol === "padres") {
    firebase.database().ref("rol_activo").set("hijos")
      .then(() => log("🔄 Rol cambiado a HIJOS"));
  } else {
    log("📷 Iniciando verificación con FaceIO...");

    faceio.authenticate({ locale: "auto" })
      .then(userInfo => {
        log("✅ Rostro reconocido: acceso concedido a PADRES");
        firebase.database().ref("rol_activo").set("padres");
      })
      .catch(err => {
        console.error("FaceIO Error completo:", err);  // Mostrar todo en consola
        const code = err?.code ?? "sin código";
        const msg = err?.message ?? JSON.stringify(err);
        log(`❌ Acceso denegado. FaceIO → Código: ${code}, Mensaje: ${msg}`);
        firebase.database().ref("rol_activo").set("hijos");
      });
  }
}

function reiniciarApp() {
  document.getElementById("modalPin").style.display = "flex";
}

function cerrarModalPin() {
  document.getElementById("modalPin").style.display = "none";
  document.getElementById("inputPin").value = "";
}

function cerrarModalPinCerradura() {
  document.getElementById("modalPinCerradura").style.display = "none";
  document.getElementById("inputPinCerradura").value = "";
}

function toggleCerradura() {
    document.getElementById("modalPinCerradura").style.display = "flex";
}

// 👇 ESTA LÍNEA ES CRUCIAL PARA QUE FUNCIONE EN HTML
window.toggleCerradura = toggleCerradura;




function validarPin() {
  const pinIngresado = document.getElementById("inputPin").value;

  if (pinIngresado !== "20112825") {
    log("❌ PIN incorrecto. No se reinició la app.");
    cerrarModalPin();
    return;
  }

  log("♻️ Reiniciando aplicación...");
  cerrarModalPin();

  setTimeout(() => {
    location.reload();  // 🔄 Recarga la app
  }, 1000);
}

function validarPinCerradura() {
  const pinIngresado = document.getElementById("inputPinCerradura").value;

  if (pinIngresado !== "20112825") {
    log("❌ PIN incorrecto. No se alternó la cerradura");
    cerrarModalPinCerradura();
    return;
  }

  log("🔐 Cerradura alternada");
  cerrarModalPinCerradura();

  const refCerradura = firebase.database().ref("padres/cerradura");

  refCerradura.once("value").then(snapshot => {
    const estadoActual = snapshot.val();
    const nuevoEstado = estadoActual === 1 ? 0 : 1;

    refCerradura.set(nuevoEstado).then(() => {
      log(`🔐 Cerradura ${nuevoEstado === 1 ? "ACTIVADA" : "DESACTIVADA"}`);
    });
  });
}


// 🔄 Leer el rol activo
firebase.database().ref("rol_activo").on("value", snapshot => {
  if (snapshot.exists()) {
    rol = snapshot.val();
    const rolDiv = document.getElementById("rolActual");
    if (rolDiv) rolDiv.innerText = `Rol: ${rol.toUpperCase()}`;
    log(`🔄 Rol actual: ${rol}`);
  }
});

firebase.database().ref("padres/cerradura").on("value", snapshot => {
  cerraduraActiva = snapshot.val() === 1;

  const estadoDiv = document.getElementById("estadoCerradura");
  if (estadoDiv) {
    estadoDiv.innerText = `Estado: ${cerraduraActiva ? "🔒 ACTIVADA" : "🔓 DESACTIVADA"}`;
  }

  // ✅ SOLO deshabilita los botones que no sean los permitidos
  document.querySelectorAll("button").forEach(btn => {
    const id = btn.id;
    const excepciones = ["btnAccesoPadre", "btnCerradura", "btnReiniciarApp"]; // <- agrega aquí los botones permitidos

    btn.disabled = cerraduraActiva && excepciones.includes(id);
  });
});





// 💡 Control de LEDs (sincroniza hijos y padres)
function toggleLed(area) {
    if (cerraduraActiva) {
    log("❌ Cerradura activada. Desactívela para usar esta función.");
    return;
  }
  firebase.database().ref(`padres/led_${area}`).once("value").then(snapshot => {
    const estado = snapshot.val();
    const nuevoEstado = estado === 1 ? 0 : 1;

    const updates = {};
    updates[`padres/led_${area}`] = nuevoEstado;
    updates[`hijos/led_${area}`] = nuevoEstado;

    firebase.database().ref().update(updates)
      .then(() => log(`💡 LED ${area} → ${nuevoEstado ? "ENCENDIDO" : "APAGADO"}`));
  }).catch(error => {
    log("❌ Error al leer estado del LED: " + error.message);
  });
}

// 🌡 Leer temperatura
function leerTemperatura() {
    if (cerraduraActiva) {
    log("❌ Cerradura activada. Desactívela para usar esta función.");
    return;
  }
  if (rol !== "padres") return log("❌ Solo PADRES pueden leer temperatura");
  firebase.database().ref("padres/temperatura").once("value").then(snapshot => {
    document.getElementById("tempOutput").innerText = `Temp: ${snapshot.val()}°C`;
    log("🌡 Temperatura leída");
  });
}

// 🚨 Alarma
function toggleAlarma() {
    if (cerraduraActiva) {
    log("❌ Cerradura activada. Desactívela para usar esta función.");
    return;
  }
  if (rol !== "padres") return log("❌ Solo PADRES pueden controlar la alarma");
  const refAlarma = firebase.database().ref("padres/alarma");
  refAlarma.once("value").then(snapshot => {
    const estado = snapshot.val();
    refAlarma.set(estado === 1 ? 0 : 1)
      .then(() => log(`🚨 Alarma ${estado === 1 ? "desactivada" : "activada"}`));
  });
}

// 🪟 Persiana
function setPersiana(valor) {
    if (cerraduraActiva) {
    log("❌ Cerradura activada. Desactívela para usar esta función.");
    return;
  }
  if (rol !== "padres") return log("❌ Solo PADRES pueden controlar la persiana");
  firebase.database().ref("padres/persiana").set(valor)
    .then(() => log(`🪟 Persiana ${valor === 1 ? "subida" : "bajada"}`));
}

// 💧 TDS
function leerTDS() {
    if (cerraduraActiva) {
    log("❌ Cerradura activada. Desactívela para usar esta función.");
    return;
  }
  if (rol !== "padres") return log("❌ Solo PADRES pueden leer calidad del agua");
  firebase.database().ref("padres/registro").once("value").then(snapshot => {
    document.getElementById("tdsOutput").innerText = `TDS: ${snapshot.val()}`;
    log("💧 Calidad del agua leída");
  });
}

// 🛢 Nivel del tanque
function leerTanque() {
    if (cerraduraActiva) {
    log("❌ Cerradura activada. Desactívela para usar esta función.");
    return;
  }
  if (rol !== "padres") return log("❌ Solo PADRES pueden leer nivel del tanque");
  firebase.database().ref("padres/tanque").once("value").then(snapshot => {
    document.getElementById("tanqueOutput").innerText = `Nivel: ${snapshot.val()} cm`;
    log("🛢 Nivel del tanque leído");
  });
}

// 🔐 Cerradura
function activarCerradura() {
  if (rol !== "padres") return log("❌ Solo PADRES pueden activar la cerradura");
  firebase.database().ref("padres/cerradura").set(1)
    .then(() => log("🔒 Cerradura activada"));
}

// 🧾 Log
function log(mensaje) {
  const ahora = new Date();
  const textoFormateado = `${ahora.toLocaleTimeString()}: ${mensaje}`;

  // Mostrar en la app
  const logDiv = document.getElementById("logEventos");
  const p = document.createElement("p");
  p.textContent = textoFormateado;
  logDiv.appendChild(p);
  logDiv.scrollTop = logDiv.scrollHeight;

  // Guardar en Firebase
  firebase.database().ref("log_eventos").push({
    texto: textoFormateado,
    timestamp: ahora.getTime()
  });
}

firebase.database().ref("log_eventos").on("value", snapshot => {
  const logDiv = document.getElementById("logEventos");
  logDiv.innerHTML = "";

  if (snapshot.exists()) {
    const datos = snapshot.val();
    const entradas = Object.values(datos).sort((a, b) => a.timestamp - b.timestamp);

    entradas.forEach(entry => {
      const p = document.createElement("p");
      p.textContent = entry.texto;
      logDiv.appendChild(p);
    });

    logDiv.scrollTop = logDiv.scrollHeight;
  } else {
    logDiv.innerHTML = "<p>Sin eventos aún.</p>";
  }
});


// ✅ Exponer funciones al HTML
window.toggleLed = toggleLed;
window.leerTemperatura = leerTemperatura;
window.toggleAlarma = toggleAlarma;
window.setPersiana = setPersiana;
window.leerTDS = leerTDS;
window.leerTanque = leerTanque;
window.activarCerradura = activarCerradura;
window.cambiarRol = cambiarRol;
