import { v4 as uuidv4 } from "uuid";
import { RawRecord } from "./transaction";

type FileType = "westpac.csv";

export class TransactionsFile {
  readonly id: string;
  enabled: boolean;
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

export interface FileWithRawRecords extends TransactionsFile {
  rawRecords: RawRecord[];
}

export interface FileDescriptor {
  readonly id: string;
  readonly filePath: string;
  readonly type: FileType;
  readonly enabled: boolean;
  readonly recordCount?: number;
}
