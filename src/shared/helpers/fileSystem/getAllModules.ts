"use strict";

import * as fs from "node:fs";
import * as path from "node:path";

import { LooseObject } from "@cmsTypes/index";

export const getAllModules = async (directory: string, { excludeList = [], fileMode = false }: { excludeList?: string[], fileMode?: boolean }): Promise<object> => {
    const importedModules: LooseObject = {};
    try {
        const fileList = await fs.readdirSync(directory, { withFileTypes: true });
        for (const file of fileList){
            if (fileMode){
                if (!file.isDirectory() || excludeList.includes(file.name)) {
                    continue;
                }
            } else {
                if (file.name !== "index.ts" || path.extname(file.name) !== '.js' || excludeList.includes(file.name)) {
                    continue;
                }
            }
            importedModules[path.basename(file.name)] = import(`${directory}/${file.name}`);
        }
    } catch (error: any) {
        // TODO
    }
    return importedModules;
};