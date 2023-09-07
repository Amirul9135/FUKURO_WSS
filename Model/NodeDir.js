
const db = require("../Controller/Database")

module.exports = class NodeDir {
    pathId
    nodeId
    path
    label

    async register() {
        var strSql = "INSERT INTO node_dir(nodeId,path,label) VALUES(:nodeId:,:path:,:label:)"
        let result = await db.queryParams(strSql, this)
        if (result)
            this.pathId = result.insertId
        return result
    }

    update() {
        var strSql = "UPDATE node_dir SET path=:path:, label=:label: WHERE pathId=:pathId:"
        return db.queryParams(strSql, this)
    }

    static async grantAccessToNode(granter, userId, nodeId, access) {

        let [access1, access2] = await Promise.all([NodeDir.getAccess(granter, nodeId), NodeDir.getAccess(userId, nodeId)])
        if(access1.length == 0){
            throw Error("Unauthorized, Granter has no access to the node")
        }
        console.log(access1)
        console.log(access2)
        if (access == true && access2.length == 0) {
            //nk bagi access and penerima blom ada access
            let pid = await NodeDir.getMemberPathId(nodeId)
            if (pid < 1) {
                throw Error("Faile to create path")
            }
            return NodeDir.grantAccess(pid, userId)
        }
        else if (access == false && access2.length != 0) {
            //nk buang access dan mmg 2nd party ada access
            return   NodeDir.removeAccessUser(userId,nodeId)

        }


    }

    static async getMemberPathId(nodeId) {
        let check = await db.query("SELECT pathId FROM node_dir WHERE nodeId=" + db.escape(nodeId) + " AND label='member'")
        
        if (check[0]) {
            return check[0].pathId
        }
        else {
            let newpath = await db.query("INSERT INTO node_dir (nodeId,path,label) VALUES(" + db.escape(nodeId) + ",'/','member')")
            if (newpath) {
                return newpath.insertId
            }
        }
    }

    static getAccess(userId, nodeId) {
        let strSql = "SELECT * FROM node_dir_access nda JOIN node_dir nd ON nd.pathId=nda.pathId WHERE nda.userId=" + db.escape(userId) + " AND nd.nodeId=" + db.escape(nodeId)
        return db.query(strSql)
    }

    static grantAccess(pathId, userId) {
        var strSQL = "INSERT IGNORE INTO node_dir_access (userId,pathId) VALUES (" + db.escape(userId) + "," + db.escape(pathId) + ")"
        return db.query(strSQL)
    }

    static removeAccess(pathId, userId) {
        var strSQL = "DELETE FROM node_dir_access WHERE userId=" + db.escape(userId) + " AND pathId=" + db.escape(pathId)
        return db.query(strSQL)
    }
    static removeAccessUser(userId, nodeId) {
        let strSql = "DELETE nda FROM node_dir_access nda JOIN node_dir nd ON nda.pathId=nd.pathId "
            + "WHERE nd.nodeId=" + db.escape(nodeId) + " AND nda.userId=" + db.escape(userId)
        return db.query(strSql)
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