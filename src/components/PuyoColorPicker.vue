<template>
  <div class="puyo-color-picker">
    <div class="picker-container">
      <menu class="header-buttons">
        <div class="left">
          <button class="fieldcap-frame-cancel" @click="prev" disabled>
            <span class="material-symbols-outlined"> arrow_back </span>
          </button>
        </div>
        <div class="center"></div>
        <div class="right">
          <button class="fieldcap-frame-ok" @click="ok" disabled>
            <span class="material-symbols-outlined"> arrow_forward </span>
          </button>
        </div>
      </menu>

      <article class="puyo-color-linking">
        <h3>ぷよと抽出した色を結びつけます</h3>
        <p>ぷよを選択してから盤面の色を選択してください</p>
        <section class="puyos">
          <div
            v-for="color in colorTypesNum"
            :class="{ 'picked-puyo': color - 1 === pickedPuyoIndex }"
            :key="color"
          >
            <img
              :src="imgUrl(color - 1)"
              alt="puyo"
              class="puyo-img"
              @click="pickPuyo(color - 1)"
            />
          </div>
        </section>
        <section class="puyos-color">
          <template v-for="(colorCode, index) in colorForPuyos">
            <div
              v-if="index < 9"
              :key="index"
              :style="{
                'background-color':
                  colorCode === '' ? '#000000' : '#' + colorCode,
              }"
            ></div>
          </template>
        </section>

        <!-- plus puyo-->
        <section class="puyos mt-3">
          <template v-for="color in colorTypesNum" :key="color + 9">
            <div
              :class="{ 'picked-puyo': color - 1 + 9 === pickedPuyoIndex }"
              v-if="color - 1 < 5"
            >
              <img
                :src="imgUrl(color - 1)"
                alt="puyo"
                class="puyo-img"
                @click="pickPuyo(color - 1 + 9)"
              />
              <img
                src="@/assets/plus.svg"
                class="puyo-plus"
                @click="pickPuyo(color - 1 + 9)"
              />
            </div>
          </template>
        </section>
        <section class="puyos-color">
          <template
            v-for="(colorCode, index) in colorForPlusPuyos"
            :key="index"
          >
            <div
              :style="{
                'background-color':
                  colorCode === '' ? '#000000' : '#' + colorCode,
              }"
            ></div>
          </template>
        </section>

        <p class="mt-3">ぷよの色を選択してください</p>
        <section class="mt-3 display_map">
          <template v-for="(line, y) in extractionColorMap" :key="y">
            <div
              alt=""
              v-for="(color, x) in line"
              :style="{ 'background-color': '#' + color }"
              :key="x"
              @click="pickColor(color)"
            ></div>
          </template>
        </section>
      </article>
    </div>
  </div>
</template>

<script>
import array2dInit from "@/js/array2d-init";

export default {
  name: "HomeView",
  components: {},
  props: { extractionColorMap: Array, isSkipSetting: Boolean },
  mounted() {
    this.loadcolorForPuyos();
    this.loadcolorForPlusPuyos();
  },
  data() {
    return {
      colorTypesNum: 9,
      map: array2dInit(8, 6, -1),
      colorForPuyos: ["", "", "", "", "", "", "", "", ""],
      colorForPlusPuyos: ["", "", "", "", ""],
      pickedPuyoIndex: 0,
    };
  },
  watch: {},
  methods: {
    clamp(x) {
      x = x < 0 ? 0 : x;
      x = x > 100 ? 100 : x;
      return x;
    },

    allButtonEnable() {
      document
        .querySelectorAll(".puyo-color-picker button")
        .forEach((button) => {
          button.disabled = false;
        });
    },
    allButtonDisabled() {
      document
        .querySelectorAll(".puyo-color-picker button")
        .forEach((button) => {
          button.disabled = true;
        });
    },
    active() {
      if (this.isSkipSetting) {
        this.skipSetting();
        return;
      }
      setTimeout(this.allButtonEnable, 1000);
    },
    skipSetting() {
      this.ok();
    },
    prev() {
      this.allButtonDisabled();
      this.$emit("prev-step");
    },
    ok: async function () {
      this.allButtonDisabled();
      this.$emit(
        "set-color-for-puyo",
        this.colorForPuyos,
        this.colorForPlusPuyos
      );
    },
    pickPuyo(index) {
      this.pickedPuyoIndex = index;
    },
    pickColor(color) {
      const ppi = this.pickedPuyoIndex;
      if (0 <= ppi && ppi <= 8) {
        this.pickcolorForPuyos(color);
      } else if (9 <= ppi && ppi <= 13) {
        this.pickcolorForPlusPuyos(color);
      }
    },
    pickcolorForPuyos(color) {
      this.colorForPuyos[this.pickedPuyoIndex] = color;
      const str = JSON.stringify(this.colorForPuyos);
      localStorage.setItem("colorForPuyo", str);
    },
    pickcolorForPlusPuyos(color) {
      this.colorForPlusPuyos[this.pickedPuyoIndex - 9] = color;
      const str = JSON.stringify(this.colorForPlusPuyos);
      localStorage.setItem("colorForPlusPuyo", str);
    },
    loadcolorForPuyos() {
      const str = localStorage.getItem("colorForPuyo");
      if (!str) return;
      this.colorForPuyos = JSON.parse(str);
    },
    loadcolorForPlusPuyos() {
      const str = localStorage.getItem("colorForPlusPuyo");
      if (!str) return;
      this.colorForPlusPuyos = JSON.parse(str);
    },

    imgUrl(imgNum) {
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

      if (imgNum == -1) return "./img/blank_r.gif";

      return puyoImg[imgNum];
    },
  },
};
</script>

<style scoped>
* {
  margin: 0px;
  padding: 0px;
}

img {
  line-height: 0;
}

.puyo-color-picker h3 {
  margin-top: 20px;
  font-size: 15px;
}
.puyo-color-picker button {
  width: 40px;
  height: 40px;
  border: 0;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.puyo-color-picker button:hover {
  background-color: #cccccc;
}

.puyo-color-picker button:active {
  background-color: #aaaaaa;
}

.puyo-color-picker .text-button {
  background-color: #000000;
  color: #ffffff;
  width: 120px;
  height: 30px;
  border-radius: 18px;
  border: transparent 2px solid;
}

.puyo-color-picker .text-button:active {
  background-color: #222222;
}

.puyo-color-picker .text-button:focus {
  background-color: #ffffff;
  border: #000000 2px solid;
  color: #000000;
}

.header-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  border: 0px;
}
.header-buttons > left,
.header-buttons > right {
  width: 40px;
  height: 40px;
}
.header-buttons > center {
  flex: auto;
}

.puyo-color-picker {
  display: flex;
  flex-direction: column;
}

.picker-container {
  background-color: rgb(255, 255, 255);
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 1001;

  top: 0;
  left: 0;
}

.puyo-color-picker > * {
  margin-bottom: 10px;
}

.puyo-color-picker h3 {
  margin-top: 20px;
  font-size: 15px;
}
input[type="number"] {
  width: 70px;
  height: 40px;
  border: 0;
  border-bottom: #000000 2px solid;
}

.puyo-color-picker button {
  width: 40px;
  height: 40px;
  border: 0;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.puyo-color-picker button:hover {
  background-color: #cccccc;
}

.puyo-color-picker button:active {
  background-color: #aaaaaa;
}

.puyo-color-picker .text-button {
  background-color: #000000;
  color: #ffffff;
  width: 120px;
  height: 30px;
  border-radius: 18px;
  border: transparent 2px solid;
}

.puyo-color-picker .text-button:active {
  background-color: #222222;
}

.puyo-color-picker .text-button:focus {
  background-color: #ffffff;
  border: #000000 2px solid;
  color: #000000;
}

.puyo-color-linking {
  width: 100%;
  padding: 10px;
}

.puyos {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
}
.puyo-color-picker .puyos > * {
  width: 100%;
  margin-top: 20px;
  transition: margin-top 0.25s ease-in-out;
  position: relative;
}

.puyos > .picked-puyo {
  margin-top: 0;
}

.puyos .puyo-img {
  width: 100%;
  object-fit: contain;
  aspect-ratio: 97/87;
}

.puyos .puyo-plus {
  width: 50%;
  position: absolute;
  right: 8%;
  bottom: 8%;

  transition: transform 0.25s ease-in-out;
}

.puyos > .picked-puyo > .puyo-plus {
  transform: translateY(-20px);
}

.puyos-color {
  width: 100%;
  height: 20px;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
}
.puyos-color > * {
  width: 100%;
  height: 20px;
}

.input-line {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
}

.input-line > * {
  margin-right: 20px;
}
.input-line > * > label {
  margin-right: 20px;
}

.display_map {
  background-color: #000000;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 100%;
}
.display_map div {
  aspect-ratio: 97/87;
}
.display_map img {
  width: 100%;
  object-fit: contain;
}
</style>
