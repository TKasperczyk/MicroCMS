import { GenericService } from "@framework/core/service";

import { TSettings_TicketGroup, settings_ticketGroupRequiredDefaults, settings_ticketGroupUpdateSpecs } from "./type";

new GenericService<TSettings_TicketGroup>({
    serviceId: "settings.ticketGroup",
    servicePath: "/settings/ticketGroup",
    serviceValidator: TSettings_TicketGroup,
    serviceRequiredDefaults: settings_ticketGroupRequiredDefaults,
    serviceUpdateSpecs: settings_ticketGroupUpdateSpecs,
    serviceIndexes: [{
        name: "name",
        types: ["unique"]
    }],
}).run().then(running => running ? true : process.exit()).catch((error) => {
    console.error(error);
});