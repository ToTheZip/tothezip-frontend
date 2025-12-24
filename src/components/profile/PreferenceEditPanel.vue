<template>
  <Teleport to="body">
    <transition name="slide-left">
      <section
        v-if="ui.showPreferenceEdit"
        ref="panelRef"
        class="preference-panel"
        @click.stop
      >
        <!-- 🔹 실제 내용 -->
        <PreferenceForm
          v-model="form"
          @back="ui.closePreferenceEdit"
          @complete="savePreference"
        />
      </section>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useUIStore } from "@/stores/ui";
import PreferenceForm from "@/components/signup/PreferenceForm.vue";
import { getPreferenceTags, getPreferenceRange } from "@/api/preference";
import { resolveTags } from "@/api/property";

const ui = useUIStore();
const panelRef = ref(null);

/* 기본값 */
const form = ref({
  sido: "",
  gugun: "",
  tagIds: [],
  minFloor: 1,
  maxFloor: 100,
  minArea: 1,
  maxArea: 300,
});

function isRegionTagName(name) {
  // "서울특별시 관악구" 같은 형태
  return typeof name === "string" && name.includes(" ") && name.endsWith("구");
}

/* 서버에서 기존 설정 불러오기 */
async function loadPreference() {
  try {
    const [tagsRes, rangeRes] = await Promise.all([
      getPreferenceTags(),
      getPreferenceRange(),
    ]);

    const tagIds = Array.isArray(tagsRes.data) ? tagsRes.data : [];
    const range = rangeRes.data ?? {};

    // tagId -> tagName 으로 변환
    const resolved = await resolveTags(tagIds);
    const tags = Array.isArray(resolved.data) ? resolved.data : [];

    let sido = "";
    let gugun = "";
    const facilityTagIds = [];

    for (const t of tags) {
      const name = t?.name ?? "";
      const id = t?.tagId ?? t?.id;

      if (isRegionTagName(name)) {
        const [s, g] = name.split(" ");
        sido = s;
        gugun = g;
      } else {
        facilityTagIds.push(Number(id));
      }
    }

    form.value = {
      sido,
      gugun,
      tagIds: facilityTagIds,
      minFloor: range.minFloor ?? 1,
      maxFloor: range.maxFloor ?? 100,
      minArea: range.minArea ?? 1,
      maxArea: range.maxArea ?? 300,
    };
  } catch (e) {
    console.error("[LOAD PREFERENCE FAILED]", e);
  }
}

/* 패널 열릴 때마다 실행 */
watch(
  () => ui.showPreferenceEdit,
  (open) => {
    if (open) loadPreference();
  }
);

/* 바깥 클릭 닫기 */
function handleOutside(e) {
  if (!ui.showPreferenceEdit) return;
  if (panelRef.value && !panelRef.value.contains(e.target)) {
    ui.closePreferenceEdit();
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutside);
});

/* 저장 버튼 */
async function savePreference() {
  try {
    console.log("[SAVE PREFERENCE]", form.value);

    await http.put("/user/preferences", form.value);
    alert("관심사항 변경 완료");

    alert("관심사항이 변경되었습니다.");
    ui.closePreferenceEdit();
  } catch (e) {
    alert("관심사항 변경 중 오류가 발생했어요.");
  }
}
</script>

<style scoped>
.preference-panel {
  position: fixed;
  top: 90px;
  right: 24px;
  width: 420px; /* PreferenceForm에 맞게 살짝 넓힘 */
  max-height: calc(100vh - 120px);
  background: transparent; /* 카드 자체가 배경 */
  z-index: 30000;

  display: flex;
  align-items: flex-start;
}

/* ⭐ 오른쪽 → 왼쪽 슬라이드 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-left-enter-from {
  transform: translateX(48px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(48px);
  opacity: 0;
}
</style>
