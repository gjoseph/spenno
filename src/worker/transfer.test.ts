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
import {
  fromTransferrable,
  toTransferrable,
  TransferrableTransaction,
} from "./transfer";

const { MessageChannel } = require("worker_threads");

const tx: Transaction = {
  account: { id: "b1", name: "b2" },
  date: moment(),
  desc: "d",
  amount: Big(123.32).div(Big(3)),
  merchant: "m",
  category: "c",
};

const tt: TransferrableTransaction = {
  account: { id: "b1", name: "b2" },
  date: moment().toISOString(),
  desc: "d",
  amount: "123.45",
  merchant: "m",
  category: "c",
};

test("conversion methods are symmetric 1", () => {
  expect(toTransferrable(fromTransferrable(tt))).toEqual(tt);
});

// this is another reason to ditch moment.js
test.skip("conversion methods are symmetric 2", () => {
  expect(fromTransferrable(toTransferrable(tx))).toEqual(tx);
});

test("TransferrableTransaction is really transferrable", () => {
  return expect(structuredClone(tt)).resolves.toEqual(tt);
});

test("Transaction is not transferrable", () => {
  return notTransferrable(tx, /number % 10/);
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
