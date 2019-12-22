const express = require("express");
const app = express();
const Galeria = require("../models/galeria");
const {
    verificaToken,
    verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");

// ===============================================
// Obtener todas las imagenes de galeria
// ===============================================
app.get('/', (req, res) => {
    Galeria.find({}).exec((err, galeria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar recursos de la galeria',
                err
            });
        }
        res.status(200).json({
            ok: true,
            galeria
        });
    });
});

// ===============================================
// Ingresar imagenes en galeria
// ===============================================
app.post('/', [verificaToken, verificaAdmin_Role], (req, res) => {
    let body = req.body;
    let galeria = new Galeria({
        imagen: body.imagen,
        informacion: body.informacion
    });
    galeria.save((err, galeriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            galeriaDB
        });
    });
});

// ===============================================
// Modificar información de la galeria
// ===============================================
app.put('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let usuario = req.usuario._id;
    let id = req.params.id;
    req.body.usuario = usuario;
    let body = _.pick(req.body, [
        "imagen",
        "informacion"
    ]);
    Galeria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, galeriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!galeriaDB) {
            return res.status(400).json({
                ok: false,
                message: "No existe esa imagen"
            });
        }
        res.status(200).json({
            ok: true,
            galeriaDB
        });

    });
});

// ===============================================
// Eliminar información de la galeria
// ===============================================
app.delete('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    Galeria.findByIdAndDelete(id, (err, galeriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!galeriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe esa imagen'
                }
            });
        }
        res.status(200).json({
            ok: true,
            galeriaDB
        });
    });
});

module.exports = app;