<template>
  <div class="login-page">
    <div class="content-wrapper">
      <div class="form-stack">
        <img
          src="@/assets/images/dozip_logo.png"
          alt="ToTheZip"
          class="logo-image"
        />

        <LoginForm @login="handleLogin" />
      </div>

      <div class="signup-link">
        <span class="signup-link-text">가입된 계정이 없어요! </span>
        <a href="#" class="signup-link-underline" @click.prevent="goToSignup">
          회원가입하러 가기
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from "./login/LoginForm.vue";

export default {
  name: "LoginPage",
  components: { LoginForm },
  methods: {
    handleLogin(formData) {
      console.log("Login:", formData);
    },
    goToSignup() {
      this.$router.push("/signup");
    },
  },
};
</script>

<style scoped>
.login-page {
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

  /* SignupPage와 동일 세팅 */
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

/* 하단 링크 */
.signup-link {
  margin-top: 16px;
  text-align: center;
}

.signup-link-text,
.signup-link-underline {
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 10px;
  line-height: normal;
  color: var(--tothezip-beige-04);
}

.signup-link-underline {
  text-decoration: underline;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  cursor: pointer;
}

.signup-link-underline:hover {
  color: var(--tothezip-beige-07);
}
</style>
