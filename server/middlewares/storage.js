const multer = require('multer');
module.exports = function almacenamiento(direccion) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/${direccion}`);
    },
    filename: function (req, file, cb) {
      let extension = file.mimetype.split("/")[1];
      cb(null, file.fieldname + "-" + Date.now() + "." + extension);
    }
  });
  return upload = multer({
    fileFilter(req, file, cb) {
      let extensionesPermitidas = ["image/jpeg", "image/jpg", "application/pdf", "image/png"];
      if (extensionesPermitidas.indexOf(file.mimetype) < 0) {
        return cb(null, false);
      }
      cb(null, true);
    },
     storage 
  });
}

