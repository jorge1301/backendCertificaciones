const jwt = require('jsonwebtoken');
// ====================
// Verificar Token
// ====================

let verificaToken = (req,res,next) =>{
    let token = req.get('token');
    jwt.verify(token,process.env.SEED,(err,decode)=>{
        if(err){
            return res.status(401).json({
                ok:false,
                err:{
                    message: 'No es valido ese token'
                }
            });
        }

        req.usuario = decode.usuario;
        next();

    });
    
};

// ====================
// Verificar ADMIN-ROL
// ====================

let verificaAdmin_Role = (req, res, next) => {
   let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE'){
        next();
        
    }else{
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No es un administrador'
            }
        })
    }   
    
};

// ====================
// Verificar Token para Imagen
// ====================

let verificaTokenImg = (req,res,next) =>{
    let token = req.query.token;
    jwt.verify(token, process.env.SEED, (err, decode) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'No es valido ese token'
                }
            });
        }

        req.usuario = decode.usuario;
        next();

    });
    
}

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}