import * as fs from "fs";
import * as yaml from "js-yaml";
import { Logger } from "../util/log";
import { Category, RawRecord } from "./transaction";

export namespace Rules {
  type AdditionalCheck = (transaction: RawRecord) => boolean;

  export class Rule {
    constructor(
      readonly name: string,
      readonly merchant: string,
      readonly regex: RegExp,
      readonly category: Category,
      readonly additionalCheck?: AdditionalCheck
    ) {}
  }

  export class RulesLoader {
    constructor(readonly log: Logger) {
      this.log = log;
    }

    loadFile(filePath: string): Rule[] {
      this.log.info(`Loading ${filePath}`);
      const fileContents = fs.readFileSync(filePath, "utf8");
      return this.loadYaml(fileContents);
    }

    loadYaml(yamlContent: string): Rule[] {
      const doc = yaml.load(yamlContent);
      if (!Array.isArray(doc)) {
        throw new Error("Rules yaml should be an array");
      } else {
        return Array.from(doc).map((yamlElement) => {
          return new Rule(
            yamlElement["name"],
            yamlElement["merchant"],
            new RegExp(yamlElement["regex"]),
            yamlElement["category"]
            // TODO turn yamlElement["additionalCheck"] into a Function
          );
        });
      }
    }
  }
}
