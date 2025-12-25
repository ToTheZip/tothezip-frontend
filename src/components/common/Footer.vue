<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="project-info">
        <p class="brand">ⓒ ToTheZip</p>
        <p>기획 / 개발 : 김예성, 박서현</p>
        <p class="link">주소 : https://github.com/ToTheZip</p>
      </div>

      <button class="top-button" type="button" @click="scrollToTop">
        <svg
          class="triangle-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M6 3L9 9H3L6 3Z"
            fill="#F4ECE7"
            stroke="#F4ECE7"
            stroke-width="1"
          />
        </svg>
        <span class="top-text">TOP</span>
      </button>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
};
</script>

<style scoped>
.footer {
  width: 100%;
  height: 92px;

  background-image: url("@/assets/images/footer.png");
  background-repeat: no-repeat;
  background-size: cover; /* 가로 꽉 채우기 */
  background-position: center;

  border-top: 4px solid #6f9245;
  /* 기존 느낌 유지용 */
  overflow: hidden;
}

.footer-content {
  position: relative;
  width: 1070px;
  height: 92px;
  margin: 0 auto;
}

.project-info {
  position: absolute;
  left: 16px;
  top: 26px;

  display: flex;
  flex-direction: column;
  gap: 2px;

  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: rgba(244, 236, 231, 0.92); /* 밝은 글자 */
  line-height: normal;
}

.brand {
  font-weight: 700;
}

.link {
  opacity: 0.95;
}

.top-button {
  position: absolute;
  right: 0;
  top: 24px;

  width: 66px;
  height: 46px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
}

.top-button:hover {
  opacity: 0.9;
}

.triangle-icon {
  width: 12px;
  height: 12px;
  margin-bottom: 5px;
}

.top-text {
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 10px;
  color: rgba(244, 236, 231, 0.95);
  line-height: normal;
}
</style>
