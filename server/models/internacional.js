const mongoose = require("mongoose");
const { Schema } = mongoose;

let internacionalSchema = new Schema({
  titulo: {
    type: String,
    required: [true, "El titulo es necesario"]
  },
  direccion: {
    type: String,
    required: [true, "La direccion es necesaria"]
  },
  fecha: {
    type: String,
    required: [true, "La fecha es necesaria"]
  },
  descripcion: {
    type: String,
    required: [true, "La descripción es necesaria"]
  },
  requisitos: {
    type: String,
    required: [true, "Los requisitos son necesarios"]
  },
  proposito: {
    type: String,
    required: [true, "El proposito es necesario"]
  },
  metodologia: {
    type: String,
    required: [true, "La metodología es necesaria"]
  },
  valor: {
    type: String,
    required: [true, "El valor es necesario"]
  },
  incluye: {
    type: String,
    required: [true, "Lo que incluye en el curso es necesario"]
  },
  programacion: [
    {
      dia: String,
      informacion: String
    }
  ]
});

module.exports = mongoose.model("Internacional", internacionalSchema);
