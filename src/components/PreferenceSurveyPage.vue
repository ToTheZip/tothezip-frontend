<template>
  <div class="auth-page">
    <div class="auth-wrapper">
      <div class="auth-stack">
        <!-- (선택) 로고 -->
        <img class="auth-logo" src="@/assets/images/dozip_logo.png" />

        <!-- 카드 -->
        <div class="auth-card">
          <h2 class="auth-title">관심사항 설정</h2>

          <PreferenceRegionSelect v-model="region" />
          <PreferenceTagSelect v-model="tags" />
          <PreferenceRangeInput v-model="range" />

          <button class="submit-btn" @click="complete">
            회원가입 완료
          </button>

        </div>
      </div>
    </div>
  </div>
</template>


<script>
import PreferenceRegionSelect from "@/components/preferenceSurvey/PreferenceRegionSelect.vue";
import PreferenceTagSelect from "@/components/preferenceSurvey/PreferenceTagSelect.vue";
import PreferenceRangeInput from "@/components/preferenceSurvey/PreferenceRangeInput.vue";

import axios from "axios";

export default {
  components: {
    PreferenceRegionSelect,
    PreferenceTagSelect,
    PreferenceRangeInput
  },
  data() {
    return {
      region: { city: "", district: "" },
      tags: [],
      range: {
        minArea: null,
        maxArea: null,
        minPrice: null,
        maxPrice: null
      }
    };
  },
  methods: {
    async complete() {
        try {
        const payload = {
            userId: this.userId,

            // 지역: 하나의 태그 문자열로 저장
            regionTag: `${this.region.city} ${this.region.district}`.trim(),

            // 관심 키워드
            tags: this.tags,

            // 평수 / 가격
            minArea: this.range.minArea,
            maxArea: this.range.maxArea,
            minPrice: this.range.minPrice,
            maxPrice: this.range.maxPrice,
        };

        console.log("[PREFERENCE] payload =", payload);

        const r = await fetch(`${API_BASE}/preferences`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // 이후 로그인 상태 연동 대비
            body: JSON.stringify(payload),
        });

        if (!r.ok) {
            alert("관심사항 저장에 실패했습니다.");
            return;
        }

        // 👉 SignupPage로 완료 신호 전달
        this.$emit("complete");

        } catch (e) {
        console.error("[PREFERENCE] ERROR =", e);
        alert("관심사항 저장 중 오류가 발생했습니다.");
        }
    }
  }
};
</script>

<style scoped>
/* 전체 배경 */
.auth-page {
  width: 100%;
  min-height: 100vh;
  background: #fff6ec; /* 회원가입과 동일 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 중앙 래퍼 */
.auth-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* 카드 스택 */
.auth-stack {
  width: min(400px, calc(100vw - 40px));
  position: relative;
}

/* 로고 */
.auth-logo {
  display: block;
  margin: 0 auto -40px;
  width: 180px;
  z-index: 2;
  position: relative;
}

/* 카드 */
.auth-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 60px 22px 32px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

/* 제목 */
.auth-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #7a4a21;
}

/* 완료 버튼 */
.auth-submit {
  width: 100%;
  height: 42px;
  margin-top: 28px;
  border-radius: 21px;
  background: #8b5a2b;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.auth-submit:hover {
  background: #734823;
}
</style>
