"use strict";

import express, { Express } from "express";

import { getRouter } from "./router";
import { NetBundleType } from "./type";
import { netBundleCrud } from "./crud";

netBundleCrud.get("6299670cd19d61fcfce78973").then((result) => {
    console.log(result);
});