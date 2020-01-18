const express = require("express");
const app = express();
const Portafolio = require("../models/portafolio");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const upload = require("../middlewares/storage");
const fs = require("fs");

//Storage middlewares
let cargarArchivo = upload("portafolios");

//variables
let imagenAntigua, pathViejo, pathNuevaImagen, id, desde;

// ===============================================
// Obtener toda la informacion del portafolio
// ===============================================
app.get("/", (req, res) => {
  desde = req.query.desde || 0;
  desde = Number(desde);
  Portafolio.find({})
    .skip(desde)
    .limit(5)
    .exec((err, portafolio) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando el portafolio ",
          err
        });
      }
      Portafolio.countDocuments({}, (err, total) => {
        res.status(200).json({
          ok: true,
          portafolio,
          total
        });
      });
    });
});

// ===============================================
// Ingresar el portafolio
// ===============================================
app.post('/', cargarArchivo.single('imagen'), [verificaToken, verificaAdmin_Role], (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo valido"
    });
  }
  let { titulo, mision, vision, centro } = JSON.parse(req.body.data);
  let portafolio = new Portafolio({
    titulo,
    imagen: req.file.filename,
    mision,
    vision,
    centro
  });
  portafolio.save((err, portafolioDB) => {
    if (err) {
      fs.unlinkSync("./uploads/portafolios/" + req.file.filename);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al guardar el portafolio",
        err
      });
    }
    res.status(201).json({
      ok: true,
      portafolioDB
    });
  });
});

// ===============================================
// Modificar información del portafolio
// ===============================================
app.put("/:id", cargarArchivo.single("imagen"), [verificaToken, verificaAdmin_Role], (req, res) => {
  usuario = req.usuario._id;
  if (req.file) {
    pathNuevaImagen = `./uploads/portafolios/` + req.file.filename;
  }
  Portafolio.findById(id, (err, portafolio) => {
    if (err) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el portafolio",
        err
      });
    }
    if (!portafolio) {
      req.file ? fs.unlinkSync(pathNuevaImagen) : "";
      return res.status(400).json({
        ok: false,
        mensaje: "El portafolio no existe"
      });
    }
    let { titulo, mision, vision, centro } = JSON.parse(req.body.data);
    imagenAntigua = portafolio.imagen;
    portafolio.titulo = titulo;
    portafolio.imagen = req.file === undefined ? imagenAntigua : req.file.filename;
    portafolio.mision = mision;
    portafolio.vision = vision;
    portafolio.centro = centro;
    portafolio.save((err, portafolioDB) => {
      if (err) {
        req.file ? fs.unlinkSync(pathNuevaImagen) : "";
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el portafolio",
          err
        });
      }
      pathViejo = `./uploads/portafolios/` + imagenAntigua;
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
// Eliminar información del portafolio
// ===============================================
app.delete('/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
  id = req.params.id;
  Portafolio.findOneAndDelete(id, (err, portafolioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el portafolio",
        err
      });
    }
    if (!portafolioDB) {
      return res.status(500).json({
        ok: false,
        mensaje: 'No existe ese portafolio'
      });
    }
    fs.unlinkSync(`./uploads/portafolios/` + portafolioDB.imagen);
    res.status(200).json({
      ok: true,
      portafolioDB
    });
  });
});

module.exports = app;