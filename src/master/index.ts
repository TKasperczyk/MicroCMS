import * as path from "node:path";
import * as workers from "node:worker_threads";

import { getFilesRecursive } from "@framework/helpers/fileSystem";

const getServicePaths = async (dir: string): Promise<string[]> => {
    const pathsForGroup: string[] = [];
    for await (const filePath of getFilesRecursive(dir)) {
        if (/index.js$/.test(filePath)) {
            pathsForGroup.push(filePath);
        }
    }
    return pathsForGroup;
};

(async () => {
    let pathsToFork: string[] = [path.resolve("dist/server/index.js")];
    pathsToFork = pathsToFork.concat(await getServicePaths("dist/services/database/core"));
    pathsToFork = pathsToFork.concat(await getServicePaths("dist/services/database/generic"));

    pathsToFork.forEach((pathToFork) => {
        new workers.Worker(pathToFork);
    });
})().then().catch((error) => {
    console.error(`Error while initializing the master controller ${String(error)}`);
    process.exit();
});