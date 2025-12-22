<template>
  <transition name="slide-down">
    <section
      v-if="ui.showFavoriteCalendar"
      class="mini-cal"
      ref="panelRef"
      @click.stop
    >
      <div class="top">
        <div class="title">찜한 청약 일정</div>

        <div class="month-nav">
          <button class="nav-btn" @click="prevMonth" aria-label="이전 달">‹</button>
          <div class="month-label">
            {{ viewYear }}.{{ String(viewMonth).padStart(2, "0") }}
          </div>
          <button class="nav-btn" @click="nextMonth" aria-label="다음 달">›</button>
        </div>

        <button class="close" @click="ui.closeFavoriteCalendar">✕</button>
      </div>

      <div class="week">
        <span v-for="w in weekNames" :key="w" class="w">{{ w }}</span>
      </div>

      <div class="grid">
        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          class="cell"
          :class="{ empty: !cell.day, today: cell.isToday }"
        >
          <div class="day">{{ cell.day || "" }}</div>

          <!-- ✅ dots (오렌지=접수중, 파랑=공고일) -->
          <div v-if="cell.day && hasAnyDots(cell.key)" class="dots">
            <!-- 오렌지 -->
            <template v-if="dayEventsMap[cell.key]?.orange?.length">
              <button
                v-for="ev in visibleDots(dayEventsMap[cell.key].orange)"
                :key="'o-' + ev.noticeId + '-' + ev._k"
                class="dot orange"
                :title="` ${ev.name}`"
                @click.stop="goDetail(ev.noticeId)"
              />
              <span
                v-if="dayEventsMap[cell.key].orange.length > MAX_DOTS"
                class="more"
                :title="dayEventsMap[cell.key].orange.map(e => `${e.name}`).join('\n')"
              >
                +{{ dayEventsMap[cell.key].orange.length - MAX_DOTS }}
              </span>
            </template>

            <!-- 파랑 -->
            <template v-if="dayEventsMap[cell.key]?.blue?.length">
              <button
                v-for="ev in visibleDots(dayEventsMap[cell.key].blue)"
                :key="'b-' + ev.noticeId + '-' + ev._k"
                class="dot blue"
                :title="`[결과] ${ev.name}`"
                @click.stop="goDetail(ev.noticeId)"
              />
              <span
                v-if="dayEventsMap[cell.key].blue.length > MAX_DOTS"
                class="more"
                :title="dayEventsMap[cell.key].blue.map(e => `[결과] ${e.name}`).join('\n')"
              >
                +{{ dayEventsMap[cell.key].blue.length - MAX_DOTS }}
              </span>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!isLoading && totalEvents === 0" class="empty-text">
        이번 달 찜한 청약 일정이 없어요.
      </div>

      <div v-if="isLoading" class="loading-text">불러오는 중...</div>
        <div class="legend">
            <div class="legend-item">
            <span class="legend-dot orange" aria-hidden="true"></span>
            <span class="legend-text">접수중</span>
            </div>
            <div class="legend-item">
            <span class="legend-dot blue" aria-hidden="true"></span>
            <span class="legend-text">발표일</span>
            </div>
      </div>

    </section>
  </transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { fetchNoticeCalendar } from "@/api/notice";

const API_BASE = import.meta.env.VITE_API_BASE;

const ui = useUIStore();
const auth = useAuthStore();
const router = useRouter();

const panelRef = ref(null);
const weekNames = ["일", "월", "화", "수", "목", "금", "토"];

const MAX_DOTS = 3;

const isLoading = ref(false);
const viewDate = ref(new Date()); // 현재 보고있는 월
const rawEvents = ref([]);        // 찜한 이벤트(정규화된 형태)

const viewYear = computed(() => viewDate.value.getFullYear());
const viewMonth = computed(() => viewDate.value.getMonth() + 1);

// 날짜 -> "YYYY-MM-DD"
function toKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// "YYYY-MM-DD" 또는 Date 유사값 -> Date
function toDate(x) {
  if (!x) return null;
  if (x instanceof Date) return x;
  const s = String(x).slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/**
 * ✅ 여기서 필드 분리!
 * - applyStart/applyEnd : 접수기간(오렌지)
 * - publishDate(registDate): 공고일(파랑)
 */
function normalizeEvent(ev) {
  const noticeId = Number(ev.noticeId ?? ev.subscriptionId ?? ev.id);
  const name = ev.name ?? ev.title ?? ev.noticeTitle ?? "";

  const applyStart = toDate(ev.startDate ?? ev.applyStartDate ?? ev.start ?? ev.beginDate);
  const applyEnd = toDate(ev.endDate ?? ev.applyEndDate ?? ev.end ?? ev.finishDate ?? ev.startDate);

  const publishDate = toDate(ev.registDate ?? ev.publishDate ?? ev.announcementDate ?? ev.noticeDate);

  // key 충돌 방지용(같은 notice가 여러 dot에서 key 겹치면 Vue가 싫어함)
  const _k = Math.random().toString(36).slice(2);

  return { noticeId, name, applyStart, applyEnd, publishDate, _k };
}

// 특정 event가 걸치는 모든 날짜(포함) 순회
function eachDayInclusive(start, end, fn) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  for (let d = s; d <= e; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    fn(d);
  }
}

/**
 * ✅ 날짜별: { orange:[], blue:[] }
 */
const dayEventsMap = computed(() => {
  const map = {};

  function ensure(key) {
    if (!map[key]) map[key] = { orange: [], blue: [] };
    return map[key];
  }

  for (const ev of rawEvents.value) {
    if (!Number.isFinite(ev.noticeId)) continue;

    // 오렌지: 접수기간
    if (ev.applyStart && ev.applyEnd) {
      eachDayInclusive(ev.applyStart, ev.applyEnd, (d) => {
        const key = toKey(d);
        ensure(key).orange.push(ev);
      });
    }

    // 파랑: 공고일(발표날)
    if (ev.publishDate) {
      const key = toKey(ev.publishDate);
      ensure(key).blue.push(ev);
    }
  }

  return map;
});

function hasAnyDots(key) {
  const x = dayEventsMap.value[key];
  return !!(x && ((x.orange?.length || 0) + (x.blue?.length || 0) > 0));
}

const totalEvents = computed(() => rawEvents.value.length);

// 달력 셀 만들기 (빈칸 포함 6주까지)
const cells = computed(() => {
  const y = viewYear.value;
  const m = viewMonth.value;

  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();

  const todayKey = toKey(new Date());
  const result = [];

  for (let i = 0; i < startWeekday; i++) result.push({ day: null });

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(y, m - 1, day);
    const key = toKey(d);
    result.push({ day, key, isToday: key === todayKey });
  }

  while (result.length % 7 !== 0) result.push({ day: null });

  // 6주 고정(42칸)
  while (result.length < 42) result.push({ day: null });
  if (result.length > 42) result.length = 42;

  return result;
});

function visibleDots(list) {
  return (list || []).slice(0, MAX_DOTS);
}

async function loadData() {
  if (!auth.accessToken) {
    rawEvents.value = [];
    return;
  }

  isLoading.value = true;
  try {
    // 1) 찜한 noticeId 목록
    const favRes = await fetch(`${API_BASE}/favorite?type=청약`, {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      credentials: "include",
    });

    if (!favRes.ok) {
      rawEvents.value = [];
      return;
    }

    const favIdsRaw = await favRes.json(); // [noticeId,...]
    const favSet = new Set((favIdsRaw || []).map((x) => Number(x)));

    // 2) 해당 월 캘린더 이벤트 불러오기
    const res = await fetchNoticeCalendar({
      year: viewYear.value,
      month: viewMonth.value,
    });

    const items = res?.items || [];
    const normalized = items.map(normalizeEvent);

    // 3) 찜한 것만 필터
    rawEvents.value = normalized.filter(
      (ev) => Number.isFinite(ev.noticeId) && favSet.has(ev.noticeId)
    );
  } finally {
    isLoading.value = false;
  }
}

function goDetail(noticeId) {
  const nid = Number(noticeId);
  if (!Number.isFinite(nid)) return;
  ui.closeFavoriteCalendar();
  router.push({ name: "NoticeDetail", params: { noticeId: nid } });
}

function prevMonth() {
  const d = viewDate.value;
  viewDate.value = new Date(d.getFullYear(), d.getMonth() - 1, 1);
}
function nextMonth() {
  const d = viewDate.value;
  viewDate.value = new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

// 열릴 때 로드
watch(
  () => ui.showFavoriteCalendar,
  (open) => {
    if (open) loadData();
  }
);

// 월 이동 시 로드
watch(
  () => [viewYear.value, viewMonth.value],
  () => {
    if (ui.showFavoriteCalendar) loadData();
  }
);

// 바깥 클릭 닫기
function onDocClick(e) {
  // ✅ 헤더 캘린더 버튼에 data-favcal-toggle="1" 달아둔 상태여야 깜빡임 안남
  if (e.target.closest?.('[data-favcal-toggle="1"]')) return;

  const el = panelRef.value;
  if (!el) return;
  if (!el.contains(e.target)) ui.closeFavoriteCalendar();
}

onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<style scoped>
/* 드롭다운 위치: 헤더 아래 우측 */
.mini-cal {
  position: fixed;
  top: 88px;            /* header 80px + 여유 */
  right: 28px;
  width: 320px;
  border: 1px solid rgba(220, 212, 207, 0.9);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(17, 17, 17, 0.12);
  z-index: 1200;        /* header(1000)보다 위에 */
  padding: 14px 14px 12px;
}

.top {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(220, 212, 207, 0.7);
}

.title {
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #6f3d32;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-label {
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #111;
  min-width: 72px;
  text-align: center;
}

.nav-btn {
  width: 26px;
  height: 26px;
  border-radius: 10px;
  border: 1px solid rgba(220, 212, 207, 0.9);
  background: #fff;
  cursor: pointer;
}

.close {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: 1px solid rgba(220, 212, 207, 0.9);
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  padding: 10px 2px 8px;
}
.w {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(163, 151, 143, 0.95);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  padding: 2px;
}

.cell {
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(239, 231, 226, 1);
  background: #fff;
  position: relative;
  padding: 6px 6px 6px;
}

.cell.empty {
  border: 1px solid transparent;
  background: transparent;
}

.cell.today {
  border-color: rgba(255, 156, 51, 0.55);
  background: rgba(255, 156, 51, 0.08);
}

.day {
  font-size: 12px;
  font-weight: 700;
  color: rgba(17, 17, 17, 0.85);
}

.dots {
  position: absolute;
  left: 6px;
  bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap; /* 오렌지+파랑 같이 있을 때 줄바꿈 허용 */
  max-width: calc(100% - 10px);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
}

/* ✅ 색 분리 */
.dot.orange { background: #ff9c33; } /* 접수중 */
.dot.blue   { background: #4d86ff; } /* 공고일 */

.more {
  font-size: 11px;
  font-weight: 700;
  color: rgba(111, 61, 50, 0.85);
}

.empty-text,
.loading-text {
  padding: 10px 2px 2px;
  text-align: center;
  font-size: 12px;
  color: rgba(163, 151, 143, 0.95);
}

/* 애니메이션 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.22s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.legend {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(220, 212, 207, 0.55);
  display: flex;
  gap: 14px;
  justify-content: center;
  align-items: center;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

/* dots */
.dot.orange {
  background: var(--tothezip-orange-04); /* 접수중 */
}

.dot.blue,
.dot-announce {
  background: var(--tothezip-brown-07);  /* 발표일 */
}

/* legend */
.legend-dot.orange {
  background: var(--tothezip-orange-04);
}

.legend-dot.blue {
  background: var(--tothezip-brown-07);
}


.legend-text {
  font-size: 12px;
  font-weight: 600;
  color: rgba(111, 61, 50, 0.85);
}

.dot-announce {
  background: var(--tothezip-brown-07);
  box-shadow: 0 0 0 2px rgba(111, 70, 46, 0.18);
}
</style>
