// ===== FUNCIONES OBLIGATORIAS (no modificar) =====

function toggleMenu(titulo) {
  const seccion = titulo.nextElementSibling;
  if (!seccion) return;
  const isOpen = seccion.style.display === "block";
  seccion.style.display = isOpen ? "none" : "block";
  titulo.classList.toggle("open", !isOpen);
}

function toggleCantidad(checkbox) {
  const item = checkbox.closest(".item");
  if (!item) return;
  const cantidad = item.querySelector(".cantidad");
  if (!cantidad) return;
  if (checkbox.checked) {
    cantidad.disabled = false;
    if (Number(cantidad.value) === 0) cantidad.value = 1;
    item.classList.add("seleccionado");
  } else {
    cantidad.value = 0;
    cantidad.disabled = true;
    item.classList.remove("seleccionado");
  }
  calcularTotal();
}

function toggleDescripcion(checkbox) {
  const item = checkbox.closest(".item");
  if (!item) return;
  const desc = item.querySelector(".descripcion");
  if (!desc) return;
  desc.style.display = checkbox.checked ? "block" : "none";
}

function calcularTotal() {
  let subtotal = 0;
  let contadorEmpaque = 0;

  document.querySelectorAll(".check-plato").forEach(cb => {
    if (!cb.checked) return;
    const item = cb.closest(".item");
    if (!item) return;
    const cantidad = Number(item.querySelector(".cantidad")?.value) || 0;
    if (cantidad <= 0) return;

    const spanPrecio = item.querySelector(".item-linea span");
    if (!spanPrecio) return;
    const precioStr = spanPrecio.textContent.replace(/[$.\s]/g, "").replace(",", "");
    const precio = Number(precioStr) || 0;
    subtotal += precio * cantidad;
    const seccion = cb.closest(".menu-section");
    const titulo = seccion?.querySelector("h2")?.textContent || "";
    const esAdicion = titulo.includes("ADICIONES") || titulo.includes("TOPPINGS");
    if (!esAdicion) contadorEmpaque += cantidad;
  });

  const tipoEntrega = document.getElementById("tipoEntrega")?.value;
  let totalEmpaque = contadorEmpaque * 2000;

  if (tipoEntrega === "Comer dentro del local") {
    totalEmpaque = 0;
  }

  let totalFinal = subtotal + totalEmpaque;

  document.getElementById("subtotal").innerText =
    "Subtotal: $" + subtotal.toLocaleString("es-CO");

  const empaqueEl = document.getElementById("empaque");
  if (tipoEntrega === "Comer dentro del local") {
    empaqueEl.style.display = "none";
  } else {
    empaqueEl.style.display = "block";
    empaqueEl.innerText = "Empaque: $" + totalEmpaque.toLocaleString("es-CO");
  }

  document.getElementById("total").innerText = "$" + totalFinal.toLocaleString("es-CO");
  document.getElementById("totalPedido").value = totalFinal;
}

// ===== ENTREGA =====
function actualizarEntrega() {
  const val = document.getElementById("tipoEntrega").value;
  document.getElementById("direccionField").style.display = val === "A domicilio" ? "block" : "none";
  document.getElementById("costoDomicilio").style.display = val === "A domicilio" ? "block" : "none";
  document.getElementById("mesaField").style.display = val === "Comer dentro del local" ? "block" : "none";
  calcularTotal();
}

// ===== PAGO =====
function actualizarPago() {
  const val = document.getElementById("tipoPago").value;
  document.getElementById("efectivoField").style.display = val === "Efectivo" ? "block" : "none";
  const infoPago = document.getElementById("infoPago");
  const infoNequi = document.getElementById("infoNequi");
  const infoBanco = document.getElementById("infoBanco");

  if (val === "Nequi / Llave") {
    infoPago.style.display = "block";
    infoNequi.style.display = "block";
    infoBanco.style.display = "none";
  } else if (val === "Transferencia bancaria") {
    infoPago.style.display = "block";
    infoNequi.style.display = "none";
    infoBanco.style.display = "block";
  } else {
    infoPago.style.display = "none";
    infoNequi.style.display = "none";
    infoBanco.style.display = "none";
  }
}

// ===== ENVÍO =====
function enviarPedido(e) {
  e.preventDefault();

  const btn = document.getElementById("btnEnviar");
  if (btn.disabled) return;

  // Construir lista de platos
  let listaPlatos = "";
  document.querySelectorAll(".check-plato").forEach(cb => {
    if (!cb.checked) return;
    const item = cb.closest(".item");
    if (!item) return;
    const cantidad = Number(item.querySelector(".cantidad")?.value) || 0;
    if (cantidad <= 0) return;
    const nombre = cb.value;
    const spanPrecio = item.querySelector(".item-linea span");
    const precio = spanPrecio ? spanPrecio.textContent.trim() : "";
    const sabor = item.querySelector(".sabor");
    const saborVal = sabor ? ` [${sabor.value}]` : "";
    listaPlatos += `  • ${cantidad}x ${nombre}${saborVal} — ${precio}\n`;
  });

  if (!listaPlatos) {
    alert("⚠️ Por favor selecciona al menos un producto.");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const tipoEntrega = document.getElementById("tipoEntrega").value;
  const direccion = document.getElementById("direccion").value.trim();
  const mesa = document.getElementById("numeroMesa").value.trim();
  const tipoPago = document.getElementById("tipoPago").value;
  const efectivo = document.getElementById("efectivoCliente").value.trim();
  const specs = document.getElementById("especificaciones").value.trim();

  const subtotalTxt = document.getElementById("subtotal")?.innerText || "";
  const empaqueTxt = document.getElementById("empaque")?.innerText || "";
  const totalTxt = document.getElementById("total").innerText;
  const total = document.getElementById("totalPedido").value;

  let mensaje = `🍟 *NUEVO PEDIDO*\n\n`;
  mensaje += `👤 *Cliente:* ${nombre}\n\n`;
  mensaje += `📞 *WhatsApp:* ${telefono}\n\n`;
  mensaje += `🛒 *Pedido:*\n${listaPlatos}`;
  mensaje += `📦 *Entrega:* ${tipoEntrega}\n\n`;
  if (tipoEntrega === "A domicilio" && direccion) mensaje += `📍 *Dirección:* ${direccion}\n\n`;
  if (tipoEntrega === "Comer dentro del local" && mesa) mensaje += `🔢 *Mesa:* ${mesa}\n\n`;
  mensaje += `💰 *Pago:* ${tipoPago}\n\n`;
  if (tipoPago === "Efectivo" && efectivo) mensaje += `💵 *Paga con:* ${efectivo}\n\n`;
  if (specs) mensaje += `📒 *Especificaciones:* ${specs}\n`;
  mensaje += `━━━━━━━━━━━━━━━━━\n`;
  mensaje += `${subtotalTxt}\n\n`;
  mensaje += `${empaqueTxt}\n\n`;
  mensaje += `💸 *TOTAL: ${totalTxt}*`;

  // Verificar si hay adiciones o toppings
  let tieneAdiciones = false;
  document.querySelectorAll(".check-plato:checked").forEach(cb => {
    const seccion = cb.closest(".menu-section");
    const tit = seccion?.querySelector("h2")?.textContent || "";
    if (tit.includes("ADICIONES") || tit.includes("TOPPINGS")) tieneAdiciones = true;
  });
  if (tieneAdiciones) {
    mensaje += `\n\n⚠️ *Nota:* El empaque de adiciones, proteinas y toppings no está incluido en el total — queda a criterio del restaurante.`;
  }

  const numero = "573153951035";
  const url = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);

  // Anti doble envío
  btn.disabled = true;
  btn.textContent = "✅ Pedido enviado — espera 5s";
  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = "📲 Enviar Pedido por WhatsApp";
  }, 5000);

  // ── GUARDAR EN SHEETS ──
  const formData = new FormData();
  formData.append('entry.353056933', nombre);
  formData.append('entry.1483594722', telefono);
  formData.append('entry.783434514', listaPlatos);
  formData.append('entry.441518739', tipoEntrega);
  formData.append('entry.772261059', direccion || '');
  formData.append('entry.1751084415', tipoPago);
  formData.append('entry.871880474', efectivo || '');
  formData.append('entry.599195021', specs || '');
  formData.append('entry.269632135', "$" + Number(total).toLocaleString("es-CO") + " COP");

  fetch('https://docs.google.com/forms/d/e/1FAIpQLSeCSJ5G-c5YcdTCfeYTGdWjVn3yp99_LvLVBO3LlVGd8JeKMg/formResponse', {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).finally(() => {
    window.open(url, "_blank");
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  });
}

document.querySelectorAll(".item-linea label").forEach(label => {
  label.addEventListener("click", function() {
    const cb = this.previousElementSibling;
    if (cb && cb.classList.contains("check-plato")) {
      cb.checked = !cb.checked;
      toggleCantidad(cb);
      toggleDescripcion(cb);
    }
  });
});