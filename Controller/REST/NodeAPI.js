const express = require("express");
const router = express.Router();
const Validator = require("../Middleware/Validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Auth = require("../Middleware/Authenticate");
const Node_ = require("../../Model/Node_");
const NodeDir = require("../../Model/NodeDir");
const CPUReading = require("../../Model/CPUReading");
 

router.get(
  "/access",
  [
    Auth.verifyJWT(),
    Validator.checkNumber("nodeId", { min: 1 }),
    Validator.checkString("passKey"),
    Validator.validate(),
  ],
  function verifyAccess(req, res) {
    console.log("here");
    Node_.findNode(req.body.nodeId, req.user.id)
      .then(async function (result) {
        var isMatch = await bcrypt.compare(req.body.passKey, result.passKey);
        result.passKey = null;
        if (isMatch) return res.status(200).send(result);
        else return res.status(401).send({ message: "no access" });
      })
      .catch(function (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
      });
  }
);

//redundant since flutter mobile cant send body in get
router.post(
  "/access",
  [
    Auth.verifyJWT(),
    Validator.checkNumber("nodeId", { min: 1 }),
    Validator.checkString("passKey"),
    Validator.validate(),
  ],
  function (req, res) {
    console.log("here");
    Node_.findNode(req.body.nodeId, req.user.id)
      .then(async function (result) {
        var isMatch = await bcrypt.compare(req.body.passKey, result.passKey);
        result.passKey = null;
        if (isMatch) return res.status(200).send(result);
        else return res.status(401).send({ message: "no access" });
      })
      .catch(function (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
      });
  }
);

router.post(
  "/",
  [
    Auth.verifyJWT(),
    Validator.checkString("name"),
    Validator.checkString("description"),
    Validator.checkString("ipAddress"),
    Validator.checkString("passKey"),
    Validator.validate(),
  ],
  async function registerNode (req, res) {
    var newNode = new Node_(req.body);
    var error;
    newNode.setPassKey(
      await bcrypt.hash(newNode.getPassKey(), await bcrypt.genSalt(10))
    );
    newNode.setNodeId(
      await newNode.register().catch(function (err) {
        error = err;
      })
    );
    if (!newNode.getNodeId())
      return res
        .status(500)
        .send({ message: "failed to register node", details: error });

    var newDir = new NodeDir({
      nodeId: newNode.getNodeId(),
      path: "/",
      label: "root",
    });
    newDir.setPathId(
      await newDir.register().catch(function (err) {
        error = err;
      })
    );
    if (!newDir.getPathId())
      return res
        .status(500)
        .send({
          message: "failed to register node default root directory",
          details: error,
        });

    NodeDir.grantAccess(newDir.getPathId(), req.user.id)
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
);

router.put(
  "/",
  [
    Auth.verifyJWT(),
    Validator.checkNumber("nodeId",{min:1}),
    Validator.checkString("name"),
    Validator.checkString("description"),
    Validator.checkString("ipAddress"),
    Validator.checkString("passKey"),
    Validator.validate(),
  ],
  async function registerNode (req, res) {
    var newNode = new Node_(req.body);
    var error;
    newNode.setPassKey(
      await bcrypt.hash(newNode.getPassKey(), await bcrypt.genSalt(10))
    );
    newNode.update().then(function(result){
      return res.status(200).send()
    }).catch(function (err) {
      return res.status(500).send({ message: err.message });
    });
    
  }
);


router.get("/", Auth.verifyJWT(), function fetchAccessibleNodes (req, res) {
  Node_.findUserAccessibleNodes(req.user.id)
    .then(function (result) {
      return res.status(200).send(result);
    })
    .catch(function (err) {
      return res.status(500).send({ message: err.message });
    });
});

router.get("/:nodeId", Auth.verifyJWT(), function nodeDetails(req, res) {
  Node_.findNode(req.params.nodeId, req.user.id)
    .then(function (result) {
      result.passKey = null;
      return res.status(200).send(result);
    })
    .catch(function (err) {
      return res.status(500).send({ message: err.message });
    });
});

router.get("/config/:nodeId", function getNodeConfigs(req, res) {
  console.log("s");
  WsClients.testBroadcast()
  if (!req.params.nodeId) {
    return res.status(400).send();
  }
  Node_.fetchConfigs(req.params.nodeId)
    .then(function (result) {
      return res.status(200).send(result);
    })
    .catch(function (err) {
      return res.status(500).send({ message: err.message });
    });
});
/*metrics api*/
// @Path variable integer of the node id
// @Query dur= duration in second
// @Query int= interval in second
router.get("/cpu/:nodeId", [Auth.verifyJWT()], function historicalCPUUsage (req, res) {
  //must have path variable which is the nodeId
  if (!req.params.nodeId) {
    return res.status(400).send({ message: "invalid request" });
  }
  var nodeId = parseInt(req.params.nodeId);
  if (isNaN(nodeId)) {
    return res.status(400).send({ message: "invalid request" });
  }
  console.log(req.query);
  var duration = 3600;
  var interval = 15;
  if (req.query.dur) {
    duration = parseInt(req.query.dur);
  }
  if (req.query.int) {
    interval = parseInt(req.query.int);
  }
  var date = null;
  if (req.query.date) {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(req.query.date)) {
      // if valid yyyy-mm-dd hh:mm format
      date = req.query.date;
    }
  }

  CPUReading.fetchHistorical(nodeId, interval, duration, date)
    .then(function (result) {
      return res.status(200).send(result);
    })
    .catch(function (err) {
      return res.status(400).send({ message: err.message });
    });
});

module.exports = router;
