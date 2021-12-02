import * as chalk from "chalk";

export interface Logger {
  debug(message: string, ...stuff: any[]): void;

  info(message: string): void;

  warn(message: string): void;
}

type LogLevel = "debug" | "info" | "warn";

export interface LogEntry {
  level: LogLevel;
  message: string;
}

export class ArrayLogger implements Logger {
  readonly logEntries: LogEntry[] = [];

  constructor(readonly debugMode: boolean) {}

  debug(message: string, ...stuff: any[]): void {
    if (this.debugMode) {
      this.add("debug", [message, ...stuff].join(" "));
    }
  }

  info(message: string): void {
    this.add("info", message);
  }

  warn(message: string): void {
    this.add("warn", message);
  }

  private add(level: LogLevel, message: string) {
    this.logEntries.push({ level, message });
  }
}

export class ConsoleLogger implements Logger {
  debug(message: string, ...stuff: any[]): void {
    console.debug(message, ...stuff);
  }

  info(message: string): void {
    console.info(message);
  }

  warn(message: string): void {
    console.warn(message);
  }
}

export class TermLogger implements Logger {
  constructor(readonly debugMode: boolean) {}

  debug(message: string, ...stuff: any[]) {
    if (this.debugMode) {
      console.debug(chalk.cyan(message), ...stuff);
    }
  }

  info(message: string) {
    console.info(chalk.green(message));
  }

  warn(message: string) {
    console.warn(chalk.rgb(255, 165, 0)(message));
  }

  randomColors(message: string) {
    console.warn(
      Array.from(message)
        .map((c) => this.rndChlk()(c))
        .join("")
    );
  }

  private rndChlk = (): chalk.Chalk =>
    chalk.rgb(this.rnd255(), this.rnd255(), this.rnd255());

  private rnd255 = (): number => {
    return Math.floor(Math.random() * 255);
  };
}

export class SilentLogger implements Logger {
  debug(message: string, ...stuff: any[]): void {}

  info(message: string): void {}

  warn(message: string): void {}
}

export const forwardLogs = (logs: LogEntry[], targetLogger: Logger) => {
  logs.forEach((l) => {
    targetLogger[l.level]("[job result] " + l.message);
  });
};
