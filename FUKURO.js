//static fields for standardization
//basically dictionary of hardcodded value in this system
class FUKURO{ 
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
            static THRESHOLD = class{
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

module.exports = FUKURO;