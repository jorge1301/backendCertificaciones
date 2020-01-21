const express = require("express");
const app = express();
const Avanzado = require("../models/avanzado");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const upload = require("../middlewares/storage");
const fs = require("fs");

//Storage middlewares
let cargarArchivo = upload("avanzados");

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id, desde;

// ===============================================
// Obtener todos los cursos avanzados
// ===============================================
app.get("/", (req, res) => {
  desde = req.query.desde || 0;
  if (desde < 0) {
    desde = 0;
  }
  desde = Number(desde);
  Avanzado.find({})
    .skip(desde)
    .limit(5)
    .exec((err, avanzado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando cursos avanzados",
          err
        });
      }
      Avanzado.countDocuments({}, (err, total) => {
        res.status(200).json({
          ok: true,
          avanzado,
          total
        });
      });
    });
});

// ===============================================
// Buscar curso avanzado
// ===============================================
app.get('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    Avanzado.findById(id, (err, avanzado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el curso avanzado",
                err
            });
        }
        if (!avanzado) {
          return res.status(400).json({
            ok: false,
            mensaje: "El curso avanzado no existe"
          });
        }
        res.status(200).json({
          ok: true,
          avanzado
        });

    });
});

// ===============================================
// Ingresar un curso avanzado
// ===============================================
app.post("/", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo valido"
    });
  }
  let { titulo, direccion, fecha, descripcion, requisitos, proposito, metodologia, valor, incluye, programacion } = JSON.parse(req.body.data);
  let avanzado = new Avanzado({
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

  avanzado.save((err, avanzadoDB) => {
    if (err) {
      fs.unlinkSync('./uploads/avanzados/' + req.file.filename);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al guardar el curso avanzado",
        err
      });
    }
    res.status(201).json({
      ok: true,
      avanzadoDB
    });
  });
});

// ===============================================
// Modificar información de un curso avanzado
// ===============================================
app.put("/:id", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  if (req.file) {
    pathNuevaImagen = `./uploads/avanzados/` + req.file.filename;
  }
  Avanzado.findById(id, (err, avanzado) => {
    if (err) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el curso avanzado",
        err
      });
    }
    if (!avanzado) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(400).json({
        ok: false,
        mensaje: "El curso avanzado no existe"
      });
    }
    let { titulo, direccion, fecha, descripcion, requisitos, proposito, metodologia, valor, incluye, programacion } = JSON.parse(req.body.data);
    imagenAntigua = avanzado.imagen;
    avanzado.titulo = titulo;
    avanzado.imagen = req.file === undefined ? imagenAntigua : req.file.filename;
    avanzado.direccion = direccion;
    avanzado.fecha = fecha;
    avanzado.descripcion = descripcion;
    avanzado.requisitos = requisitos;
    avanzado.proposito = proposito;
    avanzado.metodologia = metodologia;
    avanzado.valor = valor;
    avanzado.incluye = incluye;
    avanzado.programacion = programacion
    avanzado.save((err, avanzadoDB) => {
      if (err) {
        req.file ? fs.unlinkSync(pathNuevaImagen) : "";
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el curso avanzado",
          err
        });
      }
      pathViejo = `./uploads/avanzados/` + imagenAntigua;
      if (fs.existsSync(pathViejo)) {
        req.file ? fs.unlinkSync(pathViejo) : "";
      }
      res.status(200).json({
        ok: true,
        avanzadoDB
      });
    });
  });
});

// ===============================================
// Eliminar información de un curso avanzado
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  Avanzado.findByIdAndRemove(id, (err, avanzadoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el curso avanzado",
        err
      });
    }
    if (!avanzadoDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ese curso avanzado"
      });
    }
    fs.unlinkSync(`./uploads/avanzados/` + avanzadoDB.imagen);
    res.status(200).json({
      ok: true,
      avanzadoDB
    });
  });
});

module.exports = app;
