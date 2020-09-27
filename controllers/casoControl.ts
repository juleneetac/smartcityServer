'use strict';



async function postCaso (req, res){  //registrarse un usuario si el usuario ya existe da error
    let c = req.body.addcaso;
    console.log(req.body);
    
        try{
            console.log("Todo: "+ c)
            return res.status(201).send({message: "Nuevo Post añadido"}) 
            } 
        catch (err) {
            res.status(500).send(err);
            console.log(err);
            }
    }

    module.exports = {postCaso};