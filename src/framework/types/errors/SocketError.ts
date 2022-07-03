export class TSocketError extends Error {
    constructor(message: string, requestId: string) {
        super(message);
        this.requestId = requestId;
    }
    public requestId: string;
}