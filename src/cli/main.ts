#!/usr/bin/env node

import fs from "fs";
import * as yargs from "yargs";
import { Bank } from "../domain/accounts";
import { Category } from "../domain/category";
import { TransactionsFile } from "../domain/file";
import { RawRecordFilters } from "../domain/filters";
import { TransactionsProcessor } from "../domain/processor";
import { Rules } from "../domain/rules";
import {
  byAmountAsc,
  byAmountDesc,
  isUncategorised,
  RawRecord,
  sum,
  Transaction,
  TransactionsLoader,
} from "../domain/transaction";
import { Logger, TermLogger } from "../util/log";
import { countBy, groupBy } from "../util/reducers";
import { percentOf, zer0 } from "../util/util";
import Rule = Rules.Rule;
import RuleDesc = Rules.RuleDesc;

function _doStuff(args: Args) {
  const stuffDoer = new StuffDoer(args);
  stuffDoer.doStuff();
}

class StuffDoer {
  private log: Logger;
  private rulesFilePath: ReadonlyArray<string>;
  private accountsFilePath: string;
  private txFilePaths: ReadonlyArray<string>;

  constructor(args: Args) {
    this.log = new TermLogger(args.debug);
    this.log.debug("Starting with args", args);
    this.rulesFilePath = args.rules;
    this.accountsFilePath = args.accounts;
    this.txFilePaths = args.files;
  }

  loadRules(): RuleDesc[] {
    return this.rulesFilePath.flatMap((f) =>
      new Rules.RulesLoader(this.log).loadFile(f)
    );
  }

  loadAccounts(): Bank.Accounts {
    return new Bank.AccountsLoader(this.log).loadFile(this.accountsFilePath);
  }

  doStuff() {
    const rules = this.loadRules();
    this.log.debug(
      "Loaded rules:",
      rules.map((r) => r.name)
    );

    const accounts = this.loadAccounts();
    this.log.debug("Loaded accounts:", accounts);

    const transactionsLoader = new TransactionsLoader(accounts, this.log);
    const transactionsProcessor = new TransactionsProcessor(
      rules.map(Rules.toRule),
      this.log
    );
    const processed = this.txFilePaths.flatMap((f) =>
      this.loadTransactions(f, transactionsLoader, transactionsProcessor)
    );
    this.log.info(
      `Total: processed ${processed.length} records from ${this.txFilePaths.length} files`
    );

    const { isDebit, isCredit, inTime, between } = RawRecordFilters;
    const uncategorisedRecords = processed.filter(isUncategorised());

    const mostCommonUncategorised = uncategorisedRecords
      .reduce(...countBy((r: Transaction) => r.desc))
      .toArray()
      .map((e) => ({ desc: e.key, count: e.value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map((r) => `${r.desc} (${r.count} times)`);

    const mostSpennoUncategorised = uncategorisedRecords
      .sort(byAmountAsc)
      .slice(0, 20)
      .map((r) => `${r.desc} ($${r.amount})`);

    this.log.info("");
    const pc = percentOf(uncategorisedRecords.length, processed.length);
    this.log.warn(
      `Missing category for ${uncategorisedRecords.length} records (${pc})`
    );

    this.log.info("");
    this.log.warn("Recurring unrecognised records:");
    mostCommonUncategorised.forEach((mc) => this.log.info(mc));

    this.log.info("");
    this.log.warn("Most spenno unrecognised records:");
    mostSpennoUncategorised.forEach((ms) => this.log.warn(ms));

    this.log.info("");
    this.log.warn("Incoming unrecognised records:");
    this.log.info(
      "Total: " + uncategorisedRecords.filter(isCredit()).reduce(sum, zer0)
    );

    this.log.info(
      uncategorisedRecords
        .filter(isCredit())
        .sort(byAmountDesc)
        .map((r) => `${r.desc} ($${r.amount})`)
        .join("\n")
    );

    const bankStuff = processed.filter((r) => r.category === "bank");
    const bankTotal = bankStuff.reduce(sum, zer0);
    this.log.info("");
    this.log.warn(`Bank-related transactions 2018: ${bankTotal.toString()}`);

    this.log.info("");
    const totalSpend2018 = processed
      .filter(isDebit())
      .filter(inTime(2018, "year"))
      .reduce(sum, zer0);
    this.log.warn(`Total spends 2018: ${totalSpend2018}`);

    this.log.info("");
    const totalCredit2018 = processed
      .filter(isCredit())
      .filter(inTime(2018, "year"))
      .reduce(sum, zer0);
    this.log.warn(`Total gains 2018: ${totalCredit2018}`);

    this.log.info("");
    this.log.warn("By category");
    const totalsByCat = processed
      .reduce(...groupBy((t: Transaction) => t.category))
      .toArray()
      .map((e) => this.totalsForCategory(e.value, e.key));
    this.log.info(totalsByCat.map((t) => JSON.stringify(t)).join("\n"));

    this.log.warn("By store");
    // ... TODO
  }

  private loadTransactions(
    filePath: string,
    transactionsLoader: TransactionsLoader,
    transactionsProcessor: TransactionsProcessor
  ): Transaction[] {
    this.log.info(`Loading ${filePath}`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const transactionsFile = new TransactionsFile(
      filePath,
      "westpac.csv",
      fileContents
    );
    const loaded: RawRecord[] =
      transactionsLoader.loadRawRecords(transactionsFile);
    this.log.info(`Loaded ${loaded.length} records from ${filePath}`);
    const processed = transactionsProcessor.applyRules(loaded);
    this.log.info(`Processed ${processed.length} records from ${filePath}`);
    return processed;
  }

  private totalsForCategory(records: Transaction[], category: Category) {
    const debit = records.filter(RawRecordFilters.isDebit()).reduce(sum, zer0);
    const credit = records
      .filter(RawRecordFilters.isCredit())
      .reduce(sum, zer0);
    const total = records.reduce(sum, zer0);
    if (!total.eq(credit.plus(debit))) {
      throw new Error("WTF");
    }
    return {
      category: category,
      total: total,
      debit: debit,
      credit: credit,
    };
  }
}

interface Args {
  debug: boolean;
  accounts: string;
  rules: string[];
  files: string[];
  type: "westpac-csv";
}

// yargs(process.argv.slice(2)) to explicitly pass array, which makes this more testable.
const argv: Args = yargs.strict().options({
  debug: { alias: "d", desc: "Debug mode", type: "boolean", default: false },
  files: {
    alias: ["f", "file"],
    desc: "Input file(s) to load",
    array: true,
    demandOption: true,
  },
  type: {
    alias: "t",
    desc: "Type of input files",
    string: true,
    default: "westpac-csv",
    choices: ["westpac-csv"],
    demandOption: true,
  },
  rules: {
    alias: ["r", "rule"],
    desc: "Rule configuration file(s) to load",
    array: true,
    demandOption: true,
  },
  accounts: {
    alias: "a",
    desc: "Accounts configuration file",
    string: true,
    demandOption: true,
  },
}).argv as Args;

_doStuff(argv);

// commands
// check-rules
//   prints out uncat'd items, amounts, sums
//   --max-uncategorised error out if more than N uncat'd transactiond
//   --max-repeats error out if any uncat'd transaction repeats more than N times

// analyse
//   prints out text-based analysis
//   --unit <unit> of time to slice analysis -- if not specified, provides an overall
//   --categories [...categories-to-include]
//   --categories-exclude [...ditto]
//   --from <date> --to <date>
//   --sorting flags would also be good?

// web
//   spins up a web server with a React app showing the above graphicallyg

console.log("Bye");
process.exit(0);
