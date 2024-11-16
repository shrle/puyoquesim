import * as maps from "@/js/maps";
import { PuyoqueStd } from "@/js/puyoquestd";

const puyoColor = PuyoqueStd.puyoColor;

const settings = {
  normal: {
    maps: maps.normal,
    name: "通常のタネ",
    erasePuyoLength: 4,
    chainCorrection: 1,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.red,
    selectRouteBehavior: "delete",
  },
  deleteThree: {
    maps: maps.deleteThree,
    name: "3個消し",
    erasePuyoLength: 3,
    chainCorrection: 7,
    eraseAssumedPuyoLength: 2,
    eraseBlankNum: 2,
    color: puyoColor.green,
    selectRouteBehavior: "delete",
  },
  paintBlue: {
    maps: maps.paintBlue,
    name: "青ぬりかえ",
    erasePuyoLength: 4,
    chainCorrection: 10,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.blue,
    selectRouteBehavior: "paint",
  },

  paintPurple: {
    maps: maps.paintPurple,
    name: "紫ぬりかえ",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.purple,
    selectRouteBehavior: "paint",
  },

  paintYellow: {
    maps: maps.paintYellow,
    name: "黄ぬりかえ",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.yellow,
    selectRouteBehavior: "paint",
  },

  paintRed: {
    maps: maps.paintRed,
    name: "赤ぬりかえ",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.red,
    selectRouteBehavior: "paint",
  },

  paintGreen: {
    maps: maps.paintGreen,
    name: "緑ぬりかえ",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.green,
    selectRouteBehavior: "paint",
  },
};

export default settings;
