"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouter = void 0;
const express_1 = require("express");
const helpers_1 = require("../../../shared/helpers");
const getRouter = (routePrefix, middleware) => {
    const routes = {
        get: `${routePrefix}/netBundle/:id`,
        search: `${routePrefix}/netBundle/search`,
        aggregate: `${routePrefix}/netBundle/aggregate`,
        add: `${routePrefix}/netBundle`,
        update: `${routePrefix}/netBundle/:id`,
        delete: `${routePrefix}/netBundle/:id`,
    };
    const router = (0, express_1.Router)();
    for (const crudRoute of Object.keys(routes)) {
        const routerMethod = (0, helpers_1.crudRouteToMethod)(crudRoute);
        const routerFunction = router[routerMethod];
        console.log(routerFunction);
    }
    return router;
};
exports.getRouter = getRouter;
(0, exports.getRouter)(``, ``);
//# sourceMappingURL=router.js.map