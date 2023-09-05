//this class handles the request to manage resource related to node data
const RESTController = require("./RESTController") // rest controller base class
const NodeDir = require("../../Model/NodeDir")
const Node_ = require("../../Model/Node_");
const bcrypt = require("bcryptjs");

class NodeAPI extends RESTController {
  constructor() {
    super()

    //bind path
    this._router.post("/access", this.#verifyAccess())
    this._router.post("/", this.#registerNode())
    this._router.get("/", this.#fetchAccessibleNodes())
    this._router.get("/:nodeId",this.#nodeDetails())
    this._router.put("/",this.#updateNode())
  }
  #verifyAccess() {
    return [
      this._auth.authRequest(),
      this._validator.checkNumber("nodeId", { min: 1 }),
      this._validator.checkString("passKey"),
      this._validator.validate(),
      (req, res) => {
        console.log("here");
        Node_.findNode(req.body.nodeId, req.user.id)
          .then(async function (result) {
            var isMatch = (result) ? await bcrypt.compare(req.body.passKey, result.passKey) : false
            result.passKey = null;
            console.log(result)
            if (isMatch) return res.status(200).send(result);
            else return res.status(401).send({ message: "no access" });
          })
          .catch(function (err) {
            console.log(err);
            return res.status(500).send({ message: err.message });
          });
      }
    ]
  }
  #registerNode() {
    return [
      this._auth.authRequest(),
      this._validator.checkString("name"),
      this._validator.checkString("description"),
      this._validator.checkString("passKey"),
      this._validator.validate(),
      async (req, res) => {
        var newNode = new Node_(req.body);
        var error;
        newNode.passKey = await bcrypt.hash(newNode.passKey, await bcrypt.genSalt(10))
        await newNode.register()
        if (!newNode.nodeId)
          return res
            .status(500)
            .send({ message: "failed to register node" });

        var newDir = new NodeDir({
          nodeId: newNode.nodeId,
          path: "/",
          label: "root",
        });
        await newDir.register()
        console.log('after reg', newDir)
        if (!newDir.pathId)
          return res
            .status(500)
            .send({
              message: "failed to register node default root directory"
            });

        NodeDir.grantAccess(newDir.pathId, req.user.id)
          .then(function (result) {
            return res.status(200).send({ message: "registered" });
          })
          .catch(function (err) {
            return res
              .status(500)
              .send({
                message: "failed to grant user access to default directory root",
              });
          });
      }
    ]
  }
  #fetchAccessibleNodes() {
    return [
      this._auth.authRequest(),
      (req, res) => {

        Node_.findUserAccessibleNodes(req.user.id)
          .then(function (result) {
            return res.status(200).send(result);
          })
          .catch(function (err) {
            return res.status(500).send({ message: err.message });
          });
      }
    ]
  }
  #nodeDetails() {
    return [
      this._auth.authRequest(),
      (req, res) => {
        Node_.findNode(req.params.nodeId, req.user.id)
          .then(function (result) {
            result.passKey = null;
            return res.status(200).send(result);
          })
          .catch(function (err) {
            return res.status(500).send({ message: err.message });
          })
      }
    ]
  }
  #updateNode() {
    return [
      this._auth.authRequest(),
      this._validator.checkNumber("nodeId",{min:1}),
      this._validator.checkString("name"),
      this._validator.checkString("description"), 
      this._validator.validate(),
      async   (req, res) => {
        var newNode = new Node_(req.body);  
        newNode.update(req.user.id).then(function(result){
          if(result>0){
            return res.status(200).send()

          }
          else{
            
            return res.status(400).send({ message: "no change, make sure you have access and authority to update the node" })
          }
        }).catch(function (err) {
          return res.status(500).send({ message: err.message });
        });
        
      }

    ]
  }
}

module.exports = NodeAPI;
