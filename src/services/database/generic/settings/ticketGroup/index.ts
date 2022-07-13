import { runGenericService } from "@framework/service/generic";

import { TSettings_TicketGroup, settings_ticketGroupRequiredDefaults, settings_ticketGroupUpdateSpecs } from "./type";

runGenericService<TSettings_TicketGroup>({
    serviceId: "settings.ticketGroup",
    servicePath: "/settings/ticketGroup",
    serviceValidator: TSettings_TicketGroup,
    serviceRequiredDefaults: settings_ticketGroupRequiredDefaults,
    serviceUpdateSpecs: settings_ticketGroupUpdateSpecs,
    serviceIndexes: [],
    serviceUniqueIndexes: ["name"]
}).then().catch((error) => {
    console.error(error);
});
