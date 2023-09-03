//static fields for standardization 

//basically dictionary of hardcodded value in this system
// for toggles except realtime. if record does not exist in db means active, if there is record in config then its disabled
class FUKURO {
    static CONFIGURE(obj) {
        FUKURO.AGENT.PATH[String(obj.id)] = obj.path
        FUKURO.AGENT.DEFAULT.VAL[String(obj.id)] = obj.defVal
        FUKURO.AGENT.MIN.VAL[String(obj.id)] = obj.minVal
        FUKURO.MONITORING.NAMES[String(obj.id)] = obj.name
    }

    static getName(configId) {
        return FUKURO.MONITORING.NAMES[String(configId)]
    }

    static getDefaultValue(configId) {
        return FUKURO.AGENT.DEFAULT.VAL[String(configId)]
    }
    static getMin(configId) {
        return FUKURO.AGENT.MIN.VAL[String(configId)]
    }
    static MONITORING = class {
        static NAMES = {}//reference for json
        static Thresholds = []
        static PUSH = class {
            static Interval = 1//
            static Toggle = 2 //
        }
        static CPU = class {
            static INTERVAL = class {
                static Extract = 101//
                static Realtime = 102//
            }
            static TOGGLE = class {
                static Extract = 110//
                static Realtime = 111 // not in db 
            }
            static ALERT = class {
                static Threshold = 10 // notification table
                static Tick = 122 //
                static Cooldown = 123 //
            }
        }
        static MEM = class {
            static INTERVAL = class {
                static Extract = 201//
                static Realtime = 202//
            }
            static TOGGLE = class {
                static Extract = 210// 
                static Realtime = 211 // not in db 
            }
            static ALERT = class {
                static Threshold = 20 // notification table
                static Tick = 222 //
                static Cooldown = 223 //
            }
        }
        static NET = class {
            static INTERVAL = class {
                static Extract = 301//
                static Realtime = 302//
            }
            static TOGGLE = class {
                static Extract = 310// 
                static Realtime = 311 // not in db 
            }
            static ALERT = class {
                static Threshold = 30 // notification table
                static Tick = 322 //
                static Cooldown = 323 //
            }
        }
        static DSK = class {
            static INTERVAL = class {
                static Extract = 401//
                static Realtime = 402//
            }
            static TOGGLE = class {
                static Extract = 410// 
                static Realtime = 411 // not in db 
            }
            static ALERT = class {
                static Threshold = 40 // notification table
                static Tick = 422 //
                static Cooldown = 423 //
            }
        }
    }

    static SPEC = class{
        static totalMemory = 251
    }

    static AGENT = class {
        static PATH = {
        }
        static DEFAULT = class {
            static VAL = {}
        }
        static MIN = class {
            static VAL = {} // {Min,Max} 
        }
        static config(configId, value) {
            return {
                path: FUKURO.AGENT.PATH[String(configId)],
                data: value
            }
        }
        static ALL() {
            let all = []
            Object.keys(FUKURO.AGENT.PATH).forEach(k => {
                all.push(parseInt(k))
            })
            return all
        }
    }
    static RESOURCE = class {
        static cpu = 1
        static mem = 2
        static net = 3
        static dsk = 4
    }
}
// agent config path mapping from static config id  

// threshold ids
FUKURO.MONITORING.Thresholds.push(
    FUKURO.MONITORING.CPU.ALERT.Threshold,
    FUKURO.MONITORING.MEM.ALERT.Threshold,
    FUKURO.MONITORING.DSK.ALERT.Threshold,
    FUKURO.MONITORING.NET.ALERT.Threshold) 

//realtime configs not stored hence no need to have additional values
FUKURO.AGENT.PATH[String(FUKURO.MONITORING.CPU.TOGGLE.Realtime)] = 'toggle/realtime/cpu'
FUKURO.AGENT.PATH[String(FUKURO.MONITORING.MEM.TOGGLE.Realtime)] = 'toggle/realtime/mem'
FUKURO.AGENT.PATH[String(FUKURO.MONITORING.DSK.TOGGLE.Realtime)] = 'toggle/realtime/dsk'
FUKURO.AGENT.PATH[String(FUKURO.MONITORING.NET.TOGGLE.Realtime)] = 'toggle/realtime/net'


// path is used to address agent operation
// name is used to identify and determine JSON field
// minVal is the minimum value
// defVal is the default value

/** Toggles **/
FUKURO.CONFIGURE({
    id: FUKURO.MONITORING.PUSH.Toggle,
    path: 'toggle/push',
    name: 'active',
    defVal: true
})
FUKURO.CONFIGURE({
    id: FUKURO.MONITORING.CPU.TOGGLE.Extract,
    path: 'toggle/cpu',
    name: 'active',
    defVal: true
})

FUKURO.CONFIGURE({id: FUKURO.MONITORING.PUSH.Interval,
    path: 'interval/push',
    name: 'interval',
    minVal: 60,
    defVal: 300
})

/**CPU configuration mappings */
FUKURO.CONFIGURE({
    id: FUKURO.MONITORING.CPU.ALERT.Threshold,
    path: 'alert/threshold/cpu',
    name: 'threshold',
    minVal: 50,
    defVal: 0 // by default notification is disabled
})
FUKURO.CONFIGURE({
    id: FUKURO.MONITORING.CPU.INTERVAL.Extract,
    path: 'interval/cpu',
    name: 'extract',
    minVal: 10,
    defVal: 15
})
FUKURO.CONFIGURE({
    id: FUKURO.MONITORING.CPU.INTERVAL.Realtime,
    path: 'interval/realtime/cpu',
    name: 'realtime',
    minVal: 1,
    defVal: 1
})
FUKURO.CONFIGURE({
    id: FUKURO.MONITORING.CPU.ALERT.Tick,
    path: 'alert/threshold/tick/cpu',
    name: 'tick',
    minVal: 1,
    defVal: 2
})
FUKURO.CONFIGURE({
    id: FUKURO.MONITORING.CPU.ALERT.Cooldown,
    path: 'alert/cooldown/cpu',
    name: 'cooldown',
    minVal: 60,
    defVal: 600
})


/**MEMORY configuration mapping */
FUKURO.CONFIGURE({id: FUKURO.MONITORING.MEM.ALERT.Threshold,path: 'alert/threshold/mem',
    name: 'threshold',
    minVal: 50,
    defVal: 0 // by default notification is disabled
}) 
FUKURO.CONFIGURE({id: FUKURO.MONITORING.MEM.INTERVAL.Extract,
    path: 'interval/mem',
    name: 'extract',
    minVal: 10,
    defVal: 15
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.MEM.INTERVAL.Realtime,
    path: 'interval/realtime/mem',
    name: 'realtime',
    minVal: 1,
    defVal: 1
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.MEM.ALERT.Tick,
    path: 'alert/threshold/tick/mem',
    name: 'tick',
    minVal: 1,
    defVal: 4 //1 minute
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.MEM.ALERT.Cooldown,
    path: 'alert/cooldown/mem',
    name: 'cooldown',
    minVal: 60,
    defVal: 600
})


/**Disk configuration mapping */
FUKURO.CONFIGURE({id: FUKURO.MONITORING.DSK.ALERT.Threshold,path: 'alert/threshold/dsk',
    name: 'threshold',
    minVal: 80,
    defVal: 0 // by default notification is disabled
}) 
FUKURO.CONFIGURE({id: FUKURO.MONITORING.DSK.INTERVAL.Extract,
    path: 'interval/dsk',
    name: 'extract',
    minVal: 10,
    defVal: 20
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.DSK.INTERVAL.Realtime,
    path: 'interval/realtime/dsk',
    name: 'realtime',
    minVal: 1,
    defVal: 1
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.DSK.ALERT.Tick,
    path: 'alert/threshold/tick/dsk',
    name: 'tick',
    minVal: 1,
    defVal: 3 //1 minute
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.DSK.ALERT.Cooldown,
    path: 'alert/cooldown/dsk',
    name: 'cooldown',
    minVal: 60,
    defVal: 600
})



/**net configuration mapping */
FUKURO.CONFIGURE({id: FUKURO.MONITORING.NET.ALERT.Threshold,path: 'alert/threshold/net',
    name: 'threshold',
    minVal: 1000,
    defVal: 0 // by default notification is disabled
}) 
FUKURO.CONFIGURE({id: FUKURO.MONITORING.NET.INTERVAL.Extract,
    path: 'interval/net',
    name: 'extract',
    minVal: 10,
    defVal: 10
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.NET.INTERVAL.Realtime,
    path: 'interval/realtime/net',
    name: 'realtime',
    minVal: 1,
    defVal: 1
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.NET.ALERT.Tick,
    path: 'alert/threshold/tick/net',
    name: 'tick',
    minVal: 1,
    defVal: 6 //1 minute
})
FUKURO.CONFIGURE({id: FUKURO.MONITORING.NET.ALERT.Cooldown,
    path: 'alert/cooldown/net',
    name: 'cooldown',
    minVal: 60,
    defVal: 600
})

module.exports = FUKURO;