const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");

// ===============================================
// Renovar token
// ===============================================
app.get('/renuevatoken', [verificaToken, verificaAdmin_Role], (req, res) => {
  let token = jwt.sign({ usuario: req.usuario }, process.env.SEED, {
    expiresIn: "1d"
  });
  return res.status(200).json({
    ok: true,
    token
  });
});

// ===============================================
// Login del usuario
// ===============================================
app.post('/', (req, res) => {
    let body = req.body;
    Usuario.findOne({email: body.email}, (err, usuarioDB)=> {
        if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al buscar usuario",
              errors: err
            });
        }
        if(!usuarioDB){
            return res.status(400).json({
              ok: false,
              mensaje: "Credenciales incorrectas -- email",
              errors: err
            });
        }
        if(!bcrypt.compareSync(body.password,usuarioDB.password)){
            return res.status(400).json({
              ok: false,
              mensaje: "Credenciales incorrectas -- password",
              errors: err
            });
        }

        // Crear un token!!!
        usuarioDB.password = ':)';
        let token = jwt.sign(
          { usuario: usuarioDB },process.env.SEED,
          {
            expiresIn: "1d"
          }
        );

        res.status(200).json({
          ok: true,
          id:usuarioDB.id,
          usuarioDB,
          token,
          body
        });
    })
    
});

module.exports = app;