import {
  addUniquenessSuffix,
  addUniquenessSuffixToProperty,
  addUniquenessSuffixToThings,
} from "./util";

test("lists with added suffix", () => {
  const input = ["a", "b", "a", "c", "c", "a"];
  expect(input.map(addUniquenessSuffix())).toEqual([
    "a",
    "b",
    "a (2)",
    "c",
    "c (2)",
    "a (3)",
  ]);
});

test("lists with added suffix using a custom formatter", () => {
  const input = ["a", "b", "a", "c", "c", "a"];
  expect(input.map(addUniquenessSuffix((s, i) => `#${i} for ${s}`))).toEqual([
    "#1 for a",
    "#1 for b",
    "#2 for a",
    "#1 for c",
    "#2 for c",
    "#3 for a",
  ]);
});

const things = [
  { name: "a", blah: "foo", count: 123 },
  { name: "b", blah: "bar", count: 123 },
  { name: "a", blah: "qux", count: 123 },
  { name: "c", blah: "qwe", count: 123 },
  { name: "c", blah: "rty", count: 123 },
  { name: "a", blah: "uio", count: 123 },
];

test("list of things added suffix as a mapping function on list", () => {
  expect(
    things.map(
      addUniquenessSuffixToThings(
        (t) => t.name,
        (t, s) => ({ ...t, name: s }),
        (s, i) => `#${i} for ${s}`,
      ),
    ),
  ).toEqual([
    { name: "#1 for a", blah: "foo", count: 123 },
    { name: "#1 for b", blah: "bar", count: 123 },
    { name: "#2 for a", blah: "qux", count: 123 },
    { name: "#1 for c", blah: "qwe", count: 123 },
    { name: "#2 for c", blah: "rty", count: 123 },
    { name: "#3 for a", blah: "uio", count: 123 },
  ]);
});

// TODO test that verifies that passing "invalid-prop" to addUniquenessSuffixToProperty() should not compile ? Also, "count" should not compile as its not a string prop
test("list of things added suffix as a mapping function on list with property", () => {
  expect(
    things.map(
      addUniquenessSuffixToProperty("name", (s, i) => `#${i} for ${s}`),
    ),
  ).toEqual([
    { name: "#1 for a", blah: "foo", count: 123 },
    { name: "#1 for b", blah: "bar", count: 123 },
    { name: "#2 for a", blah: "qux", count: 123 },
    { name: "#1 for c", blah: "qwe", count: 123 },
    { name: "#2 for c", blah: "rty", count: 123 },
    { name: "#3 for a", blah: "uio", count: 123 },
  ]);
});
