<template>
  <div class="tag-item" :class="{ 'no-remove': !removable }">
    <span class="tag-label">{{ label }}</span>
    <button v-if="removable" class="remove-btn" @click.stop="$emit('remove')">
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 1L1 9M1 1L9 9"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
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
    removable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["remove"],
};
</script>

<style scoped>
.tag-item {
  padding: 6px 10px 6px 14px;
  border: 1.5px solid var(--tothezip-brown-03);
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(250, 247, 245, 0.95) 100%
  );
  box-shadow: 0 2px 8px rgba(75, 29, 28, 0.06);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  position: relative;
  overflow: hidden;
}

.tag-item.no-remove {
  padding: 6px 14px;
}

.tag-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--tothezip-orange-01) 0%,
    var(--tothezip-orange-02) 100%
  );
  opacity: 0;
  transition: opacity 0.25s ease;
}

.tag-item:hover {
  border-color: var(--tothezip-orange-04);
  box-shadow: 0 4px 12px rgba(227, 93, 55, 0.15);
  transform: translateY(-1px);
}

.tag-item:hover::before {
  opacity: 1;
}

.tag-item:hover .tag-label {
  color: var(--tothezip-brown-08);
  font-weight: 600;
}

.tag-label {
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--tothezip-brown-06);
  white-space: nowrap;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
  transition: all 0.25s ease;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--tothezip-brown-04);
  cursor: pointer;
  z-index: 2;
  padding: 0;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--tothezip-orange-06);
}

.tag-item:hover .remove-btn {
  color: var(--tothezip-brown-08);
}

.tag-item:hover .remove-btn:hover {
  color: var(--tothezip-orange-07);
}

.tag-label {
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--tothezip-brown-06);
  white-space: nowrap;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
  transition: all 0.25s ease;
}
</style>
