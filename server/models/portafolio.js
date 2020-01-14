const mongoose = require("mongoose");
const { Schema } = mongoose;

let portafolioShema = new Schema({
  titulo: { type: String, required: [true, "El titulo es necesario"] },
  imagen: { type: String, required: [true, "La imagen es necesaria"] },
  mision: { type: String, requiered: [true, "La mision es necesaria"] },
  vision: { type: String, required: [true, "La vision es necesaria"] },
  centro: {
    type: String,
    required: [true, "La descripción del centro es necesaria"]
  }
});

module.exports =  mongoose.model('Portafolio',portafolioShema);