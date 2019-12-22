const express = require("express");
const app = express();
const Agencia = require("../models/agencia");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");

// app.get('/', [verificaToken, verificaAdmin_Role], (req, res) => {

// });



// function buscarAgencias(busqueda, regex) {
//   return new Promise((resolve, reject) => {
//     Agencia.find()
//     .or(informacion: regex)
//    });
// }

module.exports = app;