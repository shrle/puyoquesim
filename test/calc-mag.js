/**
 * 同時消し倍率の取得
 *
 * @param {number} deletePuyoNum 同時消し数
 * @param {number} doujiCorrection 同時消し係数の補正
 * @param {number} erasePuyoLength ぷよの消える最小数
 * @returns {number}
 */
const getDoujiMag = (deletePuyoNum, doujiCorrection, erasePuyoLength) => {
  return 1 + (deletePuyoNum - erasePuyoLength) * (0.15 * doujiCorrection);
};

/**
 * 連鎖倍率の取得
 *
 * @param {number} chainNum 連鎖数
 * @param {number} chainCorrection 連鎖係数の補正
 * @returns {number}
 */
// 連鎖係数のテーブル 50連鎖分
const chainCoefficientTable = [
  0.0, 0.4, 0.7, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2,
  3.4, 3.6, 3.8, 4.0, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
  4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
  4.2, 4.2, 4.2, 4.2, 4.2,
];
const getChainMag = (chainNum, chainCorrection) => {
  return chainCoefficientTable[chainNum] * chainCorrection + 1;
};

/**
 * 色ぷよの攻撃倍率計算
 * プリズムボールや分離消しボーナスなどは含まない
 * @param {number} deletePuyoNum   消えたぷよの数
 * @param {number} chainNum        連鎖数 0が1連鎖
 * @param {number} doujiCorrection 同時消し係数
 * @param {number} chainCorrection 連鎖倍率
 * @param {number} erasePuyoLength ぷよが消える長さ
 */
const puyoMagCalc = (
  deletePuyoNum,
  chainNum,
  doujiCorrection,
  chainCorrection,
  erasePuyoLength
) => {
  let doujiMag = getDoujiMag(deletePuyoNum, doujiCorrection, erasePuyoLength); // 同時消し倍率
  let chainMag = getChainMag(chainNum, chainCorrection); // 連鎖倍率
  console.dir("doujiMag: " + doujiMag);
  console.dir("chainMag: " + chainMag);
  const mag = doujiMag * chainMag;
  console.dir("mag: " + Math.round(mag * 100) / 100);
  return doujiMag * chainMag;
};

puyoMagCalc(4, 1, 1, 1, 4);
puyoMagCalc(5, 1, 1, 1, 4);
puyoMagCalc(6, 1, 1, 1, 4);
puyoMagCalc(7, 1, 1, 1, 4);
puyoMagCalc(8, 1, 1, 1, 4);
