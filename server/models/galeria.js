const mongoose = require('mongoose');
const { Schema } = mongoose;

let galeriaSchema = new Schema({
  imagen: { type: String, required: false },
  informacion: { type: String, required: false }
});

module.exports = mongoose.model("Galeria", galeriaSchema);