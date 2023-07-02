//static fields for standardization

class FUKURO{ 
    static CPU = class{
        static CONFIG = class{ 
            static ExtractInterval = 2;
            static Threshold = 3;
            static ThresholdCooldown = 4;
        }
        static ResourceId = 1;
    }
}

module.exports = FUKURO;