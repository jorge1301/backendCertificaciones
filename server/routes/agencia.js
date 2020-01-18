const express = require("express");
const app = express();
const Agencia = require("../models/agencia");
const {
    verificaToken,
    verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const upload = require('../middlewares/storage');
const fs = require('fs');

//Storage middlewares
let cargarArchivo = upload('agencias');

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id, desde;

// ===============================================
// Obtener todos las agencias
// ===============================================
app.get("/", (req, res) => {
  desde = req.query.desde || 0;
  desde = Number(desde);
  Agencia.find({})
    .skip(desde)
    .limit(5)
    .exec((err, agencia) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          message: "Error al cargar recursos de las agencias",
          err
        });
      }
      Agencia.countDocuments({}, (err, total) => {
        res.status(200).json({
          ok: true,
          agencia,
          total
        });
      });
    });
});

// ===============================================
// Buscar Agencia
// ===============================================
app.get('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Agencia.findById(id, (err, agencia) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar la agencia",
                err
            });
        }
        if (!agencia) {
            return res.status(400).json({
                ok: false,
                mensaje: "La agencia no existe"
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
app.post("/", cargarArchivo.single('imagen'), [verificaToken, verificaAdmin_Role], (req, res) => {
    let { informacion } = JSON.parse(req.body.data);
    if (!req.file) {
        return res.status(400).json({
            ok: false,
            mensaje: "No se ha seleccionado un archivo valido"
        });
    }
    let agencia = new Agencia({
        imagen: req.file.filename,
        informacion
    });
    agencia.save((err, agenciaDB) => {
        if (err) {
            fs.unlinkSync("./uploads/agencias/" + req.file.filename);
            return res.status(500).json({
              ok: false,
              mensaje: "Error al guardar la agencia",
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
app.put("/:id", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    if (req.file) {
        pathNuevaImagen = `./uploads/agencias/` + req.file.filename;
    }
    Agencia.findById(id, (err, agencia) => {
        if (err) {
            req.file ? fs.unlinkSync(pathNuevaImagen) : "";
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar la agencia",
                err
            });
        }
        if (!agencia) {
            req.file ? fs.unlinkSync(pathNuevaImagen) : "";
            return res.status(400).json({
                ok: false,
                mensaje: "La agencia no existe"
            });
        }
        let { informacion } = JSON.parse(req.body.data);
        imagenAntigua = agencia.imagen;
        agencia.imagen = req.file === undefined ? imagenAntigua : req.file.filename;
        agencia.informacion = informacion;
        agencia.save((err, agenciaDB) => {
            if (err) {
                req.file ? fs.unlinkSync(pathNuevaImagen) : "";
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar la agencia",
                    err
                });
            }
            pathViejo = `./uploads/agencias/` + imagenAntigua;
            if (fs.existsSync(pathViejo)) {
                req.file ? fs.unlinkSync(pathViejo) : "";
            }
            res.status(200).json({
                ok: true,
                agenciaDB
            });
        });
    });
});

// ===============================================
// Eliminar información de la agencia
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Agencia.findByIdAndDelete(id, (err, agenciaDB) => {
        if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "Error al buscar la agencia",
              err
            });
        }
        if (!agenciaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe esa agencia"
            });
        }
        fs.unlinkSync(`./uploads/agencias/` + agenciaDB.imagen);
        res.status(200).json({
            ok: true,
            agenciaDB
        });
    });
});

module.exports = app;
