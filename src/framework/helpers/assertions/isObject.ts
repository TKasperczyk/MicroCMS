export const isObject = <InputType>(input: InputType): boolean => {
    return (typeof input === "object" && input !== null);
};