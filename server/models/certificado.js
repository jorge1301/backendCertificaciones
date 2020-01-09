const mongoose = require("mongoose");
const { Schema } = mongoose;

let certificadoSchema = new Schema({
  cedula: {
    type: String,
    required: [true, "Es necesaria la cedula"],
    unique: true
  },
  nombre: {
    type: String,
    required: [true, "Es necesario el nombre"]
  },
  imagen: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Certificado', certificadoSchema);