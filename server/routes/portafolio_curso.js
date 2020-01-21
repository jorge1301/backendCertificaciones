const express = require("express");
const app = express();
const PortafolioCurso = require("../models/portafolio_curso");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const upload = require("../middlewares/storage");
const fs = require("fs");

//Storage middlewares
let cargarArchivo = upload("portafolioCursos");

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id, desde;

// ===============================================
// Obtener todos los cursos del portafolio
// ===============================================
app.get("/", (req, res) => {
  desde = req.query.desde || 0;
  if (desde < 0) {
    desde = 0;
  }
  desde = Number(desde);
  PortafolioCurso.find({})
    .skip(desde)
    .limit(5)
    .exec((err, portafolioCursoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al cargar cursos del portafolio",
          err
        });
      }
      PortafolioCurso.countDocuments({}, (err, total) => {
        res.status(200).json({
          ok: true,
          portafolioCursoDB,
          total
        });
      });
    });
});

// ===============================================
// Buscar curso del portafolio
// ===============================================
app.get('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    id = req.params.id;
    PortafolioCurso.findById(id, (err, portafolioCursoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar el curso del portafolio",
          err
        });
      }
      if (!portafolioCursoDB) {
        return res.status(400).json({
          ok: false,
          mensaje: "El curso del portafolio no existe"
        });
      }
      res.status(200).json({
        ok: true,
        portafolioCursoDB
      });
    });
});

// ===============================================
// Ingresar cursos al portafolio
// ===============================================
app.post('/', cargarArchivo.single('imagen'), [verificaToken, verificaToken], (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo valido"
    });
  }
  let { requisitos, incluye, ciclos } = JSON.parse(req.body.data);
  let portafolioCurso = new PortafolioCurso({
    imagen: req.file.filename,
    requisitos,
    incluye,
    ciclos
  });
  portafolioCurso.save((err, portafolioCursoDB) => {
    if (err) {
      fs.unlinkSync("./uploads/portafolioCursos/" + req.file.filename);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al guardar el curso del portafolio",
        err
      });
    }
    res.status(201).json({
      ok: true,
      portafolioCursoDB
    });
  });
});

// ===============================================
// Modificar información de un curso del portafolio
// ===============================================
app.put("/:id", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  if (req.file) {
    pathNuevaImagen = `./uploads/portafolioCursos/` + req.file.filename;
  }
  PortafolioCurso.findById(id, (err, portafolio) => {
    if (err) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el curso del portafolio",
        err
      });
    }
    if (!portafolio) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(400).json({
        ok: false,
        mensaje: "El curso del portafolio no existe"
      });
    }
    let { requisitos, incluye, ciclos } = JSON.parse(req.body.data);
    imagenAntigua = portafolio.imagen;
    portafolio.imagen = req.file === undefined ? imagenAntigua : req.file.filename;
    portafolio.requisitos = requisitos;
    portafolio.incluye = incluye;
    portafolio.ciclos = ciclos;
    portafolio.save((err, portafolioDB) => {
      if (err) {
        req.file ? fs.unlinkSync(pathNuevaImagen) : "";
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el curso del portafolio",
          err
        });
      }
      pathViejo = `./uploads/portafolioCursos/` + imagenAntigua;
      if (fs.existsSync(pathViejo)) {
        req.file ? fs.unlinkSync(pathViejo) : "";
      }
      res.status(200).json({
        ok: true,
        portafolioDB
      });
    });
  });
});

// ===============================================
// Eliminar información de un curso del portafolio
// ===============================================
app.delete("/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  PortafolioCurso.findByIdAndDelete(id, (err, portafolioCursoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el curso del portafolio",
        err
      });
    }
    if (!portafolioCursoDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ese curso en el portafolio"
      });
    }
    fs.unlinkSync(`./uploads/portafolioCursos/` + portafolioCursoDB.imagen);
    res.status(200).json({
      ok: true,
      portafolioCursoDB
    });
  });
});

module.exports = app;
