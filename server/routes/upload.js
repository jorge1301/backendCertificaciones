const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require('fs');
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");
const Usuario = require("../models/usuario");
const Agencias = require('../models/agencia');
const Certificado = require("../models/certificado");
const Avanzado = require("../models/avanzado");
const Internacional = require("../models/internacional");
const PortafolioCursos = require("../models/portafolio_curso");
const Galeria = require("../models/galeria");
const Portafolio = require("../models/portafolio");

//Default options
app.use(fileUpload());

app.put("/:coleccion/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let coleccion = req.params.coleccion;
  let id = req.params.id;

  //Colecciones permitidas
  let coleccionesValidas = ['agencias', 'avanzados', 'certificados', 'galerias', 'internacionales', 'portafoliocursos', 'usuarios', 'portafolios'];

  if (coleccionesValidas.indexOf(coleccion) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Coleccion no valida"
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se ha seleccionado un archivo"
    });
  }

  //Obtener nombre del archivo
  let archivo = req.files.imagen;
  let recortarNombre = archivo.name.split(".");
  let extensionArchivo = recortarNombre[recortarNombre.length - 1];
  //let nombreOriginal = recortarNombre[0];

  // Filtar extensiones permitidas
  let extensionesPermitidas = ["jpg", "pdf", "png"];
  if (extensionesPermitidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no válida",
      err: {
        message:
          "Las extensiones válidas son " + extensionesPermitidas.join(", ")
      }
    });
  }

  //Nombre de archivo personalizado
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  subirPorColeccion(coleccion, id, nombreArchivo, res, archivo);
});

function subirPorColeccion(coleccion, id, nombreArchivo, res, archivo) {
  switch (coleccion) {
    case "agencias":
      modificarImagen(id,nombreArchivo,res,Agencias,coleccion, archivo);
      break;
    case "certificados":
      modificarImagen(id, nombreArchivo, res, Certificado, coleccion, archivo);
      break;
    case "avanzados":
      modificarImagen(id, nombreArchivo, res, Avanzado, coleccion, archivo);
      break;
    case "internacionales":
      modificarImagen(id, nombreArchivo, res, Internacional, coleccion, archivo);
      break;
    case "portafoliocursos":
      modificarImagen(id, nombreArchivo, res, PortafolioCursos, coleccion, archivo);
      break;
    case "galerias":
      modificarImagen(id, nombreArchivo, res, Galeria, coleccion, archivo);
      break;
    case "portafolios":
      modificarImagen(id, nombreArchivo, res, Portafolio, coleccion, archivo);
      break;
    case "usuarios":
      modificarImagen(id, nombreArchivo, res, Usuario, coleccion, archivo);
      break;
    default:
      break;
  }
}

function modificarImagen(id, nombreArchivo, res, modelo, coleccion, archivo ) {
  modelo.findById(id, (err, data) => {
    if (!data) {
      return res.status(400).json({
        ok: false,
        err: "No existe esa información"
      });
    }
    let path = `./uploads/${coleccion}/${nombreArchivo}`;
    archivo.mv(path, err => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al mover el archivo",
          err
        });
      }
    });
    let pathViejo = `./uploads/${coleccion}/` + data.imagen;
    if (fs.existsSync(pathViejo)) {
      fs.unlinkSync(pathViejo);
    }
    data.imagen = nombreArchivo;
    data.save((err, dataActualizada) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      return res.status(200).json({
        ok: true,
        message: "Imagen actualizada"
      });
    });
  });
}

module.exports = app;
