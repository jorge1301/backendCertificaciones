const express = require("express");
const app = express();
const Agencia = require("../models/agencia");
const Avanzado = require("../models/avanzado");
const Certificado = require("../models/certificado");
const Galeria = require("../models/galeria");
const Internacional = require("../models/internacional");
const Portafolio = require("../models/portafolio");
const PortafolioCursos = require("../models/portafolio_curso");

const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");
const _ = require("underscore");

app.get('/coleccion/:tabla/:busqueda', [verificaToken, verificaAdmin_Role], (req, res) => {
  let busqueda = req.params.busqueda;
  let tabla = req.params.tabla;
  let regex = new RegExp(busqueda, "i");
  let promesa;
  switch (tabla) {
    case "agencias":
      promesa = buscarAgencias(regex);
      break;
    case "avanzados":
      promesa = buscarCursosAvanzados(regex);
      break;
    case "certificados":
      promesa = buscarCertificados(regex);
      break;
    case "galeria":
      promesa = buscarGaleria(regex);
      break;
    case "internacionales":
      promesa = buscarCursosInternacionales(regex);
      break;
    case "portafolio":
      promesa = buscarPortafolio(regex);
      break;
    case "portafolioCursos":
      promesa = buscarPortafolioCursos(regex);
      break;

    default:
      return res.status(400).json({
        ok: false,
        err: "No existe esa coleccion"
      });
  }
  promesa.then(data => {
    res.status(200).json({
      ok: true,
      [tabla]: data
    });
  });
});

app.get('/:busqueda', [verificaToken, verificaAdmin_Role], (req, res) => {
  let busqueda = req.params.busqueda;
  let regex = new RegExp(busqueda,'i');
  Promise.all([
    buscarAgencias(regex),
    buscarCursosAvanzados(regex),
    buscarCertificados(regex),
    buscarGaleria(regex),
    buscarCursosInternacionales(regex),
    buscarPortafolio(regex),
    buscarPortafolioCursos(regex)
  ]).then(respuestas => {
    res.status(200).json({
      ok: true,
      agencias: respuestas[0],
      avanzados: respuestas[1],
      certificados: respuestas[2],
      galerias: respuestas[3],
      internacionales: respuestas[4],
      portafolio: respuestas[5],
      portafolioCursos: respuestas[6]
    });
  });
});

function buscarAgencias(regex) {
  return new Promise((resolve, reject) => {
    Agencia.find()
      .or([{informacion: regex}])
      .exec((err, agencias) => {
        if(err){
          reject('Error al cargar las agencias', err);
        } else {
          resolve(agencias);
        }
      });
  });
}

function buscarCursosAvanzados(regex){
  return new Promise((resolve, reject) => {
    Avanzado.find()
      .or([{titulo: regex}])
      .exec((err,avanzado)=> {
        if(err){
          reject('Error al cargar los cursos avanzados', err)
        } else {
          resolve(avanzado)
        }
      });
  });
}

function buscarCertificados(regex) {
  return new Promise((resolve, reject) => {
    Certificado.find()
      .or([{ cedula: regex },{nombre: regex}])
      .exec((err, certificado) => {
        if (err) {
          reject("Error al cargar los certificados", err);
        } else {
          resolve(certificado);
        }
      });
  });
}

function buscarGaleria(regex) {
  return new Promise((resolve, reject) => {
    Galeria.find()
      .or([{ informacion: regex }])
      .exec((err, galeria) => {
        if (err) {
          reject("Error al cargar la galeria", err);
        } else {
          resolve(galeria);
        }
      });
  });
}

function buscarCursosInternacionales(regex) {
  return new Promise((resolve, reject) => {
    Internacional.find()
      .or([{ titulo: regex }])
      .exec((err, internacionales) => {
        if (err) {
          reject("Error al cargar los cursos internacionales", err);
        } else {
          resolve(internacionales);
        }
      });
  });
}

function buscarPortafolio(regex) {
  return new Promise((resolve, reject) => {
    Portafolio.find()
      .or([{ titulo: regex }])
      .exec((err, portafolio) => {
        if (err) {
          reject("Error al cargar el portafolio", err);
        } else {
          resolve(portafolio);
        }
      });
  });
}

function buscarPortafolioCursos(regex) {
  return new Promise((resolve, reject) => {
    PortafolioCursos.find()
      .or([{ titulo: regex }])
      .exec((err, portafolio) => {
        if (err) {
          reject("Error al cargar el curso del portafolio", err);
        } else {
          resolve(portafolio);
        }
      });
  });
}

module.exports = app;