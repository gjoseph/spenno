import * as fs from "fs";
import * as yaml from "js-yaml";
import { evalTSFunction } from "../util/eval";
import { Logger } from "../util/log";
import { Category, RawRecord } from "./transaction";

export namespace Rules {
  type AdditionalCheck = (transaction: RawRecord) => boolean;
  type AdditionalCheckTS = string;

  /* The rule, pretty much as described in the yaml file -- could even have comments, line numbers, the lot */
  export interface RuleDesc {
    readonly name: string;
    readonly merchant?: string;
    readonly category: string;
    readonly regex: string;
    readonly additionalCheck?: AdditionalCheckTS;
  }

  /* The rule, as used at runtime */
  export interface Rule {
    readonly name: string;
    readonly merchant?: string;
    readonly category: Category;
    readonly regex: RegExp;
    readonly additionalCheck?: AdditionalCheck;
  }

  // For transactions and dateRange, we're doing this conversion in worker/transfer, but i'm not sure this'll scale
  // ... and maybe there's a better solution than hand-rolling conversion methods out there
  export const toRule: (r: RuleDesc) => Rule = (r: RuleDesc) => {
    return {
      name: r.name,
      regex: new RegExp(r.regex),
      category: r.category,
      merchant: r.merchant,
      additionalCheck: r.additionalCheck
        ? evalRule(r.additionalCheck)
        : undefined,
    };
  };

  function evalRule(additionalCheck: AdditionalCheckTS): AdditionalCheck {
    return evalTSFunction<RawRecord, boolean>(additionalCheck);
  }

  export class RulesLoader {
    constructor(readonly log: Logger) {
      this.log = log;
    }

    loadFile(filePath: string): RuleDesc[] {
      this.log.info(`Loading ${filePath}`);
      const fileContents = fs.readFileSync(filePath, "utf8");
      return this.loadYaml(fileContents);
    }

    loadYaml(yamlContent: string): RuleDesc[] {
      const doc = yaml.load(yamlContent);
      if (!Array.isArray(doc)) {
        throw new Error("Rules yaml should be an array");
      } else {
        return Array.from(doc).map((yamlElement) => {
          return {
            name: yamlElement["name"],
            merchant: yamlElement["merchant"],
            category: yamlElement["category"],
            regex: yamlElement["regex"],
            additionalCheck: yamlElement["additionalCheck"],
          };
        });
      }
    }
  }
}
