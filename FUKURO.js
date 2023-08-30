//static fields for standardization

const { CLIENT_RENEG_LIMIT } = require("tls")

//basically dictionary of hardcodded value in this system
class FUKURO{ 
    static CONFIGURE(obj){
        FUKURO.AGENT.PATH[String(obj.id)] = obj.path
        FUKURO.AGENT.DEFAULT.VAL[String(obj.id)] = obj.defVal
        FUKURO.AGENT.MIN.VAL[String(obj.id)] = obj.minVal
        FUKURO.MONITORING.NAMES[String(obj.id)] = obj.name
    }
    
    static MONITORING = class{
        static NAMES = {}//reference for json
        static getName(configId){
            return FUKURO.MONITORING.NAMES[String(configId)]
        }
        static PUSH = class{
            static Interval =  1//
            static Toggle = 2 //
        }
        static CPU = class{
            static INTERVAL = class{
                static Extract = 101//
                static Realtime = 102//
            }
            static TOGGLE = class{
                static Extract = 110//
                static Realtime = 111 // not in db 
            }
            static ALERT = class{
                static Threshold = 121 // notification table
                static Tick = 122 //
                static Cooldown = 123 //
            }
        }
        static MEM= class{
            static INTERVAL = class{
                static Extract = 201//
                static Realtime = 202//
            }
            static TOGGLE = class{
                static Extract = 210// 
                static Realtime = 211 // not in db 
            }
            static ALERT = class{
                static Threshold = 221 // notification table
                static Tick = 222 //
                static Cooldown = 223 //
            }
        }
        static NET= class{
            static INTERVAL = class{
                static Extract =301//
                static Realtime = 302//
            }
            static TOGGLE = class{
                static Extract = 310// 
                static Realtime = 311 // not in db 
            }
            static ALERT = class{
                static Threshold = 321 // notification table
                static Tick = 322 //
                static Cooldown = 323 //
            }
        }
        static DSK= class{
            static INTERVAL = class{
                static Extract = 401//
                static Realtime = 402//
            }
            static TOGGLE = class{
                static Extract = 410// 
                static Realtime = 411 // not in db 
            }
            static ALERT = class{
                static Threshold = 421 // notification table
                static Tick = 422 //
                static Cooldown = 423 //
            }
        }
    }


    static AGENT = class{
        static PATH = { 
        }
        static DEFAULT = class{
            static VAL = {}
            static getValue(configId){
                return FUKURO.AGENT.DEFAULT.VAL[String(configId)]
            }
        } 
        static MIN = class{
            static VAL = {} // {Min,Max} 
            static getMin(configId){
                return FUKURO.AGENT.MIN.VAL[String(configId)]
            }
        }
        
        static config(configId,value){
            return {
                path:FUKURO.AGENT.PATH[String(configId)],
                data: value
            }
        }
    }

    //old mapping
    static NODE = class{
        static INTERVAL = class{
            static push = 100//
            static cpu = 101//
            static mem = 102
            static net = 103
            static dsk = 104
            static REALTIME = class{
                static cpu = 111//
                static mem = 112
                static net = 113
                static dsk = 114
            }
        }
        static TOGGLE = class{
            static push = 200//
            static cpu = 201//
            static mem = 202
            static net = 203
            static dsk = 204
            static REALTIME = class{
                static cpu = 211//
                static mem = 212
                static net = 213
                static dsk = 214
            }
        }
        static ALERT = class{
            static up = 100 
            static cpu = 101//
            static mem = 102
            static net = 103
            static dsk = 104
            static down = 111
            static THRESHOLD = class{ //deprecated due to treshold value in notification select lowest
                static cpu = 401//
                static mem = 402
                static net = 403
                static dsk = 404
            }
            static TICK = class{
                static cpu = 501//
                static mem = 502
                static net = 503
                static dsk = 504
            }
            static COOLDOWN = class{
                static cpu = 601//
                static mem = 602
                static net = 603
                static dsk = 604
            }
        }
    }
 
    static RESOURCE = class {
        static cpu = 1
        static mem = 2
        static net = 3
        static dsk = 4
    }
} 
// agent config path mapping from static config id and the default value
FUKURO.AGENT.PATH[String(FUKURO.MONITORING.PUSH.Interval)] = 'interval/push'
FUKURO.AGENT.DEFAULT.VAL[String(FUKURO.MONITORING.PUSH.Interval)] = 60 

FUKURO.AGENT.PATH[String(FUKURO.MONITORING.PUSH.Toggle)] = 'toggle/push'
FUKURO.AGENT.DEFAULT[String(FUKURO.MONITORING.PUSH.Toggle)] = 1

/***CPU CONFIGS***/
FUKURO.AGENT.PATH[String(FUKURO.MONITORING.CPU.TOGGLE.Extract)] = 'toggle/cpu' 
FUKURO.AGENT.DEFAULT.VAL[String(FUKURO.MONITORING.CPU.TOGGLE.Extract)] = 1// 1 true

FUKURO.AGENT.PATH[String(FUKURO.MONITORING.CPU.TOGGLE.Realtime)] = 'toggle/realtime/cpu' 



FUKURO.AGENT.PATH[String(FUKURO.MONITORING.CPU.ALERT.Threshold)] = 'alert/threshold/cpu'
FUKURO.AGENT.DEFAULT.VAL[String(FUKURO.MONITORING.CPU.ALERT.Threshold)] = 80

FUKURO.CONFIGURE({
    id:FUKURO.MONITORING.CPU.INTERVAL.Extract,
    path:'interval/cpu',
    name:'extract',
    minVal:10,
    defVal:15
}) 
FUKURO.CONFIGURE({
    id:FUKURO.MONITORING.CPU.INTERVAL.Realtime,
    path:'interval/realtime/cpu',
    name:'realtime',
    minVal:1,
    defVal:1
}) 
FUKURO.CONFIGURE({
    id:FUKURO.MONITORING.CPU.ALERT.Tick,
    path:'alert/threshold/tick/cpu',
    name:'tick',
    minVal:1,
    defVal:2
}) 
  
FUKURO.CONFIGURE({
    id:FUKURO.MONITORING.CPU.ALERT.Cooldown,
    path:'alert/cooldown/cpu',
    name:'cooldown',
    minVal:60,
    defVal:600
})
  



module.exports = FUKURO;