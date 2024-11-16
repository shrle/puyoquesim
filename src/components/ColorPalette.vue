<template>
  <FooterDrawer ref="FooterDrawer" @close="close" height="60px">
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
  </FooterDrawer>
</template>

<script>
import FooterDrawer from "./FooterDrawer.vue";
export default {
  name: "ColorPalette",
  emits: ["setEditPaintColor"],
  components: {
    FooterDrawer,
  },
  data() {
    return {
      editPaintColor: -1,
    };
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
      this.editPaintColor = index;
      this.$emit("setEditPaintColor", index);
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
</style>
