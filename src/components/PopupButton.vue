<template>
  <section class="popup-button-container">
    <div
      ref="buttonContainerElement"
      class="button-container"
      @click="showPopup"
    >
      <slot name="button" ref="buttonElement"></slot>
    </div>
    <div
      ref="popupContainerElement"
      class="popup-container"
      :style="{ top: popupPos.y + 'px', left: popupPos.x + 'px' }"
      :class="{ 'show-popup': isShowPopup }"
    >
      <slot name="popup"></slot>
    </div>
  </section>
</template>

<script>
export default {
  name: "PopupButton",
  emits: [],
  props: {},
  data() {
    return {
      isButtonClicked: false,
      isShowPopup: false,
      popupPos: { x: 0, y: 0 },
      buttonElement: {},
    };
  },
  mounted() {
    this.buttonElement =
      this.$refs.buttonContainerElement.querySelector("button");
    this.eventToPopupClose();
  },
  methods: {
    eventToPopupClose() {
      const btn = this.buttonElement;
      const pe = this.$refs.popupContainerElement;

      document.addEventListener("click", (e) => {
        if (!this.isShowPopup) return;
        // ポップアップボタンがクリックされた場合
        if (e.target === btn || btn.contains(e.target)) return;
        // クリックされたのがポップアップの子要素でない場合
        if (!pe.contains(e.target)) {
          this.closePopup();
        }
      });
    },
    showPopup() {
      this.isShowPopup = true;
      this.isButtonClicked = true;
      this.calcPopupPosX();
      this.calcPopupPosY();
    },
    closePopup() {
      this.isShowPopup = false;
    },
    calcPopupPosX() {
      const btnRect = this.getButtonRect();
      const popupWidth = this.getPopupRect().width;
      const rightSpace = this.getButtonRightSpace();

      // ポップアップの横幅よりもボタンの右側の空間が広ければ右側に配置する
      if (popupWidth <= rightSpace) {
        this.popupPos.x = btnRect.left;
        return;
      }

      // ボタンの左右の空間の広さを比較し、広い方にポップアップを配置する
      const leftSpace = this.getButtonLeftSpace();
      if (leftSpace < rightSpace) {
        this.popupPos.x = btnRect.left;
        return;
      }

      this.popupPos.x = btnRect.right - popupWidth;
    },
    calcPopupPosY() {
      const btnRect = this.getButtonRect();
      const popupHeight = this.getPopupRect().height;
      const bottomSpace = this.getButtonBottomSpace();

      // ポップアップの横幅よりもボタンの右側の空間が広ければ右側に配置する
      if (popupHeight <= bottomSpace) {
        this.popupPos.y = btnRect.bottom;
        return;
      }

      // ボタンの左右の空間の広さを比較し、広い方にポップアップを配置する
      const topSpace = this.getButtonTopSpace();
      if (topSpace < bottomSpace) {
        this.popupPos.y = btnRect.bottom;
        return;
      }

      this.popupPos.y = btnRect.top - popupHeight;
    },
    getButtonRect() {
      return this.$refs.buttonContainerElement.getBoundingClientRect();
    },
    getPopupRect() {
      return this.$refs.popupContainerElement.getBoundingClientRect();
    },
    getButtonRightSpace() {
      const btnRect = this.getButtonRect();
      const windowWidth = document.querySelector("html").clientWidth;
      const Space = windowWidth - btnRect.left;
      return Space;
    },
    getButtonLeftSpace() {
      const btnRect = this.getButtonRect();
      const Space = btnRect.right;

      return Space;
    },
    getButtonTopSpace() {
      const btnRect = this.getButtonRect();
      const Space = btnRect.top;
      return Space;
    },
    getButtonBottomSpace() {
      const btnRect = this.getButtonRect();
      const windowHeight = document.querySelector("html").clientHeight;
      const Space = windowHeight - btnRect.bottom;
      return Space;
    },
  },
};
</script>

<style scoped>
.popup-button-container {
  position: relative;
}
.button-container {
  width: fit-content;
  height: fit-content;
}
.popup-container {
  width: fit-content;
  height: fit-content;
  position: fixed;
  visibility: hidden;
  z-index: 2001;
}

.popup-container.show-popup {
  visibility: visible;
}
</style>
