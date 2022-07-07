export interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
}