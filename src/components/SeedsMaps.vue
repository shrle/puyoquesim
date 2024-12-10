<template>
  <FooterDrawer ref="FooterDrawer" @close="close" height="90vh">
    <article class="seeds-maps">
      <div class="seed-picker-container">
        <select class="seed-picker" const v-on:change="changeSeed">
          <option v-for="seed in seedList" :value="seed.id" :key="seed.id">
            {{ seed.name }}
          </option>
        </select>
      </div>

      <section class="maps-container">
        <div
          class="map-container"
          v-for="map in maps"
          :key="map"
          @click="pickMap(map)"
        >
          <PuyoMap :puyo-width="puyoWidth" :puyo-height="puyoHeight" :map="map">
          </PuyoMap>
        </div>
      </section>
    </article>
  </FooterDrawer>
</template>

<script>
import FooterDrawer from "./FooterDrawer.vue";
import PuyoMap from "./PuyoMap.vue";
import seeds from "@/js/seeds-settings";
import { ref } from "vue";

export default {
  name: "SeedsMaps",
  components: { PuyoMap, FooterDrawer },
  emits: ["setMapColor", "setSeedSetting"],
  props: {},
  data() {
    return {
      puyoWidth: "22.5px",
      puyoHeight: "20px",
      pickedSeedId: "normal",
      maps: ref(seeds.normal.maps),
      seeds: seeds,
      seedList: [
        { id: "normal", name: "通常のタネ" },
        { id: "deleteThree", name: "3個消し" },
        { id: "paintBlue", name: "青ぬりかえ" },
        { id: "paintPurple", name: "紫ぬりかえ" },
        { id: "paintYellow", name: "黄ぬりかえ" },
        { id: "paintRed", name: "赤ぬりかえ" },
        { id: "paintGreen", name: "緑ぬりかえ" },
        //{ id: "", name: "" },
      ],
    };
  },
  mounted() {},
  methods: {
    open() {
      this.$refs.FooterDrawer.open();
    },
    close() {},
    pickMap(map) {
      this.$emit("setMapColor", map);
      this.$emit("setSeedSetting", this.pickedSeedId);
      this.$refs.FooterDrawer.close();
    },
    changeSeed(e) {
      const id = e.target.value;
      this.maps = ref(seeds[id].maps);
      this.pickedSeedId = id;
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
.seeds-maps {
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: start;
  gap: 10px;
}

.seed-picker-container {
  width: 100%;
  height: 40px;
  padding-left: 10px;
  padding-top: 10px;
}
.seed-picker {
  width: 200px;
}

.maps-container {
  width: 100%;
  height: calc(90vh - 40px);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-content: start;
  row-gap: 10px;
  column-gap: 10px;

  overflow-y: scroll;
}

.map-container {
  width: calc(8 * v-bind(puyoWidth));
  height: calc(6 * v-bind(puyoHeight));
}
</style>
