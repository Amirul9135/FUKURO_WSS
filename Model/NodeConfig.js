const db = require("../Controller/Database")
const Node_ = require("./Node_")
class NodeConfig {

    static updateConfig(nodeId, configId, value, userId) {
        var strSql = "INSERT INTO node_config (nodeId, configId, value) "
            + " SELECT  " + db.escape(nodeId) + ", " + db.escape(configId) + ", " + db.escape(value)
            + " FROM node_dir_access nda JOIN node_dir nd ON nda.pathId=nd.pathId WHERE nda.userId=" + db.escape(userId) + " LIMIT 1 "
            + " ON DUPLICATE KEY UPDATE value = VALUES(value)"
        return db.query(strSql)
    }

    // method to update configuration in node_config table multiple value
    // @params
    // nodeId
    // userId to check user has authority
    // configurations must be array of object {configId:0,val:numericalvalue}
    static async updateConfigs(nodeId, userId, configurations) {
        // check access
        await Node_.findNode(nodeId, userId) // ensure user have connection with node being configured
        let strSql = "INSERT INTO node_config (nodeId,configId,value) VALUES "
        configurations.forEach(conf => {
            strSql += " (" + db.escape(nodeId) + "," + db.escape(conf.configId) + "," + db.escape(conf.val) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1);
        strSql += " ON DUPLICATE KEY UPDATE value=VALUES(value) "
        return db.query(strSql)
    }

    // method to remove configuration in node_config table multiple records
    // @params
    // nodeId
    // userId to check user has authority
    // configurations must be array of id [1,1,2,3] etc
    static async removeConfigs(nodeId, userId, configurations) {
        if (configurations.length < 1) {
            return
        }
        await Node_.findNode(nodeId, userId)  // ensure user have connection with node being configured
        let strSql = "DELETE FROM node_config WHERE nodeId=" + db.escape(nodeId) + " AND configId IN ("
        configurations.forEach(conf => {
            strSql += db.escape(conf) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ")";
        return db.query(strSql)
    }

    static removeConfig(nodeId, configId, userId) {
        var strSQL = "DELETE nc FROM node_config nc "
            + " JOIN node_dir nd ON nd.nodeId=nc.nodeId JOIN node_dir_access nda ON nda.pathId=nd.pathId"
            + " WHERE nc.nodeId=" + db.escape(nodeId) + " AND nc.configId=" + db.escape(configId) + " AND nda.userId=" + db.escape(userId)
        return db.query(strSQL)
    }

    static enableNotification(nodeId, notId, userId, value) {
        var strSql = "INSERT INTO notification_config (nodeId, notId, userId,value) "
            + " SELECT  " + db.escape(nodeId) + ", " + db.escape(notId) + ", " + db.escape(userId) + "," + db.escape(value)
            + " FROM node_dir_access nda JOIN node_dir nd ON nda.pathId=nd.pathId WHERE nda.userId=" + db.escape(userId) + " LIMIT 1 "
            + " ON DUPLICATE KEY UPDATE value = VALUES(value) "
        return db.query(strSql)

    }

    static disableNotification(nodeId, notId, userId) {
        var strSql = "DELETE FROM notification_config WHERE "
            + " nodeId=" + db.escape(nodeId) + " AND notId=" + db.escape(notId) + " AND userId=" + db.escape(userId)
        return db.query(strSql)
    }

    // ids is array of integers of configurable id
    static async getThreshold(nodeId, ids) {
        var strSql = "SELECT MIN(value) AS MIN,notId FROM notification_config WHERE nodeId="
            + db.escape(nodeId) + " AND notId IN("
        ids.forEach(id => {
            strSql += db.escape(id) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ") GROUP BY notId";
        let result = await db.query(strSql)
        return result
    }

    //configs is array of id [1,2,3]
    static async getConfigs(nodeId, userId,configs ) {

        await Node_.findNode(nodeId, userId) // ensure user have connection with node being configured
        return NodeConfig.getConfigsDirect(nodeId,configs)
    }

       //configs is array of id [1,2,3] not secured version only for internal uses
    static async getConfigsDirect(nodeId,configs ) { 
        var strSql = "SELECT configId,value FROM node_config WHERE nodeId= " + db.escape(nodeId)
            + " AND configId IN("
        configs.forEach(conf => {
            strSql += db.escape(conf) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ")";
        return db.query(strSql)
    }

    // ids is array of id
    static async getNotificationConfigs(nodeId, userId, ids) {
        let strSql = "SELECT notId,value FROM notification_config "
            + " WHERE userId=" + db.escape(userId) + " AND nodeId=" + db.escape(nodeId)
            + " AND notId IN ("
        ids.forEach(id => {
            strSql += db.escape(id) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ")";
        return db.query(strSql)

    }
} 
module.exports = NodeConfig