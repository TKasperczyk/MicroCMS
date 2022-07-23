import * as path from "node:path";
import { Worker } from "node:worker_threads";

import { command } from "yargs";

import { getErrorMessage } from "@framework/helpers";
import { getServicePaths } from "@framework/helpers/fileSystem";
import { appLogger } from "@framework/logger";

const argv = command("generic", "A single generic service to run").parseSync();
const ml = appLogger("master");

(async () => {
    const serverPath = path.resolve("dist/server/index.js");
    const corePaths = await getServicePaths("dist/services/database/core");
    let genericPaths = await getServicePaths("dist/services/database/generic");

    ml.debug({ argv }, "Checking generic arguments");
    if (typeof argv.generic === "string") {
        genericPaths = genericPaths.filter(pathToFork => pathToFork.includes(String(argv.generic)));
        ml.debug({ genericPaths }, "Filtered generic services");
    }

    ml.info("Running the main server");
    const serverWorker = new Worker(serverPath);
    const coreWorkers: { worker: Worker, initialized: boolean, servicePath: string }[] = [];
    serverWorker.on("message", (message) => {
        if (message !== "initialized") {
            return;
        }
        ml.info("The main server is initialized. Running core services");
        corePaths.forEach((corePath) => {
            const coreWorker = {
                worker: new Worker(corePath),
                initialized: false,
                servicePath: corePath
            };
            coreWorker.worker.on("message", (message) => {
                if (message !== "initialized") {
                    return;
                }
                coreWorker.initialized = true;
            });
            coreWorkers.push(coreWorker);
        });
    });

    const waitForCoreWorkers = setInterval(() => {
        if (coreWorkers.length !== corePaths.length || !coreWorkers.every(coreWorker => coreWorker.initialized)) {
            ml.debug({ 
                coreWorkers: coreWorkers.map((coreWorker) => { 
                    return { initialized: coreWorker.initialized, servicePath: coreWorker.servicePath };
                }) 
            }, "Waiting for the core services to become initialized");
            return;
        }
        ml.info("Core workers initialized. Running generic services");
        genericPaths.forEach((genericPath) => {
            new Worker(genericPath, { env: { startGenericServices: "true" } });
        });
        clearInterval(waitForCoreWorkers);
    }, 500);
})().then().catch((error) => {
    console.error(`Error while initializing the master controller ${getErrorMessage(error)}`);
    process.exit();
});