<template>
  <div class="form-group">
    <label class="label">희망 평수</label>
    <div class="row">
      <input class="input" type="number" v-model.number="minArea" placeholder="최소" />
      <input class="input" type="number" v-model.number="maxArea" placeholder="최대" />
    </div>
    <small class="hint">(평수 입력, 1평 ≈ 3.3㎡)</small>

    <label class="label">희망 가격</label>
    <div class="row">
      <input class="input" type="number" v-model.number="minPrice" placeholder="최소" />
      <input class="input" type="number" v-model.number="maxPrice" placeholder="최대" />
    </div>
    <small class="hint">(만원 단위)</small>
  </div>
</template>

<script>
export default {
  props: ["modelValue"],
  emits: ["update:modelValue"],
  data() {
    return {
      minArea: null,
      maxArea: null,
      minPrice: null,
      maxPrice: null
    };
  },
  watch: {
    minArea: "emit",
    maxArea: "emit",
    minPrice: "emit",
    maxPrice: "emit"
  },
  methods: {
    emit() {
      this.$emit("update:modelValue", {
        minArea: this.minArea,
        maxArea: this.maxArea,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice
      });
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
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--tothezip-brown);
}

.row {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 0 12px;
  font-size: 13px;
  box-sizing: border-box;
}

.hint {
  margin-top: 4px;
  font-size: 11px;
  color: #999;
}
</style>
