import CONFIG from "./config.js";

function goTo(page) {
  window.location.href = page;
}

// Generar opciones de hora desde 07:00 a 23:00
function generarHoras(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  for (let h = 7; h <= 23; h++) {
    const hora = (h < 10 ? "0" : "") + h + ":00";
    const option = document.createElement("option");
    option.value = hora;
    option.textContent = hora;
    select.appendChild(option);
  }
}



// Función genérica para pedir salas
function fetchSalas(endpoint, callback) {
  fetch(CONFIG.getWebhookPath(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": CONFIG.TOKEN
    },
    body: JSON.stringify({})
  })
    .then(res => {
      if (!res.ok) throw new Error("Respuesta no válida del servidor");
      return res.json();
    })
    .then(data => callback(data))
    .catch(err => {
      console.error("Error al cargar salas:", err);
      callback(null, err);
    });
}

let horariosSalas = {}; 
document.addEventListener("DOMContentLoaded", () => {
  // --- Reservas.html ---
  const fechaInput = document.getElementById("fecha");
  if (fechaInput) {
    const today = new Date().toISOString().split("T")[0];
    fechaInput.setAttribute("min", today);
    fechaInput.addEventListener("change", function () {
      if (this.value < today) {
        alert("No puedes seleccionar una fecha pasada");
        this.value = "";
      }
    });
  }

  const participantesInput = document.getElementById("participantes");
  if (participantesInput) {
    participantesInput.addEventListener("input", function () {
      if (this.value.length > 3) {
        this.value = this.value.slice(0, 3);
      }
    });
  }

  generarHoras("hora-inicio");
  generarHoras("hora-termino");

  const inicioSelect = document.getElementById("hora-inicio");
  const terminoSelect = document.getElementById("hora-termino");
  if (inicioSelect && terminoSelect) {
    terminoSelect.addEventListener("change", () => {
      if (inicioSelect.value && terminoSelect.value <= inicioSelect.value) {
        alert("La hora de término debe ser posterior a la hora de inicio");
        terminoSelect.value = "";
      }
    });
    inicioSelect.addEventListener("change", () => {
      if (terminoSelect.value && terminoSelect.value <= inicioSelect.value) {
        alert("La hora de inicio debe ser anterior a la hora de término");
        inicioSelect.value = "";
      }
    });
  }

  const salaSelect = document.getElementById("sala");
const detalleSala = document.getElementById("detalle-sala");

if (salaSelect && detalleSala) {
  fetchSalas("/horarios", (data, err) => {
    salaSelect.innerHTML = "";
    detalleSala.innerHTML = "";

    if (err || !data || !data.salas || data.salas.length === 0) {
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "No hay salas disponibles";
      defaultOption.disabled = true;
      salaSelect.appendChild(defaultOption);
      detalleSala.innerHTML = `
        <p style="color:orange; font-weight:bold;">
          No existen salas disponibles en este momento.
        </p>`;
      return;
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccione sala...";
    salaSelect.appendChild(defaultOption);

    data.salas.forEach(sala => {
      const option = document.createElement("option");
      option.value = sala.Salas;
      option.textContent = sala.Salas;
      salaSelect.appendChild(option);

      // 🔎 Guardamos horarios y capacidad para validaciones posteriores
      horariosSalas[sala.Salas] = {
        apertura: sala["Hora apertura"],
        cierre: sala["Hora cierre"],
        capacidad: sala.MaxParticipantes
      };
    });

    let tablaHTML = `
      <table class="tabla-salas">
        <thead>
          <tr>
            <th>Sala</th>
            <th>Ubicación</th>
            <th>Capacidad</th>
            <th>Hora apertura</th>
            <th>Hora cierre</th>
          </tr>
        </thead>
        <tbody>`;
    data.salas.forEach(sala => {
      tablaHTML += `
        <tr>
<td>
  <span class="codigo-sala" data-codigo="${sala.Salas}" style="cursor:pointer; color:#0066cc; text-decoration:underline;">
    ${sala.Salas}
  </span>
</td>

          <td>${sala.Ubicacion}</td>
          <td>${sala.MaxParticipantes}</td>
          <td>${sala["Hora apertura"]}</td>
          <td>${sala["Hora cierre"]}</td>
        </tr>`;
    });
    tablaHTML += `</tbody></table>`;
    detalleSala.innerHTML = tablaHTML;
    // Activar copia al hacer clic en el código de sala
document.querySelectorAll(".codigo-sala").forEach(span => {
  span.addEventListener("click", () => {
    const codigo = span.getAttribute("data-codigo");
    navigator.clipboard.writeText(codigo).then(() => {
      // Aviso visual
      alert(`Código de sala "${codigo}" copiado al portapapeles ✅`);
    }).catch(err => {
      console.error("Error al copiar:", err);
      alert("No se pudo copiar el código ❌");
    });
  });
});

  });
}
});




// --- Gestion.html ---
generarHoras("hora-apertura");
generarHoras("hora-cierre");

const aperturaSelect = document.getElementById("hora-apertura");
const cierreSelect = document.getElementById("hora-cierre");
if (aperturaSelect && cierreSelect) {
  cierreSelect.addEventListener("change", () => {
    if (aperturaSelect.value && cierreSelect.value <= aperturaSelect.value) {
      alert("La hora de cierre debe ser posterior a la hora de apertura");
      cierreSelect.value = "";
    }
  });
  aperturaSelect.addEventListener("change", () => {
    if (cierreSelect.value && cierreSelect.value <= aperturaSelect.value) {
      alert("La hora de apertura debe ser anterior a la hora de cierre");
      aperturaSelect.value = "";
    }
  });
}

const salaEliminarSelect = document.getElementById("sala-eliminar");
let salasDisponibles = []; // guardaremos aquí las salas para validación

if (salaEliminarSelect) {
  fetchSalas("/horarios", (data, err) => {
    salaEliminarSelect.innerHTML = "";

    if (err || !data || !data.salas || data.salas.length === 0) {
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "No hay salas disponibles";
      defaultOption.disabled = true;
      salaEliminarSelect.appendChild(defaultOption);
      return;
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccione sala...";
    salaEliminarSelect.appendChild(defaultOption);

    data.salas.forEach(sala => {
      const option = document.createElement("option");
      option.value = sala.Salas;
      option.textContent = sala.Salas;
      salaEliminarSelect.appendChild(option);
    });

    // Guardar lista de salas disponibles para validación
    salasDisponibles = data.salas.map(s => s.Salas.toLowerCase().trim());
  });
}

// --- Envío de formulario de reserva ---
const reservaForm = document.getElementById("reserva-form");
if (reservaForm) {
  reservaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!reservaForm.checkValidity()) {
      alert("Por favor completa todos los campos obligatorios antes de enviar.");
      return;
    }

    // 🔎 Validaciones adicionales
    const salaSeleccionada = document.getElementById("sala").value;
    const horaInicio = document.getElementById("hora-inicio").value;
    const horaTermino = document.getElementById("hora-termino").value;
    const participantes = parseInt(document.getElementById("participantes").value, 10);

    if (salaSeleccionada && horariosSalas[salaSeleccionada]) {
      const { apertura, cierre, capacidad } = horariosSalas[salaSeleccionada];

      const toMinutes = h => {
        const [hh, mm] = h.split(":").map(Number);
        return hh * 60 + mm;
      };

      const inicioMin = toMinutes(horaInicio);
      const terminoMin = toMinutes(horaTermino);
      const aperturaMin = toMinutes(apertura);
      const cierreMin = toMinutes(cierre);

      // Validación de rango horario
      if (inicioMin < aperturaMin || terminoMin > cierreMin) {
        alert(`La reserva debe estar dentro del horario de la sala (${apertura} - ${cierre}).`);
        return;
      }

      // Validación de capacidad
      if (participantes > capacidad) {
        alert(`La sala seleccionada tiene una capacidad máxima de ${capacidad} participantes.`);
        return;
      }
    }

    // ✅ Si pasa todas las validaciones, construimos formData y enviamos
    const formData = {
      correo: document.getElementById("correo").value,
      nombre: document.getElementById("nombre").value,
      titulo: document.getElementById("titulo").value,
      descripcion: document.getElementById("descripcion").value,
      fecha: document.getElementById("fecha").value,
      hora_inicio: horaInicio,
      hora_termino: horaTermino,
      area: document.getElementById("area").value,
      participantes: participantes,
      sala: salaSeleccionada,
      correos_participantes: document.getElementById("correos-participantes").value
    };

    fetch(CONFIG.getWebhookPath("/reserva"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": CONFIG.TOKEN
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then(data => {
        console.log("Reserva enviada:", data);
        alert("Reserva enviada correctamente ✅");
        reservaForm.reset();
      })
      .catch(err => {
        console.error("Error al enviar reserva:", err);
        alert("Error al enviar la reserva ❌. Intenta nuevamente.");
      });
  });
}




// --- Envío de formulario de creación de sala ---
const crearSalaForm = document.getElementById("crear-sala-form");
if (crearSalaForm) {
  crearSalaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!crearSalaForm.checkValidity()) {
      alert("Por favor completa todos los campos obligatorios antes de enviar.");
      return;
    }

    const codigoSala = document.getElementById("nombre-sala").value.trim().toLowerCase();

    // Validar si el código ya existe
    if (salasDisponibles.includes(codigoSala)) {
      alert("El código único de sala ya existe. Por favor ingresa un código distinto.");
      return; // cancelar envío
    }

    const formData = {
      correo_admin: document.getElementById("correo-admin").value,
      sala: document.getElementById("nombre-sala").value,
      ubicacion: document.getElementById("ubicacion").value,
      maxParticipantes: document.getElementById("max-participantes").value,
      hora_apertura: document.getElementById("hora-apertura").value,
      hora_cierre: document.getElementById("hora-cierre").value
    };

    fetch(CONFIG.getWebhookPath("/Solicitud-sala"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": CONFIG.TOKEN
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then(data => {
        console.log("Sala creada:", data);
        alert("Solicitud enviada correctamente ✅");
        crearSalaForm.reset();
      })
      .catch(err => {
        console.error("Error al crear sala:", err);
        alert("Error al crear la sala ❌. Intenta nuevamente.");
      });
  });
}

// --- Envío de formulario de eliminación de sala ---
const eliminarSalaForm = document.getElementById("eliminar-sala-form");
if (eliminarSalaForm) {
  eliminarSalaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!eliminarSalaForm.checkValidity()) {
      alert("Por favor completa todos los campos obligatorios antes de enviar.");
      return;
    }

    const formData = {
      correo: document.getElementById("correo-eliminar").value,
      sala: document.getElementById("sala-eliminar").value
    };

    fetch(CONFIG.getWebhookPath("/Solicitud-eliminar-sala"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": CONFIG.TOKEN
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then(data => {
        console.log("Solicitud de eliminación enviada:", data);
        alert("Solicitud de eliminación enviada correctamente ✅");
        eliminarSalaForm.reset();
      })
      .catch(err => {
        console.error("Error al solicitar eliminación:", err);
        alert("Error al solicitar la eliminación ❌. Intenta nuevamente.");
      });
  });
}




