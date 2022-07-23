import { getFilesRecursive } from "@framework/helpers/fileSystem/getFilesRecursive";

export const getServicePaths = async (dir: string): Promise<string[]> => {
    const pathsForGroup: string[] = [];
    for await (const filePath of getFilesRecursive(dir)) {
        if (/index.js$/.test(filePath)) {
            pathsForGroup.push(filePath);
        }
    }
    return pathsForGroup;
};