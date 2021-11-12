const express = require("express");
const app = express();
const multer = require("multer");
const {uuid} = require("uuidv4")

const path = require("path");
const port = 3000;



//Settings
app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))





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



// Router
app.use(require("./routes/mainRouter"));

// Static files

app.use(express.static(path.join(__dirname, "public")))