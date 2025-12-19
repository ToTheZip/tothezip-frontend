<template>
  <div class="login-card">
    <div class="login-header">
      <h2>로그인</h2>
    </div>

    <div class="login-body">
      <FormInput
        label="이메일"
        v-model="formData.email"
        type="email"
        custom-class="email-group"
        input-class="email-input"
      />

      <FormInput
        label="비밀번호"
        v-model="formData.password"
        type="password"
        custom-class="password-group"
        input-class="password-input"
      />

      <div class="actions">
        <button class="login-button" @click="handleLogin">로그인</button>
      </div>
    </div>
  </div>
</template>

<script>
import FormInput from "../signup/FormInput.vue";
// ⬆️ 경로는 너 프로젝트 구조에 맞게 조정
// 예) "@/components/auth/FormInput.vue" 같은 형태면 그걸로 변경

export default {
  name: "LoginForm",
  components: { FormInput },
  data() {
    return {
      formData: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    handleLogin() {
      this.$emit("login", this.formData);
    },
  },
};
</script>

<style scoped>
.login-card {
  width: 100%;
  background: var(--tothezip-white);
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 20px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 회원가입 카드랑 같은 타이틀 위치감 */
.login-header {
  padding-top: 30px;
  padding-bottom: 6px;
  display: flex;
  justify-content: center;
}

.login-header h2 {
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1;
  color: var(--tothezip-beige-09);
  letter-spacing: -0.08px;
}

.login-body {
  padding: 16px 56px 30px;

  /* 로고 손이 카드 위에 걸치는 공간 */
  padding-top: calc(var(--logo-size) * 0.18);

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* 입력 폭 통일 */
  --field-width: 260px;
}

/* 모든 입력 그룹 폭 통일 */
.login-body :deep(.input-group) {
  width: var(--field-width);
  margin-left: auto;
  margin-right: auto;
}

/* 버튼도 입력폭 컨테이너 기준 오른쪽 정렬 */
.actions {
  width: var(--field-width);
  margin: 8px auto 0;
  display: flex;
  justify-content: flex-end;
}

.login-button {
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

.login-button:hover {
  background: var(--tothezip-beige-08);
}

@media (max-width: 500px) {
  .login-body {
    padding-left: 40px;
    padding-right: 40px;
    --field-width: min(260px, 100%);
  }

  .actions {
    width: var(--field-width);
  }
}
</style>
