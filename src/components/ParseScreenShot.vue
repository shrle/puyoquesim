<template>
  <div class="field">
    <InputImage @load-image="loadImage" ref="InputImage" hidden></InputImage>

    <!--
      <div v-if="!onload">
        データ読込中
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      -->

    <FieldRangeSelector
      :canvasImage="image"
      :isSkipSetting="isSkipSetting"
      @prev-step="prevStep"
      @set-extract-color-map="setExtractColorMap"
      v-show="step === 1 && !isSkipSetting"
      ref="FieldRangeSelector"
    ></FieldRangeSelector>

    <PuyoColorPicker
      :isSkipSetting="isSkipSetting"
      @prev-step="prevStep"
      @set-color-for-puyo="setColorForPuyos"
      :extractionColorMap="extractionColorMap"
      v-show="step === 2 && !isSkipSetting"
      ref="PuyoColorPicker"
    ></PuyoColorPicker>

    <NextRangeSelector
      :isSkipSetting="isSkipSetting"
      @prev-step="prevStep"
      @set-extract-color-nextpuyo="setExtractColorNextPuyos"
      v-show="step === 3 && !isSkipSetting"
      ref="NextRangeSelector"
    ></NextRangeSelector>

    <NextPuyoColorPicker
      :isSkipSetting="isSkipSetting"
      @prev-step="prevStep"
      @set-color-for-nextpuyos="setColorForNextPuyos"
      :extractionColorNextPuyos="extractionColorNextPuyos"
      v-show="step === 4 && !isSkipSetting"
      ref="NextPuyoColorPicker"
    ></NextPuyoColorPicker>
  </div>
</template>

<script>
import convert from "color-convert";
import { PuyoqueStd } from "@/js/puyoquestd";

import InputImage from "@/components/InputImage.vue";
import FieldRangeSelector from "@/components/FieldRangeSelector.vue";
import PuyoColorPicker from "@/components/PuyoColorPicker.vue";
import NextRangeSelector from "@/components/NextRangeSelector.vue";
import NextPuyoColorPicker from "@/components/NextPuyoColorPicker.vue";

const fieldWidth = 8;
const fieldHeight = 6;

export default {
  name: "ParseScreenShot",
  components: {
    InputImage,
    FieldRangeSelector,
    PuyoColorPicker,
    NextRangeSelector,
    NextPuyoColorPicker,
  },
  props: {
    isSkipSetting: Boolean,
  },
  mounted() {},
  data() {
    return {
      step: 0,
      image: null,
      /** SSのフィールドから抽出したの各色 */
      extractionColorMap: [],
      /** SSのネクストぷよから抽出した各色 */
      extractionColorNextPuyos: [],
      /** フィールドの場合のぷよ番号ごとに関連付けられたカラーコード */
      colorForPuyos: [],
      colorForPlusPuyos: [],
      /** ネクストぷよの場合のぷよ番号ごとに関連付けられたカラーコード */
      colorForNextPuyos: [],

      puyoMap: null,
      nextPuyos: null,
      field: PuyoqueStd.createField(fieldWidth, fieldHeight),

      onload: false,
    };
  },
  watch: {
    step() {
      if (this.step === 0) {
        document.exitFullscreen().catch(() => {});
      } else if (this.step === 1) {
        this.$refs.FieldRangeSelector.active();
      } else if (this.step === 2) {
        this.$refs.PuyoColorPicker.active();
      } else if (this.step === 3) {
        this.$refs.NextRangeSelector.active();
      } else if (this.step === 4) {
        this.$refs.NextPuyoColorPicker.active();
      } else if (this.step === 5) {
        document.exitFullscreen().catch(() => {});

        this.convertColorMapToPuyoMap();
        this.convertColorNextPuyosToNextPuyos();
        this.$emit("set-puyo-map", this.field);
      }
    },
  },
  methods: {
    selectFile() {
      this.$refs.InputImage.selectFile();
    },
    loadImage: function (image) {
      this.image = image;
      this.step = 1;
    },
    adjustSettings() {
      if (!this.image) return;
      this.step = 1;
    },
    setExtractColorMap: function (map) {
      this.extractionColorMap = map;
      this.nextStep();
    },
    setExtractColorNextPuyos: function (map) {
      this.extractionColorNextPuyos = map;
      this.nextStep();
    },
    setColorForPuyos(colorForPuyos, colorForPlusPuyos) {
      this.colorForPuyos = colorForPuyos;
      this.colorForPlusPuyos = colorForPlusPuyos;
      this.nextStep();
    },
    setColorForNextPuyos(colors) {
      this.colorForNextPuyos = colors;
      this.nextStep();
    },
    prevStep() {
      if (this.step === 0) return;
      this.step--;
    },
    nextStep() {
      this.step++;
    },
    isNearColor: function (colorCode1, colorCode2) {
      // HSV値をそれぞれ取得
      const hsv1 = convert.hex.hsv(colorCode1);
      const hsv2 = convert.hex.hsv(colorCode2);

      // 色相の差を計算
      const hueDiff = Math.min(
        Math.abs(hsv1[0] - hsv2[0]),
        360 - Math.abs(hsv1[0] - hsv2[0])
      );

      // 彩度の差を計算
      const saturationDiff = Math.abs(hsv1[1] - hsv2[1]);

      // 明度の差を計算
      const valueDiff = Math.abs(hsv1[2] - hsv2[2]);

      // 各差の閾値を設定
      const hueThreshold = 10;
      const saturationThreshold = 20;
      const valueThreshold = 30;

      // すべての差が閾値以下であれば、近い色と判定
      return (
        hueDiff <= hueThreshold &&
        saturationDiff <= saturationThreshold &&
        valueDiff <= valueThreshold
      );
    },
    /**
     * 指定色がぷよの色に近ければそのぷよ番号を返す
     * @param {Number} colorCode
     * @param {Number[]} puyosToColorCodes
     *
     * @returns {Number} puyo index , not found: -1
     */
    colorCodeToPuyo(colorCode, puyosToColorCodes) {
      for (let i = 0; i < puyosToColorCodes.length; i++) {
        const cc = puyosToColorCodes[i];
        if (this.isNearColor(colorCode, cc)) return i;
      }
      return -1;
    },

    /**
     * 指定色がプラスぷよの色に近ければそのぷよ番号を返す
     * @param {Number} colorCode
     * @param {Number[]} puyosToColorCodes
     *
     * @returns {Number} puyo index
     */
    colorCodeToPlusPuyo(colorCode, puyosToColorCodes) {
      for (let i = 0; i < puyosToColorCodes.length; i++) {
        const cc = puyosToColorCodes[i];
        if (this.isNearColor(colorCode, cc)) return i;
      }
      return -1;
    },

    convertColorMapToPuyoMap() {
      //let map = [];
      for (let y = 0; y < fieldHeight; y++) {
        //map[y] = [];
        for (let x = 0; x < fieldWidth; x++) {
          let isPlus = false;
          let color = this.colorCodeToPuyo(
            this.extractionColorMap[y][x],
            this.colorForPuyos
          );
          if (color === -1) {
            color = this.colorCodeToPuyo(
              this.extractionColorMap[y][x],
              this.colorForPlusPuyos
            );
            isPlus = color !== -1;
          }
          //map[y][x] = color;
          if (color !== -1) {
            this.field.setPuyo(x, y, color, false, isPlus);
          }
        }
      }
      //this.puyoMap = map;
    },
    convertColorNextPuyosToNextPuyos() {
      //this.nextPuyos = [];
      for (let x = 0; x < fieldWidth; x++) {
        const color = this.colorCodeToPuyo(
          this.extractionColorNextPuyos[x],
          this.colorForNextPuyos
        );
        if (color !== -1) {
          this.field.setNextPuyo(x, color, false, false);
        }
      }
    },
  },
};
</script>

<style scoped></style>
