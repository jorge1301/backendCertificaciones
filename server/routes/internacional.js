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
let imagenAntigua, pathViejo, pathNuevaImagen, id, desde;

// ===============================================
// Obtener todos los cursos internacionales
// ===============================================
app.get("/", (req, res) => {
  desde = req.query.desde || 0;
  limite = req.query.limite || 0;
  if (desde < 0) {
    desde = 0;
  }
  desde = Number(desde);
  limite = Number(limite);
  Internacional.find({})
    .skip(desde)
    .limit(limite)
    .exec((err, internacional) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando cursos internacionales",
          err
        });
      }
      Internacional.countDocuments({}, (err, total) => {
        res.status(200).json({
          ok: true,
          internacional,
          total
        });
      });
    });
});

// ===============================================
// Buscar curso internacional
// ===============================================
app.get('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Internacional.findById(id, (err, internacional) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el curso internacional",
                err
            });
        }
        if (!internacional) {
          return res.status(400).json({
            ok: false,
            mensaje: "El curso internacional no existe"
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
  let { titulo, direccion, fecha, descripcion, requisitos, proposito, metodologia, valor, incluye, programacion } = JSON.parse(req.body.data);
  let internacional = new Internacional({
    titulo,
    imagen: req.file.filename,
    direccion,
    fecha,
    descripcion,
    requisitos,
    proposito,
    metodologia,
    valor,
    incluye,
    programacion
  });

  internacional.save((err, internacionalDB) => {
    if (err) {
      fs.unlinkSync("./uploads/internacionales/" + req.file.filename);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al guardar el curso internacional",
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
  id = req.params.id;
  if (req.file) {
    pathNuevaImagen = `./uploads/internacionales/` + req.file.filename;
  }
  Internacional.findById(id, (err, internacional) => {
    if (err) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el curso internacional",
        err
      });
    }
    if (!internacional) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(400).json({
        ok: false,
        mensaje: "El curso internacional no existe"
      });
    }
    let { titulo, direccion, fecha, descripcion, requisitos, proposito, metodologia, valor, incluye, programacion } = JSON.parse(req.body.data);
    imagenAntigua = internacional.imagen;
    internacional.titulo = titulo;
    internacional.imagen = req.file === undefined ? imagenAntigua : req.file.filename;
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
        req.file ? fs.unlinkSync(pathNuevaImagen) : "";
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el curso internacional",
          err
        });
      }
      pathViejo = `./uploads/internacionales/` + imagenAntigua;
      if (fs.existsSync(pathViejo)) {
        req.file ? fs.unlinkSync(pathViejo) : "";
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
        mensaje: "Error al buscar el curso internacional",
        err
      });
    }
    if (!internacionalDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ese certificado"
      });
    }
    fs.unlinkSync(`./uploads/internacionales/` + internacionalDB.imagen);
    res.status(200).json({
      ok: true,
      internacionalDB
    });
  });
});

// ===============================================
// Eliminar una programación
// ===============================================
app.delete("/eliminar/programacion", (req, res) => {
  id = req.query.id;
  idProgramacion = req.query.idProgramacion;
  Internacional.findOneAndUpdate(
    { _id: id },
    { $pull: { programacion: { _id: idProgramacion } } },
    { safe: true, multi: true }
  ).exec((err, internacional) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar",
        err
      });
    }
    res.status(200).json({
      ok: true,
      internacional
    });
  });
});

module.exports = app;
