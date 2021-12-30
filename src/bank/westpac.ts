import * as csv from "csv-parse/browser/esm/sync";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { Bank } from "../domain/accounts";
import { TransactionsFile } from "../domain/file";
import { RawRecord } from "../domain/transaction";
import { Logger } from "../util/log";
import { signedAmount } from "../util/util";

interface BankFileHandler {
  /**
   * Bank Account,Date,Narrative,Debit Amount,Credit Amount,Balance,Categories,Serial
   */
  loadRawRecords(file: TransactionsFile): RawRecord[];
}

export namespace Westpac {
  export class WestpacHandler implements BankFileHandler {
    constructor(readonly accounts: Bank.Accounts, readonly log: Logger) {}

    /**
     * Bank Account,Date,Narrative,Debit Amount,Credit Amount,Balance,Categories,Serial
     */
    loadRawRecords(file: TransactionsFile): RawRecord[] {
      const records: any[] = csv.parse(file.fileContents, { columns: true });
      const westpac: RawRecord[] = records.map((a) => {
        const desc = this.simplifyNarrative(a.Narrative);
        if (a.Serial) {
          // No idea what these are ... (some sort of transactionID would be nice...)
          this.log.warn("WE FOUND A SERIAL: " + a.Serial);
        }
        return {
          id: uuidv4(),
          account: this.accounts.getAccount(a["Bank Account"]),
          date: moment(a.Date, "D/M/YYYY"),
          desc: desc,
          amount: signedAmount(
            Number.parseFloat(a["Debit Amount"]),
            Number.parseFloat(a["Credit Amount"]),
            () => `for this line: ${a.toString()}`
          ),
        };
      });

      const westpacCategories = Array.from(
        new Set(records.map((a) => a.Categories))
      );
      this.log.warn(
        westpacCategories.length +
          " unique Westpac categories: " +
          westpacCategories
      );

      this.log.info(`Loaded ${westpac.length} records from Westpac file`);
      return westpac;
    }

    private simplifyNarrative(narrative: string): string {
      const cleanedNarrative = narrative
        .replace(/WITHDRAWAL BY EFTPOS \d{7} /, "")
        .replace(/WITHDRAWAL ONLINE \d{7} /, "")
        .replace("DEBIT CARD PURCHASE ", "")
        .replace("DEBIT CARD REFUND ", "")
        .replace(/\s+/g, " ");
      this.log.debug("Full description:", narrative);
      this.log.debug("Simplified to:", cleanedNarrative);
      return cleanedNarrative;
    }
  }
}
