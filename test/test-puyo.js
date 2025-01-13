import { PuyoqueStd, Puyo, Field } from "../src/js/puyoquestd.js";
import * as maps from "../src/js/maps.js";

console.log(Puyo.fromChar("A"));
const puyoColor = PuyoqueStd.puyoColor;
const field = PuyoqueStd.createField(8, 6);
field.setMapColor(maps.normal[0]);
field.output();

console.log(
  "------------------------------------------------------------------------"
);
console.log("");
const code = field.toCode();
console.dir(code);

console.log("");
const f = Field.fromCode(code);
f.output();
console.log("");
console.log(
  "------------------------------------------------------------------------"
);
console.log("");
/*
for (let color = -1; color < 10; color++) {
  const p = new Puyo(color, false, true);
  console.dir(p);

  const c = p.toChar();
  console.log(c);

  const np = Puyo.fromChar(c);
  console.dir(np);

  console.log("");
  console.log("-----------------------------------------------------");
  console.log("");
}
*/
