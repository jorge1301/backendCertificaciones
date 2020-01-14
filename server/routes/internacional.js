const express = require("express");
const app = express();
const Internacional = require("../models/internacional");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const upload = require("../middlewares/storage");
const fs = require("fs");

//Storage middlewares
let cargarArchivo = upload("internacionales");

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id, usuario;

// ===============================================
// Obtener todos los cursos internacionales
// ===============================================
app.get("/", (req, res) => {
  Internacional.find({}).exec((err, internacional) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando cursos internacionales",
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      internacional
    });
  });
});

// ===============================================
// Ingresar un curso internacional
// ===============================================
app.post("/", cargarArchivo.single('imagen'), [verificaToken, verificaAdmin_Role], (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo valido"
    });
  }
  let body = req.body;
  let internacional = new Internacional({
    titulo: body.titulo,
    imagen: req.file.filename,
    direccion: body.direccion,
    fecha: body.fecha,
    descripcion: body.descripcion,
    requisitos: body.requisitos,
    proposito: body.proposito,
    metodologia: body.metodologia,
    valor: body.valor,
    incluye: body.incluye,
    programacion: body.programacion
  });

  internacional.save((err, internacionalDB) => {
    if (err) {
      fs.unlinkSync("./uploads/internacionales/" + req.file.filename);
      return res.status(500).json({
        ok: false,
        err
      });
    }
    res.status(201).json({
      ok: true,
      internacionalDB
    });
  });
});

// ===============================================
// Modificar información de un curso internacional
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
  pathNuevaImagen = `./uploads/internacionales/` + req.file.filename;
  req.body.usuario = usuario;
  Internacional.findById(id, (err, internacional) => {
    if (err) {
      fs.unlinkSync(pathNuevaImagen);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el curso internacional",
        errors: err
      });
    }
    if (!internacional) {
      fs.unlinkSync(pathNuevaImagen);
      return res.status(400).json({
        ok: false,
        mensaje: "El curso internacional no existe"
      });
    }
    imagenAntigua = internacional.imagen;
    let { titulo, direccion, fecha, descripcion, requisitos, proposito, metodologia, valor, incluye, programacion } = req.body;
    internacional.titulo = titulo;
    internacional.imagen = req.file.filename;
    internacional.direccion = direccion;
    internacional.fecha = fecha;
    internacional.descripcion = descripcion;
    internacional.requisitos = requisitos;
    internacional.proposito = proposito;
    internacional.metodologia = metodologia;
    internacional.valor = valor;
    internacional.incluye = incluye;
    internacional.programacion = programacion
    internacional.save((err, internacionalDB) => {
      if (err) {
        fs.unlinkSync(pathNuevaImagen);
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el curso internacional",
          errors: err
        });
      }
      pathViejo = `./uploads/internacionales/` + imagenAntigua;
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }
      res.status(200).json({
        ok: true,
        internacionalDB
      });
    });
  });
});

// ===============================================
// Eliminar información de un curso internacional
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  Internacional.findByIdAndDelete(id, (err, internacionalDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if (!internacionalDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "No existe ese certificado"
        }
      });
    }
    fs.unlinkSync(`./uploads/internacionales/` + internacionalDB.imagen);
    res.status(200).json({
      ok: true,
      internacionalDB
    });
  });
});

module.exports = app;
