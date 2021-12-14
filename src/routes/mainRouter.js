const express = require("express");
const routerApp = express();
const {Router} = require("express");
const router = Router();
const db = require("../../database/models");
const {sequelize, Sequelize} = require("../../database/models");
const op = Sequelize.Op;
const path = require("path");
const {unlink} = require("fs-extra");
const { nextTick } = require("process");
const {body, validationResult, check} = require("express-validator");
const bcryptjs = require("bcryptjs");
const multer = require("multer");
const {uuid} = require("uuidv4")


//MULTER MIDDLEWARE PARA FOTO DE PERFIL DE USUARIO EN LA CARPETA FOTOPERFIL

let configuracionImagenFotoPerfil = multer.diskStorage({
    destination: path.join(__dirname, "../public/img/fotoPerfil"),
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

let multerFotoPerfil = multer({
    storage: configuracionImagenFotoPerfil,
    dest: path.join(__dirname, "../public/img/fotoPerfil"),
    limits: {fileSize: 3000000},
    fileFilter: (req, file, cb) => {
        const fileType = /jpeg|jpg|png|gif/;
        const mimeType = fileType.test(file.mimetype);
        const extName = fileType.test(path.extname(file.originalname));

        if(mimeType && extName){
            return cb(null, true)
        }
        else {
            cb("Error: El archivo debe ser una imagen valida")
        }
    }
})

//MULTER MIDDLEWARE PARA FOTO DE IMAGEN EN LA CARPETA IMG

let configuracionImagenFotoImg = multer.diskStorage({
    destination: path.join(__dirname, "../public/img"),
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

let multerFotoImg = multer({
    storage: configuracionImagenFotoImg,
    dest: path.join(__dirname, "../public/img"),
    limits: {fileSize: 3000000},
    fileFilter: (req, file, cb) => {
        const fileType = /jpeg|jpg|png|gif/;
        const mimeType = fileType.test(file.mimetype);
        const extName = fileType.test(path.extname(file.originalname));

        if(mimeType && extName){
            return cb(null, true)
        }
        else {
            cb("Error: El archivo debe ser una imagen valida")
        }
    }
})

//VALIDATIONS//

const validatedSubmit = [
    body("title").notEmpty().withMessage("Debes completar este campo"),
    body("description").notEmpty().withMessage("Escribe una descripción para la imagen"),
    body("image").custom((value, {req}) => {
        let file = req.file;
        let acceptedExtensions = ["jpg", "jpeg", "png", "gif"];
        
        if(!file){
            throw new Error("Tienes que ingresar una imagen")
        }
        return true;
    })
 
]


const validatedEdit = [
    body("title").notEmpty().withMessage("Completa este campo"),
    body("description").notEmpty().withMessage("Escribe una descripción para la imagen"),
    body("image").optional().custom((value, {req}) => {
        let file = req.file;
        let acceptedExtensions = ["jpg", "jpeg", "png", "gif"];
        
        if(!file){
            throw new Error("Tienes que ingresar una imagen")
        }
        return true;
    })
]

const validatedLogin = [
    body("email").notEmpty().withMessage("ingresa un email").bail().isEmail().withMessage("Debes ingresar un email valido"),
    body("")
];

const validatedEditUser = [
    body("nombre").notEmpty().withMessage("Ingresa un nombre"),
    body("email").notEmpty().withMessage("Ingresa un email").bail().isEmail().withMessage("Debes ingresar un email valido"),
    check("imagen").optional({nullable: true, checkFalsy:true})
]




router.get("/", (req, res) => {
    res.render("home")
})



router.post("/", validatedSubmit, multerFotoImg.single("image"),async(req, res) => {
    let resultsValidations = validationResult(req);
    if (resultsValidations.errors.length > 0){
        return res.render("home", {
            errors: resultsValidations.mapped(),
            old: req.body
        })
    }
else{
    
    if(req.session.usuarioLogueado){
        await db.Imagen.create({
            url: "/img/" + req.file.filename,
            Titulo: req.body.title,
            Description: req.body.description,
            id_usuario: req.session.usuarioLogueado.id,
            created_at: new Date()
        })
        res.redirect("/subido")
        console.log(req.file)    
    }

    if (!req.session.usuarioLogueado){
        unlink(path.resolve("./src/public/img/" + req.file.filename))
        return res.render("home", {
            error: {
                deslogueado: {
                    msg: "Debes estar logueado para subir una imagen"
                }
            }
        })
        
    }
    
    
}
})


router.get("/perfilUsuario/:id", (req, res) => {
    let pedidoImagen = db.Imagen.findAll()
    let pedidoUsuario = db.Usuario.findByPk(req.params.id, {
        include: [{association: "imagenes"}]
    })
    Promise.all([pedidoImagen, pedidoUsuario])
        .then(function([imagen, usuario]){
            res.render("perfilUsuario", {imagen, usuario})
        })
})

router.post("/perfilUsuario/:id/delete", async(req, res) => {

    let usuarioImagenEncontrado = await db.Usuario.findByPk(req.params.id)
    
    let imagenEncontrada = await db.Imagen.findAll({
        where:{
            id_usuario: req.params.id
        }
    })
    if(imagenEncontrada.length > 0){
        for(let i = 0; i < imagenEncontrada.length; i++){
            await db.Imagen.destroy({
                where:{
                    id_usuario: req.params.id
                }
            })
            await unlink(path.resolve("./src/public" + imagenEncontrada[i].url))
        }
    }
    

    

    await db.Usuario.destroy({
        where: {
            id: req.params.id
        }
    })

    await unlink(path.resolve("./src/public" + usuarioImagenEncontrado.foto_perfil))

    

    req.session.destroy()
    
    res.redirect("/")
})

router.get("/editarUsuario/:id", (req, res) => {
    db.Usuario.findByPk(req.params.id)
        .then(function(usuario){
            res.render("editarUsuario", {usuario})
        })
})

router.post("/editarUsuario/:id", multerFotoPerfil.single("imagen"), validatedEditUser,  async(req, res) => {

    let resultsValidations = validationResult(req);
    
     if (resultsValidations.errors.length > 0){
         db.Usuario.findByPk(req.params.id)
            .then(function(usuario){
                res.render("editarUsuario", {
                    errors: resultsValidations.mapped(),
                    old: req.body,
                    usuario
                })
            })
    }

    else{
        let imagenEncontradaEdicion = await db.Usuario.findByPk(req.params.id);

        function siExisteONo(){
            if(req.file){
                return "/img/fotoPerfil/" + req.file.filename
            }
            else{
                return imagenEncontradaEdicion.foto_perfil
            }
        }

        //"/img/fotoPerfil/" + req.file.filename

        
            await db.Usuario.update({
                Nombre: req.body.nombre,
                Email: req.body.email,
                foto_perfil: siExisteONo()
            }, {
                where:{
                    id: req.params.id
                }
            })
    
    
        if(req.file){
            await unlink(path.resolve("./src/public" + imagenEncontradaEdicion.foto_perfil))
        }
        
        
        res.redirect("/")
    }

    
})


router.get("/subido",  (req, res) => {

     db.Imagen.findAll()
        .then(function(imagen){
            res.render("Imagenes", {imagen})
        })
})

router.get("/imagenApi", (req, res) => {
    db.Imagen.findAll()
        .then(function(imagenes){
            res.status(200).json({
                total: imagenes.length,
                data: imagenes
            })
            
        })
})

router.get("/image/:id", (req, res) => {
    db.Imagen.findByPk(req.params.id)
        .then(function(imagen){
            res.render("Detalle", {imagen})
        })
})

router.post("/image/:id/delete", async (req, res) => {
    
    let imagenEncontrada = await db.Imagen.findByPk(req.params.id);
    console.log(imagenEncontrada.url);

    await db.Imagen.destroy({
    
        where: {
            id: req.params.id
        }
    })

    await unlink(path.resolve("./src/public" + imagenEncontrada.url))
    
    res.redirect("/subido")
})


router.get("/edicion/:id",  (req, res) => {
    

    db.Imagen.findByPk(req.params.id)
        .then(function(imagen){
            res.render("edicion", {imagen})
        })
})

router.post("/edicion/:id", validatedEdit, async(req, res) => {
    

    let resultsValidations = validationResult(req);
    if (resultsValidations.errors.length > 0){
        return res.render("edicion", {
            errors: resultsValidations.mapped(),
            old: req.body
        })
    }

    else{
        let imagenEncontrada = await db.Imagen.findByPk(req.params.id);
        let usuarioEdita = await db.Usuario.findAll();

        await db.Imagen.update({
            url: "/img/" + req.file.filename,
            Titulo: req.body.title,
            Description: req.body.description,
            id_usuario: usuarioEdita.id,
            updated_at: new Date()
        }, {
            where: {
                id: req.params.id
            }
        })
        //hola//
    
        await unlink(path.resolve("./src/public" + imagenEncontrada.url))
    
        res.redirect("/subido")
    }

    
})

router.get("/registro", (req, res) => {
    res.render("registro")
})

router.post("/registro", multerFotoPerfil.single("imagen"), (req, res) => {
    console.log(req.file)

    
    function siHayFotoONo(){
        if(req.file){
            return "/img/fotoPerfil" + req.file.filename
        }
        else{
            return "Sin foto de perfil"
        }
    }
    
    let encriptedPass = bcryptjs.hashSync(req.body.password, 10);
   
    let NewUser =   {
        Nombre: req.body.nombre,
        Email: req.body.email,
        Password: encriptedPass,
        foto_perfil: siHayFotoONo()
    }

    

    db.Usuario.create(NewUser);

    res.redirect("/login")
    console.log(path.join(__dirname))
    
    
    
})



router.get("/login", (req, res) => {
    res.render("login")
})

router.post("/login", (req, res) => {
    let errors = validationResult(req);

    if(errors.isEmpty()){

        db.Usuario.findAll()
            .then(function (usuarios) {
                let emailBuscado = req.body.email;
                let passwordIngresada = req.body.password;

                let usuarioEncontrado;
                let emailEncontrado;

                for (let i of usuarios) {
                    if (emailBuscado == i.Email) {
                        emailEncontrado = true;

                        if (bcryptjs.compareSync(passwordIngresada, i.Password)) {
                            usuarioEncontrado = i;
                            break;
                        }
                    }
                }
                if (usuarioEncontrado) {
                    req.session.usuarioLogueado = usuarioEncontrado; //Guardo el usuario en session

                    res.redirect("/")
                }

                else {
                    if (emailEncontrado == true || !usuarioEncontrado) {
                        res.render("login", {
                            errors: {
                                contraseña: {
                                    msg: 'Credenciales invalidas'
                                }
                            },
                            old: req.body
                        }); // Email Correcto pero Password Incorrecto       
                    }

                }
            })

    }

    else {
        if (errors.errors.length > 0) {
            res.render("login", { errors: errors.mapped() })
        }
    }
    //FALTA AGREGAR LAS VALIDACIONES DEL BACKEND//
})

router.get("/userApi", (req, res) => {
    db.Usuario.findAll()
        .then(function(usuarios){
            res.status(200).json({
                total: usuarios.length,
                data: usuarios
            })
        })
})


router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/")
})

module.exports = router;