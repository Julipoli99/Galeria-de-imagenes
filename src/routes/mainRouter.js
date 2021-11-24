const {Router} = require("express");
const router = Router();
const db = require("../../database/models");
const {sequelize, Sequelize} = require("../../database/models");
const op = Sequelize.Op;
const path = require("path");
const {unlink} = require("fs-extra");
const { nextTick } = require("process");
const {body, validationResult} = require("express-validator");
const bcryptjs = require("bcryptjs");


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
]




router.get("/", (req, res) => {
    res.render("home")
})



router.post("/", validatedSubmit, async(req, res) => {
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



router.get("/subido",  (req, res) => {

     db.Imagen.findAll()
        .then(function(imagen){
            res.render("Imagenes", {imagen})
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
        
    
        await unlink(path.resolve("./src/public" + imagenEncontrada.url))
    
        res.redirect("/subido")
    }

    
})

router.get("/registro", (req, res) => {
    res.render("registro")
})

router.post("/registro", (req, res) => {

    let encriptedPass = bcryptjs.hashSync(req.body.password, 10);
   
    let NewUser =   {
        Nombre: req.body.nombre,
        Email: req.body.email,
        Password: encriptedPass
    }

    db.Usuario.create(NewUser);

    res.redirect("/login")
    
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


router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/")
})

module.exports = router;