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
let imagenAntigua, pathViejo, pathNuevaImagen, id, usuario;

// ===============================================
// Obtener todos los certificados de un usuario
// ===============================================
app.get("/", (req, res) => {
  let cedula = req.body.cedula
  Certificado.find({ cedula }, 'imagen').exec((err, certificadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "Error al cargar recursos del certificado",
        err
      });
    }
    let [datos] = certificadoDB;
    if (!datos) {
      return res.status(400).json({
        ok: false,
        message: "No existe ese estudiante"
      });
    }
    if (!datos.imagen) {
      return res.status(400).json({
        ok: false,
        message: "No existen certificados"
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
  Certificado.find({}).exec((err, certificado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error al cargar recursos del certificado',
        err
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
  let { cedula, nombre } = req.body;
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
          message: 'Ya existe ese usuario'
        });
      }
      else {
        fs.unlinkSync("./uploads/certificados/" + req.file.filename);
        return res.status(500).json({
          ok: false,
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
  usuario = req.usuario._id;
  id = req.params.id;
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo"
    });
  }
  pathNuevaImagen = `./uploads/certificados/` + req.file.filename;
  req.body.usuario = usuario;
  req.body.imagen = req.file.filename;
  Certificado.findById(id, (err, certificado) => {
    if (err) {
      fs.unlinkSync(pathNuevaImagen);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el certificado",
        errors: err
      });
    }
    if (!certificado) {
      fs.unlinkSync(pathNuevaImagen);
      return res.status(400).json({
        ok: false,
        mensaje: "El certificado no existe"
      });
    }
    imagenAntigua = certificado.imagen;
    certificado.nombre = req.body.nombre;
    certificado.imagen = req.file.filename;
    certificado.save((err, certificadoDB) => {
      if (err) {
        fs.unlinkSync(pathNuevaImagen);
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el certificado",
          errors: err
        });
      }
      pathViejo = `./uploads/certificados/` + imagenAntigua;
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
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
        err
      });
    }
    if (!certificadoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "No existe ese certificado"
        }
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
