
const db = require("../Controller/Database")

module.exports = class NodeDir {
    pathId
    nodeId
    path
    label

    async register() {
        var strSql = "INSERT INTO node_dir(nodeId,path,label) VALUES(:nodeId:,:path:,:label:)"
        let result = await db.queryParams(strSql,this) 
        if(result)
            this.pathId = result.insertId 
        return result
    }

    update() {
        var strSql = "UPDATE node_dir SET path=:path:, label=:label: WHERE pathId=:pathId:" 
        return db.queryParams(strSql,this)
    }

    static grantAccess(pathId, userId) {
        var strSQL = "INSERT IGNORE INTO node_dir_access (userId,pathId) VALUES (" + db.escape(userId) + "," + db.escape(pathId) + ")"
        return db.query(strSQL)
    }

    static removeAccess(pathId, userId) {
        var strSQL = "DELETE FROM node_dir_access WHERE userId=" + db.escape(userId) + " AND pathId=" + db.escape(pathId)
        return db.query(strSQL)
    }

    constructor(jObj = null) {
        if (jObj != null) {
            if (jObj.hasOwnProperty("pathId")) {
                this.pathId = jObj["pathId"];
            }
            if (jObj.hasOwnProperty("nodeId")) {
                this.nodeId = jObj["nodeId"];
            }
            if (jObj.hasOwnProperty("path")) {
                this.path = jObj["path"];
            }
            if (jObj.hasOwnProperty("label")) {
                this.label = jObj["label"];
            }
        }
    } 
}