'use strict';

const afiliados = require('../data/afiliados');

// Caja de enlaces de afiliados reutilizable para todas las páginas
function afiliadosBox() {
  return `
  <div class="affiliate-box">
    <h4>Portales inmobiliarios</h4>
    <ul>
      ${afiliados.inmobiliarias.map(a => `<li><a href="${a.url}" target="_blank" rel="nofollow sponsored noopener">${a.nombre}</a></li>`).join('\n      ')}
    </ul>
  </div>
  <div class="affiliate-box">
    <h4>Seguro de hogar</h4>
    <ul>
      ${afiliados.seguros.map(a => `<li><a href="${a.url}" target="_blank" rel="nofollow sponsored noopener">${a.nombre}</a></li>`).join('\n      ')}
    </ul>
  </div>
  <div class="affiliate-box">
    <h4>Mudanzas y suministros</h4>
    <ul>
      ${[...afiliados.mudanzas, ...afiliados.energia].map(a => `<li><a href="${a.url}" target="_blank" rel="nofollow sponsored noopener">${a.nombre}</a></li>`).join('\n      ')}
    </ul>
  </div>
  <div class="affiliate-box">
    <h4>Esenciales para tu hogar</h4>
    <ul>
      ${afiliados.amazon.map(a => `<li><a href="${a.url}" target="_blank" rel="nofollow sponsored noopener">${a.nombre}</a></li>`).join('\n      ')}
    </ul>
    <p class="affiliate-disclaimer">Enlaces de afiliados: podemos recibir una comisión por compras realizadas a través de estos enlaces.</p>
  </div>`;
}

module.exports = { afiliadosBox };
