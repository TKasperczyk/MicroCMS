import { ZodError } from "zod";

export const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") {
        return error;
    } else if (error instanceof ZodError) {
        return JSON.stringify(error.issues);
    } else if (error instanceof Error) {
        return error.message;
    }  else {
        return String(error);
    }
};