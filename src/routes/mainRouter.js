const {Router} = require("express");
const router = Router();
const db = require("../../database/models");
const {sequelize, Sequelize} = require("../../database/models");
const op = Sequelize.Op;
const path = require("path");
const {unlink} = require("fs-extra");
const { nextTick } = require("process");
const {body, validationResult} = require("express-validator");


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
    await db.Imagen.create({
        url: "/img/" + req.file.filename,
        Titulo: req.body.title,
        Description: req.body.description
    })
    res.redirect("/subido")
    console.log(req.file)
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

router.post("/edicion/:id", async(req, res) => {
    let imagenEncontrada = await db.Imagen.findByPk(req.params.id);

     await db.Imagen.update({
        url: "/img/" + req.file.filename,
        Titulo: req.body.title,
        Description: req.body.description
    }, {
        where: {
            id: req.params.id
        }
    })

    await unlink(path.resolve("./src/public" + imagenEncontrada.url))

    res.redirect("/subido")
})

module.exports = router;