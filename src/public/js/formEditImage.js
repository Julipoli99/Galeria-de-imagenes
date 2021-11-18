window.addEventListener("load", function(){
    let formulario = document.querySelector(".formulario-edicion");
    let titulo = document.getElementById("titulo");
    let imagen = document.getElementById("imagen");
    let descripcion = document.getElementById("descripcion");

    let errorTituloP = document.getElementById("errorTituloP")
    let errorImagenP = document.getElementById("errorImagenP")
    let errorDescripcionP = document.getElementById("errorDescripcionP")

    formulario.addEventListener("submit", function(e){
        e.preventDefault();

        let errorTitle = [];
        let errorImage = [];
        let errorDescription = [];
        let key = false;


        if(titulo.value === "" || titulo.value === null){
            errorTitle.push("Ingresa un titulo");
            key = true;
        }
    
        if(imagen.value === "" || imagen.value === null){
            errorImage.push("Ingresa una imagen");
            key = true;
        }
    
        if(descripcion.value === "" || descripcion.value === null){
            errorDescription.push("Ingresa una descripción");
            key = true;
        }

        if(key){
            errorTituloP.innerHTML = errorTitle.join(" ");
            errorImagenP.innerHTML = errorImage.join(" ");
            errorDescripcionP.innerHTML = errorDescription.join(" ");

            errorTituloP.style.color = "crimson";
            errorImagenP.style.color = "crimson";
            errorDescripcionP.style.color = "crimson";

        }
    
        else {
           formulario.submit()
        }
    })
    
})