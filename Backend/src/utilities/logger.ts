import { pino, Logger } from "pino";

const logger: Logger = pino({
    level: process.env.LOG_LEVEL || "info",
    transport: {
        target: "pino-pretty", // To make the JSON logs pretty & readable
    },
    formatters: {
        level: (label, number) => {
            return { level: label.toUpperCase() };
        },
        bindings: (bindings) => {
            return { processID: bindings.pid };
        },
    },
    timestamp: () => {
        const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
            dateStyle: "long",
            timeStyle: "long",
            timeZone: process.env.LOG_TIMEZONE || "UTC",
        });

        return `,"time":"${dateTimeFormatter.format(Date.now())}"`;
    },
    messageKey: "message",
    errorKey: "error",
});

export default logger;
// FATAL - 60
// ERROR - 50
// WARN  - 40
// INFO  - 30  <- Default Level
// DEBUG - 20
// TRACE - 10
