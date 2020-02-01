const mongoose = require("mongoose");
const { Schema } = mongoose;

let alumnoShema = new Schema({
  cedula: { type: String, required: [true, "La cedula es necesaria"], unique: true},
  nombre: { type: String, required: [true, "El nombre es necesario"]},
  email: { type: String, required: [true, "El email es necesario"]},
  aciertos: { type: String, required: false },
  estado: {type: Boolean, required: false},
  quiz: { type: String, required: [true, "Debe asociar el tipo de preguntas para el alumno"]}
}, {collection: 'alumnos'});

module.exports = mongoose.model("Alumno", alumnoShema);