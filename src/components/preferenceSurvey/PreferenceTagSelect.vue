<template>
  <div class="form-group">
    <label class="label">관심 키워드</label>

    <div class="tag-row">
      <button
        v-for="tag in tagList"
        :key="tag"
        :class="['tag-btn', { active: selected.includes(tag) }]"
        @click.prevent="toggle(tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["modelValue"],
  emits: ["update:modelValue"],
  data() {
    return {
      tagList: ["역세권", "문세권", "병세권", "학세권"],
      selected: []
    };
  },
  methods: {
    toggle(tag) {
      if (this.selected.includes(tag)) {
        this.selected = this.selected.filter(t => t !== tag);
      } else {
        this.selected.push(tag);
      }
      this.$emit("update:modelValue", this.selected);
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 18px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--tothezip-brown);
}

.tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-btn {
  padding: 6px 14px;
  border-radius: 18px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
}

.tag-btn.active {
  background: var(--tothezip-brown);
  color: #fff;
  border-color: var(--tothezip-brown);
}
</style>
