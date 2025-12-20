<template>
  <div class="signup-page">
    <div class="content-wrapper">
      <div class="form-stack">
        <ClickableLogo :src="logo" />

        <SignupForm @verify-email="handleVerifyEmail" @signup="handleSignup" />
      </div>

      <div class="login-link">
        <span class="login-link-text">이미 계정이 있어요! </span>
        <a href="#" class="login-link-underline" @click.prevent="goToLogin">
          로그인하러 가기
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import ClickableLogo from "./common/ClickableLogo.vue";
import SignupForm from "./signup/SignupForm.vue";
import logo from "@/assets/images/dozip_logo.png";

export default {
  name: "SignupPage",
  components: { SignupForm, ClickableLogo },
  methods: {
    handleVerifyEmail(email) {
      console.log("Verify email:", email);
    },
    handleSignup(formData) {
      console.log("Signup:", formData);
    },
    goToLogin() {
      this.$router.push("/login");
    },
  },
  data() {
    return { logo };
  },
};
</script>

<style scoped>
.signup-page {
  width: 100vw;
  min-height: 100svh;
  background-color: var(--tothezip-beige-01);

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0;
  padding: 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  box-sizing: border-box;
}

.form-stack {
  width: min(400px, calc(100vw - 40px));
  position: relative;

  --logo-size: clamp(200px, 28vw, 260px);
  --logo-top-ratio: 0.41;
  --logo-top: calc(var(--logo-size) * var(--logo-top-ratio) * -1);
}

.logo-image {
  position: absolute;
  top: var(--logo-top);
  left: 50%;
  transform: translateX(-50%);
  width: var(--logo-size);
  height: auto;
  z-index: 10;
  pointer-events: none;
}

.logo-hitbox {
  position: absolute;
  top: var(--logo-top);
  left: 50%;
  transform: translateX(-50%);

  width: var(--logo-size);
  height: calc(var(--logo-size) * 0.5);

  z-index: 11;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.login-link {
  margin-top: 16px;
  text-align: center;
}

.login-link-text,
.login-link-underline {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 10px;
  line-height: normal;
  color: var(--tothezip-beige-04);
}

.login-link-underline {
  text-decoration: underline;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  cursor: pointer;
}

.login-link-underline:hover {
  color: var(--tothezip-beige-07);
}
</style>
