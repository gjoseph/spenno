import { Logger } from "../util/log";
import { UNCATEGORISED } from "./category";
import { Rules } from "./rules";
import { RawRecord, Transaction } from "./transaction";

export class TransactionsProcessor {
  constructor(readonly rules: Rules.Rule[], readonly log: Logger) {}

  applyRules(rawRecords: RawRecord[]) {
    const processed: Transaction[] = rawRecords.map((raw) => {
      const rule = this.getRuleFor(this.rules, raw);
      const category = rule ? rule.category : UNCATEGORISED;
      const merchant = rule?.merchant || null;
      return {
        id: raw.id,
        account: raw.account,
        date: raw.date,
        desc: raw.desc,
        amount: raw.amount,
        merchant: merchant,
        category: category,
      };
    });
    return processed;
  }

  private getRuleFor(rules: Rules.Rule[], raw: RawRecord): Rules.Rule | null {
    const matches = rules.filter((rule) => {
      const storeRegex = rule.regex;
      const regexResult = storeRegex.test(raw.desc);
      if (!regexResult) {
        this.log.debug("Not matching", storeRegex);
        return regexResult;
      }
      const addCheckResult = !rule.additionalCheck || rule.additionalCheck(raw);
      this.log.debug(
        "Matches %s, %s",
        storeRegex,
        rule.additionalCheck
          ? "additional check " + (addCheckResult ? "passed" : "failed")
          : "no additional check"
      );
      return regexResult && addCheckResult;
    });

    if (matches.length === 1) {
      return matches[0];
    }

    if (matches.length === 0) {
      this.log.debug("No match for", raw.desc);
      return null;
    }

    // TODO return the error so we can expose to ui
    // TODO or merely just return another special category?
    // ... and/or include error in Transaction object
    this.log.warn(
      `${JSON.stringify(raw)} matches more than 1 rule: ${matches}`
    );
    return null;
  }
}
