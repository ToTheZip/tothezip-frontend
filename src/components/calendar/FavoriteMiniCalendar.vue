<template>
  <transition name="slide-down">
    <section
      v-if="ui.showFavoriteCalendar"
      class="mini-cal"
      ref="panelRef"
      @click.stop
    >
      <!-- Header -->
      <div class="top">
        <h2 class="title"><span class="icon">📅</span> 찜한 청약 일정</h2>

        <button
          class="close-btn"
          @click="ui.closeFavoriteCalendar"
          aria-label="닫기"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Month Navigation -->
      <div class="month-control">
        <button class="nav-btn" @click="prevMonth" aria-label="이전 달">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="month-label">
          {{ viewYear }}.{{ String(viewMonth).padStart(2, "0") }}
        </div>
        <button class="nav-btn" @click="nextMonth" aria-label="다음 달">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Week Header -->
      <div class="week">
        <span
          v-for="(w, i) in weekNames"
          :key="w"
          class="w"
          :class="{ sun: i === 0, sat: i === 6 }"
        >
          {{ w }}
        </span>
      </div>

      <!-- Calendar Grid -->
      <div class="grid">
        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          class="cell"
          :class="{
            'is-empty': !cell.day,
            'is-today': cell.isToday,
          }"
        >
          <div class="day-number">{{ cell.day || "" }}</div>

          <!-- Dots -->
          <div v-if="cell.day && hasAnyDots(cell.key)" class="dots-wrapper">
            <!-- Orange Dots (접수중) -->
            <template v-if="dayEventsMap[cell.key]?.orange?.length">
              <div
                v-for="ev in visibleDots(dayEventsMap[cell.key].orange)"
                :key="'o-' + ev.noticeId + '-' + ev._k"
                class="dot-container"
              >
                <button
                  class="dot orange"
                  @click.stop="goDetail(ev.noticeId)"
                ></button>
                <div class="tooltip">
                  <div class="tooltip-header">
                    <span class="tooltip-badge orange">접수중</span>
                    <span class="tooltip-title">{{ ev.name }}</span>
                  </div>
                  <div class="tooltip-date">
                    <svg
                      class="calendar-icon"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{{
                      formatDateRange(ev.applyStart, ev.applyEnd)
                    }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Blue Dots (발표일) -->
            <template v-if="dayEventsMap[cell.key]?.blue?.length">
              <div
                v-for="ev in visibleDots(dayEventsMap[cell.key].blue)"
                :key="'b-' + ev.noticeId + '-' + ev._k"
                class="dot-container"
              >
                <button
                  class="dot blue"
                  @click.stop="goDetail(ev.noticeId)"
                ></button>
                <div class="tooltip">
                  <div class="tooltip-header">
                    <span class="tooltip-badge blue">발표</span>
                    <span class="tooltip-title">{{ ev.name }}</span>
                  </div>
                  <div class="tooltip-date">
                    <svg
                      class="calendar-icon"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{{ formatSingleDate(ev.publishDate) }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- More Indicator -->
            <div
              v-if="
                (dayEventsMap[cell.key]?.orange?.length || 0) +
                  (dayEventsMap[cell.key]?.blue?.length || 0) >
                MAX_DOTS
              "
              class="more-indicator"
            >
              +
            </div>
          </div>
        </div>
      </div>

      <!-- States -->
      <div v-if="!isLoading && totalEvents === 0" class="empty-state">
        <p>이번 달 찜한 청약 일정이 없어요 🥲</p>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>일정을 불러오고 있어요...</span>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot orange"></span>
          <span class="legend-text">접수일</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot blue"></span>
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
const MAX_DOTS = 4;

const isLoading = ref(false);
const viewDate = ref(new Date());
const rawEvents = ref([]);

const viewYear = computed(() => viewDate.value.getFullYear());
const viewMonth = computed(() => viewDate.value.getMonth() + 1);

function toKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toDate(x) {
  if (!x) return null;
  if (x instanceof Date) return x;
  const s = String(x).slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatSingleDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function formatDateRange(start, end) {
  if (!start || !end) return "";
  const startStr = formatSingleDate(start);
  const endStr = formatSingleDate(end);
  return `${startStr} ~ ${endStr}`;
}

function normalizeEvent(ev) {
  const noticeId = Number(ev.noticeId ?? ev.subscriptionId ?? ev.id);
  const name = ev.name ?? ev.title ?? ev.noticeTitle ?? "";
  const applyStart = toDate(
    ev.startDate ?? ev.applyStartDate ?? ev.start ?? ev.beginDate
  );
  const applyEnd = toDate(
    ev.endDate ?? ev.applyEndDate ?? ev.end ?? ev.finishDate ?? ev.startDate
  );
  const publishDate = toDate(
    ev.registDate ?? ev.publishDate ?? ev.announcementDate ?? ev.noticeDate
  );
  const _k = Math.random().toString(36).slice(2);
  return { noticeId, name, applyStart, applyEnd, publishDate, _k };
}

function eachDayInclusive(start, end, fn) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  for (
    let d = s;
    d <= e;
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  ) {
    fn(d);
  }
}

const dayEventsMap = computed(() => {
  const map = {};
  function ensure(key) {
    if (!map[key]) map[key] = { orange: [], blue: [] };
    return map[key];
  }

  for (const ev of rawEvents.value) {
    if (!Number.isFinite(ev.noticeId)) continue;
    if (ev.applyStart && ev.applyEnd) {
      eachDayInclusive(ev.applyStart, ev.applyEnd, (d) => {
        const key = toKey(d);
        ensure(key).orange.push(ev);
      });
    }
    if (ev.publishDate) {
      const key = toKey(ev.publishDate);
      ensure(key).blue.push(ev);
    }
  }
  return map;
});

function hasAnyDots(key) {
  const x = dayEventsMap.value[key];
  return !!(x && (x.orange?.length || 0) + (x.blue?.length || 0) > 0);
}

const totalEvents = computed(() => rawEvents.value.length);

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
  while (result.length < 35) result.push({ day: null });

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
    const favRes = await fetch(`${API_BASE}/favorite?type=청약`, {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      credentials: "include",
    });
    if (!favRes.ok) {
      rawEvents.value = [];
      return;
    }
    const favIdsRaw = await favRes.json();
    const favSet = new Set((favIdsRaw || []).map((x) => Number(x)));

    const res = await fetchNoticeCalendar({
      year: viewYear.value,
      month: viewMonth.value,
    });
    const items = res?.items || [];
    const normalized = items.map(normalizeEvent);
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

watch(
  () => ui.showFavoriteCalendar,
  (open) => {
    if (open) loadData();
  }
);
watch(
  () => [viewYear.value, viewMonth.value],
  () => {
    if (ui.showFavoriteCalendar) loadData();
  }
);

function onDocClick(e) {
  if (e.target.closest?.('[data-favcal-toggle="1"]')) return;
  const el = panelRef.value;
  if (!el) return;
  if (!el.contains(e.target)) ui.closeFavoriteCalendar();
}

onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<style scoped>
/* ----------- Layout ----------- */
.mini-cal {
  position: fixed;
  top: 90px;
  right: 24px;
  width: 340px;
  background: var(--tothezip-cream-01);
  border: 2px solid var(--tothezip-beige-03);
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(75, 29, 28, 0.12);
  z-index: 9999;
  padding: 20px;
  font-family: "Pretendard", sans-serif;
  color: var(--tothezip-brown-09);
  overflow: visible;
}

/* ----------- Header Area ----------- */
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: var(--tothezip-brown-08);
  display: flex;
  align-items: center;
  gap: 6px;
}

.title .icon {
  font-size: 18px;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--tothezip-brown-04);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: var(--tothezip-beige-02);
  color: var(--tothezip-brown-07);
}

/* ----------- Month Navigation ----------- */
.month-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 18px;
  background-color: var(--tothezip-cream-02);
  padding: 8px;
  border-radius: 12px;
  border: 1px solid var(--tothezip-beige-02);
}

.month-label {
  font-size: 16px;
  font-weight: 800;
  color: var(--tothezip-brown-07);
  letter-spacing: 0.5px;
  width: 80px;
  text-align: center;
}

.nav-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid var(--tothezip-beige-04);
  border-radius: 8px;
  color: var(--tothezip-brown-06);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.nav-btn:hover {
  background: var(--tothezip-orange-01);
  border-color: var(--tothezip-orange-03);
  transform: translateY(-1px);
}

/* ----------- Week Names ----------- */
.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.w {
  font-size: 12px;
  font-weight: 600;
  color: var(--tothezip-gray-04);
  padding: 4px 0;
}

.w.sun {
  color: var(--tothezip-ruby-05);
}
.w.sat {
  color: var(--tothezip-brown-05);
}

/* ----------- Calendar Grid ----------- */
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  overflow: visible;
}

.cell {
  height: 44px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid var(--tothezip-beige-01);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 4px;
  transition: background-color 0.2s;
  overflow: visible;
}

.cell.is-empty {
  background: transparent;
  border: none;
  pointer-events: none;
}

.cell.is-today {
  background: var(--tothezip-orange-01);
  border-color: var(--tothezip-orange-03);
}

.day-number {
  font-size: 11px;
  font-weight: 700;
  color: var(--tothezip-brown-08);
  margin-bottom: 2px;
  padding-left: 2px;
}

/* Dots Styling */
.dots-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-content: flex-start;
  flex: 1;
  overflow: visible;
}

.dot-container {
  position: relative;
  display: inline-block;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  display: block;
}

.dot:hover {
  transform: scale(1.3);
}

.dot.orange {
  background-color: var(--tothezip-orange-04);
}
.dot.blue {
  background-color: var(--tothezip-brown-07);
}

/* 🎨 Beautiful Tooltip */
.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid var(--tothezip-orange-03);
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 8px 24px rgba(227, 93, 55, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  white-space: nowrap;
  z-index: 1000;
  min-width: 200px;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--tothezip-orange-03);
}

.dot-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-4px);
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tooltip-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}

.tooltip-badge.orange {
  background: linear-gradient(
    135deg,
    var(--tothezip-orange-04),
    var(--tothezip-orange-05)
  );
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(227, 93, 55, 0.3);
}

.tooltip-badge.blue {
  background: linear-gradient(
    135deg,
    var(--tothezip-brown-07),
    var(--tothezip-brown-08)
  );
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(75, 29, 28, 0.3);
}

.tooltip-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--tothezip-brown-09);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--tothezip-brown-06);
  padding: 6px 8px;
  background: rgba(244, 236, 231, 0.5);
  border-radius: 6px;
}

.calendar-icon {
  color: var(--tothezip-orange-05);
  flex-shrink: 0;
}

.more-indicator {
  font-size: 9px;
  font-weight: 800;
  color: var(--tothezip-brown-05);
  line-height: 8px;
  margin-left: 1px;
}

/* ----------- Empty & Loading ----------- */
.empty-state,
.loading-state {
  text-align: center;
  padding: 30px 0;
  color: var(--tothezip-gray-04);
  font-size: 13px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid var(--tothezip-beige-02);
  border-top-color: var(--tothezip-orange-04);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ----------- Legend ----------- */
.legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--tothezip-beige-03);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.orange {
  background-color: var(--tothezip-orange-04);
}
.legend-dot.blue {
  background-color: var(--tothezip-brown-07);
}

.legend-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--tothezip-brown-06);
}

/* ----------- Transition ----------- */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}
</style>
