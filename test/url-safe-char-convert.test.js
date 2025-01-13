import {
  numToUrlSafeChar,
  UrlSafeCharToNum,
} from "../src/js/url-safe-char-convert";

const undo = (num) => {
  const char = numToUrlSafeChar(num);
  const charToNum = UrlSafeCharToNum(char);

  return charToNum;
};

for (let num = -5; num < 70; num++) {
  test("num to equal charToNum: " + num, () => {
    expect(num).toBe(undo(num));
  });
}

test("numToUrlSafeChar()に規定に反する引数を与える ", () => {
  expect(numToUrlSafeChar("a")).toBe(null);
  expect(numToUrlSafeChar(false)).toBe(null);
  expect(numToUrlSafeChar("0")).toBe(null);
  expect(numToUrlSafeChar(10.5)).toBe(null);
});

test("UrlSafeCharToNum()に規定に反する引数を与える ", () => {
  expect(UrlSafeCharToNum(0)).toBe(null);
  expect(UrlSafeCharToNum(10)).toBe(null);
  expect(UrlSafeCharToNum(10.5)).toBe(null);
  expect(UrlSafeCharToNum("*")).toBe(null);
  expect(UrlSafeCharToNum("+")).toBe(null);
  expect(UrlSafeCharToNum("?")).toBe(null);
});
