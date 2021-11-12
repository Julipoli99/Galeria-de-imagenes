const {Router} = require("express");
const router = Router();
const db = require("../../database/models");
const {sequelize, Sequelize} = require("../../database/models");
const op = Sequelize.Op;
const path = require("path");
const {unlink} = require("fs-extra");




router.get("/", (req, res) => {
    res.render("home")
})



router.post("/subido", async(req, res) => {
    await db.Imagen.create({
        url: "/img/" + req.file.filename,
        Titulo: req.body.title,
        Description: req.body.description
    })
    res.redirect("/subido")
    console.log(req.file)
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

module.exports = router;