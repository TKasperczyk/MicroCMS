import * as fs from "node:fs";
import * as path from "node:path";
import * as workers from "node:worker_threads";

interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
}

async function* getFilesRecursive(dir: string): AsyncIterable<string> {
    const dirents = await fs.promises.readdir(dir, {
        withFileTypes: true
    });
    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFilesRecursive(res);
        } else {
            yield res;
        }
    }
}

(async () => {
    const pathsToFork: string[] = [path.resolve("dist/server/index.js")];
    for await (const filePath of getFilesRecursive("dist/services")) {
        if (/index.js$/.test(filePath)) {
            pathsToFork.push(filePath);
        }
    }

    pathsToFork.forEach((pathToFork) => {
        new workers.Worker(pathToFork);
    });
    console.log(pathsToFork);
})().then().catch((error) => {
    console.error(`Error while initializing the master controller ${String(error)}`);
    process.exit();
});