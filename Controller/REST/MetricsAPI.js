//this class handles the request to manage resource related to metric readings
const RESTController = require("./RESTController") // rest controller base class
const FUKURO = require("../../FUKURO") //static class for config id reference
const MetricController = require("../MetricController")

class MetricsAPI extends RESTController {
    constructor() {
        super()

        //bind routes
        this._router.get("/:nodeId/cpu",[this.#parseURL(),this.#getHistorical(FUKURO.RESOURCE.cpu)])
        this._router.get("/:nodeId/mem",[this.#parseURL(),this.#getHistorical(FUKURO.RESOURCE.mem)])
        this._router.get("/:nodeId/disk/:diskname",[this.#parseURL(),this.#getHistorical(FUKURO.RESOURCE.dsk)])
        this._router.get("/:nodeId/net",[this.#parseURL(),this.#getHistorical(FUKURO.RESOURCE.net)])
    }

    #getHistorical(resId) {
        return (req,res)=>{ 

            let diskonly = null
            //addditional for disk only
            if(resId == FUKURO.RESOURCE.dsk){
                diskonly = req.params.diskname
                if(!diskonly){
                    return res.status(400).send({message:'no disk specified'})
                }
            } 

            MetricController.fetchHistoricalData(resId,req.params.nodeId,
                req.query.interval,req.query.start,req.query.end,diskonly).then((result)=>{
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
                    && req.query && req.query.start  && req.query.interval) { 
 
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