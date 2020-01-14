const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const upload = require("../middlewares/storage");
const fs = require("fs");

//Storage middlewares
let cargarArchivo = upload('usuarios');

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id;

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
app.put("/:id", cargarArchivo.single('imagen'), [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  let {nombre,email} = req.body;
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo"
    });
  }
  pathNuevaImagen = `./uploads/usuarios/` + req.file.filename;
  Usuario.findById(id, (err, usuario) => {
    if (err) {
      fs.unlinkSync(pathNuevaImagen);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el usuario",
        errors: err
      });
    }
    if (!usuario) {
      fs.unlinkSync(pathNuevaImagen);
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario no existe",
        errors: err
      });
    }
    imagenAntigua = usuario.imagen;
    usuario.nombre = nombre;
    usuario.email  = email;
    usuario.imagen = req.file.filename;
    usuario.save((err, usuarioGuardado) => {
      if (err) {
        fs.unlinkSync(pathNuevaImagen);
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el usuario",
          errors: err
        });
      }
      pathViejo = `./uploads/usuarios/` + imagenAntigua;
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }
      res.status(200).json({
        ok: true,
        usuarioGuardado
      });
    });
  });
});


module.exports = app;
