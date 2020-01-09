const express = require("express");
const app = express();
const Certificado = require("../models/certificado");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const fs = require('fs');
const path = require("path");


// ===============================================
// Obtener todos los certificados de un usuario
// ===============================================
app.get("/", (req, res) => {
  let cedula = req.body.cedula
  Certificado.find({ cedula }, 'imagen').exec((err, certificadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "Error al cargar recursos del certificado",
        err
      });
    }
    let [datos] = certificadoDB;
    if (!datos) {
      return res.status(400).json({
        ok: false,
        message: "No existe ese estudiante"
      });
    }
    if (!datos.imagen) {
      return res.status(400).json({
        ok: false,
        message: "No existen certificados"
      });
    }
    let pathImagen = path.resolve(
      __dirname,
      `../../uploads/certificados/${datos.imagen}`
    );
    if (fs.existsSync(pathImagen)) {
      res.download(pathImagen);
    }
    // res.status(200).json({
    //   ok: true,
    //   certificadoDB
    // });
  });
});

// ===============================================
// Obtener todos los certificados -- administrador
// ===============================================
app.get("/certificados",[verificaToken,verificaAdmin_Role], (req, res) => {
   Certificado.find({}).exec((err, certificado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar recursos del certificado',
                err
            });
        }
        res.status(200).json({
          ok: true,
          certificado
        });
    });
});


// ===============================================
// Ingresar certificados
// ===============================================
app.post("/", [verificaToken, verificaAdmin_Role], (req, res) => {
  let body = req.body;
  let certificado = new Certificado({
    cedula: body.cedula,
    nombre: body.nombre
  });
  certificado.save((err, certificadoDB) => {
    if (err) {
      if (err.code === 11000) {
        return res.status(500).json({
          ok: false,
          message: 'Ya existe ese usuario'
        });
      }
      else {
        return res.status(500).json({
          ok: false,
          err
        });
      }
    }
    res.status(201).json({
      ok: true,
      certificadoDB
    });
  });
});

// ===============================================
// Modificar información del certificado
// ===============================================
app.put("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let usuario = req.usuario._id;
  let id = req.params.id;
  req.body.usuario = usuario;
  let body = _.pick(req.body, ["cedula","nombre"]);
  Certificado.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, certificadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!certificadoDB) {
      return res.status(400).json({
        ok: false,
        message: "No existe ese certificado"
      });
    }
    res.status(200).json({
      ok: true,
      certificadoDB
    });
  });
});

// ===============================================
// Eliminar información de la galeria
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let id = req.params.id;
  Certificado.findByIdAndDelete(id, (err, certificadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!certificadoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "No existe ese certificado"
        }
      });
    }
    res.status(200).json({
      ok: true,
      certificadoDB
    });
  });
});

module.exports = app;
