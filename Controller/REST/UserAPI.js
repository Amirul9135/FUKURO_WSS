//this class handles the request to manage resource related to user data
const RESTController = require("./RESTController") // rest controller base class
const User = require("../../Model/User") // user entity model
const bcrypt = require("bcryptjs") // password encryption 
const crypto = require("crypto") // generate random number for dynamic jwt secret
const jwt = require("jsonwebtoken"); //jwt signing

class UserAPI extends RESTController {

    constructor() {
        super()

        //bind routes to handler in class method
        this._router.post("/", this.#registerUser())
        this._router.post("/login", this.#login())
        this._router.put("/",this.#updateUser())
        this._router.get("/",this.#getUser())
        this._router.get("/logout",this.#logout())
        //simple verification route to only check token
        this._router.get("/verify",  [this._auth.authRequest(),function(req,res){ return res.status(200).send()}])

        //paramas node i
        //query k= &k= , multiple k if needed, as search keys
        //access=true/false
        this._router.get("/find/:nodeId",[this._auth.authRequest(),this.#findUser()]) 
    }
    #findUser(){
        return [
            (req,res)=>{ 
                if(!req.params.nodeId){
                    return res.status(400).send({message:"No node id specified"})
                } 
                let keys = []
                if(req.query.k){
                    keys= [req.query.k]
                }
                console.log(req.query.k)
                User.findUser(req.params.nodeId,keys,req.query.access,req.user.id).then((result)=>{
                    return res.status(200).send(result)
                }).catch((err)=>{
                    return res.status(500).send({message:err.message})
                })
            }
        ]
    }
    #registerUser() {
        return [
            this._validator.checkString("name", "name is required"),
            this._validator.checkString("username",{ min: 6 }, "username must be at least 6 character"),
            this._validator.checkString("email", "email required"),
            this._validator.checkString("password", { min: 6 }, "password must be at least 6 character"),
            this._validator.checkString("phone", { min: 10, max: 11 }),
            this._validator.checkString("pin", { min: 6, max: 6 }),
            this._validator.validate(),
            async function (req, res) {
                var reguser = new User(req.body)
                var salt = await bcrypt.genSalt(10)
                var hashed = await bcrypt.hash(reguser.password, salt)
                salt = await bcrypt.genSalt(10)
                var hashedPin = await bcrypt.hash(reguser.pin, salt)

                reguser.password = hashed
                reguser.pin = hashedPin
                reguser.register().then(function (value) {
                    return res.status(200).send({ message: "registered" })
                }).catch(function (err) {
                    if (err.errno == 1062) {
                        return res.status(409).send({ message: "Username already in use" })
                    }
                    else {
                        return res.status(500).send({ message: err.message })
                    }
                })
            }
        ]
    }

    #login() {
        // bind the logout handler to an instance to be passed into request handler 
        return [
            this._validator.checkString("username", { min: 6 }, "username must be at least 6 character"),
            this._validator.checkString("password", { min: 6 }, "password must be at least 6 character"),
            this._validator.validate(),
            async (req, res)=> {
                var loginUser = new User(req.body)
                loginUser.login().then(async  (result)=> {
                    var isMatch = await bcrypt.compare(loginUser.password, result.password)
                    if (isMatch) {
                        if (!global.jwts)//if no jwts yet initialize
                            global.jwts = {};
                        var secret = ""
                        if (global.jwts && global.jwts.hasOwnProperty(result.userId)) {
                            secret = global.jwts[result.userId]
                        }
                        else {
                            secret = crypto.randomBytes(32).toString('hex');
                            global.jwts[result.userId] = secret;
                        } 
                        await this._auth.logUser (result.userId,secret)
                        console.log('after')
                     //   jwtsCache.mcache.setItem(String(result.userId), secret)
                        var payload = {
                            user: {
                                id: result.userId,
                                name: result.name,
                                username: result.username
                            }
                        }
                        jwt.sign(payload,
                            global.jwts[result.userId],
                            (err, token) => {
                                if (err) throw err
                                var fragment = token.toString().split('.');
                                return res.send({ token: fragment[1] + "." + fragment[2], uid: result.userId });
                            }
                        );

                    }
                    else {
                        return res.status(401).send({ message: "unauthorized" })
                    }
                }).catch(function (err) {
                    return res.status(401).send({ message: "unauthorized" })
                })

            }
        ]
    }
    //update user except password
    #updateUser() {
        return [
            this._auth.authRequest(),
            this._validator.checkString("name", "name is required"),
            this._validator.checkString("username",{ min: 6 }, "user name must be atleast 6 character"),
            this._validator.checkString("email", "email required"),
            this._validator.checkString("phone", { min: 10, max: 11 }),
            this._validator.validate(),
            async  (req, res)=> {
                var reguser = new User(req.body)
                reguser.userId = req.user.id
                reguser.update().then(function (value) {
                    return res.status(200).send({ message: "updated" })
                }).catch(function (err) {
                    if (err.errno == 1062) {
                        return res.status(409).send({ message: "Username already in use" })
                    }
                    else {
                        return res.status(500).send({ message: err.message })
                    }
                })
            }

        ]
    }
    #getUser() {
        return [
            this._auth.authRequest(),
            async (req, res)=> {
                let user = new User({"userId":req.user.id})
            
                user.findByUserId().then(function (result) {
                    return res.status(200).send(result)
                }).catch(function (err) {
                    return res.status(500).send({ message: err.message })
                })
            }
        ]
    }

    #logout() { 
        return [
            this._auth.authRequest(),
            async (req,res) =>{

                //remove the dyamic jwt secret of this user
                //all existing token will be invalid
                console.log("logout")
                this._auth.logoutUser(req.user.id) 
            
                return res.status(200).send();
            }
        ]
    }
}

module.exports = UserAPI