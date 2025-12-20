<template>
  <div class="input-group" :class="customClass">
    <label class="input-label">{{ label }}</label>

    <div class="field-row" :class="{ 'has-button': hasButton }">
      <div class="input-wrap" :class="{ 'has-right-icon': !!rightIcon }">
        <input
          :type="type"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          class="input-field"
          :class="inputClass"
          :placeholder="placeholder"
          :disabled="disabled"
        />

        <span
          v-if="rightIcon"
          class="right-icon"
          :class="rightIconType"
          role="button"
          tabindex="0"
          @click="$emit('right-icon-click')"
          @keydown.enter.prevent="$emit('right-icon-click')"
          @keydown.space.prevent="$emit('right-icon-click')"
        >
          <IconEye v-if="rightIcon === 'eye'" />
          <IconEyeOff v-else-if="rightIcon === 'eye-off'" />
          <span v-else class="icon-text">{{
            rightIcon === "x" ? "✕" : rightIcon
          }}</span>
        </span>
      </div>

      <button
        v-if="hasButton"
        class="verify-button"
        type="button"
        :disabled="buttonDisabled"
        @click="$emit('button-click')"
      >
        {{ buttonText }}
      </button>
    </div>

    <p v-if="helperText" class="helper-text" :class="helperType">
      {{ helperText }}
    </p>
  </div>
</template>

<script>
import IconEye from "@/components/icons/IconEye.vue";
import IconEyeOff from "@/components/icons/IconEyeOff.vue";

export default {
  name: "FormInput",
  components: { IconEye, IconEyeOff },
  props: {
    label: { type: String, required: true },
    modelValue: { type: String, default: "" },
    type: { type: String, default: "text" },
    placeholder: { type: String, default: "" },
    customClass: { type: String, default: "" },
    inputClass: { type: String, default: "" },

    hasButton: { type: Boolean, default: false },
    buttonText: { type: String, default: "" },
    buttonDisabled: { type: Boolean, default: false },

    helperText: { type: String, default: "" },
    helperType: { type: String, default: "" }, // "error" | "success" | "info"
    rightIcon: { type: String, default: "" }, // "x" 등
    rightIconType: { type: String, default: "" }, // "error" | "success"
    rightIconAria: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "button-click", "right-icon-click"],
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

.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-wrap {
  position: relative;
  width: 100%;
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

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.right-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);

  cursor: pointer;
  user-select: none;
  pointer-events: auto;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--tothezip-beige-04);
}

.right-icon.toggle:hover {
  color: var(--tothezip-beige-07);
}

.right-icon.error {
  color: #d24b4b;
}

.right-icon.success {
  color: #2f8f4e;
}

/* 버튼 있을 때 인풋이 버튼/아이콘과 겹치지 않도록 */
.field-row.has-button .input-field {
  padding-right: 15px;
}

.verify-button {
  flex: 0 0 auto;
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

.verify-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* helper text */
.helper-text {
  margin: 6px 0 0;
  padding: 0 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 1.2;
  color: rgba(163, 151, 143, 0.9);
}

.helper-text.error {
  color: #d24b4b;
}

.helper-text.success {
  color: #2f8f4e;
}

.helper-text.info {
  color: rgba(163, 151, 143, 0.95);
}

.input-wrap.has-right-icon .input-field {
  padding-right: 42px; /* 아이콘 공간 확보 */
}
</style>
