window.addEventListener("load", function() {
    let formulario = document.querySelector(".formulario");
    let nombre = document.getElementById("nombre");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let boton = document.getElementById("button");
    let iconoX = document.getElementById("iconoX");
    let iconoX2 = document.getElementById("iconoX2");
    let iconoX3 = document.getElementById("iconoX3");


    let errorNombreP = document.getElementById("errorNombreP");
    let errorEmailP = document.getElementById("errorEmailP");
    let errorPassP = document.getElementById("errorPassP");



    formulario.addEventListener("submit", function(e){
        e.preventDefault()
    
        let errorName = [];
        let errorEmail = [];
        let errorPass = [];
        let regexEmail =  /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
    
        let key = false;
    
    
    
        //          *** NOMBRE ***          //
    
    
        if (nombre.value === "" || nombre.value === null){
            errorName.push("Ingresa un nombre de usuario");
            key = true;
            iconoX.innerHTML = "<i class = 'fas fa-times'></i>";
            iconoX.style.color = "crimson";
            iconoX.style.paddingLeft = "5px";
        }
    
        else if (nombre.value.length < 3){
            errorName.push("Ingresa un nombre mas largo");
            key = true;
            iconoX.innerHTML = "<i class = 'fas fa-times'></i>";
            iconoX.style.color = "crimson";
            iconoX.style.paddingLeft = "5px";
        }
    
        else {
            iconoX.innerHTML = "<i class = 'fas fa-check'></i>";
            iconoX.style.color = "lightgreen";
            iconoX.style.paddingLeft = "5px";
        }
    
    
    
    
    
    
    
        //          *** EMAIL ***           //
    
    
        if (email.value === "" || email.value === null){
            errorEmail.push("Ingresa un email");
            key = true;
            iconoX2.innerHTML = "<i class = 'fas fa-times'></i>";
            iconoX2.style.color = "crimson";
            iconoX2.style.paddingLeft = "5px";
        }
    
        else if (!regexEmail.test(email.value)){
            errorEmail.push("Ingresa un email válido");
            key = true;
            iconoX2.innerHTML = "<i class = 'fas fa-times'></i>";
            iconoX2.style.color = "crimson";
            iconoX2.style.paddingLeft = "5px";
        }
    
    
        else {
            
            iconoX2.innerHTML = "<i class = 'fas fa-check'></i>";
            iconoX2.style.color = "lightgreen";
            iconoX2.style.paddingLeft = "5px";
        }
    
    
    
    
    
    
        
    //          ***PASSWORD***          //
    
    
    
        if (password.value === "" || password.value === null){
            errorPass.push("Ingresa una contraseña");
            key = true;
            iconoX3.innerHTML = "<i class = 'fas fa-times'></i>";
            iconoX3.style.color = "crimson";
            iconoX3.style.paddingLeft = "5px";
        }
        else if (password.value.length < 3){
            errorPass.push("Ingresa una contraseña de mas de 3 caracteres");
            key = true;
            iconoX3.innerHTML = "<i class = 'fas fa-times'></i>";
            iconoX3.style.color = "crimson";
            iconoX3.style.paddingLeft = "5px";
        }
    
        else{
           
            
            
            iconoX3.innerHTML = "<i class = 'fas fa-check'></i>";
            iconoX3.style.color = "lightgreen";
            iconoX3.style.paddingLeft = "5px";
        }
        
    
    
    
    
    
    
        //          ***ERRORES***           //
    
    
        if (key){
            errorNombreP.innerHTML = errorName.join(" ");
            errorEmailP.innerHTML = errorEmail.join(" ");
            errorPassP.innerHTML = errorPass.join(" ");
        }
    
        
    
    
    
    
        //          ***ENVIO DE FORMULARIO***           //
        
    
        else {
            errorNombreP.innerText = "";
            errorEmailP.innerText = "";
            errorPassP.innerText = "";

            formulario.submit();    
        }
})

})