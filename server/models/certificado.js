const mongoose = require("mongoose");
const { Schema } = mongoose;

let certificadoSchema = new Schema({
  cedula: {
    type: String,
    required: [true, "Es necesaria la cedula"],
    unique: true
  },
  certificados: [
    {
      imagen: String
    }
  ]
});

module.exports = mongoose.model('Certificado', certificadoSchema);