"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequest = void 0;
const parseRequest = (req) => {
    return {
        params: req.params,
        query: req.query,
        body: req.body
    };
};
exports.parseRequest = parseRequest;
//# sourceMappingURL=parser.js.map