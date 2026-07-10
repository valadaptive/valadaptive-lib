/**
 * A simple async mutex implementation that allows you to queue up async operations on a shared resource.
 */
export default class AsyncMutex<T> {
    private inner: T;
    private queue: Promise<unknown>;
    constructor(inner: T) {
        this.inner = inner;
        this.queue = Promise.resolve();
    }

    withValue<R>(cb: (inner: T) => Promise<R> | R): Promise<R> {
        const result = this.queue.then(() => cb(this.inner));
        this.queue = result.catch(() => {});
        return result;
    }
}
