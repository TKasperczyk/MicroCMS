import { TData_User } from "@services/database/generic/data/user/type";

type TData_UserPartial = Pick<TData_User, "login" | "group">;

export const extractUserData = (incomingObject: TData_UserPartial | { user: TData_UserPartial }): TData_UserPartial => {
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