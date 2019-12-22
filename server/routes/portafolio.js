const express = require("express");
const app = express();
const Portafolio = require("../models/portafolio");
const {
    verificaToken,
    verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");

// ===============================================
// Obtener toda la informacion del portafolio
// ===============================================
app.get('/', (req, res) => {
    Portafolio.find({}).exec((err, portafolio) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando el portafolio ',
                err
            })
        }
        res.status(200).json({
            ok: true,
            portafolio
        });
    });
});

// ===============================================
// Ingresar el portafolio
// ===============================================
app.post('/', [verificaToken, verificaAdmin_Role], (req, res) => {
    let body = req.body;
    let portafolio = new Portafolio({
        titulo: body.titulo,
        mision: body.mision,
        vision: body.vision,
        imagen: body.imagen,
        centro: body.centro
    });
    portafolio.save((err, portafolioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            portafolioDB
        });
    });
});

// ===============================================
// Modificar información del portafolio
// ===============================================
app.put("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    let usuario = req.usuario._id;
    let id = req.params.id;
    req.body.usuario = usuario;
    let body = _.pick(req.body, [
        "titulo",
        "mision",
        "vision",
        "imagen",
        "centro"
    ]);

    Portafolio.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, portafolioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!portafolioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No existe ese portafolio"
                }
            })
        }
        res.status(200).json({
            ok: true,
            portafolioDB
        })
    })
});

// ===============================================
// Eliminar información del portafolio
// ===============================================
app.delete('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    Portafolio.findOneAndDelete(id, (err, portafolioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!portafolioDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'No existe ese portafolio'
                }
            });
        }
        res.status(200).json({
            ok: true,
            portafolioDB
        });
    });
});

module.exports = app;