<template>
  <div class="signup-page">
    <div class="content-wrapper">
      <div class="slider-viewport">
        <div class="slider" :class="{ moved: step === 2 }">
          <!-- STEP 1 -->
          <div class="slide">
            <div class="form-stack">
              <ClickableLogo :src="logo" />

              <SignupForm
                @verify-email="handleVerifyEmail"
                @signup="cacheSignupData"
              />

              <button class="arrow-btn" @click="goNext">→</button>
            </div>

            <div class="login-link">
              <span class="login-link-text">이미 계정이 있어요! </span>
              <a href="#" class="login-link-underline" @click.prevent="goToLogin">
                로그인하러 가기
              </a>
            </div>
          </div>

          <!-- STEP 2 -->
          <div class="slide">
            <div class="form-stack">
              <ClickableLogo :src="logo" />

              <!-- ✅ v-model로 preference 내려줌 -->
              <PreferenceForm
                v-model="preference"
                @back="step = 1"
                @complete="submitAll"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- /viewport -->
    </div>
  </div>
</template>

<script>
import ClickableLogo from "@/components/common/ClickableLogo.vue";
import SignupForm from "@/components/signup/SignupForm.vue";
import PreferenceForm from "@/components/signup/PreferenceForm.vue";
import logo from "@/assets/images/dozip_logo.png";

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "SignupPage",
  components: { SignupForm, ClickableLogo, PreferenceForm },
  data() {
    return {
      logo,
      step: 1,

      signupData: null,

      // ✅ PreferenceForm이 emit 하는 키와 "완전히 동일"하게 맞춤
      preference: {
        sido: "",
        gugun: "",
        tagIds: [],
        minArea: null,
        maxArea: null,
      },

      loading: false,
    };
  },
  methods: {
    handleVerifyEmail(email) {
      console.log("Verify email:", email);
    },

    cacheSignupData(payload) {
      this.signupData = payload;
      this.step = 2;
    },

    goNext() {
      if (!this.signupData) {
        alert("회원가입 정보를 입력해주세요.");
        return;
      }
      this.step = 2;
    },

    async uploadProfileIfNeeded(profileFile) {
      if (!profileFile) return "";

      const form = new FormData();
      form.append("file", profileFile);

      const r = await fetch(`${API_BASE}/user/profile/upload`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const text = await r.text();

      if (r.status === 403) throw new Error("EMAIL_NOT_VERIFIED");
      if (!r.ok) throw new Error("PROFILE_UPLOAD_FAILED");

      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("PROFILE_RESPONSE_NOT_JSON");
      }

      return data?.url || "";
    },

    async submitAll() {
      if (this.loading) return;
      if (!this.signupData) {
        alert("회원가입 정보가 없습니다. 처음 화면으로 돌아가 주세요.");
        this.step = 1;
        return;
      }

      this.loading = true;

      try {
        const { name, email, password, profileFile } = this.signupData;

        // 1) 프로필 업로드(선택)
        const profileImgUrl = await this.uploadProfileIfNeeded(profileFile);

        // 2) 회원가입
        const body = {
          email,
          password,
          userName: name,
          profileImg: profileImgUrl,
        };

        const r = await fetch(`${API_BASE}/user/regist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

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

        // ✅ 3) 자동 로그인 (accessToken 발급)
        const lr = await fetch(`${API_BASE}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // refresh_token 쿠키 받으려면 포함
          body: JSON.stringify({ email, password }),
        });

        if (!lr.ok) {
          alert("회원가입은 완료됐지만 자동 로그인에 실패했습니다. 로그인 후 다시 시도해주세요.");
          this.$router.push("/login");
          return;
        }

        const loginData = await lr.json();
        const accessToken = loginData?.accessToken;
        if (!accessToken) {
          alert("자동 로그인 토큰을 받지 못했습니다. 로그인 후 다시 시도해주세요.");
          this.$router.push("/login");
          return;
        }

        // ✅ 4) 관심사항 저장 전에 정리
        const cleanTagIds = Array.from(
          new Set((this.preference.tagIds || []).map((x) => Number(x)))
        ).filter((x) => Number.isInteger(x) && x > 0);

        console.log("[PREF payload]", {
          ...this.preference,
          tagIds: cleanTagIds,
        });

        const pr = await fetch(`${API_BASE}/user/preferences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            ...this.preference,
            tagIds: cleanTagIds,
          }),
        });

        if (!pr.ok) {
          const text = await pr.text().catch(() => "");
          console.error("[PREFERENCES] status=", pr.status, text);
          alert("관심사항 저장에 실패했습니다.");
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
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.content-wrapper {
  width: 100%;
  box-sizing: border-box;
}

.slider-viewport {
  width: 100%;
  overflow-x: hidden;
  overflow-y: visible;
}

.slider {
  display: flex;
  width: 200%;
  transition: transform 0.5s ease;
  transform: translateX(0%);
}

.slider.moved {
  transform: translateX(-50%);
}

.slide {
  width: 50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 16px 24px;
  box-sizing: border-box;
}

.form-stack {
  width: min(400px, calc(100vw - 40px));
  position: relative;

  --logo-size: clamp(200px, 28vw, 260px);
  --logo-top-ratio: 0.41;
  --logo-top: calc(var(--logo-size) * var(--logo-top-ratio) * -1);
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

.arrow-btn,
.submit-btn {
  margin-top: 12px;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: none;
  background: var(--tothezip-brown);
  color: white;
  font-size: 22px;
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 14px;
  border-radius: 22px;
}

.back-btn {
  margin-top: 10px;
  border: none;
  background: transparent;
  color: var(--tothezip-beige-04);
  cursor: pointer;
}
</style>
