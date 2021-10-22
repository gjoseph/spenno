import { Bank } from "../domain/accounts";
import { Rules } from "../domain/rules";

export namespace Temp {
  // Not committing this, since it's mostly private data
  export const Temp_Accounts: Bank.Account[] = [
    new Bank.Account("savings", "032143377573"),
    new Bank.Account("checking", "732108778897"),
    new Bank.Account("swiss", "034770000440"),
  ];

  export const Temp_Rules: Rules.Rule[] = [
    new Rules.Rule(
      "spotify",
      "spotify",
      /^Spotify/i,
      "lux-utilities"
      // additionalCheck: "isDebit({ eq: 11.99}).or(isDebit({eq: 17.99}))" # solo and family account
    ),
    new Rules.Rule(
      "rent-mansfield",
      "rent-mansfield",
      /PYMT Posco Pty Rent Mansfield$/,
      "rent"
      // additionalCheck: "isDebit({ eq: 700}).or(isDebit({eq: 780}))"
    ),
    new Rules.Rule(
      "rent-bridgerd",
      "rent-bridgerd",
      /BPAY Rent Bridg Rent BridgeRd$/,
      "rent"
      // additionalCheck: "isDebit({ eq: 780 })"
    ),
  ];
}
