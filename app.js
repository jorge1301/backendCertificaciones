// Importaciones
const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
require('dotenv').config();



//Inportar Rutas
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');
//Inicializar
const app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//Rutas
app.use("/login", loginRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/", appRoutes);

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
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor, \x1b[32m%s\x1b[0m", "online");
});
