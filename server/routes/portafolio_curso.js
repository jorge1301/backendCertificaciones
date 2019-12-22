const express = require("express");
const app = express();
const PortafolioCurso = require("../models/portafolio_curso");
const {
    verificaToken,
    verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");

// ===============================================
// Obtener todos los cursos del portafolio
// ===============================================
app.get('/', (req, res) => {
    PortafolioCurso.find({}).exec((err, portafolioCursoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar cursos del portafolio',
                err
            });
        }
        res.status(200).json({
            ok: true,
            portafolioCursoDB
        });
    });
});

// ===============================================
// Ingresar cursos al portafolio
// ===============================================
app.post('/', [verificaToken, verificaToken], (req, res) => {
    let body = req.body;
    let portafolioCurso = new PortafolioCurso({
        imagen: body.imagen,
        requisitos: body.requisitos,
        incluye: body.incluye,
        ciclos: body.ciclos
    });
    portafolioCurso.save((err, portafolioCursoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            portafolioCursoDB
        });
    });
});

// ===============================================
// Modificar información de un curso avanzado
// ===============================================
app.put('/:id', [verificaToken, verificaToken], (req, res) => {
    let usuario = req.usuario._id;
    let id = req.params.id;
    req.body.usuario = usuario;
    let body = _.pick(req.body, [
        "imagen",
        "requisitos",
        "incluye",
        "ciclos"
    ]);

    PortafolioCurso.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, portafolioCursoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!portafolioCursoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No existe ese curso en el portafolio"
                }
            });
        }
        res.status(200).json({
            ok: true,
            portafolioCursoDB
        });
    });
});

// ===============================================
// Eliminar información de un curso del portafolio
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    PortafolioCurso.findByIdAndDelete(id, (err, portafolioCursoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!portafolioCursoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No existe ese curso en el portafolio"
                }
            });
        }
        res.status(200).json({
          ok: true,
          portafolioCursoDB
        });
    });
});

module.exports = app;
