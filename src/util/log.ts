import * as chalk from "chalk";

export interface Logger {
  debug(message: string, ...stuff: any[]): void;

  info(message: string): void;

  warn(message: string): void;
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
