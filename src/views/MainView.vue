<template>
  <div id="main">
    <main>
      <h1>ぷよクエ練習シミュレータ</h1>
      <article class="rate-container">
        <div
          v-for="(mag, index) in colorMag"
          :class="colorClassName[index]"
          :key="index"
        >
          {{ Math.floor(mag * 10) / 10 }}
        </div>
      </article>

      <div class="info">
        <div>のこりなぞり消し:{{ selectRouteSurplusLength }}</div>

        <div>連鎖数:{{ chainNum }}</div>
        <button class="icon-button" @click="undo">
          <span class="material-symbols-outlined"> undo </span>
        </button>
      </div>
      <!-- canvas -->
      <div id="cv"></div>

      <article class="replay-container">
        <!--リプレイ ボタン-->
        <button
          class="icon-button"
          @click="replayFirst"
          :disabled="replay.length === 0"
        >
          <span class="material-symbols-outlined"> keyboard_tab_rtl </span>
        </button>
        <button
          class="icon-button"
          @click="replayPrev"
          :disabled="replay.length === 0"
        >
          <span class="material-symbols-outlined"> arrow_back </span>
        </button>
        <button
          class="icon-button"
          @click="replayNext"
          :disabled="replay.length === 0"
        >
          <span class="material-symbols-outlined"> arrow_forward </span>
        </button>
        <div v-show="replay.length > 0">
          {{ replayIndex + 1 }} / {{ replay.length }}
        </div>
      </article>

      <article class="settings">
        <label for="historyIndex">
          <span class="material-symbols-outlined"> schedule </span>
          履歴
        </label>
        <div class="felx-row">
          <select name="historyIndex" v-model="historyIndex">
            <option
              v-for="(item, index) in history"
              :value="index"
              :key="index"
            >
              連鎖:{{ item.chainNum }},{{ item.colorMag }}
            </option>
          </select>
          <button class="icon-button" @click="historyRouteShow">
            <span class="material-symbols-outlined"> visibility </span>
          </button>
          <button class="icon-button" @click="historyRouteFire">
            <span class="material-symbols-outlined"> swipe_right </span>
          </button>
        </div>

        <label for="selectNextColor"> ネクスト </label>

        <div>
          <select name="selectNextColor" v-model="selectNextColor">
            <option
              v-for="(item, index) in colorName"
              :value="index - 1"
              :key="index"
            >
              {{ item }}
            </option>
          </select>
        </div>

        <label for="paintColor"> なぞり </label>
        <div>
          <select name="paintColor" v-model="paintColor">
            <option value="-1">消す</option>
            <template v-for="(item, index) in colorName" :key="index">
              <option :value="index - 1" v-if="index > 0">
                {{ item }}
              </option>
            </template>
          </select>
        </div>

        <label for="atackColor"> 攻撃色 </label>
        <div>
          <select name="atackColor" v-model="atackColor">
            <template v-for="(item, index) in colorName">
              <option :value="index - 1" v-if="index > 0" :key="index">
                {{ item }}
              </option>
            </template>
          </select>
        </div>

        <label for="erasePuyoLength"> N個で消える </label>
        <div>
          <select name="erasePuyoLength" v-model="erasePuyoLength">
            <option v-for="(item, index) in 47" :value="index + 2" :key="index">
              {{ item + 1 }}
            </option>
          </select>
        </div>

        <label for="selectRouteLengthMax"> なぞり消し数 </label>
        <div>
          <select name="selectRouteLengthMax" v-model="selectRouteLengthMax">
            <option
              v-for="(item, index) in squareLength"
              :value="index + 1"
              :key="index"
            >
              {{ index + 1 }}
            </option>
          </select>
        </div>

        <label for="doujiCorrection"> 同時消し係数 </label>
        <div>
          <select name="doujiCorrection" v-model="doujiCorrection">
            <option
              v-for="(item, index) in squareLength * 2"
              :value="index / 2 + 1"
              :key="index"
            >
              {{ index / 2 + 1 }}
            </option>
          </select>
        </div>

        <label for="chainCorrection"> 連鎖倍率 </label>
        <div>
          <select name="chainCorrection" v-model="chainCorrection">
            <option
              v-for="(item, index) in squareLength * 2"
              :value="index / 2 + 1"
              :key="index"
            >
              {{ index / 2 + 1 }}
            </option>
          </select>
        </div>
      </article>

      <!---->
      <article class="tools">
        <button class="icon-button" @click="selectFile">
          <span class="material-symbols-outlined"> screenshot </span>
        </button>
        <button class="icon-button" @click="isShowPalette = !isShowPalette">
          <span class="material-symbols-outlined"> palette </span>
        </button>
      </article>

      <article class="palette-container" :class="{ show: isShowPalette }">
        <div class="palette-top">
          <div></div>
          <div>
            <button
              class="icon-button hide-button"
              @click="resetEditPaintColor"
            >
              <span class="material-symbols-outlined">
                keyboard_arrow_down
              </span>
            </button>
          </div>
        </div>
        <section class="palette">
          <div v-for="index in 9" :key="index">
            <img
              :src="puyoImgUrl(index - 1)"
              :class="{ selected: editPaintColor === index - 1 }"
              @click="setEditPaintColor(index - 1)"
            />
          </div>
          <button
            class="icon-button"
            :class="{ selected: editPaintColor === 999 }"
            @click="setEditPaintColor(999)"
          >
            <span class="material-symbols-outlined"> ink_eraser </span>
          </button>
        </section>
      </article>
    </main>
  </div>

  <ParseScreenShot
    @set-puyo-map="setPuyoMap"
    ref="ParseScreenShot"
  ></ParseScreenShot>
</template>

<script>
import PuyoqueStd from "../js/puyoquestd.js";
import PuyoqueCanvas from "../js/puyoquecanvas.js";
import ParseScreenShot from "@/components/ParseScreenShot.vue";
class History {
  constructor(map, lastNextPuyos, selectRoute, colorMag, chainNum) {
    this.map = map;
    this.lastNextPuyos = lastNextPuyos;
    this.selectRoute = selectRoute;
    this.colorMag = colorMag;
    this.chainNum = chainNum;
  }
}

export default {
  name: "MainView",
  components: { ParseScreenShot },
  async mounted() {
    const screenWidth = window.screen.availWidth;
    if (screenWidth < 400) {
      this.canvasWidth = screenWidth;
      const scale = screenWidth / 80;
      this.canvasHeight = 59 * scale;
    }
    console.dir(window.screen.availWidth);
    console.dir(this.canvasWidth);
    console.dir(this.canvasHeight);

    this.field = PuyoqueStd.createField(this.fieldWidth, this.fieldHeight);
    this.field.setMapColor(this.map);
    this.field.setNextColors(this.nextPuyos);
    this.canvas = new PuyoqueCanvas();
    await this.canvas.init(
      "#cv",
      this.canvasWidth,
      this.canvasHeight,
      this.field
    );
    this.canvas.colorMagCalc = this.colorMagCalc;
    this.canvas.addSelectRouteListeners(this.getSelectRoute);
    this.canvas.addChainStartListener(this.chainStart);
    this.canvas.addChainListener(this.chain);
    this.canvas.addChainEndListener(this.chainEnd);
    this.selectRoute = this.canvas.selectRoute;
    this.canvas.passSelectRouteLengthMax = this.passSelectRouteLengthMax;
    this.canvas.setErasePuyoLength(this.erasePuyoLength);
  },
  data() {
    return {
      canvasWidth: 400,
      canvasHeight: 295,
      fieldWidth: 8,
      fieldHeight: 6,
      field: {},
      canvas: {},
      selectRoute: [], // readonly
      selectRouteLengthMax: 5,
      history: [],
      historyIndex: 0,
      historyMaxLength: 50,
      stopRecordingHistory: false,
      lastMap: [],
      lastNextPuyos: [],
      doujiCorrection: 1,
      chainCorrection: 1,
      colorMag: [0, 0, 0, 0, 0, 0],
      chainNum: 0,
      erasePuyoLength: 4,
      selectMapIndex: 0,
      replay: [],
      replayIndex: 0,
      paintColor: -1,
      editPaintColor: -1,
      atackColor: 0,
      colorName: ["無", "赤", "青", "黄", "緑", "紫"],
      colorClassName: [
        "atackRateRed",
        "atackRateBlue",
        "atackRateYellow",
        "atackRateGreen",
        "atackRatePurple",
      ],
      selectNextColor: -1,

      map: [
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0, 1, 2, 3, 4, 5, 6, 7],
      ],
      nextPuyos: [0, 1, 2, 3, 4, 0, 1, 2],

      isShowPalette: false,
    };
  },
  computed: {
    selectRouteSurplusLength: function () {
      return this.selectRouteLengthMax - this.selectRoute.length;
    },
    squareLength: function () {
      return this.fieldWidth * this.fieldHeight;
    },
  },
  watch: {
    erasePuyoLength: function () {
      this.canvas.setErasePuyoLength(this.erasePuyoLength);
    },
    selectNextColor: function () {
      this.field.setAllNextColor(this.selectNextColor);
    },
    paintColor: function () {
      this.canvas.setPaintColor(this.paintColor);
    },
  },
  methods: {
    selectFile() {
      this.$refs.ParseScreenShot.selectFile();
    },
    setPuyoMap(map, nextPuyos) {
      console.dir(map);
      console.dir(nextPuyos);
      this.field.setMapColor(map);
      this.field.setNextColors(nextPuyos);
    },
    getSelectRoute: function (selectRoute) {
      this.selectRoute = selectRoute;
    },

    passSelectRouteLengthMax: function () {
      return this.selectRouteLengthMax;
    },

    historyRouteShow: function () {
      if (this.history.length === 0) return;
      let history = this.history[this.historyIndex];
      this.field.setMapPuyo(history.map);
      this.field.setNextColors(history.lastNextPuyos);
      this.selectRoute = history.selectRoute.clone();
      this.canvas.setRoute(this.selectRoute);
      this.replay = [];
      // this.canvas.allVisible();
    },

    historyRouteFire: function () {
      if (this.history.length === 0) return;
      this.stopRecordingHistory = true;
      let history = this.history[this.historyIndex];
      this.field.setMapPuyo(history.map);
      this.field.setNexts(history.lastNextPuyos);
      this.selectRoute = history.selectRoute.clone();
      this.canvas.setRoute(this.selectRoute);
      // this.canvas.allVisible();
      this.canvas.fire();
    },
    selectMap: function (index) {
      this.selectMapIndex = index;
      this.field.setMapColor(this.maps[index]);
      this.field.setAllNextColor(this.selectNextColor);
      // this.canvas.allVisible();
    },

    chainStart: function (selectRoute) {
      this.colorMag = [0, 0, 0, 0, 0, 0];
      this.lastMap = this.field.mapClone();
      this.lastNextPuyos = this.field.nextsClone();
      this.replay = [];
      this.replay.push({
        map: this.field.mapClone(),
        nexts: this.field.nextsClone(),
      });
      this.selectRoute = selectRoute.clone();

      this.field.recordMap();
    },

    chain: function () {
      this.replay.push({
        map: this.field.mapClone(),
        nexts: this.field.nextsClone(),
      });
    },

    chainEnd: function (chainNum) {
      this.chainNum = chainNum;
      this.replay.push({
        map: this.field.mapClone(),
        nexts: this.field.nextsClone(),
      });
      let wild = this.colorMag.reduce((sum, element) => sum + element, 0);
      let wildNum = 5;
      this.colorMag[wildNum] = wild;
      for (let i = 0; i < this.colorMag.length; i++) {
        this.colorMag[i] = this.round(this.colorMag[i], 2);
      }
      if (this.stopRecordingHistory) {
        this.stopRecordingHistory = false;
        return;
      }

      if (this.colorMag[5] <= 0) return;
      this.history.unshift(
        new History(
          this.lastMap,
          this.lastNextPuyos,
          this.selectRoute,
          this.colorMag,
          this.chainNum
        )
      );
      if (this.history.length >= this.historyMaxLength) {
        this.history.length = this.historyMaxLength;
      }
      this.replayIndex = this.replay.length - 1;
    },

    colorMagCalc: function (
      deletePuyoNum,
      deleteColorList,
      deletePrismNum,
      chainNum
    ) {
      var colorMag = [0, 0, 0, 0, 0]; // colorMag[puyoColor] = 倍率;
      var puyoMag = PuyoqueStd.puyoMagCalc(
        deletePuyoNum,
        chainNum,
        this.doujiCorrection,
        this.chainCorrection,
        this.erasePuyoLength
      );

      for (const color of deleteColorList) {
        colorMag[color] += puyoMag;
      }
      for (const color in colorMag) {
        colorMag[color] += deletePrismNum * 3;
      }

      for (let i = 0; i < colorMag.length; i++) {
        this.colorMag[i] += colorMag[i];
      }
    },

    undo: function () {
      if (this.history.length === 0) return;
      let history = this.history[0];
      this.field.setMapPuyo(history.map);
      this.field.setNexts(history.lastNextPuyos);
      this.selectRoute = [];
      this.canvas.resetRoute();
      this.replay = [];
      //this.canvas.allVisible();
    },

    showReplay: function () {
      this.field.setMapPuyo(this.replay[this.replayIndex].map);
      this.field.setNexts(this.replay[this.replayIndex].nexts);
      // this.canvas.allVisible();
      if (this.replayIndex === 0) {
        this.canvas.setRoute(this.selectRoute);
      } else {
        this.canvas.resetRoute();
      }
    },

    replayFirst: function () {
      if (this.replay.length === 0) return;
      this.replayIndex = 0;
      this.showReplay();
    },

    replayPrev: function () {
      if (this.replayIndex === 0) return;
      this.replayIndex--;
      this.showReplay();
    },

    replayNext: function () {
      if (this.replayIndex >= this.replay.length - 1) return;
      this.replayIndex++;
      this.showReplay();
    },
    setEditPaintColor(color) {
      this.editPaintColor = color;
      this.canvas.setEditPaintColor(color);
    },
    resetEditPaintColor() {
      this.isShowPalette = false;
      this.editPaintColor = -1;
      this.setEditPaintColor(-1);
    },

    puyoImgUrl(puyoIndex) {
      var puyoImg = [
        "./img/red.webp",
        "./img/blue.webp",
        "./img/yellow.webp",
        "./img/green.webp",
        "./img/purple.webp",
        "./img/heart.webp",
        "./img/prism.webp",
        "./img/ojama.webp",
        "./img/katapuyo.webp",
      ];

      if (puyoIndex == -1) return "./img/blank_r.gif";

      return puyoImg[puyoIndex];
    },

    round: function (value, base = 0) {
      return Math.round(value * 10 ** base) / 10 ** base;
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Kosugi+Maru&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

@layer base,util;

@layer base {
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    /*font-family: "Kosugi Maru", sans-serif;*/
    font-family: "Roboto", sans-serif;
  }

  h1 {
    margin-top: 10px;
    font-size: 12px;
  }

  .material-symbols-outlined {
    font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    user-select: none;
  }
  img {
    user-select: none;
    -webkit-user-drag: none;
    -moz-user-select: none;
  }

  button.icon-button {
    width: 40px;
    height: 40px;
    border: 0;
    background-color: #ffffff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  button.icon-button:hover {
    background-color: #cccccc;
  }

  button.icon-button:active {
    background-color: #aaaaaa;
  }

  #main {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
  }

  main {
    width: 400px;
    margin-bottom: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  @media screen and (max-width: 400px) {
    main {
      width: 100%;
    }
  }
  #main select {
    width: 60px;
    height: 30px;
    border: #aaaaaa 1px solid;
    border-radius: 10px;
    padding: 0;
    padding-left: 10px;
  }

  .info {
    margin-top: 10px;
    width: 100%;
    height: 40px;
    display: flex;
    flex-direction: row;
  }

  .info > div {
    flex: auto;
    display: flex;

    justify-content: left;
    align-items: center;
  }

  .replay-container {
    margin-top: 10px;
    padding-left: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    column-gap: 20px;
  }
  .replay-container > button {
    background-color: #eeeeee;
    border-radius: 50%;
  }

  main .settings {
    width: 100%;
    margin-top: 10px;
    display: grid;
    grid-template-columns: 140px 1fr;
    row-gap: 10px;
  }
  main .settings > * {
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    justify-content: left;
    align-items: center;
  }

  .palette-container {
    z-index: 11;
    background-color: #ffffff;
    width: 100%;
    height: 100px;
    position: fixed;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    transform: translateY(100px);
    transition: transform 0.25s ease-in-out;
  }

  .palette-container.show {
    transform: translateY(0px);
  }

  .palette-top {
    width: 100%;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: end;
  }

  .palette-top > div:first-child {
    flex: auto;
    border-bottom: #aaaaaa 1px solid;
  }
  .palette-top .hide-button {
    border: #aaaaaa 1px solid;
    border-bottom: 0;
    border-radius: 10% 10% 0 0;
  }

  .palette-top .hide-button:hover {
    background-color: #cccccc;
  }

  .palette-top .hide-button:active {
    background-color: #aaaaaa;
  }

  .palette {
    width: 400px;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0 auto;
  }

  .palette > div {
    width: 40px;
  }

  @media screen and (max-width: 400px) {
    .palette > div {
      width: calc((100% - 40px) / 9);
    }
  }

  .palette > button {
    width: 40px;
    transform: translateY(20px);
    transition: transform 0.25s ease-in-out;
  }

  .palette > button.selected {
    transform: translateY(0);
  }

  .palette > * > img {
    transform: translateY(20px);
    transition: transform 0.25s ease-in-out;
    width: 100%;
    object-fit: contain;
    aspect-ratio: 97/87;
  }

  .palette > * > img.selected {
    transform: translateY(0);
  }

  .tools {
    z-index: 10;
    background-color: #ffffff;
    width: 400px;
    height: 50px;

    padding-bottom: 10px;
    padding-left: 10px;
    position: fixed;
    bottom: 0px;

    display: flex;
    flex-direction: row;
    justify-content: left;
    column-gap: 10px;
  }

  @media screen and (max-width: 400px) {
    .palette {
      width: 100%;
    }

    .tools {
      width: 100%;
    }
  }

  .rate-container {
    width: 100%;
    height: 20;
    margin-top: 50px;
    display: flex;
    flex-direction: row;
  }
  .rate-container > div {
    padding-right: 10px;
    flex: auto;
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .atackRatePurple {
    background-color: #cc99ff;
  }

  .atackRateYellow {
    background-color: #ffff99;
  }

  .atackRateRed {
    background-color: #ff9999;
  }

  .atackRateGreen {
    background-color: #99ff99;
  }

  .atackRateBlue {
    background-color: #66ccff;
  }

  .heart_rate {
    background-color: #ffe0fa;
  }
}

@layer util {
  .felx-row {
    display: flex;
    flex-direction: row;
    column-gap: 20px;
    justify-content: left;
  }

  @media screen and (max-width: 400px) {
    .felx-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
</style>
