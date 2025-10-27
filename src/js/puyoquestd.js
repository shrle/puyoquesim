import Point from "./point.js";
import Queue from "./queue.js";
import codeToPoint from "./code-to-point.js";
import array2dInit from "./array2d-init.js";

class Puyo {
  /**
   * ぷよの情報
   * @param {PuyoqueStd.puyoColor} color
   * @param {boolean} chance
   * @param {boolean} plus
   */
  constructor(color, chance, plus) {
    this.color = color;
    this.chance = chance;
    this.plus = plus;
  }

  clone() {
    return new Puyo(this.color, this.chance, this.plus);
  }

  /**
   * Puyoを1文字に変換する
   * 返された1文字をPuyo.fromChar()に渡すことで再び同じPuyoを生成できる
   * @returns
   */
  toChar() {
    let num = 0;
    num += this.chance ? 1 : 0;

    num = num << 1;

    num += this.plus ? 1 : 0;

    num = num << 4;

    //ぷよの色は -1 から始まるので +1 する
    num += this.color + 1;

    return Puyo.numToBase64Chars[num];
  }

  /**
   * Puyo.toChar()から返される1文字からPuyoを生成する
   * @param {string} 1文字
   * @returns {Puyo | null}
   */
  static fromChar(char) {
    if (typeof char !== "string") return null;
    if (char.length !== 1) return null;

    const num = Puyo.base64CharsToNum[char];
    if (num === undefined) return null;

    const FLAG_COLOR = 0xf;
    const FLAG_CHANCE = 0x20;
    const FLAG_PLUS = 0x10;

    const color = num & FLAG_COLOR;
    const chance = (num & FLAG_CHANCE) > 0;
    const plus = (num & FLAG_PLUS) > 0;

    // color - 1 : 文字へと変換する際に +1 したので -1 する
    return new Puyo(color - 1, chance, plus);
  }

  static numToBase64Chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(
      ""
    );
  static base64CharsToNum = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25,
    a: 26,
    b: 27,
    c: 28,
    d: 29,
    e: 30,
    f: 31,
    g: 32,
    h: 33,
    i: 34,
    j: 35,
    k: 36,
    l: 37,
    m: 38,
    n: 39,
    o: 40,
    p: 41,
    q: 42,
    r: 43,
    s: 44,
    t: 45,
    u: 46,
    v: 47,
    w: 48,
    x: 49,
    y: 50,
    z: 51,
    0: 52,
    1: 53,
    2: 54,
    3: 55,
    4: 56,
    5: 57,
    6: 58,
    7: 59,
    8: 60,
    9: 61,
    "-": 62,
    _: 63,
  };
}

class FloatingPuyo {
  /**
   * 浮遊しているぷよの情報
   * @param {number} x
   * @param {number} y
   * @param {PuyoqueStd.puyoColor} color
   * @param {boolean} chance
   * @param {boolean} plus
   * @param {number} dropStep 落下する段数
   */
  constructor(x, y, color, chance, plus, dropStep) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.chance = chance;
    this.plus = plus;
    this.dropStep = dropStep;
  }
}

class PuyoqueStd {
  constructor() {}

  static puyoColor = {
    blank: -1,
    red: 0,
    blue: 1,
    yellow: 2,
    green: 3,
    purple: 4,
    heart: 5,
    prism: 6,
    ojama: 7,
    kataPuyo: 8,
    ojamaChanging: 9,
  };

  /**
   *
   * @param {nuber} width
   * @param {nuber} height
   *
   * @returns {Field}
   */
  static createField(width, height) {
    return new Field(width, height);
  }

  static array2dInit(width, height, value) {
    let array = [];

    for (let y = 0; y < height; y++) {
      array[y] = [];
      for (let x = 0; x < width; x++) {
        array[y][x] = value;
      }
    }
    return array;
  }

  /**
   * 同時消し倍率の取得
   *
   * @param {number} deletePuyoNum 同時消し数
   * @param {number} doujiCorrection 同時消し係数の補正
   * @param {number} erasePuyoLength ぷよの消える最小数
   * @returns {number}
   */
  static getDoujiMag(deletePuyoNum, doujiCorrection, erasePuyoLength) {
    return 1 + (deletePuyoNum - erasePuyoLength) * (0.15 * doujiCorrection);
  }

  /**
   * 連鎖倍率の取得
   *
   * @param {number} chainNum 連鎖数
   * @param {number} chainCorrection 連鎖係数の補正
   * @returns {number}
   */
  // 連鎖係数のテーブル 50連鎖分
  static chainCoefficientTable = [
    0.0, 0.4, 0.7, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2,
    3.4, 3.6, 3.8, 4.0, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    4.2, 4.2, 4.2, 4.2, 4.2,
  ];
  static getChainMag(chainNum, chainCorrection) {
    return PuyoqueStd.chainCoefficientTable[chainNum] * chainCorrection + 1;
  }

  /**
   * 色ぷよの攻撃倍率計算
   * プリズムボールや分離消しボーナスなどは含まない
   * @param {number} deletePuyoNum   消えたぷよの数
   * @param {number} chainNum        連鎖数
   * @param {number} doujiCorrection 同時消し係数
   * @param {number} chainCorrection 連鎖倍率
   * @param {number} erasePuyoLength ぷよが消える長さ
   */
  static puyoMagCalc(
    deletePuyoNum,
    chainNum,
    doujiCorrection,
    chainCorrection,
    erasePuyoLength
  ) {
    let doujiMag = PuyoqueStd.getDoujiMag(
      deletePuyoNum,
      doujiCorrection,
      erasePuyoLength
    ); // 同時消し倍率
    let chainMag = PuyoqueStd.getChainMag(chainNum, chainCorrection); // 連鎖倍率

    return doujiMag * chainMag;
  }

  /**
   * 色の種類を数える
   *
   * @param {PuyoqueStd.puyoColor[]} colorList 色の種類のリスト 同じ色が格納されていても良い
   * @returns {number} 重複を含まない色の種類の数
   */
  static countColor(colorList) {
    let count = 0;
    let colorFlag = 0;
    for (let i = 0; i < colorList.length; i++) {
      if (colorList[i] < 0) continue;
      let bit = 1 << colorList[i];
      if ((colorFlag ^ bit) > 0) count++;
      colorFlag = colorFlag | bit;
    }

    return count;
  }
}

class Field {
  /**
   *
   * @param {Number} width 横のマス数
   * @param {Number} height 縦のマス数
   */
  constructor(width, height) {
    /** @type {Number} 横のマス数*/
    this._width = width;

    /** @type {Number} 縦のマス数*/
    this._height = height;
    /** @type {Puyo[][]} 盤面のぷよの情報 */
    this.map = [];

    /** @type {Puyo[]} ネクストぷよの情報 */
    this.next = [];

    /** @type {Puyo[][]} ネクネクのぷよの情報 */
    this.nextnext = [];

    this.boostAreaMap = [];
    this.initBoostArea();

    this.mapRecord = [];

    this.clear();
    this.floatingPuyo = [];

    /**
     * マップの各マスの隣接する座標が格納される
     * adjacentPoints[0][0] = [[0,1],[1,0]]
     */
    this.adjacentPoints = [];

    {
      const adjacentPoint = [
        //new Point(-1, -1),
        new Point(0, -1),
        //new Point(1, -1),
        new Point(1, 0),
        //new Point(1, 1),
        new Point(0, 1),
        //new Point(-1, 1),
        new Point(-1, 0),
      ];
      for (let y = 0; y < this.height; y++) {
        let line = [];
        for (let x = 0; x < this.width; x++) {
          let adjacent = [];
          for (const ap of adjacentPoint) {
            const point = new Point(x + ap.x, y + ap.y);
            if (!this.isRangeField(point.x, point.y)) continue;
            adjacent.push(point);
          }
          line.push(adjacent);
        }
        this.adjacentPoints.push(line);
      }
    }
  }

  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  mapClear() {
    this.map = [];

    for (let y = 0; y < this.height; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.map[y][x] = new Puyo(PuyoqueStd.puyoColor.blank, false);
      }
    }
  }

  nextClear() {
    this.next = [];
    for (let x = 0; x < this.width; x++) {
      this.next[x] = new Puyo(PuyoqueStd.puyoColor.blank, false, false);
    }
  }

  nextnextClear() {
    this.nextnext = [];

    for (let y = 0; y < this.height; y++) {
      this.nextnext[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.nextnext[y][x] = new Puyo(PuyoqueStd.puyoColor.blank, false);
      }
    }
  }

  clear() {
    this.mapClear();
    this.nextClear();
    this.nextnextClear();

    this.mapRecord = [];
  }

  getAdjacentPoints(x, y) {
    return this.adjacentPoints[y][x];
  }

  cloneMap() {
    let map = [];

    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = this.puyoClone(x, y);
      }
    }
    return map;
  }

  cloneNextPuyos() {
    let clone = [];

    for (let x = 0; x < this.width; x++) {
      clone[x] = this.nextClone(x);
    }

    return clone;
  }

  /**
   *
   * @returns {Field}
   */
  clone() {
    let newField = PuyoqueStd.createField(this.width, this.height);
    newField.copy(this);
    return newField;
  }

  /**
   *
   * @param {Field} copyField
   */
  copy(copyField) {
    if (!(copyField instanceof Field)) return;

    for (let x = 0; x < copyField.width; x++) {
      const n = copyField.getNextPuyo(x);
      this.setNextPuyo(x, n.color, n.chance, n.plus);
    }

    for (let y = 0; y < copyField.height; y++) {
      for (let x = 0; x < copyField.width; x++) {
        const m = copyField.getPuyo(x, y);
        this.setPuyo(x, y, m.color, m.chance, m.plus);
      }
    }
  }

  recordMap() {
    this.mapRecord.push({
      map: this.cloneMap(),
      next: this.cloneNextPuyos(),
    });
  }

  undoMap() {
    if (this.mapRecord.length === 0) return;
    let record = this.mapRecord.pop();
    this.map = record.map;
    this.next = record.next;
  }

  /**
   * 座標がフィールド範囲内か調べる
   * @param {number} x
   * @param {number} y
   */
  isRangeField(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  setColor(x, y, color) {
    if (!this.isRangeField(x, y)) return;
    this.map[y][x].color = color;
  }

  getPuyo(x, y) {
    if (!this.isRangeField(x, y)) return null;
    return this.map[y][x];
  }

  getColor(x, y) {
    if (!this.isRangeField(x, y)) return PuyoqueStd.puyoColor.blank;
    return this.map[y][x].color;
  }

  getChance(x, y) {
    if (!this.isRangeField(x, y)) return false;
    return this.map[y][x].chance;
  }

  getPlus(x, y) {
    if (!this.isRangeField(x, y)) return false;
    return this.map[y][x].plus;
  }

  setPlus(x, y) {
    if (!this.isRangeField(x, y)) return false;
    this.map[y][x].plus = true;
  }

  countPointsToPlus(points) {
    let count = 0;
    for (const p of points) {
      if (this.getPlus(p.x, p.y)) count++;
    }

    return count;
  }

  setPuyo(x, y, color, isChance, isPlus) {
    if (!this.isRangeField(x, y)) return;
    this.map[y][x].color = color;
    this.map[y][x].chance = isChance;
    this.map[y][x].plus = isPlus;
  }

  setNextColor(x, color) {
    if (!this.isRangeField(x, 0)) return;
    this.next[x].color = color;
  }

  setNextPlus(x) {
    if (!this.isRangeField(x, 0)) return;
    this.next[x].plus = true;
  }
  deleteNextPlus(x) {
    if (!this.isRangeField(x, 0)) return;
    this.next[x].plus = false;
  }

  setNextsPlus() {
    for (let x = 0; x < this.width; x++) {
      this.setNextPlus(x);
    }
  }

  setNextPuyo(x, color, isChance, isPlus) {
    if (!this.isRangeField(x, 0)) return;
    this.next[x].color = color;
    this.next[x].chance = isChance;
    this.next[x].plus = isPlus;
  }

  setNextNextPuyo(x, y, color, isChance, isPlus) {
    //TODO: 範囲外チェック
    this.nextnext[y][x].color = color;
    this.nextnext[y][x].chance = isChance;
    this.nextnext[y][x].plus = isPlus;
  }

  setNextNextMapColor(map) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setNextNextPuyo(x, y, map[y][x], false, false);
      }
    }
  }

  getNextPuyo(x) {
    if (!this.isRangeField(x, 0)) return null;
    return this.next[x];
  }
  getNextColor(x) {
    if (!this.isRangeField(x, 0)) return PuyoqueStd.puyoColor.blank;
    return this.next[x].color;
  }

  getNextChance(x) {
    if (!this.isRangeField(x, 0)) return false;
    return this.next[x].chance;
  }

  getNextPlus(x) {
    if (!this.isRangeField(x, 0)) return false;
    return this.next[x].plus;
  }

  getNextNextPuyo(x, y) {
    return this.nextnext[y][x];
  }

  setAllNextColor(color) {
    for (let i = 0; i < this.width; i++) {
      this.next[i].color = color;
    }
  }

  setChance(x, y) {
    if (!this.isRangeField(x, y)) return;
    this.map[y][x].chance = true;
  }
  deleteChance(x, y) {
    if (!this.isRangeField(x, y)) return PuyoqueStd.puyoColor.blank;
    this.map[y][x].chance = false;
  }
  deletePlus(x, y) {
    if (!this.isRangeField(x, y)) return PuyoqueStd.puyoColor.blank;
    this.map[y][x].plus = false;
  }

  deletePuyo(x, y) {
    this.setPuyo(x, y, PuyoqueStd.puyoColor.blank, false, false);
  }

  deletePuyos(pointList) {
    pointList.forEach((point) => {
      this.deletePuyo(point.x, point.y);
    });
  }

  deletePuyosFromCode(code) {
    for (const c of code) {
      const p = codeToPoint[c];
      this.deletePuyo(p.x, p.y);
    }
  }

  setPuyosColorFromCode(code, color) {
    for (const c of code) {
      const p = codeToPoint[c];
      this.setColor(p.x, p.y, color);
    }
  }

  initBoostArea() {
    this.boostAreaMap = array2dInit(this.width, this.height, false);
  }
  setBoostAreaFromCode(code) {
    for (const c of code) {
      const p = codeToPoint[c];
      this.boostAreaMap[p.y][p.x] = true;
    }
  }
  setBoostAreaFromCodes(codes) {
    this.initBoostArea();
    for (const code of codes) {
      this.setBoostAreaFromCode(code);
    }
    console.dir(this.boostAreaMap);
  }

  isBoostArea(x, y) {
    if (!this.isRangeField(x, y)) return false;
    return this.boostAreaMap[y][x];
  }

  deleteNext(x) {
    this.setNextPuyo(x, PuyoqueStd.puyoColor.blank, false, false);
  }

  deleteNextNext(x, y) {
    this.setNextNextPuyo(x, y, PuyoqueStd.puyoColor.blank, false, false);
  }

  puyoClone(x, y) {
    let color = this.getColor(x, y);
    let chance = this.getChance(x, y);
    let plus = this.getPlus(x, y);
    return new Puyo(color, chance, plus);
  }

  nextClone(x) {
    let color = this.getNextColor(x);
    let chance = this.getNextChance(x);
    let plus = this.getNextPlus(x);
    return new Puyo(color, chance, plus);
  }

  setMapColor(map) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setPuyo(x, y, map[y][x], false, false);
      }
    }
  }

  /**
   * 盤面を設定する
   * @param {Puyo[][]} map
   */
  setMapPuyo(map) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const puyo = map[y][x];
        this.setPuyo(x, y, puyo.color, puyo.chance, puyo.plus);
      }
    }
  }

  /**
   * ネクストぷよを設定する
   * @param {Puyo[]} nexts
   */
  setNextPuyos(nexts) {
    for (let x = 0; x < this.width; x++) {
      const puyo = nexts[x];
      this.setNextPuyo(x, puyo.color, puyo.chance, puyo.plus);
    }
  }

  /**
   *
   * @param {Number[]} Number is puyo index
   */
  setNextColors(colors) {
    for (let x = 0; x < this.width; x++) {
      this.setNextPuyo(x, colors[x], false);
    }
  }

  /**
   * 盤面のぷよの色をすべて取得する
   * @returns {PuyoqueStd.puyoColor[][]} puyo color map
   */
  getMap() {
    let map = [];

    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = this.getColor(x, y);
      }
    }
    return map;
  }

  /**
   * 盤面のデータを文字列として返す
   * 戻り値をField.fromCode()に渡すことで同じ盤面のFieldを生成できる
   * @returns
   */
  toCode() {
    let code = "";
    for (let x = 0; x < this.width; x++) {
      const puyo = this.getNextPuyo(x);
      const char = puyo.toChar();
      code += char;
    }

    code += "_";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const puyo = this.getPuyo(x, y);
        const char = puyo.toChar();
        code += char;
      }
    }
    return code;
  }

  /**
   * Field.toCode()から返された文字列から盤面を設定する
   *
   * @param {string} code
   */
  codeToMap(code) {
    if (typeof code !== "string") return null;

    const data = code.split("_");
    if (data.length !== 2) return null;

    const nextChars = data[0];
    const mapChars = data[1];

    const width = nextChars.length;

    if (mapChars.length % width !== 0) return null;

    const height = mapChars.length / width;

    /** @type {Puyo[]} ネクストぷよ */
    let nexts = [];
    for (const n of nextChars) {
      nexts.push(Puyo.fromChar(n));
    }

    /** @type {Puyo[][]} 盤面のぷよ */
    let map = [];
    let i = 0;
    for (let y = 0; y < height; y++) {
      let line = [];
      for (let x = 0; x < width; x++) {
        const puyo = Puyo.fromChar(mapChars[i]);
        line.push(puyo);
        i++;
      }
      map.push(line);
    }

    this.setNextPuyos(nexts);
    this.setMapPuyo(map);
  }

  /**
   * Field.toCode()から返された文字列からFieldを生成する
   *
   * @param {string} code
   * @returns {Field | null}
   */
  static fromCode(code) {
    if (typeof code !== "string") return null;

    const data = code.split("_");
    if (data.length !== 2) return null;

    const nextChars = data[0];
    const mapChars = data[1];

    const width = nextChars.length;

    if (mapChars.length % width !== 0) return null;

    const height = mapChars.length / width;

    /** @type {Puyo[]} ネクストぷよ */
    let nexts = [];
    for (const n of nextChars) {
      nexts.push(Puyo.fromChar(n));
    }

    /** @type {Puyo[][]} 盤面のぷよ */
    let map = [];
    let i = 0;
    for (let y = 0; y < height; y++) {
      let line = [];
      for (let x = 0; x < width; x++) {
        const puyo = Puyo.fromChar(mapChars[i]);
        line.push(puyo);
        i++;
      }
      map.push(line);
    }

    let field = new Field(width, height);
    field.setNextPuyos(nexts);
    field.setMapPuyo(map);
    return field;
  }

  /**
   * 盤面の情報をconsole.logに出力する
   */
  output() {
    let text = "";
    for (let x = 0; x < this.width; x++) {
      let color = this.getNextColor(x);
      let chance = this.getNextChance(x);
      if (0 <= color && color < 10) {
        text += chance ? "*" : " ";
      }
      text += color;
      text += x < this.width - 1 ? "," : "";
    }

    text += "\n------------------------\n";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let color = this.getColor(x, y);
        let chance = this.getChance(x, y);
        let plus = this.getPlus(x, y);

        let status = chance ? "*" : " ";
        status = plus ? "+" : status;
        status = chance && plus ? "@" : status;

        if (0 <= color && color < 10) {
          text += status;
        }
        text += color;
        text += x < this.width - 1 ? "," : "";
      }
      text += "\n";
    }

    console.log(text);
  }

  /**
   * 指定座標の色をひとつずらす
   * 赤 -> 青 -> 黄 -> 緑 -> 紫
   * @param {Number} x マス
   * @param {Number} y マス
   */
  shiftColor(x, y) {
    if (this.isBlank(x, y)) return false;
    let puyoColor = PuyoqueStd.puyoColor;
    let changedColor = [
      puyoColor.blue,
      puyoColor.yellow,
      puyoColor.green,
      puyoColor.purple,
      puyoColor.red,
    ];
    let color = this.getColor(x, y);
    this.setColor(x, y, changedColor[color]);
  }

  /**
   * 盤面のすべてのぷよ色をひとつずらす
   * 赤 -> 青 -> 黄 -> 緑 -> 紫
   */
  shuffleMap() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.shiftColor(x, y);
      }
    }
  }

  /**
   * 指定座標の上下左右の色を調べる
   * フィールド外は呼び出さない
   */
  targetAround(x, y, callback) {
    let color = this.getColor(x - 1, y);
    if (this.isRangeField(x - 1, y)) callback(x - 1, y, color);

    color = this.getColor(x, y - 1);
    if (this.isRangeField(x, y - 1)) callback(x, y - 1, color);

    color = this.getColor(x + 1, y);
    if (this.isRangeField(x + 1, y)) callback(x + 1, y, color);

    color = this.getColor(x, y + 1);
    if (this.isRangeField(x, y + 1)) callback(x, y + 1, color);
  }

  /**
   * 複数の指定座標の上下左右の色を調べる
   * フィールド外は呼び出さない
   */
  targetsAround(points, callback) {
    for (const p of points) {
      this.targetAround(p.x, p.y, callback);
    }
  }

  /**
   * 指定座標に対する上下左右それぞれの色を引数に呼び出される
   * @callback targetAround
   *
   * @param {Point} x, y
   * @param {PuyoqueStd.puyoColor} color
   */

  /**
   * 指定座標が色ぷよかどうか判定
   * @returns \{boolean\}
   */
  isPuyo(x, y) {
    let color = this.getColor(x, y);
    return (
      color >= PuyoqueStd.puyoColor.red && color <= PuyoqueStd.puyoColor.purple
    );
  }

  /**
   * 指定座標がなぞり消し可能か調べる
   */
  canTracePuyo(x, y) {
    let color = this.getColor(x, y);
    return (
      color >= PuyoqueStd.puyoColor.red && color <= PuyoqueStd.puyoColor.prism
    );
  }

  /**
   * 指定座標リストが全てなぞり消し可能か調べる
   */
  canTraceRoute(points) {
    for (const point of points) {
      if (!this.canTracePuyo(point.x, point.y)) return false;
    }
    return true;
  }

  isChancePuyo(x, y) {
    if (!this.isRangeField(x, y)) return false;
    return this.map[y][x].chance;
  }

  isBlank(x, y) {
    return this.getColor(x, y) === PuyoqueStd.puyoColor.blank;
  }

  isBlanks(points) {
    for (const point of points) {
      if (this.getColor(point.x, point.y) !== PuyoqueStd.puyoColor.blank)
        return false;
    }
    return true;
  }

  isNextBlank(x) {
    return this.getNextColor(x) === PuyoqueStd.puyoColor.blank;
  }

  /**
   * 指定列が埋まっているか調べる
   *
   * @param {number} x 列
   * @returns {boolean} 埋まっていたらtrue
   */
  isFull(x) {
    return !this.isBlank(x, 0);
  }

  isAllClear() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isBlank(x, y)) return false;
      }
    }
    return true;
  }

  /**
   *  指定座標のぷよと指定色が一致しているか
   * @param {number} x
   * @param {number} y
   * @param {PuyoqueStd.puyoColor} color
   */
  colorComp(x, y, color) {
    return this.getColor(x, y) === color;
  }
  /**
   * 指定座標のぷよと複数の指定色のいずれかでも一致しているか
   * @param {number} x
   * @param {number} y
   * @param {PuyoqueStd.puyoColor} colors
   */
  colorMultComp(x, y, colors) {
    for (const color of colors) {
      if (this.colorComp(x, y, color)) return true;
    }
    return false;
  }

  twoPointColorComp(aX, aY, bX, bY) {
    return this.getColor(aX, aY) === this.getColor(bX, bY);
  }

  /**
   * 指定列に指定色を落とす
   * @param {number} x
   * @param {PuyoqueStd.puyoColor} color
   */
  dropPuyo(x, color) {
    if (!this.isRangeField(x, 0)) return;
    let y;
    for (y = this.height; y >= 0; y--) {
      if (this.isBlank(x, y)) break;
    }
    if (y >= 0) this.setColor(x, y, color);
  }

  /**
   * 浮いているぷよの情報を返す
   * @returns {FloatingPuyo[]}
   */
  getFloatingPuyo() {
    let puyos = [];
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
        else if (blankNum > 0) {
          let puyo = this.puyoClone(x, y);
          puyos.push(
            new FloatingPuyo(x, y, puyo.color, puyo.chance, puyo.plus, blankNum)
          );
        }
      }
    }
    return puyos;
  }

  /**
   * 浮遊ぷよの情報を保存
   */
  holdFloatingPuyo() {
    this.floatingPuyo = this.getFloatingPuyo();
  }

  /**
   * 盤面上の浮遊ぷよを削除
   */
  deleteFoatingPuyo() {
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
        else if (blankNum > 0) {
          this.deletePuyo(x, y);
        }
      }
    }
  }

  /**
   * 各座標のぷよが浮いているか真偽値
   * true = 浮いている, false = 浮いていない
   * @returns {boolean[][]}
   */
  getIsFloatingPuyoMap() {
    let map = PuyoqueStd.array2dInit(this.width, this.height, false);
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) {
          blankNum++;
        } else if (blankNum > 0) {
          map[y][x] = true;
        }
      }
    }
    return map;
  }

  /**
   * 浮いているネクストぷよの情報を返す
   * @returns {FloatingPuyo[]}
   */
  getFloatingNext() {
    let puyos = [];
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
      }
      if (blankNum === 0) continue;
      let puyo = this.getNextPuyo(x);
      if (!this.isNextBlank(x)) {
        puyos.push(
          new FloatingPuyo(x, -1, puyo.color, puyo.chance, puyo.plus, blankNum)
        );
      }
    }
    return puyos;
  }

  holdFoatingNexts() {
    this.floatingPuyo = this.getFloatingNext();
  }

  /**
   * 浮いているネクネクを含めたネクストぷよの情報を返す
   * @returns {FloatingPuyo[]}
   */
  getFloatingNextNext() {
    console.log("getFloatingNextNext");
    let puyos = [];
    let blankNum = 0;

    // 列ごとに処理する
    for (let x = 0; x < this.width; x++) {
      // 列の空マスの数をカウント
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
      }

      // 空マスがないのでネクストは降らない
      if (blankNum === 0) continue;

      /** ネクストぷよの深さ ネクストぷよがある場合 -1 で その次のネクネクが -2と深くなっていく、ただしネクストがない場合は最初のネクネクが-1 */
      let depth = -1;

      if (!this.isNextBlank(x)) {
        // ネクストぷよがある場合
        let puyo = this.getNextPuyo(x);
        puyos.push(
          new FloatingPuyo(
            x,
            depth,
            puyo.color,
            puyo.chance,
            puyo.plus,
            blankNum
          )
        );
        depth--;
      }

      for (let y = this.height - 1; y >= 0; y--) {
        if (blankNum + depth < 0) break;

        let puyo = this.getNextNextPuyo(x, y);
        // ネクネクが存在しないのでこの列はスキップ
        if (puyo.color === PuyoqueStd.puyoColor.blank) break;
        puyos.push(
          new FloatingPuyo(
            x,
            depth,
            puyo.color,
            puyo.chance,
            puyo.plus,
            blankNum
          )
        );
        depth--;
      }
    }
    return puyos;
  }

  holdFoatingNextNext() {
    this.floatingPuyo = this.getFloatingNextNext();
  }

  deleteFoatingNexts() {
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
      }
      if (blankNum === 0) continue;
      //let color = this.getNextColor(x);
      if (!this.isNextBlank(x)) {
        this.deleteNext(x);
      }
    }
  }

  deleteFoatingNextNext() {
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
      }
      if (blankNum === 0) continue;
      //let color = this.getNextColor(x);

      let depth = -1;
      if (!this.isNextBlank(x)) {
        this.deleteNext(x);
        depth--;
      }

      for (let y = this.height - 1; y >= 0; y--) {
        if (blankNum + depth <= 0) break;
        this.deleteNextNext(x, y);
        depth--;
      }
    }
  }

  /**
   * 各座標のネクストぷよが浮いているか真偽値
   * true = 浮いている, false = 浮いていない
   * @returns {boolean[][]}
   */
  getIsFloatingNexts() {
    let nexts = [];
    //let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      //blankNum = 0;
      nexts[x] = false;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) {
          nexts[x] = true;
          break;
        }
      }
    }
  }

  /**
   * 浮いているぷよを落とす
   */
  dropFloatingPuyo() {
    let blankQueue = [];
    for (let x = 0; x < this.width; x++) {
      blankQueue = [];
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankQueue.push(new Point(x, y));
        else if (blankQueue.length > 0) {
          let blankPoint = blankQueue.shift();
          let puyo = this.getPuyo(x, y);
          this.setPuyo(
            blankPoint.x,
            blankPoint.y,
            puyo.color,
            puyo.chance,
            puyo.plus
          );
          this.deletePuyo(x, y);
          blankQueue.push(new Point(x, y));
        }
      }
    }
  }

  /**
   * 浮いているネクストぷよを落とす
   */
  dropFloatingNext() {
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
      }
      if (blankNum === 0) continue;
      let puyo = this.getNextPuyo(x);
      this.setPuyo(x, blankNum - 1, puyo.color, puyo.chance, puyo.plus);
      this.deleteNext(x);
    }
  }

  /**
   * 保存した浮遊ぷよを落下させる
   */
  dropHoldFoatingPuyo() {
    for (const puyo of this.floatingPuyo) {
      const x = puyo.x;
      const y = puyo.y + puyo.dropStep;
      const color = puyo.color;
      const chance = puyo.chance;
      const plus = puyo.plus;
      this.setPuyo(x, y, color, chance, plus);
    }
  }

  /**
   * フィールド上のぷよの連結状態を調べるメソッド
   * 指定数以上のぷよの連結を見つけたら連結箇所ごとに座標リストとその色をコールバック関数にわたす
   *
   * @param {targetLink} callback
   * @param {Number} targetLinkNum 指定数
   */
  searchLinkPuyos(targetLinkNum, callback) {
    let checkedMap = PuyoqueStd.array2dInit(this.width, this.height, false);

    const height = this.height;
    const width = this.width;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!this.isPuyo(x, y)) continue;

        const pointList = this.countLinkPuyos(x, y, checkedMap);

        if (pointList.length >= targetLinkNum) {
          const color = this.getColor(x, y);
          if (callback(pointList, color) === false) return;
        }
      }
    }
  }
  /*
  searchLinkPuyos(targetLinkNum, callback) {
    let checkedMap = PuyoqueStd.array2dInit(this.width, this.height, false);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isPuyo(x, y)) continue;

        let pointList = [];
        let color = this.getColor(x, y);
        let linkNum = this.countLinkPuyos(
          x,
          y,
          color,
          0,
          checkedMap,
          pointList
        );

        if (linkNum >= targetLinkNum) {
          if (callback(pointList, color) === false) return;
        }
      }
    }
  }
  */

  /**
   * 指定数以上のぷよの連結を見つけた場合に呼び出される
   * 連結箇所ごとに座標リストとその色を渡されるので目的に応じて処理を行う
   * @callback targetLink
   *
   * @param {Point[]} pointList
   * @param {PuyoStd.puyoColor} color
   *
   * @returns {Boolean} falseが帰ってきた場合searchLinkPuyosメソッドを途中終了させる
   */

  /**
   * フィールド上のぷよの連結数を再起的に調べる
   *
   * @param {number} x 現在座標x
   * @param {number} y 現在座標y
   * @param {bool[][]} checkedMap trueであれば探査済みのマップ
   *
   * @returns {number} 連結座標リスト
   */
  countLinkPuyos(x, y, checkedMap) {
    const queue = new Queue();
    queue.push(new Point(x, y));
    let pointList = [];
    const color = this.getColor(x, y);

    while (queue.size != 0) {
      const p = queue.pop();
      if (checkedMap[p.y][p.x] || !this.colorComp(p.x, p.y, color)) continue;

      pointList.push(new Point(p.x, p.y));
      checkedMap[p.y][p.x] = true;
      for (const ap of this.adjacentPoints[p.y][p.x]) {
        queue.push(ap);
      }
    }

    return pointList;
  }
  /*
  countLinkPuyos(x, y, color, linkNum, checkedMap, pointList) {
    if (
      !this.isRangeField(x, y) ||
      checkedMap[y][x] ||
      !this.colorComp(x, y, color)
    )
      return linkNum;

    linkNum++;
    checkedMap[y][x] = true;
    pointList.push(new Point(x, y));

    linkNum = this.countLinkPuyos(
      x,
      y - 1,
      color,
      linkNum,
      checkedMap,
      pointList
    ); // top
    linkNum = this.countLinkPuyos(
      x + 1,
      y,
      color,
      linkNum,
      checkedMap,
      pointList
    ); // right
    linkNum = this.countLinkPuyos(
      x,
      y + 1,
      color,
      linkNum,
      checkedMap,
      pointList
    ); // bottom
    linkNum = this.countLinkPuyos(
      x - 1,
      y,
      color,
      linkNum,
      checkedMap,
      pointList
    ); // left

    return linkNum;
  }
*/
  /**
   * 指定数以上のぷよの連結を見つけた場合にtrueを返す
   *
   * @param {Number} targetLinkNum 指定数
   * @returns {boolean}
   */
  isChain(targetLinkNum) {
    let chained = false;
    this.searchLinkPuyos(targetLinkNum, () => {
      chained = true;
      return false; // searchLinkPuyosを終了させる
    });
    return chained;
  }

  /**
   * 指定座標のぷよの上下左右の連結状態をビットフラグで返す
   * 最上段(y=0)は同色であってもつながらない
   *
   * @returns {bitflag}
   */
  puyoLinkState(x, y) {
    let linkState = 0;
    let top = 1 << 0,
      right = 1 << 1,
      bottom = 1 << 2,
      left = 1 << 3;

    if (y == 0) return 0;
    if (this.twoPointColorComp(x, y, x, y - 1) && y - 1 > 0)
      linkState = linkState | top;
    if (this.twoPointColorComp(x, y, x + 1, y)) linkState = linkState | right;
    if (this.twoPointColorComp(x, y, x, y + 1)) linkState = linkState | bottom;
    if (this.twoPointColorComp(x, y, x - 1, y)) linkState = linkState | left;

    return linkState;
  }

  /**
   * 指定座標のぷよの上下左右の連結状態を番号で返す
   *
   * @returns {number}
   *
   */
  puyoLinkStateNumber(x, y) {
    let linkState = 0;
    let top = 1 << 0,
      right = 1 << 1,
      bottom = 1 << 2,
      left = 1 << 3;

    linkState = this.puyoLinkState(x, y);

    let linkNum = 0;
    if (linkState === 0) linkNum = 0;
    else if (linkState == top) linkNum = 1;
    else if (linkState == right) linkNum = 2;
    else if (linkState == bottom) linkNum = 3;
    else if (linkState == left) linkNum = 4;
    else if (linkState == (top | right)) linkNum = 5;
    else if (linkState == (top | bottom)) linkNum = 6;
    else if (linkState == (top | left)) linkNum = 7;
    else if (linkState == (bottom | right)) linkNum = 8;
    else if (linkState == (bottom | left)) linkNum = 9;
    else if (linkState == (bottom | top | right)) linkNum = 10;
    else if (linkState == (bottom | top | left)) linkNum = 11;
    else if (linkState == (right | left)) linkNum = 12;
    else if (linkState == (right | left | top)) linkNum = 13;
    else if (linkState == (right | left | bottom)) linkNum = 14;
    else if (linkState == (right | left | bottom | top)) linkNum = 15;

    return linkNum;
  }
}

export { PuyoqueStd, Puyo, Field };
