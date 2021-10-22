import { Bank } from "../domain/accounts";
import { Rules } from "../domain/rules";

export namespace Temp {
  // Not committing this, since it's mostly private data
  export const Temp_Accounts: Bank.Account[] = [];

  export const Temp_Rules: Rules.Rule[] = [];
}
