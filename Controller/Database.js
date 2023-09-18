const mysql = require('mysql');

class Database {
    #pool 
    #config
    constructor(config) { 
        this.#pool = mysql.createPool(config);
        this.#config = config
        //test connection  
    }

    init(){
        return new Promise((resolve,reject)=>{
            this.#pool.getConnection((err, connection) => {
                if (err)
                    reject(err)
                console.log('Successfully Connected to ' + this.#config.database); 
                connection.release();
                resolve()
            });
        })
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

    
    // pass date to be converted to local timezone
    // @param = date in string
    // @return = string of date in yyyy-mm-dd HH:mm:ss format
    toLocalSQLDateTime(strDate){ 
        let dto = new Date(strDate)
  
        return dto.toLocaleDateString('en-CA',{
    hourCycle: 'h23'
}).replace(',','') + " " + dto.toLocaleTimeString('en-CA',{
    hourCycle: 'h23'
});    
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
