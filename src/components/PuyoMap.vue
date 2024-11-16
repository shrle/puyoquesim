<template>
  <div class="puyo-map">
    <template v-for="line in map">
      <img :src="puyoImgUrl(imgNum)" v-for="(imgNum, x) in line" :key="x" />
    </template>
  </div>
</template>

<script>
export default {
  name: "PuyoMap",
  props: {
    puyoWidth: {},
    puyoHeight: {},
    map: {},
  },
  methods: {
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.puyo-map {
  background-color: #222244;
  display: grid;
  grid-template: repeat(6, v-bind(puyoHeight)) / repeat(8, v-bind(puyoWidth));

  width: calc(8 * v-bind(puyoWidth));
  height: calc(6 * v-bind(puyoHeight));
}

.puyo-map img {
  width: v-bind(puyoWidth);
  height: v-bind(puyoHeight);
}
</style>
