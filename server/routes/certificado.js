const express = require("express");
const app = express();
const Certificado = require("../models/certificado");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const fs = require('fs');
const path = require("path");
const upload = require("../middlewares/storage");

//Storage middlewares
let cargarArchivo = upload("certificados");

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id, desde;

// ===============================================
// Obtener todos los certificados de un usuario
// ===============================================
app.get("/documento", (req, res) => {
  let cedula = req.query.cedula;
  Certificado.find({ cedula }, 'imagen').exec((err, certificadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al cargar recursos del certificado",
        err
      });
    }
    let [datos] = certificadoDB;
    
    if (!datos) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ese estudiante"
      });
    }
    if (!datos.imagen) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existen certificados"
      });
    }
    let pathImagen = path.resolve(
      __dirname,
      `../../uploads/certificados/${datos.imagen}`
    );
    if (fs.existsSync(pathImagen)) {
      res.download(pathImagen);
    }
    // res.status(200).json({
    //   ok: true,
    //   certificadoDB
    // });
  });
});

// ===============================================
// Obtener todos los certificados -- administrador
// ===============================================
app.get("/certificados", [verificaToken, verificaAdmin_Role], (req, res) => {
  desde = req.query.desde || 0;
  if (desde < 0) {
    desde = 0;
  }
  desde = Number(desde);
  Certificado.find({})
    .skip(desde)
    .limit(5)
    .exec((err, certificado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al cargar recursos del certificado",
          err
        });
      }
      Certificado.countDocuments({}, (err, total) => {
        res.status(200).json({
          ok: true,
          certificado,
          total
        });
      });
    });
});

// ===============================================
// Buscar certificado
// ===============================================
app.get('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Certificado.findById(id, (err, certificado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el certificado",
                err
            });
        }
        if (!certificado) {
          return res.status(400).json({
            ok: false,
            mensaje: "El certificado no existe"
          });
        }
        res.status(200).json({
          ok: true,
          certificado
        });

    });
});

// ===============================================
// Ingresar certificados
// ===============================================
app.post("/", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
  let { cedula, nombre } = JSON.parse(req.body.data);
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo valido"
    });
  }
  let certificado = new Certificado({
    cedula,
    nombre,
    imagen: req.file.filename
  });
  certificado.save((err, certificadoDB) => {
    if (err) {
      if (err.code === 11000) {
        fs.unlinkSync("./uploads/certificados/" + req.file.filename);
        return res.status(500).json({
          ok: false,
          mensaje: 'Ya existe ese usuario'
        });
      }
      else {
        fs.unlinkSync("./uploads/certificados/" + req.file.filename);
        return res.status(500).json({
          ok: false,
          mensaje: "Error al guardar el certificado",
          err
        });
      }
    }
    res.status(201).json({
      ok: true,
      certificadoDB
    });
  });
});

// ===============================================
// Modificar información del certificado
// ===============================================
app.put("/:id", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  if (req.file) {
    pathNuevaImagen = `./uploads/certificados/` + req.file.filename;
  };
  Certificado.findById(id, (err, certificado) => {
    if (err) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el certificado",
        err
      });
    }
    if (!certificado) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(400).json({
        ok: false,
        mensaje: "El certificado no existe"
      });
    }
    let { nombre } = JSON.parse(req.body.data);
    imagenAntigua = certificado.imagen;
    certificado.nombre = nombre;
    certificado.imagen = req.file === undefined ? imagenAntigua : req.file.filename;
    certificado.save((err, certificadoDB) => {
      if (err) {
        req.file ? fs.unlinkSync(pathNuevaImagen) : "";
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el certificado",
          err
        });
      }
      pathViejo = `./uploads/certificados/` + imagenAntigua;
      if (fs.existsSync(pathViejo)) {
        req.file ? fs.unlinkSync(pathViejo) : "";
      }
      res.status(200).json({
        ok: true,
        certificadoDB
      });
    });
  });
});

// ===============================================
// Eliminar información de la galeria
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  Certificado.findByIdAndDelete(id, (err, certificadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el certificado",
        err
      });
    }
    if (!certificadoDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ese certificado"
      });
    }
    fs.unlinkSync(`./uploads/certificados/` + certificadoDB.imagen);
    res.status(200).json({
      ok: true,
      certificadoDB
    });
  });
});

module.exports = app;
