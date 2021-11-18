window.addEventListener("load", function(){
    let formulario = document.querySelector(".formulario");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let boton = document.getElementById("button");
    let iconoX = document.getElementById("iconoX");
    let iconoX2 = document.getElementById("iconoX2");



let errorEmailP = document.getElementById("errorEmailP");
let errorPassP = document.getElementById("errorPassP");



formulario.addEventListener("submit", function(e){
    e.preventDefault()


    let errorEmail = [];
    let errorPass = [];

    let key = false;



    //          ***EMAIL***         //

    if (email.value === "" || email.value === null){
        errorEmail.push("Ingresa un correo electronico");
        key = true;
        iconoX.innerHTML = "<i class = 'fas fa-times'></i>";
        iconoX.style.color = "crimson";
        iconoX.style.paddingLeft = "5px";
    }

    

    else {
        iconoX.innerHTML = "";
        iconoX.style.color = "lightgreen";
        iconoX.style.paddingLeft = "5px";
    }

    



    //          ***PASSWORD***          //

    
    if (password.value === null || password.value === ""){
        errorPass.push("Ingresa una contraseña");
        key = true;
        iconoX2.innerHTML = "<i class = 'fas fa-times'></i>";
        iconoX2.style.color = "crimson";
        iconoX2.style.paddingLeft = "5px";
    }
    

    

    else {
        iconoX2.innerHTML = "";
        iconoX2.style.color = "lightgreen";
        iconoX2.style.paddingLeft = "5px";
    }

    
    
    
    //          ***ERRORES***           //

    
    if (key){
        errorEmailP.innerHTML = errorEmail.join(" ");
        errorPassP.innerHTML = errorPass.join(" ");
    }

    else{
        errorEmailP.innerText = "";
        errorPassP.innerText = "";
        
       formulario.submit()
    }
})

})