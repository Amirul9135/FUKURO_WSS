const mysql = require('mysql');

class Database {
    #pool

    constructor(config) {
        this.#pool = mysql.createPool(config);
        //test connection
        this.#pool.getConnection((err, connection) => {
            if (err)
                throw err;
            console.log('Successfully Connected to ' + config.database);
            connection.release();
        });
    }

    query(sql){
        console.log("string query",sql)
        return new Promise((resolve, reject) => {
            this.#pool.query(sql, (error, results) => {
                if (error) {
                    console.log("Query Error",error)
                    reject(error);
                } else {  
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });

    }

    //accept sql query string (with placeholders ??) and values (object/array)
    //return promise result/error
    queryParams(sql, values) { 
        if(values instanceof Object){ 
            let vals = [];
            let parsedSql = sql;  
            let matches = parsedSql.match(/:([^:]+):/g);   
          
            if (matches) {
              for (let match of matches) {
                let key = match.slice(1, -1); 
                if (values.hasOwnProperty(key)) {
                    vals.push(values[key]); 
                    parsedSql = parsedSql.replace(match, '?'); 
                }
              }
            }
            console.log("Object query")
            console.log(parsedSql,vals) 
            sql = parsedSql
            values = vals
        }
        return new Promise((resolve, reject) => {
            this.#pool.query(sql, values, (error, results) => { 
                if (error) {
                    console.log("Query Error",error)
                    reject(error);
                } else { 
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            });
        });
    }
    escape(val){
        return this.#pool.escape(val)
    }
    

    close() {
        this.pool.end();
    } 
}

// Singleton pattern
const fukuroDb = new Database({
    host: "localhost",
    user: "root",
    password: "",
    database: "fukurodb"
});

module.exports = fukuroDb;