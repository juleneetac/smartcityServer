'use strict';



async function postCaso (req, res){  //registrarse un usuario si el usuario ya existe da error
    let nombre = req.body.addcaso;
    console.log(req.body);
        try{
            console.log("Nombre recibido: "+ nombre)
            return res.status(201).send({message: "Nuevo Post añadido"}) 
            } 
        catch (err) {
            res.status(500).send(err);
            console.log(err);
            }
    }
async function getFrase (req, res){ //me da datos de un estudiante especifico
    let frase = "Esto es un get del server";
    res.status(200).json(frase);
    console.log(frase)
    };

    module.exports = {postCaso, getFrase};