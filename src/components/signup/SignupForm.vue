<template>
  <div class="signup-card">
    <div class="signup-header">
      <h2>회원가입</h2>
    </div>

    <div class="signup-body">
      <div class="top-row">
        <ProfileImageUpload />

        <FormInput
          label="이름"
          v-model="formData.name"
          type="text"
          custom-class="name-group"
          input-class="name-input"
        />
      </div>

      <FormInput
        label="이메일"
        v-model="formData.email"
        type="email"
        custom-class="email-group"
        input-class="email-input"
        :has-button="true"
        button-text="인증"
        @button-click="verifyEmail"
      />

      <FormInput
        label="비밀번호"
        v-model="formData.password"
        type="password"
        custom-class="password-group"
        input-class="password-input"
      />

      <FormInput
        label="비밀번호 확인"
        v-model="formData.passwordConfirm"
        type="password"
        custom-class="password-confirm-group"
        input-class="password-confirm-input"
      />

      <div class="actions">
        <button class="signup-button" @click="handleSignup">회원가입</button>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileImageUpload from "./ProfileImageUpload.vue";
import FormInput from "./FormInput.vue";

export default {
  name: "SignupForm",
  components: { ProfileImageUpload, FormInput },
  data() {
    return {
      formData: {
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
      },
    };
  },
  methods: {
    verifyEmail() {
      this.$emit("verify-email", this.formData.email);
    },
    handleSignup() {
      this.$emit("signup", this.formData);
    },
  },
};
</script>

<style scoped>
.signup-card {
  width: 100%;
  background: var(--tothezip-white);
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 20px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.signup-header {
  padding-top: 30px;
  padding-bottom: 6px;
  display: flex;
  justify-content: center;
}

.signup-header h2 {
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1;
  color: var(--tothezip-beige-09);
  letter-spacing: -0.08px;
}

.signup-body {
  padding: 16px 56px 30px;
  padding-top: calc(var(--logo-size) * 0.18);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  --field-width: 260px;
}

.signup-body :deep(.input-group) {
  width: var(--field-width);
  margin-left: auto;
  margin-right: auto;
}

.top-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 18px;
  width: var(--field-width);
  margin: 0 auto 10px;
}

.top-row :deep(.input-group) {
  margin: 0;
  width: calc(var(--field-width) - 80px - 18px);
}

.top-row :deep(.input-label) {
  margin-top: 0;
}

.top-row :deep(.name-input) {
  width: 100%;
  max-width: none;
}

.actions {
  width: var(--field-width);
  margin: 8px auto 0;
  display: flex;
  justify-content: flex-end;
}

.signup-button {
  width: 66px;
  height: 32px;
  background: var(--tothezip-beige-07);
  border: 1px solid var(--tothezip-beige-08);
  border-radius: 20px;
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: var(--tothezip-beige-01);
  cursor: pointer;
}

.signup-button:hover {
  background: var(--tothezip-beige-08);
}

@media (max-width: 500px) {
  .signup-body {
    padding-left: 40px;
    padding-right: 40px;
    --field-width: min(260px, 100%);
  }

  .top-row {
    width: var(--field-width);
    flex-direction: column;
    gap: 12px;
  }

  .top-row :deep(.input-group) {
    width: var(--field-width);
  }

  .actions {
    width: var(--field-width);
  }
}
</style>
