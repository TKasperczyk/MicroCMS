export class SocketError extends Error {
    constructor(message: string, id: string) {
        super(message);
        this.id = id;
    }
    public id: string;
}