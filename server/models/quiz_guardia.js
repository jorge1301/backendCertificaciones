const mongoose = require("mongoose");
const { Schema } = mongoose;

let quizShema = new Schema({
    pregunta: { type: String, required:[ true, 'La pregunta es necesaria']},
    opcion1: { type: String, required: [ true, 'La primera opcion es necesaria']},
    opcion2: { type: String, required: [ true, 'La primera opcion es necesaria']},
    opcion3: { type: String, required: [ true, 'La primera opcion es necesaria']},
    opcion4: { type: String, required: [ true, 'La primera opcion es necesaria']},
    respuesta: { type: String, required: [ true, 'La primera opcion es necesaria']}
},{collection: 'quizGuardia'})
module.exports = mongoose.model('Quiz', quizShema);