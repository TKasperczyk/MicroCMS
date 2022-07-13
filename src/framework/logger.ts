import { pino, Logger } from "pino";

export const appLogger = (name: string): Logger => {
    return pino({ name, level: "trace" });
};

export const reqLogger = (name: string): Logger => {
    return pino({
        transport: {
            target: "pino/file",
            options: { destination: "./logs/requests/current.json", mkdir: true },
        }, 
        name,
        level: "trace"
    });
};

export const perfLogger = (name: string): Logger => {
    return pino({
        transport: {
            target: "pino/file",
            options: { destination: "./logs/performance/current.json", mkdir: true },
        }, 
        name,
        level: "trace"
    });
};