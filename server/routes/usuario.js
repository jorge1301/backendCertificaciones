const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");


// ===============================================
// Obtener todos los usuarios
// ===============================================
app.get("/",[verificaToken, verificaAdmin_Role], (req, res) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
        (err,usuarios)=>{
        if(err){
            return res.status(500).json({
              ok: false,
              mensaje: "Error cargando usuarios",
              errors: err
            });
        }
         res.status(200).json({
           ok: true,
           usuarios
         });
    })
});

// ===============================================
// Actualizar usuario
// ===============================================
app.put("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el usuario",
        errors: err
      });
    }
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario no existe",
        errors: err
      });
    }
    usuario.nombre = body.nombre;
    usuario.email = body.email;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el usuario",
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        usuarioGuardado
      });
    });
  });
});


module.exports = app;
