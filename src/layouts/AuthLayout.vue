<template>
  <div class="auth-layout">
    <main class="auth-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  width: 100%;
  min-height: 100vh; /* 화면 높이 꽉 */
  background: var(--tothezip-beige-01);
}

.auth-main {
  width: 100%;
  min-height: 100vh; /* slot 안이 작아도 전체 높이 유지 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px; /* 모바일 여백 */
  box-sizing: border-box;
}
</style>
