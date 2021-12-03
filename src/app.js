const express = require("express");
const app = express();
const multer = require("multer");
const {uuid} = require("uuidv4")

const path = require("path");
const port = 3000;

const db = require("../database/models");
const {sequelize, Sequelize} = require("../database/models");
const op = Sequelize.Op;

const session = require("express-session");
const router = require("./routes/mainRouter");

const {format} = require("timeago.js");



//Settings
app.listen(process.env.PORT || 3000, function(){
    console.log("SServer running on port: 3000")
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: "this is my secret...",
    resave: false,
    saveUninitialized: false
}));


app.use((req, res, next) => {
    res.locals.isLogged = false;
    
    db.Usuario.findAll()
        .then(function(usuario){
            if(req.session && req.session.usuarioLogueado){
                res.locals.isLogged = true;
                res.locals.usuarioLogueado = req.session.usuarioLogueado;
            }
            next();
        })
})





// Middlewares
const storage = multer.diskStorage({
    destination: path.join(__dirname, "public/img"),
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

app.use(multer({
    storage,
    dest: path.join(__dirname, "public/img"),
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
}).single("image"))



app.use((req, res, next) => {
    app.locals.format = format
    next()
})



// Router
app.use(require("./routes/mainRouter"));

// Static files

app.use(express.static(path.join(__dirname, "public")))