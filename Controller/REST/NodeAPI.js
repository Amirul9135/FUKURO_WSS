//this class handles the request to manage resource related to node data
const RESTController = require("./RESTController") // rest controller base class 
const Node_ = require("../../Model/Node_");
const NodeConfig = require("../../Model/NodeConfig")
const bcrypt = require("bcryptjs");
const FUKURO = require("../../FUKURO");

class NodeAPI extends RESTController {
  constructor() {
    super()

    //bind path
    this._router.post("/access", this.#verifyAccess())
    this._router.post("/", this.#registerNode())
    this._router.get("/", this.#fetchAccessibleNodes())
    this._router.get("/:nodeId", this.#nodeDetails())
    this._router.put("/", this.#updateNode())
    this._router.get("/:nodeId/info", this.#getSpec())
    this._router.get("/:nodeId/log/:start/:end", this.#getLog())
    // tb rmv this._router.post("/:nodeId/grant/:userId",this.#toggleAccess(true))
    // tb rmv this._router.delete("/:nodeId/grant/:userId",this.#toggleAccess(false))

    //access
    this._router.post("/:nodeId/access/admin/:userId", this.#grantAccess(1))
    this._router.post("/:nodeId/access/collaborator/:userId", this.#grantAccess(2))
    this._router.post("/:nodeId/access/guest/:userId", this.#grantAccess(3))
    this._router.delete("/:nodeId/access/:userId", this.#removeAccess())
  }
  #getLog() {
    return [
      this._auth.authRequest(),
      async (req, res) => {

        try {
          parseInt(req.params.nodeId)
          new Date(req.params.start)
          new Date(req.params.end)
        }
        catch (e) {
          return res.status(400).send({ message: "Invalid node id or date from" })
        }
  
        var nodeDetail = await Node_.findNode(req.params.nodeId, req.user.id).catch(function (err) {
          return res.status(401).send({ message: "Unauthorized to view this node log" })
        })
        if (!nodeDetail) {
          return res.status(401).send({ message: "Unauthorized to view this node log" })
        }
        Node_.fetchNodeLog(req.params.nodeId, req.params.start,req.params.end).then((result) => {
          return res.status(200).send(result)
        }).catch((error)=>{
          return res.status(500).send({message:error.message})
        })
      }
    ]
  }

  #grantAccess(role) {
    return [
      this._auth.authRequest(),
      (req, res) => {
        try {
          parseInt(req.params.nodeId)
          parseInt(req.params.userId)
        }
        catch (e) {
          return res.status(400).send({ message: "Invalid node id or user id" })
        }
        Node_.grantAccess(req.user.id, req.params.userId, req.params.nodeId, role).then((result) => {
          return res.status(200).send()
        }).catch((error) => {
          return res.status(500).send({ "message": error.message })
        })
      }
    ]
  }
  #removeAccess() {
    return [
      this._auth.authRequest(),
      (req, res) => {
        try {
          parseInt(req.params.nodeId)
          parseInt(req.params.userId)
        }
        catch (e) {
          return res.status(400).send({ message: "Invalid node id or user id" })
        }
        Node_.removeAccess(req.user.id, req.params.userId, req.params.nodeId).then((result) => {
          return res.status(200).send()
        }).catch((error) => {
          return res.status(500).send({ "message": error.message })
        })

      }
    ]
  }

  #getSpec() {
    return [
      this._auth.authRequest(),
      (req, res) => {
        if (!req.params.nodeId) {
          return res.status(400).send();
        }
        NodeConfig.getNodeSpec(req.params.nodeId).then((result) => {
          let realRes = {}
          result.forEach(s => {
            realRes[FUKURO.SPEC.getName(s.specId)] = s.value;
          });
          return res.status(200).send(realRes)
        }).catch((err) => {
          return res.status(500).send({ message: err.message })
        })
      }
    ]
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

        // grant admin access
        Node_.grantAccessToCreator(req.user.id, newNode.nodeId).then(async (result) => {
          await Node_.logActivity(newNode.nodeId, "Node Created", req.user.id)
          return res.status(200).send({ message: "registered" });

        }).catch((error) => {
          return res
            .status(500)
            .send({
              message: error.message,
            });
        })
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
      this._validator.checkNumber("nodeId", { min: 1 }),
      this._validator.checkString("name"),
      this._validator.checkString("description"),
      this._validator.validate(),
      async (req, res) => {
        var newNode = new Node_(req.body);
        newNode.update(req.user.id).then(function (result) {
          if (result > 0) {
            return res.status(200).send()

          }
          else {

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
