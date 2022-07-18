import * as path from "node:path";
import * as workers from "node:worker_threads";

import { command } from "yargs";

import { getErrorMessage } from "@framework/helpers";
import { getFilesRecursive } from "@framework/helpers/fileSystem";

const argv = command("generic", "A single generic service to run").parseSync();

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
    const corePaths = await getServicePaths("dist/services/database/core");
    let genericPaths = await getServicePaths("dist/services/database/generic");
    console.log(argv);
    if (typeof argv.generic === "string") {
        genericPaths = genericPaths.filter(pathToFork => pathToFork.includes(String(argv.generic)));
    }

    pathsToFork = pathsToFork.concat(corePaths, genericPaths);

    pathsToFork.forEach((pathToFork) => {
        new workers.Worker(pathToFork);
    });
})().then().catch((error) => {
    console.error(`Error while initializing the master controller ${getErrorMessage(error)}`);
    process.exit();
});