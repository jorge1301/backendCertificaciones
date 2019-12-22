const express = require("express");
const app = express();
const Internacional = require("../models/internacional");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");

// ===============================================
// Obtener todos los cursos internacionales
// ===============================================
app.get("/", (req, res) => {
  Internacional.find({}).exec((err, internacional) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando cursos internacionales",
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      internacional
    });
  });
});

// ===============================================
// Ingresar un curso internacional
// ===============================================
app.post("/", [verificaToken, verificaAdmin_Role], (req, res) => {
  let body = req.body;
  let internacional = new Internacional({
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

  internacional.save((err, internacionalDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    res.status(201).json({
      ok: true,
      internacionalDB
    });
  });
});

// ===============================================
// Modificar información de un curso internacional
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

  Internacional.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, internacionalDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      if (!internacionalDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "No existe ese curso internacional"
          }
        });
      }
      res.status(200).json({
        ok: true,
        internacionalDB
      });
    }
  );
});

// ===============================================
// Eliminar información de un curso internacional
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let id = req.params.id;
  Internacional.findByIdAndRemove(id, (err, internacionalDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!internacionalDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "No existe ese curso internacional"
        }
      });
    }
    res.status(200).json({
      ok: true,
      internacionalDB
    });
  });
});

module.exports = app;
