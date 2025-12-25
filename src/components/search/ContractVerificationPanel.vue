<template>
  <transition name="fade">
    <div v-if="isOpen" class="cv-overlay" @click.self="handleClose">
      <div class="cv-panel" @click.stop @mousedown.stop @pointerdown.stop>
        <!-- Header -->
        <div class="cv-header">
          <h3 class="cv-title">계약서 인증</h3>
          <button
            class="cv-close"
            type="button"
            @click="handleClose"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="cv-body">
          <!-- 아파트 이름 -->
          <div class="cv-field">
            <div class="cv-label">아파트 이름</div>
            <div class="cv-readonly">
              {{ property?.name || "-" }}
            </div>
          </div>

          <!-- 주소 -->
          <div class="cv-field">
            <div class="cv-label">주소</div>
            <div class="cv-readonly">
              {{ fullAddress || "-" }}
            </div>
          </div>

          <!-- 계약 유형 -->
          <div class="cv-field">
            <div class="cv-label">계약 유형</div>
            <div class="cv-type-row">
              <button
                v-for="t in contractTypes"
                :key="t.value"
                type="button"
                class="cv-type-btn"
                :class="{ active: contractType === t.value }"
                @click="contractType = t.value"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <!-- 계약서 파일 -->
          <div class="cv-field">
            <div class="cv-label">계약서 파일</div>

            <div
              class="cv-dropzone"
              :class="{ drag: isDragging, hasFile: !!file }"
              @dragenter.prevent="onDragEnter"
              @dragover.prevent="onDragOver"
              @dragleave.prevent="onDragLeave"
              @drop.prevent="onDrop"
              @click="triggerFilePick"
              role="button"
              tabindex="0"
              aria-label="계약서 파일 업로드"
            >
              <input
                ref="fileInput"
                type="file"
                class="cv-file-input"
                accept="image/*,application/pdf"
                @change="onFileChange"
              />

              <template v-if="!file">
                <div class="cv-dropzone-icon">⬆</div>
                <div class="cv-dropzone-text">
                  파일을 드래그하거나 클릭하여 업로드하세요
                </div>
                <div class="cv-dropzone-sub">이미지 또는 PDF 파일</div>
              </template>

              <template v-else>
                <div class="cv-file-chip">
                  <div class="cv-file-name">
                    {{ file.name }}
                  </div>
                  <button
                    class="cv-file-remove"
                    type="button"
                    @click.stop="clearFile"
                  >
                    삭제
                  </button>
                </div>

                <!-- 이미지 미리보기(이미지일 때만) -->
                <div v-if="isImageFile && previewUrl" class="cv-preview">
                  <img :src="previewUrl" alt="업로드 미리보기" />
                </div>

                <!-- PDF일 때 안내 -->
                <div v-else class="cv-preview pdf">
                  PDF 파일이 선택되었습니다.
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="cv-footer">
          <button
            class="cv-submit"
            type="button"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ submitting ? "인증 중..." : "인증 요청하기" }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const OCR_BASE = import.meta.env.VITE_OCR_BASE; // 예: http://127.0.0.1:8008
const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "ContractVerificationPanel",
  props: {
    isOpen: { type: Boolean, default: false },
    property: { type: Object, required: true },
  },
  emits: ["close"],
  data() {
    return {
      contractTypes: [
        { label: "월세", value: "월세" },
        { label: "전세", value: "전세" },
        { label: "매매", value: "매매" },
      ],
      contractType: "월세",
      file: null,
      previewUrl: "",
      isDragging: false,
      submitting: false,
      ocrResult: null,
      detailProperty: null,
    };
  },
  computed: {
    p() {
      return this.detailProperty || this.property || {};
    },
    prettyAddressRaw() {
      const raw =
        this.property?.addressRaw ||
        this.property?.address_raw ||
        this.property?.roadAddress ||
        this.property?.address ||
        "";
      return this.beautifyRoadAddress(String(raw || "").trim());
    },

    fullAddress() {
      const p = this.property || {};

      // raw: 도로명(혹은 address_raw)
      const raw = (
        p.roadAddress ||
        p.road_address ||
        p.address ||
        p.address_raw ||
        ""
      )
        .toString()
        .trim();

      if (!raw) return "";

      // 1) raw가 이미 전체 주소면 그대로
      if (this.looksLikeFullAddress(raw)) return this.beautifyRoadAddress(raw);

      // 2) 안정적인 prefix 후보: sido/gugun
      const sido = (p.sidoName || p.sido_name || p.sido || "").trim();
      const gugun = (
        p.gugunName ||
        p.gugun_name ||
        p.gugun ||
        p.sggName ||
        ""
      ).trim();
      const dong = (
        p.dongName ||
        p.dong_name ||
        p.dong ||
        p.umdName ||
        ""
      ).trim();

      const stablePrefix = [sido, gugun, dong].filter(Boolean).join(" ").trim();

      if (stablePrefix) {
        return `${stablePrefix} ${this.beautifyRoadAddress(raw)}`.trim();
      }

      try {
        const searchRaw = sessionStorage.getItem("tothezip_search");
        const search = searchRaw ? JSON.parse(searchRaw) : null;

        // location이 "대전광역시 유성구 봉명동" 같은 형태면 그대로 prefix로 사용
        const loc = (search?.location || "").trim();

        // location이 없으면 sido/gugun/dong 조합
        const ssPrefix =
          loc ||
          [search?.sido, search?.gugun, search?.dong]
            .filter(Boolean)
            .join(" ")
            .trim();

        if (ssPrefix) {
          return `${ssPrefix} ${this.beautifyRoadAddress(raw)}`.trim();
        }
      } catch (e) {}

      // 3) 마지막 fallback: regionName (단, 진짜 지역처럼 생긴 값일 때만)
      const region = (p.regionName || p.region_name || "").trim();
      const looksRegion = /(특별시|광역시|도)\s.+(구|군|시)\b/.test(region);
      if (looksRegion) {
        return `${region} ${this.beautifyRoadAddress(raw)}`.trim();
      }

      // 4) 그래도 없으면 raw만
      return this.beautifyRoadAddress(raw);
    },

    canSubmit() {
      return !!this.file && !this.submitting;
    },

    isImageFile() {
      return !!this.file && this.file.type?.startsWith("image/");
    },
  },
  watch: {
    isOpen(open) {
      if (open) {
        console.log("=== PANEL OPENED ===");
        console.log("received property:", this.property);
        console.log("aptSeq:", this.property?.aptSeq);
        console.log("id:", this.property?.id);
        this.ensurePropertyDetail();
        return;
      }
      // 닫힐 때 정리
      this.cleanupPreview();
      this.file = null;
      this.isDragging = false;
      this.submitting = false;
      this.ocrResult = null;
      this.detailProperty = null;
    },
  },
  methods: {
    async ensurePropertyDetail() {
      const aptSeq = this.p?.aptSeq ?? this.p?.id;
      if (!aptSeq) return;

      // 이미 jibun/roadNm/roadBun 있으면 OK
      if (
        this.p?.jibun &&
        (this.p?.roadNm || this.p?.road_nm) &&
        (this.p?.roadBun || this.p?.road_bun)
      ) {
        return;
      }

      try {
        // 너희가 이미 쓰는 search로 1건만 보강 (가장 간단)
        const { data } = await axios.post(`${API_BASE}/property/search`, {
          aptSeq: String(aptSeq),
          limit: 1,
          offset: 0,
        });

        const b = Array.isArray(data) ? data[0] : data;
        if (!b) return;

        this.detailProperty = {
          ...this.p,
          ...b,
          // 이름 통일해서 써도 됨
          roadNm: b.roadNm || b.road_nm,
          roadBun: b.roadBun || b.road_bun,
          jibun: b.jibun,
          sidoName: b.sidoName || b.sido_name,
          gugunName: b.gugunName || b.gugun_name || b.sggName,
          dongName: b.dongName || b.dong_name || b.umdName,
        };

        console.log("[CV] detailProperty hydrated:", this.detailProperty);
      } catch (e) {
        console.warn("[CV] ensurePropertyDetail failed:", e);
      }
    },
    handleClose() {
      this.$emit("close");
    },

    triggerFilePick() {
      this.$refs.fileInput?.click();
    },
    onFileChange(e) {
      const f = e.target.files?.[0];
      if (!f) return;
      this.setFile(f);
      e.target.value = "";
    },
    onDragEnter() {
      this.isDragging = true;
    },
    onDragOver() {
      this.isDragging = true;
    },
    onDragLeave() {
      this.isDragging = false;
    },
    onDrop(e) {
      this.isDragging = false;
      const f = e.dataTransfer?.files?.[0];
      if (!f) return;
      this.setFile(f);
    },

    setFile(f) {
      const ok =
        f.type?.startsWith("image/") ||
        f.type === "application/pdf" ||
        f.name?.toLowerCase().endsWith(".pdf");

      if (!ok) {
        alert("이미지 또는 PDF 파일만 업로드할 수 있어요.");
        return;
      }

      this.cleanupPreview();
      this.file = f;

      if (f.type?.startsWith("image/")) {
        this.previewUrl = URL.createObjectURL(f);
      } else {
        this.previewUrl = "";
      }
    },

    clearFile() {
      this.cleanupPreview();
      this.file = null;
    },

    cleanupPreview() {
      if (this.previewUrl) {
        try {
          URL.revokeObjectURL(this.previewUrl);
        } catch (_) {}
      }
      this.previewUrl = "";
    },

    // 주소 정규화: 공백/특수문자 제거 + 서울시/서울특별시 통일 정도만
    normalizeAddress(s) {
      if (!s) return "";
      return String(s)
        .replace(/\(.*?\)/g, "")
        .replace(/서울시/g, "서울특별시")
        .replace(/제?\d+층/g, "")
        .replace(/제?\d+호/g, "")
        .replace(/번지/g, "")
        .replace(/[.,·]/g, " ")
        .replace(/\s+/g, "")
        .trim();
    },

    extractJibunKey(s) {
      if (!s) return "";
      const txt = String(s);

      // 648-3번지 / 648-3 / 648번지
      const m = txt.match(/(\d{1,4}\s*-\s*\d{1,4}|\d{1,4})\s*번?지?/);
      if (m) return m[1].replace(/\s*/g, "");

      const m2 = txt.match(/(\d{1,4}\s*-\s*\d{1,4})/);
      if (m2) return m2[1].replace(/\s*/g, "");

      return "";
    },

    isAddressMatchWithCandidates(extractedAddrRaw) {
      const p = this.p || {};
      const extractedNorm = this.normalizeAddress(extractedAddrRaw);

      // 1) 지번키가 같으면 즉시 통과
      const expectedJibunKey = String(p.jibun || "").replace(/\s*/g, ""); // DB: 648-3
      const extractedJibunKey = this.extractJibunKey(extractedAddrRaw); // OCR: 648-3

      console.log("[CV] jibun compare", {
        expectedJibunKey,
        extractedJibunKey,
      });

      if (
        expectedJibunKey &&
        extractedJibunKey &&
        expectedJibunKey === extractedJibunKey
      ) {
        return true;
      }

      // 2) 도로명 키(도로명+번지) 포함 여부
      const roadNm = (p.roadNm || p.road_nm || "").trim();
      const roadBun = (p.roadBun || p.road_bun || "").trim();
      const roadKey = this.normalizeAddress(`${roadNm}${roadBun}`);

      console.log("[CV] road compare", { roadKey, extractedNorm });

      if (roadKey && extractedNorm.includes(roadKey)) {
        return true;
      }

      // 3) fallback: 전체 주소 포함 비교
      const a = this.normalizeAddress(this.fullAddress || "");
      const b = extractedNorm;
      if (a && b && (a.includes(b) || b.includes(a))) return true;

      return false;
    },

    // // 포함관계 기반 비교 (OCR 주소가 짧아도 통과)
    // isAddressMatch(expected, extracted) {
    //   const a = this.normalizeAddress(expected);
    //   const b = this.normalizeAddress(extracted);
    //   if (!a || !b) return false;
    //   return a.includes(b) || b.includes(a);
    // },

    // 최종: OCR 호출 + 주소 비교
    // async submit() {
    //   if (!this.canSubmit) return;

    //   try {
    //     this.submitting = true;

    //     const fd = new FormData();
    //     fd.append("files", this.file);

    //     const base = (OCR_BASE || "").replace(/\/$/, "");
    //     const { data } = await axios.post(`${base}/extract?llm=0`, fd);
    //     this.ocrResult = data;

    //     const extractedAddr = data?.extracted?.address_raw || "";
    //     const expectedAddr = this.fullAddress || "";

    //     const ok = this.isAddressMatchWithCandidates(extractedAddr);

    //     if (ok) {
    //       const auth = useAuthStore();
    //       const token = auth.accessToken
    //         ? auth.accessToken.startsWith("Bearer ")
    //           ? auth.accessToken
    //           : `Bearer ${auth.accessToken}`
    //         : null;
    //       const aptSeq = this.property?.aptSeq ?? this.property?.id;
    //       await axios.post(
    //         `${API_BASE}/user/certification`,
    //         {
    //           aptSeq: String(this.property?.aptSeq ?? this.property?.id ?? ""),
    //         },
    //         {
    //           headers: { Authorization: token },
    //           withCredentials: true,
    //         }
    //       );
    //       console.log(aptSeq);
    //       //   alert("✅ 주소 일치!\n인증 완료 + 내 매물에 저장했어요.");
    //       this.$emit("close");
    //       return;
    //     }
    //     alert(
    //       `${
    //         ok ? "✅ 주소 일치!" : "❌ 주소 불일치"
    //       }\n\n[화면]\n${expectedAddr}\n\n[계약서(OCR)]\n${
    //         extractedAddr || "-"
    //       }`
    //     );
    //   } catch (e) {
    //     console.error("[OCR ERROR]", e);
    //     alert("OCR 요청 실패 (OCR 서버 실행/주소/CORS 확인)");
    //   } finally {
    //     this.submitting = false;
    //   }
    // },
    // submit 메서드를 다음과 같이 수정하세요:

    async submit() {
      if (!this.canSubmit) return;

      try {
        this.submitting = true;

        // 1) OCR 요청
        const fd = new FormData();
        fd.append("files", this.file);

        const base = (OCR_BASE || "").replace(/\/$/, "");
        const { data } = await axios.post(`${base}/extract?llm=0`, fd);
        this.ocrResult = data;

        const extractedAddr = data?.extracted?.address_raw || "";
        const expectedAddr = this.fullAddress || "";

        const ok = this.isAddressMatchWithCandidates(extractedAddr);

        // 2) aptSeq 추출
        const p = this.detailProperty || this.property || {};
        const aptSeq = String(p.aptSeq ?? p.id ?? "");

        if (!aptSeq) {
          alert("❌ 매물 정보가 없습니다.");
          return;
        }

        // 3) 인증 API 호출
        const auth = useAuthStore();
        const token = auth.accessToken;

        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const authHeader = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        console.log("=== REQUEST START ===");
        console.log("URL:", `${API_BASE}/user/certification`);
        console.log("aptSeq:", aptSeq);
        console.log("Has token:", !!token);

        const response = await axios.post(
          `${API_BASE}/user/certification`,
          { aptSeq },
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        console.log("✅ SUCCESS:", response.data);
        alert(`✅ 인증이 완료되었습니다!\n\n매물: ${aptSeq}`);
        this.$emit("close");
      } catch (e) {
        console.error("=== ERROR ===");
        console.error("Status:", e.response?.status);
        console.error("Data:", e.response?.data);
        console.error("Full error:", e);

        if (e.response?.status === 403) {
          alert("❌ 403 Forbidden\n\n권한이 없습니다.");
        } else if (e.response?.status === 401) {
          alert("❌ 401 Unauthorized\n\n로그인이 필요합니다.");
        } else if (e.response?.status === 404) {
          alert("❌ 404 Not Found\n\nAPI 엔드포인트를 찾을 수 없습니다.");
        } else {
          alert(`❌ 에러 발생: ${e.message}`);
        }
      } finally {
        this.submitting = false;
      }
    },

    beautifyRoadAddress(s) {
      if (!s) return "";
      return s
        .replace(/([가-힣])(\d)/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
    },

    looksLikeFullAddress(s) {
      if (!s) return false;
      return /(특별시|광역시|특별자치시|특별자치도|도)\s/.test(s);
    },
  },
};
</script>

<style scoped>
/* Overlay */
.cv-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

/* Panel */
.cv-panel {
  width: 320px;
  max-width: 100%;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
}

/* Header */
.cv-header {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid rgba(163, 151, 143, 0.22);
}

.cv-title {
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.cv-close {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: #111;
}

/* Body */
.cv-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-label {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #111;
}

.cv-readonly {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(244, 236, 231, 0.35);
  border: 1px solid rgba(163, 151, 143, 0.22);
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  color: #333;
}

/* Contract type buttons */
.cv-type-row {
  display: flex;
  gap: 8px;
}

.cv-type-btn {
  flex: 1;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cv-type-btn.active {
  background: var(--tothezip-brown-06);
  color: #fff;
  border-color: var(--tothezip-brown-06);
}

/* Dropzone */
.cv-dropzone {
  border: 1px dashed rgba(163, 151, 143, 0.55);
  border-radius: 14px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s ease;
}

.cv-dropzone.drag {
  background: rgba(244, 236, 231, 0.5);
}

.cv-dropzone.hasFile {
  text-align: left;
  padding: 12px;
}

.cv-file-input {
  display: none;
}

.cv-dropzone-icon {
  font-size: 22px;
  margin-bottom: 8px;
}

.cv-dropzone-text {
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #333;
}

.cv-dropzone-sub {
  margin-top: 4px;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #888;
}

/* File chip */
.cv-file-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid rgba(163, 151, 143, 0.22);
  background: rgba(244, 236, 231, 0.25);
  border-radius: 12px;
  padding: 10px 10px;
}

.cv-file-name {
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cv-file-remove {
  border: 1px solid rgba(163, 151, 143, 0.35);
  background: #fff;
  border-radius: 999px;
  padding: 6px 10px;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

/* Preview */
.cv-preview {
  margin-top: 10px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(163, 151, 143, 0.22);
  background: #fff;
}

.cv-preview img {
  display: block;
  width: 100%;
  max-height: 180px;
  object-fit: cover;
}

.cv-preview.pdf {
  padding: 14px;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #555;
}

/* Footer */
.cv-footer {
  padding: 12px 14px 14px;
  border-top: 1px solid rgba(163, 151, 143, 0.22);
}

.cv-submit {
  width: 100%;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: var(--tothezip-brown-06);
  color: #fff;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.cv-submit:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
