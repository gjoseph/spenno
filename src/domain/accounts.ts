import * as fs from "fs";

import * as yaml from "js-yaml";
import { Logger } from "../util/log";

export namespace Bank {
  export class Account {
    constructor(readonly name: string, readonly id: string) {}
  }

  export class Accounts {
    constructor(readonly accounts: Account[]) {}

    getAccount = (accountNr: string): Account => {
      const account = this.accounts.find((a) => a.id === accountNr);
      if (!account) {
        throw new Error("Unknown account: " + accountNr);
      }
      return account;
    };
  }

  export class AccountsLoader {
    constructor(readonly log: Logger) {}

    loadFile(filePath: string): Accounts {
      this.log.info(`Loading ${filePath}`);
      const fileContents = fs.readFileSync(filePath, "utf8");
      return this.loadYaml(fileContents);
    }

    loadYaml(yamlContent: string): Accounts {
      const doc = yaml.load(yamlContent);
      if (!Array.isArray(doc)) {
        throw new Error("Accounts yaml should be an array");
      } else {
        const accounts = Array.from(doc).map((yamlElement) => {
          return new Account(yamlElement["name"], String(yamlElement["id"]));
        });
        return new Accounts(accounts);
      }
    }
  }
}
