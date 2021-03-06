import * as fs from "node:fs";

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error("Provide the name and the type (generic) of the service");
    process.exit();
}

const serviceName: string = args[0], 
    serviceNameSplit: string[] = serviceName.split("."),
    serviceNamePrefix: string = serviceNameSplit[0],
    serviceNameSuffix: string = serviceNameSplit[1],
    serviceType: string = args[1], 
    serviceVarName = serviceName.replace(".", "_"), 
    serviceTypeName = `${serviceNamePrefix.replace(/./, fc => fc.toUpperCase())}_${serviceNameSuffix.replace(/./, fc => fc.toUpperCase())}`,
    serviceCategoryPath =  `src/services/database/${serviceType}/${serviceNamePrefix}`,
    serviceDirPath = `${serviceCategoryPath}/${serviceNameSuffix}`;

if (!fs.existsSync(serviceCategoryPath)) {
    fs.mkdirSync(serviceCategoryPath);
}
if (!fs.existsSync(serviceDirPath)) {
    fs.mkdirSync(serviceDirPath);
}

const typeFile = `
import { ObjectId } from "mongodb";
import { z } from "zod";

import { TRequiredDefaults, TUpdateSpec } from "@framework/types/service";

export const T${serviceTypeName} = z.object({
    _id: z.instanceof(ObjectId).optional(),
    name: z.string().trim()
}).strict();
export type T${serviceTypeName} = z.input<typeof T${serviceTypeName}>;

export const ${serviceVarName}RequiredDefaults: TRequiredDefaults = {
    "name": ""
};

export const ${serviceVarName}UpdateSpecs: TUpdateSpec[] = [];
`;

const indexFile = `
import { GenericService } from "@framework/core/service";

import { TGenericSpec } from "@framework/types/service";

import { T${serviceTypeName}, ${serviceVarName}RequiredDefaults, ${serviceVarName}UpdateSpecs } from "./type";

export const serviceSpec: TGenericSpec<${serviceTypeName}> = {
    serviceId: "${serviceName}",
    servicePath: "${serviceNamePrefix}/${serviceNameSuffix}",
    serviceValidator: T${serviceTypeName},
    serviceRequiredDefaults: ${serviceVarName}RequiredDefaults,
    serviceUpdateSpecs: ${serviceVarName}UpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
};
export type TService = TGeneric_Settings_Client_AgreementLength;

export const serviceInstance = new GenericService<T${serviceTypeName}>(serviceSpec);

if (process.env.startGenericServices === "true") { 
    serviceInstance.run().then(running => running ? true : process.exit()).catch((error) => {
        console.error(error);
    });
}
`;

if (!fs.existsSync(`${serviceDirPath}/type.ts`)) {
    fs.writeFileSync(`${serviceDirPath}/type.ts`, typeFile);
    console.warn("The type file already exists");
}
if (!fs.existsSync(`${serviceDirPath}/index.ts`)) {
    fs.writeFileSync(`${serviceDirPath}/index.ts`, indexFile);
    console.warn("The index file already exists");
}

console.log(typeFile, "\n", indexFile);