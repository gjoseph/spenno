import { RawRecord } from "./transaction";
import { v4 as uuidv4 } from "uuid";

type FileType = "westpac.csv";
export class TransactionsFile {
  readonly id: string;
  enabled: boolean;
  rawRecords?: RawRecord[];
  constructor(
    readonly filePath: string,
    readonly type: FileType = "westpac.csv",
    readonly fileContents: string
  ) {
    // Generate a random id for each file
    this.id = uuidv4();
    this.enabled = true;
  }
}
