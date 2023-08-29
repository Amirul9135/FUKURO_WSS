const db = require("../Controller/Database")

module.exports = class NodeConfig{

    static updateConfig(nodeId,configId,value,userId){
        var strSql = "INSERT INTO node_config (nodeId, configId, value) "
        + " SELECT  "+db.escape(nodeId)+ ", " +db.escape(configId)+ ", " +db.escape(value) 
        + " FROM node_dir_access nda JOIN node_dir nd ON nda.pathId=nd.pathId WHERE nda.userId="+db.escape(userId) +" LIMIT 1 "  
        + " ON DUPLICATE KEY UPDATE value = VALUES(value)"
        return db.query(strSql)
    } 

    static removeConfig(nodeId,configId,userId){
        var strSQL = "DELETE nc FROM node_config nc "
        +" JOIN node_dir nd ON nd.nodeId=nc.nodeId JOIN node_dir_access nda ON nda.pathId=nd.pathId"
        +" WHERE nc.nodeId="+ db.escape(nodeId) +" AND nc.configId=" + db.escape(configId) + " AND nda.userId="+ db.escape(userId)
        return db.query(strSQL)
    }

    static enableNotification(nodeId,notId,userId,value){
        var strSql = "INSERT INTO notification_config (nodeId, notId, userId,value) "
        + " SELECT  "+db.escape(nodeId)+ ", " +db.escape(notId)+ ", " +db.escape(userId)  + ","+ db.escape(value)
        + " FROM node_dir_access nda JOIN node_dir nd ON nda.pathId=nd.pathId WHERE nda.userId="+db.escape(userId) +" LIMIT 1 " 
        + " ON DUPLICATE KEY UPDATE value = VALUES(value) "
        return db.query(strSql)

    }
 
    static disableNotification(nodeId,notId,userId){
        var strSql = "DELETE FROM notification_config WHERE "
        + " nodeID=" +db.escape(nodeId)+ " AND notId="  +db.escape(notId)+ " AND userId=" +db.escape(userId)
        return db.query(strSql)
    }
}