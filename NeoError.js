/**
 * Created by aris on 8/11/2015.
 */
export default class NeoError extends Error {
    constructor(message,code) {
        super(message);
        this.code=code;
        this.message = message;
        this.name = "Neo4jError";
        //Error.captureStackTrace(this, NeoError);
    }
}