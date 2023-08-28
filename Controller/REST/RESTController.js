// this class is aimed to create abstraction of rest api controller
// the purpose of abstraction is for scalability in case of changes in dependency used in handling rest request to the server
const Authenticator = require ("../Middleware/Authenticator")
const Validator = require("../Middleware/Validator")
const express = require("express")

class RESTController{
    _auth
    _validator
    _router
    constructor(){
        this._auth = new Authenticator()
        this._validator = new Validator()
        this._router = express.Router()
    }
    routes(){
        return this._router
    }  
}

module.exports = RESTController