const express = require("express");
const app = express();
const Agencia = require("../models/agencia");
const {
    verificaToken,
    verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const upload = require('../middlewares/storage');
const fs = require('fs');

//Storage middlewares
let cargarArchivo = upload('agencias');

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id, usuario;

// ===============================================
// Obtener todos las agencias
// ===============================================
app.get("/", (req, res) => {
    Agencia.find({}).exec((err, agencia) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al cargar recursos de las agencias",
                err
            });
        }
        res.status(200).json({
            ok: true,
            agencia
        });
    });
});

// ===============================================
// Ingresar informacion de las agencias
// ===============================================
app.post("/", cargarArchivo.single('imagen'), [verificaToken, verificaAdmin_Role], (req, res) => {
    let { informacion } = req.body;
    if (!req.file){
      return res.status(400).json({
        ok: false,
        mensaje: "No se ha seleccionado un archivo valido"
      });
    }
    let agencia = new Agencia({
        imagen: req.file.filename,
        informacion
    });
    agencia.save((err, agenciaDB) => {
        if (err) {
            fs.unlinkSync("./uploads/agencias/" + req.file.filename);
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            agenciaDB
        });
    });
});

// ===============================================
// Modificar información de la agencia
// ===============================================
app.put("/:id", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
    usuario = req.usuario._id;
    id = req.params.id;
     if (!req.file) {
       return res.status(400).json({
         ok: false,
         mensaje: "No se ha seleccionado un archivo"
       });
     }
    pathNuevaImagen = `./uploads/agencias/` + req.file.filename;
    req.body.usuario = usuario;
    Agencia.findById(id, (err, agencia) => {
        if (err) {
            fs.unlinkSync(pathNuevaImagen);
            return res.status(500).json({
              ok: false,
              mensaje: "Error al buscar la agencia",
              errors: err
            });
        }
        if (!agencia) {
          fs.unlinkSync(pathNuevaImagen);
          return res.status(400).json({
            ok: false,
            mensaje: "La agencia no existe"
          });
        }
        imagenAntigua = agencia.imagen;
        agencia.imagen = req.file.filename;
        agencia.informacion = req.body.informacion;
        agencia.save((err, agenciaDB) => {
            if (err) {
                fs.unlinkSync(pathNuevaImagen);
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar la agencia",
                    errors: err
                });
            }
            pathViejo = `./uploads/agencias/` + imagenAntigua;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            res.status(200).json({
              ok: true,
              agenciaDB
            });
        });
    });
});

// ===============================================
// Eliminar información de la agencia
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Agencia.findByIdAndDelete(id, (err, agenciaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!agenciaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No existe esa imagen"
                }
            });
        }
        fs.unlinkSync(`./uploads/agencias/` + agenciaDB.imagen);
        res.status(200).json({
            ok: true,
            agenciaDB
        });
    });
});

module.exports = app;
