const mongoose = require("mongoose");
const { Schema } = mongoose;

let usuarioShema = new Schema({
  nombre: { type: String, required: [true, "El nombre es necesario"] },
  email: {
    type: String,
    unique: true,
    required: [true, "El correo es necesario"]
  },
  password: { type: String, required: [true, "La contraseña es necesaria"] },
  imagen: { type: String, required: false },
  role: { type: String, required: true, default: "USER_ROLE" }
});


module.exports = mongoose.model('Usuario', usuarioShema);
