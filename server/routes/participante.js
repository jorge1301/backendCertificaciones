const express = require("express");
const app = express();
const Participante = require("../models/participante");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
//variables
let id, desde, limite;

// ===============================================
// Obtener todos los participantes
// ===============================================
app.get('/', (req, res) => {
    desde =  req.query.desde || 0;
    limite = req.query.limite || 0;
    if (desde < 0) {
        desde = 0;
    }
    desde = Number(desde)
    limite = Number(limite);
    Participante.find({})
    .skip(desde)
    .limit(limite)
    .exec((err, participante) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar recursos del participante'
            })
        }

        Participante.countDocuments({}, (err, total) => {
            res.status(200).json({
                ok: true,
                participante,
                total
            });
        });
    });
});

// ===============================================
// Buscar participante
// ===============================================
app.get('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Participante.findById(id, (err, participante) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el participante",
                err
            });
        }
        if (!participante) {
            return res.status(400).json({
                ok: false,
                mensaje: "El participante no existe"
            });
        }
        res.status(200).json({
            ok: true,
            participante
        });

    });
});

// ===============================================
// Ingresar informacion del participante
// ===============================================
app.post("/", [verificaToken, verificaAdmin_Role], (req, res) => {
    let { nombre, email, estado, quiz } = JSON.parse(req.body.data);
    let participante = new Participante({
        nombre,
        email,
        estado,
        quiz
    });
    participante.save((err, participanteDB) => {
        if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "Error al guardar el participante",
              err
            });
        }
        res.status(201).json({
          ok: true,
          participanteDB
        });
    });
});

// ===============================================
// Modificar información del participante
// ===============================================
app.put("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Participante.findById(id, (err, participante) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el participante",
                err
            });
        }
        if (!participante) {
            return res.status(400).json({
                ok: false,
                mensaje: "El participante no existe"
            });
        }
        let { nombre, email, aciertos, estado, quiz } = JSON.parse(req.body.data);
        participante.nombre = nombre;
        participante.email = email;
        participante.aciertos = aciertos;
        participante.estado = estado;
        participante.quiz = quiz;
        participante.save((err, participanteDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el participante",
                    err
                });
            }
            res.status(200).json({
                ok: true,
                participanteDB
            });
        });
    });
});

// ===============================================
// Eliminar información del participante
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Participante.findByIdAndDelete(id, (err, participanteDB) => {
        if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "Error al buscar el participante",
              err
            });
        }
        if (!participanteDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe ese participante"
            });
        }
        res.status(200).json({
            ok: true,
            participanteDB
        });
    });
});

module.exports = app;