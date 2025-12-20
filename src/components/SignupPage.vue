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

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "SignupPage",
  components: { SignupForm, ClickableLogo },
  data() {
    return {
      logo,
      loading: false,
    };
  },
  methods: {
    handleVerifyEmail(email) {
      console.log("Verify email:", email);
    },

    async uploadProfileIfNeeded(profileFile) {
      if (!profileFile) {
        console.log("[PROFILE] no profile file");
        return ""; // 프로필 선택 안 했으면 빈 값
      }

      console.log("[PROFILE] uploading...", profileFile.name);

      const form = new FormData();
      form.append("file", profileFile);

      const r = await fetch(`${API_BASE}/user/profile/upload`, {
        method: "POST",
        body: form,
        credentials: "include", // 세션 기반 검증이라 필수
      });

      const text = await r.text();
      console.log("[PROFILE] status:", r.status);
      console.log("[PROFILE] response:", text);

      if (r.status === 403) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }
      if (!r.ok) {
        throw new Error("PROFILE_UPLOAD_FAILED");
      }

      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("PROFILE_RESPONSE_NOT_JSON");
      }

      return data?.url || "";
    },

    async handleSignup({ name, email, password, profileFile }) {
      if (this.loading) return;
      this.loading = true;

      try {
        console.log("[SIGNUP] API_BASE =", API_BASE);

        // 1) (선택) 프로필 업로드 먼저
        const profileImgUrl = await this.uploadProfileIfNeeded(profileFile);

        // 2) 회원가입(JSON)
        const body = {
          email,
          password,
          userName: name, // 프론트 name -> 백 userName
          profileImg: profileImgUrl, // "/uploads/..." or ""
        };

        const r = await fetch(`${API_BASE}/user/regist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 세션에 있는 emailVerified 검사 때문에 필수
          body: JSON.stringify(body),
        });

        const text = await r.text();
        console.log("[SIGNUP] status:", r.status);
        console.log("[SIGNUP] response body:", text);

        if (r.status === 409) {
          alert("이미 가입된 이메일입니다.");
          return;
        }
        if (r.status === 403) {
          alert("이메일 인증이 필요합니다. 인증 후 다시 시도해주세요.");
          return;
        }
        if (!r.ok) {
          alert("회원가입에 실패했습니다.");
          return;
        }

        alert("회원가입이 완료되었습니다! 로그인 해주세요.");
        this.$router.push("/login");
      } catch (e) {
        console.error("[SIGNUP] ERROR =", e);
        if (String(e?.message) === "EMAIL_NOT_VERIFIED") {
          alert("이메일 인증이 완료된 상태에서만 프로필 업로드가 가능합니다.");
        } else {
          alert("회원가입 처리 중 오류가 발생했습니다.");
        }
      } finally {
        this.loading = false;
      }
    },

    goToLogin() {
      this.$router.push("/login");
    },
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
