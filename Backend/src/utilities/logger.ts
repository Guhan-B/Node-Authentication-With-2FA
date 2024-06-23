import dotenv from "dotenv";
import { pino } from "pino";

dotenv.config();

const handlers = String(process.env.LOG_HANDLERS).split(",");
const targets = [];

if (handlers.includes("console")) {
    targets.push({
        target: "pino-pretty"
    });
}

if (handlers.includes("file")) {
    targets.push({
        target: "pino/file",
        options: { destination: process.env.LOG_FILE_PATH || "server.log" }
    });
}

const logger = pino(
    {
        level: process.env.LOG_LEVEL || "info",
        formatters: {
            bindings: (bindings) => {
                return { PID: bindings.pid };
            }
        },
        timestamp: () => {
            const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
                dateStyle: "long",
                timeStyle: "long",
                timeZone: process.env.LOG_TIMEZONE || "UTC"
            });

            return `,"time":"${dateTimeFormatter.format(Date.now())}"`;
        },
        messageKey: "message",
        errorKey: "error"
    },
    pino.transport({ targets })
);

export default logger;

// FATAL - 60
// ERROR - 50
// WARN  - 40
// INFO  - 30  <- Default Level
// DEBUG - 20
// TRACE - 10
