import * as fs from "node:fs";
import * as path from "node:path";

import { AsyncIterable } from "@framework/types/generic";

export async function* getFilesRecursive(dir: string): AsyncIterable<string> {
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