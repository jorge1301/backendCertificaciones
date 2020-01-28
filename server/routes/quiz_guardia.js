const express = require("express");
const app = express();
const Quiz = require("../models/quiz_guardia");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
//variables
let id, desde, limite;

// ===============================================
// Obtener todas las preguntas
// ===============================================
app.get("/", (req, res) => {
  desde = req.query.desde || 0;
  limite = req.query.limite || 0;
  if (desde < 0) {
    desde = 0;
  }
  desde = Number(desde);
  limite = Number(limite);
  Quiz.find({})
    .skip(desde)
    .limit(limite)
    .exec((err, quiz) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al cargar recursos del cuestionario"
        });
      }
      Quiz.countDocuments({}, (err, total) => {
        res.status(200).json({
          ok: true,
          quiz,
          total
        });
      });
    });
});

// ===============================================
// Buscar quiz
// ===============================================
app.get("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  Quiz.findById(id, (err, quiz) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar la pregunta",
        err
      });
    }
    if (!quiz) {
      return res.status(400).json({
        ok: false,
        mensaje: "La pregunta no existe"
      });
    }
    res.status(200).json({
      ok: true,
      quiz
    });
  });
});

// ===============================================
// Obtener 20 preguntas aleatorias
// ===============================================
app.get("/cuestionario", [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  Quiz.aggregate([{$sample:{size:20}}])
  .exec((err, quiz) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al cargar recursos del cuestionario"
      });
    }
    if (!quiz) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existen preguntas"
      });
    }
     res.status(200).json({
       ok: true,
       quiz
     });
  })
});

// ===============================================
// Ingresar informacion del participante
// ===============================================
app.post("/", [verificaToken, verificaAdmin_Role], (req, res) => {
  let { pregunta, opcion1, opcion2, opcion3, opcion4, respuesta } = JSON.parse(req.body.data);
  let quiz = new Quiz({
    pregunta,
    opcion1,
    opcion2,
    opcion3,
    opcion4,
    respuesta
  });
  quiz.save((err, quizDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al guardar la pregunta",
        err
      });
    }
    res.status(201).json({
      ok: true,
      quizDB
    });
  });
});

// ===============================================
// Modificar información de la pregunta
// ===============================================
app.put("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  Quiz.findById(id, (err, quiz) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar la pregunta",
        err
      });
    }
    if (!quiz) {
      return res.status(400).json({
        ok: false,
        mensaje: "La pregunta no existe"
      });
    }
    let { pregunta, opcion1, opcion2, opcion3, opcion4, respuesta } = JSON.parse(req.body.data);
    quiz.pregunta = pregunta;
    quiz.opcion1 = opcion1;
    quiz.opcion2 = opcion2;
    quiz.opcion3 = opcion3;
    quiz.opcion4 = opcion4;
    quiz.respuesta = respuesta;
    quiz.save((err, quizDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar la pregunta",
          err
        });
      }
      res.status(200).json({
        ok: true,
        quizDB
      });
    });
  });
});

// ===============================================
// Eliminar información del participante
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  Quiz.findByIdAndDelete(id, (err, quizDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar la pregunta",
        err
      });
    }
    if (!participanteDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe esa pregunta"
      });
    }
    res.status(200).json({
      ok: true,
      quizDB
    });
  });
});

module.exports = app;
