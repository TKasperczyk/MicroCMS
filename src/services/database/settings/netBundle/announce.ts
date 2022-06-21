import { getRoutes } from "./router";

export const netBundleAnnounce = (port: number): Promise<Response> => {
    console.log("fetching");
    return fetch("http://127.0.0.1:3000/discovery", {
        method: "post",
        cache: "no-cache",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ routeMappings: getRoutes("/settings/netBundle"), port })
    });
};