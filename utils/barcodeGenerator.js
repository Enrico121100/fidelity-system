const { v4: uuidv4 } = require('uuid');

function generateBarcode() {
  return uuidv4().replace(/-/g, '').substring(0, 12); // Codice breve ma unico
}

module.exports = generateBarcode;