<template>
  <div class="input-group" :class="customClass">
    <label class="input-label">{{ label }}</label>

    <div v-if="hasButton" class="input-with-button">
      <input
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="input-field"
        :class="inputClass"
        :placeholder="placeholder"
      />
      <button class="verify-button" @click="$emit('button-click')">
        {{ buttonText }}
      </button>
    </div>

    <input
      v-else
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="input-field"
      :class="inputClass"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
export default {
  name: "FormInput",
  props: {
    label: { type: String, required: true },
    modelValue: { type: String, default: "" },
    type: { type: String, default: "text" },
    placeholder: { type: String, default: "" },
    customClass: { type: String, default: "" },
    inputClass: { type: String, default: "" },
    hasButton: { type: Boolean, default: false },
    buttonText: { type: String, default: "" },
  },
  emits: ["update:modelValue", "button-click"],
};
</script>

<style scoped>
.input-group {
  margin-bottom: 12px;
}

.input-label {
  display: block;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 1;
  color: var(--tothezip-beige-04);
  letter-spacing: -0.048px;
  margin-bottom: 6px;
  padding: 2px 8px;
}

.input-field {
  width: 100%;
  height: 38px;
  background: var(--tothezip-cream-02);
  border: 1px solid var(--tothezip-beige-02);
  border-radius: 10px;
  padding: 0 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  color: var(--tothezip-beige-09);
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: var(--tothezip-beige-04);
}

.input-field::placeholder {
  color: var(--tothezip-text-placeholder);
}

.name-input,
.password-input,
.password-confirm-input {
  width: 100%;
  max-width: none;
}

.input-with-button {
  position: relative;
  width: 100%;
}

.input-with-button .input-field {
  padding-right: 56px;
}

.verify-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--tothezip-beige-07);
  border: 1px solid var(--tothezip-beige-08);
  border-radius: 15px;
  padding: 6px 9px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 1;
  color: var(--tothezip-beige-01);
  cursor: pointer;
  transition: background 0.3s;
}

.verify-button:hover {
  background: var(--tothezip-beige-08);
}
</style>
