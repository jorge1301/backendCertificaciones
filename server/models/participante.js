const mongoose = require("mongoose");
const { Schema } = mongoose;

let participanteShema = new Schema({
  nombre: { type: String, required: [true, "El nombre es necesario"]},
  email: { type: String, required: [true, "El email es necesario"]},
  aciertos: { type: String, required: false },
  estado: {type: Boolean, required: false},
  quiz: { type: String, required: [true, "Debe asociar el tipo de preguntas para el alumno"]}
}, {collection: 'participante'});

module.exports = mongoose.model('Participante', participanteShema);