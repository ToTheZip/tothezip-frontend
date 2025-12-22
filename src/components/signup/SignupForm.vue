<template>
  <div class="signup-card">
    <div class="signup-header">
      <h2>회원가입</h2>
    </div>

    <div class="signup-body">
      <div class="top-row">
        <ProfileImageUpload
          :preview-url="profilePreviewUrl"
          @file-selected="onFileSelected"
        />

        <FormInput
          label="이름"
          v-model="formData.name"
          type="text"
          custom-class="name-group"
          input-class="name-input"
        />
      </div>

      <!-- 이메일 + 인증 버튼 -->
      <FormInput
        label="이메일"
        v-model="formData.email"
        type="email"
        custom-class="email-group"
        input-class="email-input"
        :disabled="emailStep === 'verified'"
        :has-button="true"
        :button-text="emailStep === 'verified' ? '완료' : '인증'"
        :button-disabled="
          emailLoading || !formData.email || emailStep === 'verified'
        "
        @button-click="handleEmailVerifyFlow"
        :helper-text="emailHelperText"
        :helper-type="emailHelperType"
      />

      <!-- 인증코드 입력 (메일 발송 후 표시) -->
      <FormInput
        v-if="emailStep === 'codeSent'"
        label="인증코드"
        v-model="formData.emailCode"
        type="text"
        custom-class="email-code-group"
        input-class="email-code-input"
        :has-button="true"
        button-text="확인"
        :button-disabled="emailLoading || !formData.emailCode"
        @button-click="verifyEmailCode"
        :helper-text="codeHelperText"
        :helper-type="codeHelperType"
      />

      <FormInput
        label="비밀번호"
        v-model="formData.password"
        :type="showPassword ? 'text' : 'password'"
        :right-icon="showPassword ? 'eye-off' : 'eye'"
        right-icon-type="toggle"
        @right-icon-click="showPassword = !showPassword"
        custom-class="password-group"
        input-class="password-input"
      />

      <FormInput
        label="비밀번호 확인"
        v-model="formData.passwordConfirm"
        :type="showPasswordConfirm ? 'text' : 'password'"
        :right-icon="showPasswordConfirm ? 'eye-off' : 'eye'"
        right-icon-type="toggle"
        @right-icon-click="showPasswordConfirm = !showPasswordConfirm"
        :helper-text="passwordMismatch ? '비밀번호가 일치하지 않습니다.' : ''"
        helper-type="error"
        custom-class="password-confirm-group"
        input-class="password-confirm-input"
      />

      <div class="actions">
        <button
          class="next-arrow"
          @click="handleSignup"
          :disabled="signupDisabled"
          aria-label="다음"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileImageUpload from "./ProfileImageUpload.vue";
import FormInput from "./FormInput.vue";

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "SignupForm",
  components: { ProfileImageUpload, FormInput },
  data() {
    return {
      formData: {
        name: "",
        email: "",
        emailCode: "",
        password: "",
        passwordConfirm: "",
      },

      // 이미지 상태
      profileFile: null,
      profilePreviewUrl: "",
      profileImgUrl: "",

      // 이메일 인증 상태
      emailStep: "idle", // idle | duplicate | codeSent | verified
      emailLoading: false,
      emailHelperText: "",
      emailHelperType: "",

      codeHelperText: "",
      codeHelperType: "",
      showPassword: false,
      showPasswordConfirm: false,
    };
  },
  computed: {
    passwordMismatch() {
      return (
        this.formData.password &&
        this.formData.passwordConfirm &&
        this.formData.password !== this.formData.passwordConfirm
      );
    },
    signupDisabled() {
      if (
        !this.formData.name ||
        !this.formData.email ||
        !this.formData.password
      )
        return true;
      if (this.passwordMismatch) return true;
      if (this.emailStep !== "verified") return true;
      return false;
    },
  },
  watch: {
    // 이메일 바뀌면 인증 상태 초기화
    "formData.email"(v, oldV) {
      if (v !== oldV) {
        this.emailStep = "idle";
        this.emailHelperText = "";
        this.emailHelperType = "";
        this.codeHelperText = "";
        this.codeHelperType = "";
        this.formData.emailCode = "";
      }
    },
  },
  methods: {
    onFileSelected({ file, previewUrl }) {
      this.profileFile = file;
      this.profilePreviewUrl = previewUrl;
    },

    // 이메일 인증 흐름: 중복 체크 → 메일 발송
    async handleEmailVerifyFlow() {
      const email = (this.formData.email || "").trim();
      if (!email) return;

      this.emailLoading = true;
      this.emailHelperText = "";
      this.emailHelperType = "";
      this.codeHelperText = "";
      this.codeHelperType = "";

      try {
        // 1) 중복 확인
        const r1 = await fetch(
          `${API_BASE}/user/check-email?email=${encodeURIComponent(email)}`,
          { credentials: "include" }
        );
        const exists = await r1.json();

        if (exists) {
          this.emailStep = "duplicate";
          this.emailHelperText = "이미 가입된 이메일입니다.";
          this.emailHelperType = "error";
          return;
        }

        // 2) 메일 발송
        const r2 = await fetch(`${API_BASE}/user/email/send-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        });

        if (r2.status === 409) {
          this.emailStep = "duplicate";
          this.emailHelperText = "이미 가입된 이메일입니다.";
          this.emailHelperType = "error";
          return;
        }
        if (!r2.ok) throw new Error("send-code failed");

        this.emailStep = "codeSent";
        this.emailHelperText =
          "인증코드를 발송했습니다. 메일함을 확인해주세요.";
        this.emailHelperType = "info";
      } catch (e) {
        this.emailHelperText = "이메일 인증 처리 중 오류가 발생했습니다.";
        this.emailHelperType = "error";
      } finally {
        this.emailLoading = false;
      }
    },

    // 인증코드 검증
    async verifyEmailCode() {
      const email = (this.formData.email || "").trim();
      const code = (this.formData.emailCode || "").trim();
      if (!email || !code) return;

      this.emailLoading = true;
      this.codeHelperText = "";
      this.codeHelperType = "";

      try {
        const r = await fetch(`${API_BASE}/user/email/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, code }),
        });
        if (!r.ok) throw new Error("verify failed");

        const ok = await r.json(); // true/false
        if (ok) {
          this.emailStep = "verified";
          this.emailHelperText = "이메일 인증 완료!";
          this.emailHelperType = "success";

          // 인증코드 입력칸 정리
          this.codeHelperText = "";
          this.codeHelperType = "";
        } else {
          this.codeHelperText = "인증코드가 올바르지 않습니다.";
          this.codeHelperType = "error";
        }
      } catch (e) {
        this.codeHelperText = "인증 확인 중 오류가 발생했습니다.";
        this.codeHelperType = "error";
      } finally {
        this.emailLoading = false;
      }
    },

    handleSignup() {
      if (this.signupDisabled) return;

      this.$emit("signup", {
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password,
        profileFile: this.profileFile,
        profileImgUrl: this.profileImgUrl,
      });
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

/* hover는 활성 상태에서만 */
.signup-button:not(:disabled):hover {
  background: var(--tothezip-beige-08);
}

/* disabled 상태 */
.signup-button:disabled {
  /* background: var(--tothezip-beige-03);
  border-color: var(--tothezip-beige-03);
  color: var(--tothezip-beige-05);
  cursor: default;
  opacity: 0.5; */
  opacity: 0.55;
  cursor: not-allowed;
}

.next-arrow {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: none;

  background: var(--tothezip-beige-07);
  color: var(--tothezip-beige-01);

  font-family: "Pretendard", sans-serif;
  font-weight: 800;
  font-size: 22px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.next-arrow:not(:disabled):hover {
  background: var(--tothezip-beige-08);
}

.next-arrow:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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
