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
let imagenAntigua, pathViejo, pathNuevaImagen, id, usuario;

// ===============================================
// Obtener todos los cursos del portafolio
// ===============================================
app.get('/', (req, res) => {
    PortafolioCurso.find({}).exec((err, portafolioCursoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar cursos del portafolio',
                err
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
app.post('/',cargarArchivo.single('imagen'), [verificaToken, verificaToken], (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se ha seleccionado un archivo valido"
      });
    }
    let {requisitos,incluye,ciclos} = req.body;
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
  usuario = req.usuario._id;
  id = req.params.id;
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo"
    });
  }
  pathNuevaImagen = `./uploads/portafolioCursos/` + req.file.filename;
  req.body.usuario = usuario;
  PortafolioCurso.findById(id, (err, portafolio) => {
    if (err) {
      fs.unlinkSync(pathNuevaImagen);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el curso del portafolio",
        errors: err
      });
    }
    if (!portafolio) {
      fs.unlinkSync(pathNuevaImagen);
      return res.status(400).json({
        ok: false,
        mensaje: "El curso del portafolio no existe"
      });
    }
    imagenAntigua = portafolio.imagen;
    let { requisitos, incluye, ciclos } = req.body;
    portafolio.imagen = req.file.filename;
    portafolio.requisitos = requisitos;
    portafolio.incluye  = incluye;
    portafolio.ciclos = ciclos;
    portafolio.save((err, portafolioDB) => {
      if (err) {
        fs.unlinkSync(pathNuevaImagen);
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el curso avanzado",
          errors: err
        });
      }
      pathViejo = `./uploads/portafolioCursos/` + imagenAntigua;
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
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
                err
            });
        }
        if (!portafolioCursoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No existe ese curso en el portafolio"
                }
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
