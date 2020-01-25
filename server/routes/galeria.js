const express = require("express");
const app = express();
const Galeria = require("../models/galeria");
const {
    verificaToken,
    verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const upload = require("../middlewares/storage");
const fs = require("fs");

//Storage middlewares
let cargarArchivo = upload("galerias");

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id, desde;

// ===============================================
// Obtener todas las imagenes de galeria
// ===============================================
app.get("/", (req, res) => {
    desde = req.query.desde || 0;
    limite = req.query.limite || 0;
    if(desde < 0) {
        desde = 0;
    }
    desde = Number(desde);
    limite = Number(limite);
    Galeria.find({})
        .skip(desde)
        .limit(limite)
        .exec((err, galeria) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al cargar recursos de la galeria",
                    err
                });
            }
            Galeria.countDocuments({}, (err, total) => {
              res.status(200).json({
                ok: true,
                galeria,
                total
              });
            });
        });
});

// ===============================================
// Buscar galeria
// ===============================================
app.get('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Galeria.findById(id, (err, galeria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar la galeria",
                err
            });
        }
        if (!galeria) {
          return res.status(400).json({
            ok: false,
            mensaje: "La galeria no existe"
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
app.post('/', cargarArchivo.single('imagen'), [verificaToken, verificaAdmin_Role], (req, res) => {
    let { informacion } = JSON.parse(req.body.data);
    if (!req.file) {
        return res.status(400).json({
            ok: false,
            mensaje: "No se ha seleccionado un archivo valido"
        });
    }
    let galeria = new Galeria({
        imagen: req.file.filename,
        informacion
    });

    galeria.save((err, galeriaDB) => {
        if (err) {
            fs.unlinkSync("./uploads/galerias/" + req.file.filename);
            return res.status(500).json({
                ok: false,
                mensaje: "Error al guardar la galeria",
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
app.put("/:id", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    if (req.file) {
        pathNuevaImagen = `./uploads/galerias/` + req.file.filename;
    }
    Galeria.findById(id, (err, galeria) => {
        if (err) {
            req.file ? fs.unlinkSync(pathNuevaImagen) : "";
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar la galeria",
                err
            });
        }
        if (!galeria) {
            req.file ? fs.unlinkSync(pathNuevaImagen) : "";
            return res.status(400).json({
                ok: false,
                mensaje: "La galeria no existe"
            });
        }
        let { informacion } = JSON.parse(req.body.data);
        imagenAntigua = galeria.imagen;
        galeria.imagen = req.file === undefined ? imagenAntigua : req.file.filename;
        galeria.informacion = informacion;
        galeria.save((err, galeriaDB) => {
            if (err) {
                req.file ? fs.unlinkSync(pathNuevaImagen) : "";
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar la galeria",
                    err
                });
            }
            pathViejo = `./uploads/galerias/` + imagenAntigua;
            if (fs.existsSync(pathViejo)) {
                req.file ? fs.unlinkSync(pathViejo) : "";
            }
            res.status(200).json({
                ok: true,
                galeriaDB
            });
        });
    });
});

// ===============================================
// Eliminar información de la galeria
// ===============================================
app.delete('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Galeria.findByIdAndDelete(id, (err, galeriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar la galeria",
                err
            });
        }
        if (!galeriaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe esa galeria'
            });
        }
        fs.unlinkSync(`./uploads/galerias/` + galeriaDB.imagen);
        res.status(200).json({
            ok: true,
            galeriaDB
        });
    });
});

module.exports = app;