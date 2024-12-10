var URLSafeBase64 = require("urlsafe-base64");
const pako = require("pako");

const setting = {
  field: "aabbccddeeffggaAbBcCdDeEgGaabbccddeeffggaAbBcCdDeEgGaabb",
  paintColor: -1,
  erasePuyoLength: 4,
  selectRouteLengthMax: 5,
  doujiCorrection: 1,
  chainCorrection: 1,
};

const data =
  "aabbccddeeffggaAbBcCdDeEgGaabbccddeeffggaAbBcCdDeEgGaabb,-1,4,5,1,1";
console.dir(data.length);
//let json = JSON.stringify(setting);
let pData = pako.deflate(data);

const buf = Buffer.from(pData);
console.dir(pData);
console.dir(pData.length);
console.log(buf);

const base64 = URLSafeBase64.encode(buf);

console.log(base64);
console.log(base64.length);
