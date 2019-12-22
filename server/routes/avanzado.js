const express = require("express");
const app = express();
const Avanzado = require("../models/avanzado");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");

// ===============================================
// Obtener todos los cursos avanzados
// ===============================================
app.get("/", (req, res) => {
  Avanzado.find({}).exec((err, avanzado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando cursos avanzados",
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      avanzado
    });
  });
});

// ===============================================
// Ingresar un curso avanzado
// ===============================================
app.post("/", [verificaToken, verificaAdmin_Role], (req, res) => {
  let body = req.body;
  let avanzado = new Avanzado({
    titulo: body.titulo,
    direccion: body.direccion,
    fecha: body.fecha,
    descripcion: body.descripcion,
    requisitos: body.requisitos,
    proposito: body.proposito,
    metodologia: body.metodologia,
    valor: body.valor,
    incluye: body.incluye,
    programacion: body.programacion
  });

  avanzado.save((err, avanzadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    res.status(201).json({
      ok: true,
      avanzadoDB
    });
  });
});

// ===============================================
// Modificar información de un curso avanzado
// ===============================================
app.put("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let usuario = req.usuario._id;
  let id = req.params.id;
  req.body.usuario = usuario;
  let body = _.pick(req.body, [
    "titulo",
    "direccion",
    "fecha",
    "descripcion",
    "requisitos",
    "proposito",
    "metodologia",
    "valor",
    "incluye",
    "programacion"
  ]);

  Avanzado.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, avanzadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!avanzadoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "No existe ese curso avanzado"
        }
      });
    }
    res.status(200).json({
      ok: true,
      avanzadoDB
    });
  });
});

// ===============================================
// Eliminar información de un curso avanzado
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let id = req.params.id;
  Avanzado.findByIdAndRemove(id, (err, avanzadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!avanzadoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "No existe ese curso avanzado"
        }
      });
    }
    res.status(200).json({
      ok: true,
      avanzadoDB
    });
  });
});

module.exports = app;
