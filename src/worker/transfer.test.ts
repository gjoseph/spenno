/**
 * Here we ensure that while Transaction isn't transferrable, TransferrableTransaction really is.
 * This exists because we use Web Workers, and we need objects to be transferred between threads.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
 */
import Big from "big.js";
import moment from "moment";
import { Transaction } from "../domain/transaction";
import { toEqualMoment } from "../jest/toEqualMoment";
import {
  fromTransferrable,
  toTransferrable,
  Transferrable,
  TransferrableMappings,
} from "./transfer";

// Copied from https://gist.github.com/robwise/1b36656e6ed7645ae33716dfb19fb60a
expect.extend({ toEqualMoment });

const { MessageChannel } = require("worker_threads");

const typedTx: Transaction = {
  id: "meh",
  account: { id: "b1", name: "b2" },
  date: moment(),
  desc: "d",
  amount: Big(123.32).div(Big(3)),
  merchant: "m",
  category: "c",
};

const transferrableTx: Transferrable<Transaction> = {
  id: "meh",
  account: { id: "b1", name: "b2" },
  date: moment().toISOString(),
  desc: "d",
  amount: "123.45",
  merchant: "m",
  category: "c",
};

test("conversion methods are symmetric (to(from))", () => {
  const result: any = toTransferrable(
    fromTransferrable(TransferrableMappings.TransactionTM)(transferrableTx),
  );
  expect(result).toEqual(transferrableTx);
});

test("conversion methods are symmetric (from(to))", () => {
  const result: Transaction = fromTransferrable<Transaction>(
    TransferrableMappings.TransactionTM,
  )(toTransferrable(typedTx));
  // this is another reason to ditch moment.js -- moment instances are never equal to each other
  // expect(result).toEqual(tx);
  const { date, ...txWithoutDate } = typedTx;
  expect(result).toMatchObject(txWithoutDate);
  // assert type of properties we know are transformed
  expect(moment.isMoment(result.date)).toEqual(true);
  expect(result.amount).toBeInstanceOf(Big);
  // assert date property because moment sucks
  expect(result.date).toEqualMoment(typedTx.date);
});

test("Transferrable<> remaps Big as string", () => {
  const test: Transferrable<Transaction> = {
    id: "meh",
    amount: "123",
    date: "moment()",
    category: "",
    desc: "",
    account: { id: "", name: "" },
    merchant: "",
  };
  expect(test.date).toEqual("moment()");
  expect(typeof test.date).toEqual("string");
  expect(test.amount).toEqual("123");
  expect(typeof test.amount).toEqual("string");
});

test("TransferrableTransaction is really transferrable", () => {
  return expect(structuredClone(transferrableTx)).resolves.toEqual(
    transferrableTx,
  );
});

test("Transaction is not transferrable", () => {
  return notTransferrable(typedTx, /number % 10/);
});

test("Big.js objects are not transferrable", () => {
  return notTransferrable(Big(123), /function Big/);
});

test("moment.js objects are not transferrable", () => {
  return notTransferrable(moment(), /number % 10/);
});

function notTransferrable(o: any, expectedError: RegExp) {
  return expect(structuredClone(o)).rejects.toMatchObject({
    name: "DataCloneError",
    message: expect.stringMatching(expectedError),
  });
}

// This simulates the global structuredClone browser function by using MessageChannel
// https://github.com/nodejs/node/issues/34355
function structuredClone(o: any) {
  const { port1, port2 } = new MessageChannel();
  return new Promise((resolve) => {
    port2.on("message", resolve);
    port2.on("close", port2.close);
    port1.postMessage(o);
    port1.close();
  }).catch((err) => {
    // console.log("error >>> name:", err.name, " >>> message:", err.message, "<<<<", err);
    port1.close();
    port2.close();
    return Promise.reject(err);
  });
}
