const mongoose = require("mongoose");
const { Schema } = mongoose;

let portafolioCursoShema = new Schema({
  imagen: {
    type: String,
    required: false
  },
  curso: {
    type: String,
    required: [true, "El nombre del curso es necesario"]
  },
  informacion: {
    type: String,
    required: [true, "La información es necesaria"]
  }
});

module.exports = mongoose.model("PortafolioCursos", portafolioCursoShema);
