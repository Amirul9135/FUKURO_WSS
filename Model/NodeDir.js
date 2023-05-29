const db = require("../Controller/DBConn")

module.exports = class NodeDir {
    #pathId
    #nodeId
    #path
    #label

    register() {
        var strSql = "INSERT INTO node_dir(nodeId,path,label) VALUES(" + db.escape(this.#nodeId)
            + "," + db.escape(this.#path) + "," + db.escape(this.#label) + ")"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve({ id: result.insertId })
                }
            })
        })
    }

    update() {
        var strSql = "UPDATE node_dir SET path=" + db.escape(this.#path) + ",label="
            + db.escape(this.#label) + " WHERE pathId=" + db.escape(this.#pathId)

        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve({ affected: result.affectedRows })
                }
            })
        })
    }

    static grantAccess(pathId, userId) {
        var strSQL = "INSERT IGNORE INTO node_dir_access (userId,pathId) VALUES (" + db.escape(userId) + "," + db.escape(pathId) + ")"
        return new Promise(function (resolve, reject) {
            db.query(strSQL, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

    static removeAccess(pathId, userId) {
        var strSQL = "DELETE FROM node_dir_access WHERE userId=" + db.escape(userId) + " AND pathId=" + db.escape(pathId)
        return new Promise(function (resolve, reject) {
            db.query(strSQL, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve({ affected: result.affectedRows })
                }
            })
        })
    }

    constructor(jObj = null) {
        this.#pathId = -1;
        this.#nodeId = -1;
        this.#path = "";
        this.#label = "";
        if (jObj != null) {
            if (jObj.hasOwnProperty("pathId")) {
                this.#pathId = jObj["pathId"];
            }
            if (jObj.hasOwnProperty("nodeId")) {
                this.#nodeId = jObj["nodeId"];
            }
            if (jObj.hasOwnProperty("path")) {
                this.#path = jObj["path"];
            }
            if (jObj.hasOwnProperty("label")) {
                this.#label = jObj["label"];
            }
        }
    }
    setPathId(pathId) {
        this.#pathId = pathId
    }
    getPathId() {
        return this.#pathId;
    }

    setNodeId(nodeId) {
        this.#nodeId = nodeId
    }
    getNodeId() {
        return this.#nodeId;
    }

    setPath(path) {
        this.#path = path
    }
    getPath() {
        return this.#path;
    }

    setLabel(label) {
        this.#label = label
    }
    getLabel() {
        return this.#label;
    }
}