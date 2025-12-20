<template>
  <div class="logo-wrapper">
    <!-- 클릭용 hitbox -->
    <button
      class="logo-hitbox"
      type="button"
      @click="goHome"
      aria-label="홈으로 이동"
    />

    <!-- 실제 로고 -->
    <img :src="src" alt="ToTheZip" class="logo-image" draggable="false" />
  </div>
</template>

<script>
export default {
  name: "ClickableLogo",
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  methods: {
    goHome() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.logo-wrapper {
  position: absolute;
  top: var(--logo-top);
  left: 50%;
  transform: translateX(-50%);
  width: var(--logo-size);
  z-index: 10;
}

/* 실제 로고 */
.logo-image {
  width: 100%;
  height: auto;
  pointer-events: none;
}

/* 클릭 영역 */
.logo-hitbox {
  position: absolute;
  top: 10%;
  left: 0;
  width: 100%;
  height: 70%;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  z-index: 11;
}
</style>
