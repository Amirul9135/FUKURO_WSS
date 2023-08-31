//this class handles the request to manage resource related to metric readings
const RESTController = require("./RESTController") // rest controller base class
const FUKURO = require("../../FUKURO") //static class for config id reference
const MetricController = require("../MetricController")

class MetricsAPI extends RESTController {
    constructor() {
        super()

        //bind routes
        this._router.get("/:nodeId/cpu",[this.#parseURL(),this.#getHistorical(FUKURO.RESOURCE.cpu)])
    }

    #getHistorical(resId) {
        return (req,res)=>{ 
            MetricController.fetchHistoricalData(resId,req.params.nodeId,
                req.query.interval,req.query.duration,req.query.date).then((result)=>{
                    return res.status(200).send(result)

                }).catch((error)=>{
                    return res.status(500).send({message:error.message})
                })
        }

    }

    #parseURL() {
        return [
            this._auth.authRequest(),
            (req, res, next) => {
                console.log(req.params)
                console.log(req.query)
                if (req.params && req.params.nodeId
                    && req.query && req.query.duration && req.query.interval) { 

                    if (req.query.date && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(req.query.date)) {
                        return res.status(400).send({ message: "invalid date" });
                    }
                    next()
                }
                else {
                    return res.status(400).send({ message: "invalid request, incomplete data" });

                } 
                
            }
        ]
    }
}

module.exports = MetricsAPI