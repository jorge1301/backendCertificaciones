// Importaciones
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

//Inicializar
const app = express();

//Rutas
app.get("/home", (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: "Peticion realizada correctamente"
    });
});

//Conexion BD
mongoose.connect(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    },
    err => {
        if (err) throw err;
        console.log("Base de datos conectada");
    }
)
    .catch(err => console.log);


//Iniciar Servidor
app.listen(3000, () => {
    console.log("Servidor, \x1b[32m%s\x1b[0m", "online");
});