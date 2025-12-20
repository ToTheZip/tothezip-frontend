<template>
  <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <!-- 위쪽 눈꺼풀 -->
    <path
      d="M3 12C5.5 7.5 8.8 5.5 12 5.5C15.2 5.5 18.5 7.5 21 12"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- 동공 -->
    <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2" />
    <!-- 가림선 -->
    <path
      d="M4 20L20 4"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<script>
export default { name: "IconEyeHalfOff" };
</script>

<style scoped>
.icon {
  width: 18px;
  height: 18px;
  display: block;
}
</style>
