<template>
  <div class="pref-card">
    <div class="pref-header">
      <button
        class="back-btn"
        type="button"
        @click="$emit('back')"
        aria-label="이전"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h2>관심사항 설정</h2>
    </div>

    <div class="pref-body">
      <div class="field">
        <!-- 관심 지역 -->
        <div class="block">
          <label class="field-label">관심 지역</label>

          <div class="row-2">
            <div class="select-wrap half">
              <select
                class="select"
                v-model="local.sido"
                @change="onChangeSido"
              >
                <option value="">
                  {{ loadingSido ? "불러오는 중..." : "시 선택" }}
                </option>
                <option v-for="s in sidos" :key="s" :value="s">
                  {{ s }}
                </option>
              </select>
            </div>

            <div class="select-wrap half">
              <select
                class="select"
                v-model="local.gugun"
                :disabled="!local.sido || loadingGugun || guguns.length === 0"
              >
                <option value="">
                  {{
                    !local.sido
                      ? "시를 먼저 선택"
                      : loadingGugun
                      ? "불러오는 중..."
                      : "구 선택"
                  }}
                </option>
                <option v-for="g in guguns" :key="g" :value="g">
                  {{ g }}
                </option>
              </select>
            </div>
          </div>

          <p v-if="errRegion" class="error-text">{{ errRegion }}</p>
        </div>

        <!-- 관심 키워드 -->
        <div class="block">
          <label class="field-label">관심 키워드</label>

          <div v-if="loadingTags" class="hint">태그 불러오는 중...</div>
          <p v-if="errTags" class="error-text">{{ errTags }}</p>

          <div class="tag-pills" v-if="!loadingTags && !errTags">
            <button
              v-for="t in tagOptions"
              :key="t._key"
              type="button"
              :class="['tag-pill', { active: local.tagIds.includes(t.tagId) }]"
              @click="toggleTag(t.tagId)"
            >
              {{ t.name }}
            </button>
          </div>
        </div>

        <!-- 희망 층수 -->
        <div class="block">
          <div class="field-label">희망 층</div>

          <div class="range-slider-container">
            <div class="range-values">
              <span>{{ local.minFloor }}층</span>
              <span>{{ local.maxFloor }}층</span>
            </div>

            <div class="dual-range">
              <div class="range-track"></div>
              <div class="range-progress" :style="floorProgressStyle"></div>

              <input
                type="range"
                v-model.number="local.minFloor"
                :min="FLOOR_MIN"
                :max="FLOOR_MAX"
                :step="FLOOR_STEP"
                class="range-slider range-min"
                @input="clampFloor"
              />
              <input
                type="range"
                v-model.number="local.maxFloor"
                :min="FLOOR_MIN"
                :max="FLOOR_MAX"
                :step="FLOOR_STEP"
                class="range-slider range-max"
                @input="clampFloor"
              />
            </div>
          </div>
        </div>

        <!-- 희망 평수 -->
        <div class="block">
          <div class="field-label">희망 평수</div>

          <div class="range-slider-container">
            <div class="range-values">
              <span>{{ local.minArea }}평</span>
              <span>{{ local.maxArea }}평</span>
            </div>

            <div class="dual-range">
              <div class="range-track"></div>
              <div class="range-progress" :style="areaProgressStyle"></div>

              <input
                type="range"
                v-model.number="local.minArea"
                :min="AREA_MIN"
                :max="AREA_MAX"
                :step="AREA_STEP"
                class="range-slider range-min"
                @input="clampArea"
              />
              <input
                type="range"
                v-model.number="local.maxArea"
                :min="AREA_MIN"
                :max="AREA_MAX"
                :step="AREA_STEP"
                class="range-slider range-max"
                @input="clampArea"
              />
            </div>
          </div>

          <div class="hint">(평수 입력, 1평 ≈ 3.3㎡)</div>
        </div>

        <!-- 완료 버튼 -->
        <div class="actions">
          <button class="complete-btn" type="button" @click="$emit('complete')">
            회원가입 완료
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FormInput from "./FormInput.vue";
const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "PreferenceForm",
  components: { FormInput },
  props: { modelValue: { type: Object, required: true } },

  data() {
    return {
      sidos: [],
      guguns: [],
      tagOptions: [],

      loadingSido: false,
      loadingGugun: false,
      loadingTags: false,
      errRegion: "",
      errTags: "",

      FLOOR_MIN: 1,
      FLOOR_MAX: 100,
      FLOOR_STEP: 1,

      AREA_MIN: 1,
      AREA_MAX: 300,
      AREA_STEP: 1,

      local: {
        sido: this.modelValue.sido ?? "",
        gugun: this.modelValue.gugun ?? "",
        tagIds: Array.isArray(this.modelValue.tagIds)
          ? [...this.modelValue.tagIds]
          : [],
        minFloor: this.modelValue.minFloor ?? 1,
        maxFloor: this.modelValue.maxFloor ?? 100,
        minArea: this.modelValue.minArea ?? 1,
        maxArea: this.modelValue.maxArea ?? 300,
      },
    };
  },

  computed: {
    floorProgressStyle() {
      const min = Number(this.local.minFloor ?? 0);
      const max = Number(this.local.maxFloor ?? 0);
      const left =
        ((min - this.FLOOR_MIN) / (this.FLOOR_MAX - this.FLOOR_MIN)) * 100;
      const width = ((max - min) / (this.FLOOR_MAX - this.FLOOR_MIN)) * 100;
      return { left: `${left}%`, width: `${width}%` };
    },
    areaProgressStyle() {
      const min = Number(this.local.minArea ?? 0);
      const max = Number(this.local.maxArea ?? 0);
      const left =
        ((min - this.AREA_MIN) / (this.AREA_MAX - this.AREA_MIN)) * 100;
      const width = ((max - min) / (this.AREA_MAX - this.AREA_MIN)) * 100;
      return { left: `${left}%`, width: `${width}%` };
    },
  },

  watch: {
    local: {
      deep: true,
      handler(v) {
        this.$emit("update:modelValue", {
          sido: v.sido,
          gugun: v.gugun,
          tagIds: v.tagIds,
          minFloor: v.minFloor === "" ? null : Number(v.minFloor),
          maxFloor: v.maxFloor === "" ? null : Number(v.maxFloor),
          minArea: v.minArea === "" ? null : Number(v.minArea),
          maxArea: v.maxArea === "" ? null : Number(v.maxArea),
        });
      },
    },
  },

  async mounted() {
    await Promise.all([this.loadSidos(), this.loadTags()]);
    if (this.local.sido) await this.loadGuguns(this.local.sido);
  },

  methods: {
    normalizeToStringList(list, keys = []) {
      if (!Array.isArray(list)) return [];
      return list
        .map((x) => {
          if (typeof x === "string") return x;
          for (const k of keys) {
            if (x && x[k]) return x[k];
          }
          return "";
        })
        .filter(Boolean);
    },

    async loadSidos() {
      this.loadingSido = true;
      this.errRegion = "";
      try {
        const r = await fetch(`${API_BASE}/property/regions/sido`, {
          method: "GET",
          credentials: "include",
        });
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          console.error("[sido] status=", r.status, text);
          this.errRegion =
            r.status === 403
              ? "지역 목록 조회가 403입니다. (백엔드에서 해당 API를 permitAll로 열어줘야 해요)"
              : "지역 목록을 불러오지 못했어요.";
          return;
        }
        const data = await r.json();
        this.sidos = this.normalizeToStringList(data, ["sidoName", "sido"]);
      } catch (e) {
        console.error("[sido] error=", e);
        this.errRegion = "지역 목록 조회 중 네트워크 오류가 발생했어요.";
      } finally {
        this.loadingSido = false;
      }
    },

    async loadGuguns(sido) {
      this.loadingGugun = true;
      this.errRegion = "";
      try {
        const r = await fetch(
          `${API_BASE}/property/regions/gugun?sido=${encodeURIComponent(sido)}`,
          { method: "GET", credentials: "include" }
        );
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          console.error("[gugun] status=", r.status, text);
          this.errRegion =
            r.status === 403
              ? "구 목록 조회가 403입니다. (백엔드 permitAll 필요)"
              : "구 목록을 불러오지 못했어요.";
          return;
        }
        const data = await r.json();
        this.guguns = this.normalizeToStringList(data, ["gugunName", "gugun"]);
      } catch (e) {
        console.error("[gugun] error=", e);
        this.errRegion = "구 목록 조회 중 네트워크 오류가 발생했어요.";
      } finally {
        this.loadingGugun = false;
      }
    },

    async loadTags() {
      this.loadingTags = true;
      this.errTags = "";

      const NAME_TO_ID = {
        역세권: 1,
        병세권: 2,
        학세권: 3,
        문세권: 4,
      };

      try {
        const r = await fetch(
          `${API_BASE}/property/tags?type=${encodeURIComponent("주변시설")}`,
          { method: "GET", credentials: "include" }
        );

        if (!r.ok) {
          const text = await r.text().catch(() => "");
          console.error("[tags] status=", r.status, text);
          this.errTags =
            r.status === 403
              ? "태그 조회가 403입니다. (백엔드 permitAll 필요)"
              : "태그 목록을 불러오지 못했어요.";
          return;
        }

        const data = await r.json();
        const rawList = Array.isArray(data) ? data : [];

        const mapped = rawList
          .map((x, idx) => {
            const name = (x?.name ?? x?.tagName ?? "").trim();
            const rawId = x?.tagId ?? x?.tag_id ?? x?.id ?? x?.tagID;
            let id = Number.parseInt(rawId, 10);

            if (!Number.isInteger(id) || id <= 0) {
              id = NAME_TO_ID[name] ?? null;
            }

            return {
              tagId: id,
              name,
              _key: `${id ?? "n"}-${idx}`,
            };
          })
          .filter((x) => Number.isInteger(x.tagId) && x.tagId > 0 && x.name);

        const seen = new Set();
        this.tagOptions = mapped.filter((t) => {
          if (seen.has(t.tagId)) return false;
          seen.add(t.tagId);
          return true;
        });

        console.log("[tagOptions]", this.tagOptions);
      } catch (e) {
        console.error("[tags] error=", e);
        this.errTags = "태그 조회 중 네트워크 오류가 발생했어요.";
      } finally {
        this.loadingTags = false;
      }
    },

    async onChangeSido() {
      this.local.gugun = "";
      this.guguns = [];
      if (!this.local.sido) return;
      await this.loadGuguns(this.local.sido);
    },

    toggleTag(tagId) {
      tagId = Number(tagId);
      if (!Number.isInteger(tagId) || tagId <= 0) return;

      const i = this.local.tagIds.indexOf(tagId);
      if (i >= 0) this.local.tagIds.splice(i, 1);
      else this.local.tagIds.push(tagId);
    },

    clampFloor() {
      let min = Number(this.local.minFloor);
      let max = Number(this.local.maxFloor);
      if (min > max) {
        this.local.minFloor = max;
      }
    },

    clampArea() {
      let min = Number(this.local.minArea);
      let max = Number(this.local.maxArea);
      if (min > max) {
        this.local.minArea = max;
      }
    },
  },
};
</script>

<style scoped>
/* 카드 */
.pref-card {
  width: 100%;
  background: var(--tothezip-white);
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 20px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 헤더 */
.pref-header {
  padding: 30px 56px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 56px;
}

.pref-header h2 {
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1;
  color: var(--tothezip-beige-09);
  letter-spacing: -0.08px;
}

/* 🎨 예쁜 뒤로가기 버튼 */
.back-btn {
  position: absolute;
  left: 18px;
  top: 22px;

  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1.5px solid var(--tothezip-brown-02);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(250, 247, 245, 0.95) 100%
  );
  box-shadow: 0 2px 8px rgba(75, 29, 28, 0.08);

  color: var(--tothezip-brown-07);
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover {
  background: linear-gradient(
    135deg,
    var(--tothezip-orange-01) 0%,
    var(--tothezip-orange-02) 100%
  );
  border-color: var(--tothezip-orange-04);
  color: var(--tothezip-orange-06);
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(227, 93, 55, 0.2);
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

.back-btn:active {
  transform: translateX(-2px) scale(0.98);
}

/* 바디 */
.pref-body {
  padding: 16px 56px 30px;
  padding-top: calc(var(--logo-size) * 0.18);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.field {
  --field-width: 260px;
  width: var(--field-width);
  margin: 0 auto;
}

.block {
  margin-top: 14px;
}
.block:first-child {
  margin-top: 0;
}

.field-label {
  display: block;
  margin: 0 0 6px;
  padding: 2px 8px;

  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 1;
  color: var(--tothezip-beige-04);
  letter-spacing: -0.048px;
}

.row-2 {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: flex-start;
}

.select-wrap {
  width: 100%;
}
.select-wrap.half {
  width: calc((var(--field-width) - 10px) / 2);
}

.select {
  width: 100%;
  height: 38px;
  background: var(--tothezip-cream-02);
  border: 1px solid var(--tothezip-beige-02);
  border-radius: 10px;
  padding: 0 12px;
  box-sizing: border-box;

  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  color: var(--tothezip-beige-09);
  outline: none;
}
.select:focus {
  border-color: var(--tothezip-beige-04);
}
.select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pref-body :deep(.input-group) {
  width: 100%;
  margin: 0;
}

.pref-body :deep(.input-group.no-label .input-label) {
  display: none;
}

.pref-body :deep(.input-group.half) {
  width: calc((var(--field-width) - 10px) / 2);
  margin: 0;
}

.tag-pills {
  width: 100%;
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.tag-pill {
  flex: 1;
  height: 30px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid var(--tothezip-beige-03);
  background: var(--tothezip-white);

  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: var(--tothezip-beige-08);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  white-space: nowrap;
}

.tag-pill.active {
  background: var(--tothezip-beige-07);
  border-color: var(--tothezip-beige-08);
  color: var(--tothezip-beige-01);
}

.hint {
  margin: 6px 0 0;
  padding: 0 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 1.2;
  color: rgba(163, 151, 143, 0.9);
}

.actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

.complete-btn {
  width: 100%;
  height: 44px;
  border-radius: 999px;
  border: none;

  background: var(--tothezip-beige-07);
  color: var(--tothezip-beige-01);

  font-family: "Pretendard", sans-serif;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
}
.complete-btn:hover {
  background: var(--tothezip-beige-08);
}

.error-text {
  margin: 8px 0 0;
  padding: 0 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  color: #d14b4b;
}

.select option {
  color: var(--tothezip-beige-09);
  background: var(--tothezip-white);
}

.select option[value=""] {
  color: var(--tothezip-beige-04);
}

.range-slider-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 8px;
}

.range-values {
  display: flex;
  justify-content: space-between;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--tothezip-beige-08);
}

.dual-range {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

.range-track {
  position: absolute;
  width: 100%;
  height: 8px;
  background: var(--tothezip-beige-02);
  border-radius: 999px;
  top: 50%;
  transform: translateY(-50%);
}

.range-progress {
  position: absolute;
  height: 8px;
  background: var(--tothezip-beige-07);
  border-radius: 999px;
  top: 50%;
  transform: translateY(-50%);
  transition: left 0.08s, width 0.08s;
}

.range-slider {
  position: absolute;
  width: 100%;
  height: 20px;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--tothezip-white);
  border: 3px solid var(--tothezip-beige-08);
  pointer-events: all;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--tothezip-white);
  border: 3px solid var(--tothezip-beige-08);
  pointer-events: all;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.range-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 20px;
  background: transparent;
  border: none;
}

.range-slider::-moz-range-track {
  width: 100%;
  height: 20px;
  background: transparent;
  border: none;
}

.range-slider.range-min {
  z-index: 5;
}

.range-slider.range-max {
  z-index: 6;
}

@media (max-width: 500px) {
  .pref-body {
    padding-left: 40px;
    padding-right: 40px;
  }
  .field {
    --field-width: min(260px, 100%);
  }
  .row-2 {
    flex-direction: row;
  }
}
</style>
