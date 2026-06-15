type LogLevel = "info" | "warn" | "error" | "debug";

type LogContext = Record<string, unknown>;

function formatMessage(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(formatMessage("info", message, context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(formatMessage("warn", message, context));
  },
  error(message: string, context?: LogContext) {
    console.error(formatMessage("error", message, context));
  },
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage("debug", message, context));
    }
  },
};
