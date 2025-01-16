<template>
  <article class="container" :class="{ open: isOpenDrawer }">
    <div class="top">
      <div></div>
      <div>
        <button class="icon-button close-button" @click="close()">
          <span class="material-symbols-outlined"> keyboard_arrow_down </span>
        </button>
      </div>
    </div>
    <div class="main">
      <slot></slot>
    </div>
  </article>
</template>

<script>
export default {
  name: "FooterDrawer",
  emits: ["close"],
  props: {
    height: {},
  },
  data() {
    return {
      isOpenDrawer: false,
    };
  },
  methods: {
    open() {
      this.isOpenDrawer = true;
    },
    close() {
      this.isOpenDrawer = false;
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.container {
  z-index: 11;
  width: 100%;
  height: calc(40px + v-bind(height));
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  gap: 0;

  bottom: calc((-40px - v-bind(height)));
  transition: bottom 0.25s ease-in-out;
}

.container.open {
  bottom: 0;
}

.top {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
}

.top > div:first-child {
  flex: auto;
  height: 40px;
  border-bottom: #aaaaaa 1px solid;
}
.top .close-button {
  height: 40px;
  background-color: #ffffff;
  border: #aaaaaa 1px solid;
  border-bottom: #ffffff 1px solid;
  border-radius: 10% 10% 0 0;
}

.top .close-button:hover {
  background-color: #cccccc;
}

.top .close-button:active {
  background-color: #aaaaaa;
}

.main {
  border: 0;
  background-color: #ffffff;
  width: 100%;
  height: v-bind(height);
}
</style>
