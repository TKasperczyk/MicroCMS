import cluster from "node:cluster";

const forks = 3;

if (cluster.isPrimary) {
    process.env.id = "MASTER";
    for (let fork = 0; fork <= forks; fork++) {
        cluster.fork();
    }
} else if (cluster.isWorker) {
    require("./index");
}
