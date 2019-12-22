const mongoose =  require('mongoose');
const { Schema } = mongoose;

let agenciaSchema = new Schema({
  imagen: { type: String, required: false },
  informacion: { type: String, required: false }
});

module.exports = mongoose.model("Agencia", agenciaSchema);