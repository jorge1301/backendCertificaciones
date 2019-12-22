const express = require("express");
const app = express();
const Agencia = require("../models/agencia");
const {
    verificaToken,
    verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");

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
app.post("/", [verificaToken, verificaAdmin_Role], (req, res) => {
    let body = req.body;
    let agencia = new Agencia({
        imagen: body.imagen,
        informacion: body.informacion
    });
    agencia.save((err, agenciaDB) => {
        if (err) {
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
app.put("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    let usuario = req.usuario._id;
    let id = req.params.id;
    req.body.usuario = usuario;
    let body = _.pick(req.body, [
        "imagen", 
        "informacion"
    ]);
    Agencia.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, agenciaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!agenciaDB) {
            return res.status(400).json({
                ok: false,
                message: "No existe esa agencia"
            });
        }
        res.status(200).json({
            ok: true,
            agenciaDB
        });
    }
    );
});

// ===============================================
// Eliminar información de la agencia
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
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
        res.status(200).json({
            ok: true,
            agenciaDB
        });
    });
});

module.exports = app;
