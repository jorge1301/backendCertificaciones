// Importaciones
require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicializar
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Llamado de routes
app.use(require('./routes/app'));

//Conexion BD
mongoose.connect(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    },
    (err) => {
        if (err) throw err;
        console.log("Base de datos conectada");
    }
)
    .catch(err => console.log);


//Iniciar Servidor
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor, \x1b[32m%s\x1b[0m", "online");
});
