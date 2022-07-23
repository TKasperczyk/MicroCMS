import { TGeneric_Data_User } from "@services/database/generic/data/user/type";

type TGeneric_Data_UserPartial = Pick<TGeneric_Data_User, "login" | "group">;

export const extractUserData = (incomingObject: TGeneric_Data_UserPartial | { user: TGeneric_Data_UserPartial }): TGeneric_Data_UserPartial => {
    let login = "", group = "";
    if ("user" in incomingObject) {
        login = incomingObject.user?.login || "";
        group = incomingObject.user?.group || "";
    } else if ("login" in incomingObject) {
        login = incomingObject?.login || "";
        group = incomingObject?.group || "";
    }
    return { login, group };
};