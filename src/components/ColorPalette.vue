<template>
  <FooterDrawer ref="FooterDrawer" @close="close" height="40vh">
    <div class="color-palette">
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
          :class="{ selected: editPaintColor === ERASER }"
          @click="setEditPaintColor(ERASER)"
        >
          <span class="material-symbols-outlined"> ink_eraser </span>
        </button>
      </section>
      <div class="tool-container">
        <div class="color-counter">
          <div
            v-for="(color, index) in puyoColorClassName"
            :key="color"
            :class="color"
          >
            {{ puyoColorPaintCounter[index] }}
          </div>
        </div>

        <div class="paint-color-order-container mt-3">
          <div
            class="paint-color-order"
            :class="{
              show:
                paintColorOrder &&
                paintColorOrder.length > 0 &&
                !isShownBaseField,
            }"
          >
            <template v-for="(color, index) in paintColorOrder" :key="color">
              <img :src="puyoImgUrl(color)" />
              <span
                class="material-symbols-outlined"
                v-if="index < paintColorOrder.length - 1"
              >
                arrow_forward
              </span>
            </template>
          </div>
          <div
            class="error-paint-color-order"
            :class="{
              show: !paintColorOrder && this.baseField && !isShownBaseField,
            }"
          >
            4つかたまりができてしまいます。
          </div>
        </div>

        <div class="mt-3">
          <PopupButton ref="PopupButton">
            <template v-slot:button>
              <button class="text-button">現在の盤面を基礎として登録</button>
            </template>

            <template v-slot:popup>
              <div class="popup">
                <div>
                  <button
                    class="text-button"
                    @click="$refs.PopupButton.closePopup()"
                  >
                    キャンセル
                  </button>
                </div>
                <div>
                  <button class="text-button mt-3" @click="resisterBase()">
                    登録
                  </button>
                </div>
              </div>
            </template>
          </PopupButton>
        </div>

        <button
          class="icon-button mt-3"
          v-if="baseField"
          @pointerdown="showBaseField()"
          @pointerup="hideBaseField()"
          @pointerleave="hideBaseField()"
        >
          <span class="material-symbols-outlined"> visibility </span>
        </button>
      </div>
    </div>
  </FooterDrawer>
</template>

<script>
import FooterDrawer from "./FooterDrawer.vue";
import PopupButton from "@/components/PopupButton.vue";
import { Field } from "@/js/puyoquestd";
export default {
  name: "ColorPalette",
  emits: ["setEditPaintColor"],
  components: {
    FooterDrawer,
    PopupButton,
  },
  props: {
    /**@type {Field} */
    field: Field,
    erasePuyoLength: Number,
  },
  data() {
    return {
      ERASER: 999,
      colorNum: 5,
      editPaintColor: -1,

      /**@type {Field} */
      baseField: null,
      isShownBaseField: false,

      /**@type {Field} */
      bufField: {},

      /**@type {Field} */
      verifyField: {},
      verifyBufField: {},
      isUnderVerification: false,

      /**@type {PuyoqueStd.puyoColor[] | null} 4つかたまりができない、ぬりかえを行う順序 , null = どの順序でも4つかたまりができてしまう */
      paintColorOrder: null,

      puyoColorClassName: [
        "puyo-red",
        "puyo-blue",
        "puyo-yellow",
        "puyo-green",
        "puyo-purple",
      ],
      puyoColorPaintCounter: [0, 0, 0, 0, 0],
    };
  },
  computed: {},
  mounted() {
    setInterval(() => {
      this.countPuyoColorPaint();
      this.paintColorOrder = this.verifyPaintColor();
      this.blankToBasePuyo();
    }, 500);
  },
  methods: {
    open() {
      this.$refs.FooterDrawer.open();
    },
    close() {
      this.editPaintColor = -1;
      this.$emit("setEditPaintColor", -1);
    },
    setEditPaintColor(index) {
      this.editPaintColor = Number(index);
      this.$emit("setEditPaintColor", index);
    },
    resisterBase() {
      this.baseField = this.field.clone();
      this.bufField = this.field.clone();
      this.verifyField = this.field.clone();
      this.$refs.PopupButton.closePopup();
    },
    showBaseField() {
      console.log("showBaseField");
      this.isShownBaseField = true;

      this.bufField.copy(this.field);
      this.field.copy(this.baseField);
    },
    hideBaseField() {
      if (!this.isShownBaseField) return;
      this.field.copy(this.bufField);
      this.isShownBaseField = false;
    },

    /**
     * 基礎盤面と現在の盤面の色を比較して色ごとに異なるぷよの数を集計する
     */
    countPuyoColorPaint() {
      if (!this.baseField) return;

      const width = this.field.width;
      const height = this.field.height;

      let colorCounter = [0, 0, 0, 0, 0];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (this.compareBaseFieldColor(x, y)) continue;

          const color = this.field.getColor(x, y);
          colorCounter[color]++;
        }
      }
      this.puyoColorPaintCounter = colorCounter;
    },
    /**
     * 基礎盤面と現在の盤面の色を比較する
     */
    compareBaseFieldColor(x, y) {
      const color = this.field.getColor(x, y);
      const baseColor = this.baseField.getColor(x, y);
      return color === baseColor;
    },

    /**
     * 消しゴムで盤面を消すことで生じた空欄に基礎盤面のぷよを戻す
     */
    blankToBasePuyo() {
      if (this.editPaintColor !== this.ERASER) return;
      if (!this.baseField) return;

      const width = this.field.width;
      const height = this.field.height;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (!this.field.isBlank(x, y)) continue;

          const puyo = this.baseField.getPuyo(x, y);
          this.field.setPuyo(x, y, puyo.color, puyo.chance, puyo.plus);
        }
      }
    },

    /**
     * ぬりかえを行う際に4つかたまりができないか検証する
     *
     * @returns {PuyoqueStd.puyoColor[] | null} 4つかたまりができない、ぬりかえを行う順序 , null = どの順序でも4つかたまりができてしまう
     */
    verifyPaintColor() {
      if (!this.baseField) return;
      if (this.isShownBaseField) return;

      // 検証開始
      this.isUnderVerification = true;

      let colorList = [0, 1, 2, 3, 4];
      let colorIndex = 0;

      /**
       * @type {PuyoqueStd.puyoColor[]} 4つかたまりができない、ぬりかえを行う順序
       */
      let paintColorOrder = [];
      this.verifyField.copy(this.baseField);
      this.verifyBufField = this.verifyField.clone();

      while (colorIndex < colorList.length) {
        // ぬりかえ前の盤面を保管
        this.verifyBufField.copy(this.verifyField);

        const color = colorList[colorIndex];
        // 1. field の colorList[colorIndex]の色の部分だけ を this.verifyField に上書きする
        const isPaint = this.paintVerifyField(color);
        // 2. this.verifyField に 4つかたまりがないか調べあれば colorIndex++; continue;
        const r = this.verifyField.isChain(this.erasePuyoLength);
        if (r) {
          // 4つかたまりがあったので次の色へ移る
          colorIndex++;

          // 失敗したのでぬりかえ前の盤面に戻す
          this.verifyField.copy(this.verifyBufField);
          continue;
        }

        // 4つかたまりがないので colorList から 現在の色を削除して最初の色から検証する
        colorList.splice(colorIndex, 1);
        // ぬりかえ順序の記録
        if (isPaint) paintColorOrder.push(color);
        colorIndex = 0;
      }

      // 検証終了
      this.isUnderVerification = false;

      if (colorList.length === 0) {
        // すべての検証がクリアされた
        return paintColorOrder;
      }

      return null;
    },

    /**
     * field の colorList[color]の色の部分だけ を this.verifyField に上書きする
     * @param color
     *
     * @returns {boolean} true = ぬりかえを行った
     */
    paintVerifyField(color) {
      const width = this.field.width;
      const height = this.field.height;

      let isPaint = false;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const c = this.field.getColor(x, y);
          if (c !== color) continue;

          // ぬりかえが発生したら isPaint = true;
          if (!this.verifyField.colorComp(x, y, color)) isPaint = true;
          this.verifyField.setColor(x, y, color);
        }
      }

      return isPaint;
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
  },
};
</script>

<style scoped>
.color-palette {
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
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

.tool-container {
  width: 400px;
  margin: 30px auto;
}

@media screen and (max-width: 400px) {
  .palette {
    width: 100%;
  }
  .tool-container {
    width: 100%;
  }
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

.color-counter {
  width: 300px;
  height: 20px;
  display: flex;
  flex-direction: row;
}

.color-counter > * {
  flex: auto;
  text-align: right;
  padding-right: 10px;
}

.puyo-purple {
  background-color: #cc99ff;
}

.puyo-yellow {
  background-color: #ffff99;
}

.puyo-red {
  background-color: #ff9999;
}

.puyo-green {
  background-color: #99ff99;
}

.puyo-blue {
  background-color: #66ccff;
}

.paint-color-order-container {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.paint-color-order-container > * {
  visibility: hidden;
}

.paint-color-order-container > *.show {
  visibility: visible;
}

.paint-color-order {
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.paint-color-order img {
  width: 30px;

  object-fit: contain;
  aspect-ratio: 97/87;
}
</style>
