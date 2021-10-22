import Big from "big.js";

test.skip("WTF javascript", () => {
  expect(0.1 + 0.2).toEqual(0.3);
});

test("big.js", () => {
  const z1 = sumBigs([9.9, 1.3].map((n) => new Big(n)));
  const z2 = sumBigs([9.9, 1.2, 0.1].map((n) => new Big(n)));
  expect(z1).toEqual(z2);
  expect(z1).toStrictEqual(z2);
});

function sumBigs(numbers: Big[]) {
  return numbers.reduce((acc, v) => acc.plus(v), new Big(0));
}

// TODO
test.todo("test that a record only matches 1 rule");
test.todo("test filtering by category/subcategory");
