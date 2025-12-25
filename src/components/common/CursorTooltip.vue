<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="cursor-tooltip"
      :style="{ left: x + 'px', top: y + 'px' }"
    >
      <div class="bubble">클릭하여 비교 매물 보기</div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({ show: Boolean, x: Number, y: Number });
</script>

<style>
/* scoped 빼고 그냥 전역으로 한번 해봐(원인 분리용) */
/* .cursor-tooltip {
  position: fixed;
  z-index: 2147483647;
  pointer-events: none;
  transform: translate(14px, 14px);
} */
.cursor-tooltip {
  position: fixed !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: 2147483647 !important;
  pointer-events: none;
  transform: translate(14px, 14px);
}

.cursor-tooltip .bubble {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(20, 20, 20, 0.92);
  color: white;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}
</style>
