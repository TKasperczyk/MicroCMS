"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMiddleware = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const addMiddleware = (app) => {
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(body_parser_1.default.json());
};
exports.addMiddleware = addMiddleware;
//# sourceMappingURL=middleware.js.map