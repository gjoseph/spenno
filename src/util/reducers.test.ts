import { countBy, groupBy } from "./reducers";

test("groupBy reducer - by word length", () => {
  const words = ["dog", "cat", "chat", "hop", "hip", "hund", "chien"];

  const res = words.reduce(...groupBy((current: string) => current.length));
  expect(res).not.toBeNull();
  expect(res).toBeDefined();
  expect(res.size).toEqual(3);
  expect(Array.from(res.keys())).toEqual([3, 4, 5]);
  expect(res.get(3)).toStrictEqual(["dog", "cat", "hop", "hip"]);
  expect(res.get(4)).toStrictEqual(["chat", "hund"]);
  expect(res.get(5)).toStrictEqual(["chien"]);
});

test("groupBy reducer - returns an arrayable map", () => {
  const words = ["dog", "cat", "chat", "hop", "hip", "hund", "chien"];
  const res = words.reduce(...groupBy((current: string) => current.length));

  // kinda cheating below -- we now the order of elements within the grouped arrays will remain as in the input
  // i wish i understood how to use custom matchers with jest, or to assert on "nested" elements
  expect(res.toArray()).toEqual(
    expect.arrayContaining([
      { key: 3, value: ["dog", "cat", "hop", "hip"] },
      { key: 4, value: ["chat", "hund"] },
      { key: 5, value: ["chien"] },
    ]),
  );
});

test("countBy reducer - by first letter", () => {
  const words = ["dog", "cat", "hop", "hip", "chat", "hund", "chien", "cheval"];

  const res = words.reduce(...countBy((current: string) => current[0]));
  expect(res).not.toBeNull();
  expect(res).toBeDefined();
  expect(res.size).toEqual(3);
  expect(Array.from(res.keys()).sort()).toEqual(["c", "d", "h"]);
  expect(res.get("c")).toBe(4);
  expect(res.get("d")).toBe(1);
  expect(res.get("h")).toBe(3);
});

test("countBy reducer - returns an arrayable map", () => {
  const words = ["dog", "cat", "hop", "hip", "chat", "hund", "chien", "cheval"];
  const res = words.reduce(...countBy((current: string) => current[0]));
  expect(res.toArray()).toEqual(
    expect.arrayContaining([
      { key: "c", value: 4 },
      { key: "d", value: 1 },
      { key: "h", value: 3 },
    ]),
  );
});
