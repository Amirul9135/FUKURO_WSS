// this class is aimed to create abstraction of web socket client wrapper
// the purpose of abstraction is for scalability in case of changes in dependency used in handling web socket
class WsClient{
    //attributes
    #ws //web socket object reference
    _cache


    constructor(wsc,cache){
        this.#ws = wsc
        this._cache = cache

        //bind listeners
        this.#ws.on('open', () => {
            this._onOpen()
        });
     
        this.#ws.on('message', (message) => {
            this._handleMessage(message)
        });
    
        // Handle WebSocket on close event
        this.#ws.on('close', () => {
            this._onClose()
        });
    
        // Handle WebSocket on error event
        this.#ws.on('error', (error) => {
            this.#onError(error)
        });
    }

    send(message){
        this.#ws.send(JSON.stringify(message))
    }

    close(){
        this.#ws.close()
    }

    _onOpen(){
        // To be implemented in subclasses
        throw new Error('Abstract method onOpen must be implemented in inheriting concrete class');
    }

    _onClose(){  
        // To be implemented in subclasses
        throw new Error('Abstract method onClose must be implemented in inheriting concrete class');
    }

    _handleMessage(message){
        // To be implemented in subclasses
        throw new Error('Abstract method handleMessage must be implemented in inheriting concrete class');
    }

    #onError(error){
        console.log(error)
    } 
}

module.exports = WsClient