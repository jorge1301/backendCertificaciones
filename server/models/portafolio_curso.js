const mongoose = require("mongoose");
const { Schema } = mongoose;

let portafolioCursoShema = new Schema({
    imagen: {
        type: String,
        required: false
    },
    requisitos: {
        type: String,
        required: [true, "Los requisitos son necesarios"]
    },
    incluye: {
        type: String,
        required: [true, "Lo que incluye en el curso es necesario"]
    },
    ciclos: [{
        curso: String,
        informacion: String
    }]
});

module.exports = mongoose.model("PortafolioCursos", portafolioCursoShema);
