const express = require("express");
const app = express();
const path = require('path');
const fs = require('fs');

app.get('/:tipo/:documento', (req, res) => {
    let tipo = req.params.tipo;
    let documento = req.params.documento;
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${documento}`);
    let pathDefault = path.resolve(__dirname,'../assets/no-img.jpg');
    if(fs.existsSync(pathImagen)){
        res.sendFile(pathImagen);
    } else {
        res.sendFile(pathDefault);
    }

});

module.exports = app;
