<template>
  <div class="tag-item">
    <span class="tag-label">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: "FilterTag",
  props: {
    label: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.tag-item {
  padding: 2px 8px;
  border: 1px solid var(--tothezip-gray-04);
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tag-label {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--tothezip-gray-04);
  white-space: nowrap;
}
</style>
