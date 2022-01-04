
var instance: LoggerService;
export class LoggerService {

    private logs = new Array<string>()
    // private counter = 0;

    private constructor() {

    }

    log(msg: string){
        const date = new Date()
        const time = `${date.getHours()}:${date.getMinutes()}:`
        const message = `${time}${msg}`
        this.logs.push(message);
    }

    static init() {
        instance = new LoggerService();
    }

    static getInstance(): LoggerService {
        if (instance != undefined) {
            return instance
        }
        else
            throw Error('Logger service not instantiated');
    }

    static isInstantiated(): boolean {
        return instance ? true : false
    }

    print() {
        console.log(this.logs.join('\r\n'))
    }


}