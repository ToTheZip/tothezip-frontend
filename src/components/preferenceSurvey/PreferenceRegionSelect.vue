<template>
  <div class="form-group">
    <label class="label">관심 지역</label>

    <select v-model="city" class="select">
      <option value="" disabled>시 선택</option>
      <option v-for="c in cities" :key="c">{{ c }}</option>
    </select>

    <select v-if="districts.length" v-model="district" class="select">
      <option value="" disabled>구 선택</option>
      <option v-for="d in districts" :key="d">{{ d }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: ["modelValue"],
  emits: ["update:modelValue"],
  data() {
    return {
      city: "",
      district: "",
      regionMap: {
        "서울특별시": ["종로구", "성북구", "강남구"],
        "대전광역시": ["유성구", "서구", "중구"]
      }
    };
  },
  computed: {
    cities() {
      return Object.keys(this.regionMap);
    },
    districts() {
      return this.city ? this.regionMap[this.city] : [];
    }
  },
  watch: {
    city() {
      this.district = "";
      this.emit();
    },
    district() {
      this.emit();
    }
  },
  methods: {
    emit() {
      this.$emit("update:modelValue", {
        city: this.city,
        district: this.district
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

.select {
  width: 100%;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 0 12px;
  font-size: 13px;
  box-sizing: border-box;
  background: #fff;
}

.select + .select {
  margin-top: 8px;
}
</style>
