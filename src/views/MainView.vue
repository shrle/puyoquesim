<template>
  <div id="main">
    <main>
      <h1><a href="./">ぷよクエ連鎖計算シミュレータ</a></h1>
      <article class="rate-container">
        <div
          v-for="(mag, index) in colorMag"
          :class="colorClassName[index]"
          :key="index"
        >
          {{ Math.round(mag * 100) / 100 }}
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
      <div id="cv" ref="canvasContainer"></div>

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
              v-for="(item, index) in squareLength * 2 + 1"
              :value="index / 2"
              :key="index"
            >
              {{ index / 2 }}
            </option>
          </select>
        </div>

        <label for="chainCorrection"> 連鎖係数 </label>
        <div>
          <select name="chainCorrection" v-model="chainCorrection">
            <option
              v-for="(item, index) in squareLength * 2 + 1"
              :value="index / 2"
              :key="index"
            >
              {{ index / 2 }}
            </option>
          </select>
        </div>
      </article>

      <!-- footer tools -->
      <article class="tools">
        <PopupButton>
          <template v-slot:button>
            <button class="icon-button">
              <span class="material-symbols-outlined"> screenshot </span>
            </button>
          </template>

          <template v-slot:popup>
            <div class="popup">
              <div>
                <button class="text-button" @click="selectFile">
                  SSの読み込み
                </button>
              </div>
              <div>
                <label for="isSkipSsSetting" style="margin-right: 10px"
                  >設定のスキップ</label
                ><input
                  type="checkbox"
                  id="isSkipSsSetting"
                  v-model="isSkipSsSetting"
                />
              </div>
              <div>
                <button class="text-button" @click="adjustSsSettings">
                  設定の修正
                </button>
              </div>
            </div>
          </template>
        </PopupButton>

        <button class="icon-button" @click="$refs.ColorPalette.open()">
          <span class="material-symbols-outlined"> palette </span>
        </button>

        <button class="icon-button" @click="$refs.SeedsMaps.open()">
          <span class="material-symbols-outlined"> transition_dissolve </span>
        </button>
      </article>

      <!-- footer palette -->
      <ColorPalette
        ref="ColorPalette"
        @set-edit-paint-color="setEditPaintColor"
        :field="field"
        :erasePuyoLength="erasePuyoLength"
      ></ColorPalette>

      <!-- seed maps -->
      <SeedsMaps
        ref="SeedsMaps"
        @set-map-color="setMapColor"
        @set-seed-setting="setSeedSetting"
        @set-chance-map="setChanceMap"
      ></SeedsMaps>
    </main>
  </div>

  <ParseScreenShot
    :isSkipSetting="isSkipSsSetting"
    @set-puyo-map="setPuyoMap"
    ref="ParseScreenShot"
  ></ParseScreenShot>

  <!-- <div class="tutorial" ref="tutorialContainer">
    <div class="stage-1 popup">
      <strong>ぷよクエ連鎖計算シミュレータにようこそ</strong>
      <p>
        まずは<img
          :src="puyoImgUrl(5)"
          alt="heartbox"
          style="height: 20px"
        />をなぞってみよう
      </p>
    </div>
  </div> -->

  <div class="overlay" v-if="!isAboutRead"></div>

  <section class="about" :class="{ hide: isAboutRead }">
    <p>これは<strong>ぷよクエの連鎖計算</strong>を助けるアプリです！</p>
    <p class="link-blue">
      <a href="https://www.youtube.com/watch?v=Sw7jyn5aW_I" target="_blank"
        >使い方を動画で見る</a
      >
    </p>
    <h3>機能</h3>
    <ul>
      <li>
        <p>
          <button class="icon-button">
            <span class="material-symbols-outlined"> keyboard_tab_rtl </span>
          </button>
          <button class="icon-button">
            <span class="material-symbols-outlined"> arrow_back </span>
          </button>
          <button class="icon-button">
            <span class="material-symbols-outlined"> arrow_forward </span>
          </button>

          リプレイボタンで1連鎖毎に盤面の状態を確認できます
        </p>
      </li>
      <li>
        <p>
          <button class="icon-button">
            <span class="material-symbols-outlined"> screenshot </span></button
          >からスクリーンショットを読み込み盤面を再現できます
        </p>
      </li>
      <li>
        <p>
          <button class="icon-button">
            <span class="material-symbols-outlined"> palette </span></button
          >から色の塗替えができます
        </p>
      </li>
      <li>
        <p>
          <button class="icon-button">
            <span class="material-symbols-outlined">
              transition_dissolve
            </span></button
          >から連鎖のタネを再現できます
        </p>
      </li>
    </ul>

    <button class="text-button" @click="isAboutRead = true">分かった！</button>
  </section>

  <div class="help-button-container">
    <button class="icon-button">
      <span class="material-symbols-outlined" @click="isAboutRead = false">
        help
      </span>
    </button>
  </div>
</template>

<script>
import { PuyoqueStd, Field } from "@/js/puyoquestd.js";
import Route from "@/js/route";
import PuyoqueCanvas from "@/js/puyoquecanvas.js";
import PopupButton from "@/components/PopupButton.vue";
import ParseScreenShot from "@/components/ParseScreenShot.vue";
import ColorPalette from "@/components/ColorPalette.vue";
import SeedsMaps from "@/components/SeedsMaps.vue";
import seeds from "@/js/seeds-settings";
import chanceMapList from "@/js/chance-list";
import { numToUrlSafeChar, UrlSafeCharToNum } from "@/js/url-safe-char-convert";

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
  components: {
    PopupButton,
    ParseScreenShot,
    ColorPalette,
    SeedsMaps,
  },
  setup() {},
  async mounted() {
    const screenWidth = window.screen.availWidth;
    if (screenWidth < 400) {
      this.canvasWidth = screenWidth;
      const scale = screenWidth / 80;
      this.canvasHeight = 59 * scale;
    }

    this.paramToSettings();
    if (!this.field) {
      this.field = PuyoqueStd.createField(this.fieldWidth, this.fieldHeight);
      this.field.setMapColor(this.map);
      this.field.setNextColors(this.nextPuyos);
    }

    this.canvas = new PuyoqueCanvas(process.env.VUE_APP_RESOURCE_PATH);
    await this.canvas.init(
      "#cv",
      this.canvasWidth,
      this.canvasHeight,
      this.field
    );
    this.canvas.calcColorMag = this.calcColorMag;
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
      /** @type{Field} */
      field: null,
      canvas: {},
      selectRoute: new Route(), // readonly
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
      deletePrismNum: 0,
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
        [0, 4, 4, 2, 4, 0, 2, 0],
        [0, 2, 3, 4, 4, 0, 2, 5],
        [4, 2, 3, 2, 5, 5, 5, 5],
        [3, 3, 2, 2, 4, 1, 0, 0],
        [1, 1, 1, 4, 4, 0, 1, 1],
        [0, 0, 0, 2, 3, 0, 0, 1],
      ],
      nextPuyos: [0, 0, 0, 0, 0, 0, 0, 0],

      isShowPalette: false,
      isSkipSsSetting: false,

      seedsList: [
        { id: "normal", name: "通常のタネ" },
        { id: "deleteThree", name: "3個消し" },
        { id: "paintBlue", name: "青ぬりかえ" },
        { id: "paintPurple", name: "紫ぬりかえ" },
        { id: "paintYellow", name: "黄ぬりかえ" },
        { id: "paintRed", name: "赤ぬりかえ" },
        { id: "paintGreen", name: "緑ぬりかえ" },
        //{ id: "", name: "" },
      ],

      seedMaps: [],

      isAboutRead: false,
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
      this.setParam();
    },
    selectNextColor: function () {
      this.field.setAllNextColor(this.selectNextColor);
      this.setParam();
    },
    paintColor: function (newPaintColor) {
      if (typeof newPaintColor === "string") {
        this.paintColor = parseInt(newPaintColor);
      }
      this.canvas.setPaintColor(this.paintColor);
    },
    selectRouteLengthMax() {
      this.setParam();
    },
    doujiCorrection() {
      this.setParam();
    },
    chainCorrection() {
      this.setParam();
    },
  },
  methods: {
    selectFile() {
      this.$refs.ParseScreenShot.selectFile();
    },
    setSeedSetting(seedId) {
      const s = seeds[seedId];
      this.erasePuyoLength = s.erasePuyoLength;
      this.chainCorrection = s.chainCorrection;
      this.paintColor = s.selectRouteBehavior === "delete" ? -1 : s.color;
    },
    adjustSsSettings() {
      this.isSkipSsSetting = false;
      setTimeout(() => {
        this.$refs.ParseScreenShot.adjustSettings();
      }, 100);
    },
    setMapColor(map) {
      this.field.setMapColor(map);
      this.setParam();
    },
    setPuyoMap(field) {
      const nextPuyos = field.cloneNextPuyos();
      const map = field.cloneMap();
      this.field.setNextPuyos(nextPuyos);
      this.field.setMapPuyo(map);

      this.addHistory(map, nextPuyos, new Route(), [0, 0, 0, 0, 0], 0);
      this.setParam();
    },
    setChanceMap(id) {
      this.field.codeToMap(chanceMapList[id][0]);
      this.setParam();
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
      if (!history.selectRoute) return;
      this.field.setMapPuyo(history.map);
      this.field.setNextPuyos(history.lastNextPuyos);
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
      this.field.setNextPuyos(history.lastNextPuyos);
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
      this.deletePrismNum = 0;
      this.lastMap = this.field.cloneMap();
      this.lastNextPuyos = this.field.cloneNextPuyos();
      this.replay = [];
      this.replay.push({
        map: this.field.cloneMap(),
        nexts: this.field.cloneNextPuyos(),
      });
      this.selectRoute = selectRoute.clone();

      this.field.recordMap();
    },

    chain: function () {
      this.replay.push({
        map: this.field.cloneMap(),
        nexts: this.field.cloneNextPuyos(),
      });
    },

    chainEnd: function (chainNum) {
      this.chainNum = chainNum;
      this.replay.push({
        map: this.field.cloneMap(),
        nexts: this.field.cloneNextPuyos(),
      });
      let wild = this.colorMag.reduce((sum, element) => sum + element, 0);
      let wildNum = 5;
      this.colorMag[wildNum] = wild;

      for (const color in this.colorMag) {
        this.colorMag[color] += this.deletePrismNum * 3;
      }

      for (let i = 0; i < this.colorMag.length; i++) {
        this.colorMag[i] = this.round(this.colorMag[i], 2);
      }
      if (this.stopRecordingHistory) {
        this.stopRecordingHistory = false;
        return;
      }

      if (this.colorMag[5] <= 0) return;
      this.addHistory(
        this.lastMap,
        this.lastNextPuyos,
        this.selectRoute,
        this.colorMag,
        this.chainNum
      );
    },

    addHistory(map, nextPuyos, selectRoute, colorMag, chainNum) {
      this.history.unshift(
        new History(map, nextPuyos, selectRoute, colorMag, chainNum)
      );
      if (this.history.length >= this.historyMaxLength) {
        this.history.length = this.historyMaxLength;
      }
      this.replayIndex = this.replay.length - 1;
    },

    calcColorMag: function (
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
      this.deletePrismNum += deletePrismNum;

      for (let i = 0; i < colorMag.length; i++) {
        this.colorMag[i] += colorMag[i];
      }
    },

    undo: function () {
      if (this.history.length === 0) return;
      let history = this.history[0];
      this.field.setMapPuyo(history.map);
      this.field.setNextPuyos(history.lastNextPuyos);
      this.selectRoute = [];
      this.canvas.resetRoute();
      this.replay = [];
      this.setParam();
      //this.canvas.allVisible();
    },

    showReplay: function () {
      this.field.setMapPuyo(this.replay[this.replayIndex].map);
      this.field.setNextPuyos(this.replay[this.replayIndex].nexts);
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
      if (color === -1) this.setParam();
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

    settingsToCode() {
      let code = "";
      // color は -1から始まるので +1 する
      code += numToUrlSafeChar(this.selectNextColor + 1);
      code += numToUrlSafeChar(this.paintColor + 1);
      code += numToUrlSafeChar(this.erasePuyoLength);
      code += numToUrlSafeChar(this.selectRouteLengthMax);

      const di = Math.trunc(this.doujiCorrection);
      code += numToUrlSafeChar(di);
      code += this.doujiCorrection % 1 > 0 ? "_" : "";

      const ci = Math.trunc(this.chainCorrection);
      code += numToUrlSafeChar(ci);
      code += this.chainCorrection % 1 > 0 ? "_" : "";
      return code;
    },
    setParam() {
      let code = this.field.toCode();
      code += "-";
      code += this.settingsToCode();

      this.$router.push({ name: "main", params: { settings: code } });
    },
    paramToSettings() {
      const settings = this.$route.params.settings;
      const data = settings.split("-");
      if (data.length !== 2) return;

      const fieldCode = data[0];
      const field = Field.fromCode(fieldCode);

      if (!field) return;
      this.field = field;

      const nextPuyos = field.cloneNextPuyos();
      const map = field.cloneMap();
      this.addHistory(map, nextPuyos, new Route(), [0, 0, 0, 0, 0], 0);

      /*
       * settingCode = selectNextColor, paintColor, erasePuyoLength, selectRouteLengthMax, doujiCorrection, chainCorrection
       */
      const settingCode = data[1];
      let i = 0;
      this.selectNextColor = UrlSafeCharToNum(settingCode[i]) - 1;
      i++;

      this.paintColor = UrlSafeCharToNum(settingCode[i]) - 1;
      i++;

      this.erasePuyoLength = UrlSafeCharToNum(settingCode[i]);
      i++;

      this.selectRouteLengthMax = UrlSafeCharToNum(settingCode[i]);
      i++;

      this.doujiCorrection = UrlSafeCharToNum(settingCode[i]);
      i++;
      if (settingCode[i] === "_") {
        this.doujiCorrection += 0.5;
        i++;
      }

      this.chainCorrection = UrlSafeCharToNum(settingCode[i]);
      i++;
      if (settingCode[i] === "_") {
        this.chainCorrection += 0.5;
        i++;
      }
    },

    // setPosition() {
    //   const pos = this.$refs.canvasContainer.getBoundingClientRect();
    //   this.$refs.tutorialContainer.pos.bottom;
    // },
  },
};
</script>

<style>
@layer base,util;

@layer base {
  body {
    /*font-family: "Kosugi Maru", sans-serif;*/
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
    margin-bottom: 300px;
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

  .overlay {
    width: 100vw;
    height: 100vh;

    background-color: #00000080;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .about {
    max-width: 1000px;
    width: 95%;
    height: 60%;
    padding: 10px;

    background-color: #f8f8f8;
    color: #333333;
    font-weight: bolder;
    border-radius: 15px;

    position: fixed;
    z-index: 101;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);

    /* top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); */
    transition: all 1s ease-in-out;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: 20px;
  }

  .about .link-blue {
    color: #0000dd;
  }
  .about * {
    transition: opacity 1s ease-in-out 0.5s;
    opacity: 100;

    font-size: 1rem;
  }

  .about strong {
    font-size: 1.5rem;
    color: #000000;
  }

  .about ul {
    /* padding-left: 40px;
    list-style: disc; */
    padding: 0;
    list-style: none;
  }
  .about li {
    height: 40px;
    margin-bottom: 20px;
  }

  .about li p {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }

  .about.hide {
    width: 30px;
    height: 30px;
    padding: 0;

    z-index: -1;
    top: auto;
    left: auto;
    bottom: 5px;
    right: 5px;
    transform: translate(0, 0);
  }

  .about.hide * {
    font-size: 0;
    width: 0px;
    height: 0px;
    opacity: 0;
    /* display: none; */
    visibility: hidden;
  }

  @media screen and (max-width: 750px) {
    .about * {
      font-size: 0.8rem;
    }
    .about strong {
      font-size: 1.2rem;
      color: #000000;
    }
  }
  @media screen and (max-width: 560px) {
    .about {
      width: 100%;
    }
    /* .about ul {
      padding-left: 15px;
    } */
  }

  .help-button-container {
    width: 40px;
    height: 40px;
    position: fixed;
    right: 5px;
    bottom: 5px;
    z-index: 11;
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

  .seed-maps-container {
    z-index: 11;
    background-color: #ffffff;
    width: 100%;
    height: 90vh;
    position: fixed;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    transform: translateY(90vh);
    transition: transform 0.25s ease-in-out;
  }

  @media screen and (max-width: 400px) {
    .palette {
      width: 100%;
    }

    .tools {
      width: 100%;
    }
  }

  .tutorial {
    position: fixed;
    top: v-bind(tutorialPosTop);
  }

  .tutorial > * {
    width: fit-content;
    height: fit-content;
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
