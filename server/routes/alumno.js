const express = require("express");
const app = express();
const Alumno = require("../models/alumno");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
//variables
let id, desde, limite;

// ===============================================
// Obtener todos los alumnos
// ===============================================
app.get('/', (req, res) => {
    desde =  req.query.desde || 0;
    limite = req.query.limite || 0;
    if (desde < 0) {
        desde = 0;
    }
    desde = Number(desde)
    limite = Number(limite);
    Alumno.find({})
    .skip(desde)
    .limit(limite)
    .exec((err, alumno) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar recursos del alumno'
            })
        }

        Alumno.countDocuments({}, (err, total) => {
            res.status(200).json({
                ok: true,
                alumno,
                total
            });
        });
    });
});

// ===============================================
// Buscar alumno por cedula
// ===============================================
app.get('/informacion/:id', (req, res) => {
    identificacion = req.params.id;
    Alumno.findOne({cedula: identificacion}, (err, alumno) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el alumno",
                err
            });
        }
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                mensaje: "El alumno no existe"
            });
        }
        res.status(200).json({
          ok: true,
          alumno
        });

    });
});

// ===============================================
// Buscar alumno
// ===============================================
app.get('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Alumno.findById(id, (err, alumno) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el alumno",
                err
            });
        }
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                mensaje: "El alumno no existe"
            });
        }
        res.status(200).json({
          ok: true,
          alumno
        });

    });
});

// ===============================================
// Ingresar informacion del alumno
// ===============================================
app.post("/", [verificaToken, verificaAdmin_Role], (req, res) => {
    let { cedula, nombre, email, aciertos, estado, quiz } = req.body;
    let alumno = new Alumno({
        cedula,
        nombre,
        email,
        aciertos,
        estado,
        quiz
    });
    alumno.save((err, alumnoDB) => {
        if (err) {
            if (err.code === 11000) {
              return res.status(400).json({
                ok: false,
                mensaje: "Ya existe ese alumno"
              });
            } else {
              return res.status(500).json({
                ok: false,
                mensaje: "Error al guardar el alumno",
                err
              });
            }
        }
        res.status(201).json({
          ok: true,
          alumnoDB
        });
    });
});

// ===============================================
// Actualizar aciertos
// ===============================================
app.put("/aciertos/:id", (req, res) => {
    id = req.params.id;
    Alumno.findById(id, (err, alumno) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el alumno",
                err
            });
        }
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                mensaje: "El alumno no existe"
            });
        }
        let { aciertos } = req.body;
        alumno.aciertos = aciertos;
        alumno.save((err, alumnoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el alumno",
                    err
                });
            }
            res.status(200).json({
                ok: true,
                alumnoDB
            });
        });
    });
});

// ===============================================
// Modificar información del alumno
// ===============================================
app.put("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Alumno.findById(id, (err, alumno) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el alumno",
                err
            });
        }
        if (!alumno) {
            return res.status(400).json({
                ok: false,
                mensaje: "El alumno no existe"
            });
        }
        let { nombre, email, aciertos, estado, quiz } = req.body;
        alumno.nombre = nombre;
        alumno.email = email;
        alumno.aciertos = aciertos;
        alumno.estado = estado;
        alumno.quiz = quiz;
        alumno.save((err, alumnoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el alumno",
                    err
                });
            }
            res.status(200).json({
                ok: true,
                alumnoDB
            });
        });
    });
});

// ===============================================
// Eliminar información del alumno
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Alumno.findByIdAndDelete(id, (err, alumnoDB) => {
        if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "Error al buscar el alumno",
              err
            });
        }
        if (!alumnoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe ese alumno"
            });
        }
        res.status(200).json({
            ok: true,
            alumnoDB
        });
    });
});

module.exports = app;