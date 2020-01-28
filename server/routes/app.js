const express = require('express');
const app = express();

//Inportar Rutas
const usuarioRoutes = require('./usuario');
const loginRoutes = require('./login');
const portafolioRoutes = require("./portafolio");
const portafolioCursoRoutes = require("./portafolio_curso");
const avanzadoRoutes = require('./avanzado');
const internacionalRoutes = require("./internacional");
const galeriaRoutes = require('./galeria');
const agenciaRoutes = require("./agencia");
const certificadoRoutes = require("./certificado");
const busquedaRoutes = require("./busqueda");
const uploadRoutes = require("./upload");
const imagenesRoutes = require("./imagenes");
const participanteRoutes = require("./participante");
const quizGuardiaRoutes = require ("./quiz_guardia");

//Rutas
app.use("/login", loginRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/portafolio", portafolioRoutes);
app.use("/portafolio-curso", portafolioCursoRoutes);
app.use("/avanzado", avanzadoRoutes);
app.use("/internacional", internacionalRoutes);
app.use("/galeria", galeriaRoutes);
app.use("/agencia", agenciaRoutes);
app.use("/certificado", certificadoRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes );
app.use("/imagen", imagenesRoutes);
app.use('/participante', participanteRoutes);
app.use("/quizGuardiaRoutes", quizGuardiaRoutes);

module.exports = app;
