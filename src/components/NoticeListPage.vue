<template>
  <div class="notices-page" :class="{ 'calendar-mode': viewMode === 'calendar' }">
    <div class="content-wrapper">
      <!-- HOT 뉴스 사이드바 (왼쪽 Sticky) -->
      <aside class="sidebar-area">
        <HotNewsSidebar :hotNews="hotNews" />
      </aside>

      <!-- 메인 공지사항 영역 (오른쪽) -->
      <main class="notices-main">
        <!-- 필터 옵션 & 뷰 토글 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-tags">
              <button
                v-for="filter in filters"
                :key="filter.id"
                :class="['filter-tag', { active: selectedFilter === filter.id }]"
                @click="selectFilter(filter.id)"
              >
                {{ filter.label }}
              </button>
            </div>

            <!-- 보기 토글 (목록 / 캘린더) -->
            <div class="view-toggle" aria-label="보기 전환">
              <button
                class="view-btn"
                :class="{ active: viewMode === 'list' }"
                @click="setViewMode('list')"
                title="목록 보기"
                aria-label="목록 보기"
              >
                <!-- list icon -->
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
              <button
                class="view-btn"
                :class="{ active: viewMode === 'calendar' }"
                @click="setViewMode('calendar')"
                title="캘린더 보기"
                aria-label="캘린더 보기"
              >
                <!-- calendar icon -->
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ✅ 목록 보기 -->
        <template v-if="viewMode === 'list'">
          <div class="news-grid">
            <NewsCard v-for="news in allNews" :key="news.id" :news="news" @click="goDetail(news.id)" />
          </div>

          <!-- 페이지네이션 -->
          <div class="pagination" v-if="totalPages > 1">
            <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">
              ‹
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-btn', { active: currentPage === page }]"
              @click="goPage(page)"
            >
              {{ page }}
            </button>

            <button class="page-btn" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">
              ›
            </button>
          </div>
        </template>

        <!-- ✅ 캘린더 보기 (청약 일정) -->
        <template v-else>
          <div class="calendar-wrapper">
            <!-- 캘린더 헤더 (년월 이동 + 범례 추가) -->
            <div class="calendar-header-row">
              <div class="calendar-nav-group">
                <button class="cal-nav" @click="moveMonth(-1)" aria-label="이전 달">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h2 class="calendar-title">{{ calendarTitle }}</h2>
                <button class="cal-nav" @click="moveMonth(1)" aria-label="다음 달">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>

              <!-- ✅ 범례 (Legend) 추가 -->
              <div class="calendar-legend">
                <div class="legend-item">
                  <span class="legend-dot orange"></span>
                  <span class="legend-label">접수일</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot brown"></span>
                  <span class="legend-label">발표일</span>
                </div>
              </div>
            </div>

            <div class="calendar-grid" role="grid" aria-label="청약 일정 캘린더">
              <div class="calendar-weekday" v-for="(w, i) in weekdays" :key="w" :class="{'sun': i===0, 'sat': i===6}">{{ w }}</div>

              <div
                v-for="d in calendarDays"
                :key="d.ymd"
                class="calendar-day"
                :class="{ out: !d.inMonth, today: d.isToday }"
                role="gridcell"
                @click.self="d.events.length > 2 && openDayModal(d)"
              >
                <div class="day-header">
                  <span class="day-number">{{ d.day }}</span>
                </div>

                <div class="day-events">
                  <button
                    v-for="ev in d.events.slice(0, 3)"
                    :key="ev._key"
                    class="event-chip"
                    :class="chipClass(ev)"
                    @click="goDetail(ev.id)"
                    :title="ev.title"
                  >
                    <span class="chip-dot"></span>
                    <span class="chip-title">{{ ev.title }}</span>
                    <span class="chip-kind-label" v-if="ev.kind === 'announce'">공고</span>
                  </button>

                  <button
                    v-if="d.events.length > 3"
                    type="button"
                    class="more-chip"
                    @click="openDayModal(d)"
                    :aria-label="`${d.day}일 일정 더보기`"
                  >
                    +{{ d.events.length - 3 }}개 더보기
                  </button>
                </div>
              </div>
            </div>

            <!-- 모달 등 나머지 로직 동일 -->
            <div v-if="dayModal.open" class="day-modal-overlay" @click.self="closeDayModal">
              <div class="day-modal" role="dialog" aria-modal="true">
                <div class="day-modal-header">
                  <div class="day-modal-title">{{ formatYmd(dayModal.ymd) }}</div>
                  <button class="day-modal-close" @click="closeDayModal" aria-label="닫기">✕</button>
                </div>

                <div class="day-modal-list">
                  <button
                    v-for="ev in dayModal.events"
                    :key="ev._key"
                    type="button"
                    class="day-modal-item"
                    @click="goDetail(ev.id)"
                  >
                    <span class="modal-chip-tag" :class="ev.kind">{{ ev.kindLabel }}</span>
                    <span class="day-modal-item-title">{{ ev.title }}</span>
                    <span v-if="ev.kind === 'range'" class="day-modal-item-range">{{ ev.rangeLabel }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="calendarLoading" class="calendar-loading">
              <div class="spinner"></div> 일정을 불러오는 중…
            </div>
            <div v-else-if="calendarEvents.length === 0" class="calendar-empty">
              이번 달 청약 일정이 없어요 🥲
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script>
// 기존 스크립트 로직과 동일
import NewsCard from "@/components/home/NewsCard.vue";
import HotNewsSidebar from "@/components/notices/HotNewsSidebar.vue";
import { fetchNoticeList, fetchNoticeMain, fetchNoticeCalendar } from "@/api/notice";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "NoticesPage",
  components: { NewsCard, HotNewsSidebar },
  data() {
    return {
      selectedFilter: "all",
      currentPage: 1,
      pageSize: 15,
      viewMode: "list",
      calendarCursor: new Date(),
      calendarLoading: false,
      calendarEvents: [], 
      dayModal: { open: false, ymd: "", events: [] },
      auth: null,
      totalItems: 0,
      allNews: [],
      hotNews: [],
      filters: [
        { id: "all", label: "전체" },
        { id: "subscription", label: "청약" },
        { id: "news", label: "뉴스" },
      ],
    };
  },
  created() {
    this.auth = useAuthStore();
    const now = new Date();
    this.calendarCursor = new Date(now.getFullYear(), now.getMonth(), 1);
  },
  computed: {
    totalPages() {
      const t = Number(this.totalItems || 0);
      return Math.max(1, Math.ceil(t / this.pageSize));
    },
    visiblePages() {
      const total = this.totalPages;
      const cur = this.currentPage;
      const maxButtons = 5;
      if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
      const half = Math.floor(maxButtons / 2);
      let start = cur - half;
      let end = cur + half;
      if (start < 1) { start = 1; end = start + maxButtons - 1; }
      if (end > total) { end = total; start = end - maxButtons + 1; }
      const pages = [];
      for (let p = start; p <= end; p++) pages.push(p);
      return pages;
    },
    weekdays() { return ["일", "월", "화", "수", "목", "금", "토"]; },
    calendarTitle() {
      const y = this.calendarCursor.getFullYear();
      const m = this.calendarCursor.getMonth() + 1;
      return `${y}.${String(m).padStart(2, "0")}`;
    },
    calendarEventMap() {
      const map = Object.create(null);
      for (const ev of this.calendarEvents) {
        if (!ev?.ymd) continue;
        if (!map[ev.ymd]) map[ev.ymd] = [];
        map[ev.ymd].push(ev);
      }
      const kindRank = { announce: 0, range: 1 };
      for (const k of Object.keys(map)) {
        map[k].sort((a, b) => {
          const ra = kindRank[a.kind] ?? 9;
          const rb = kindRank[b.kind] ?? 9;
          if (ra !== rb) return ra - rb;
          return String(a.title || "").localeCompare(String(b.title || ""), "ko");
        });
      }
      return map;
    },
    calendarDays() {
      const cursor = this.calendarCursor;
      const year = cursor.getFullYear();
      const month = cursor.getMonth(); 
      const first = new Date(year, month, 1);
      const startDow = first.getDay(); 
      const start = new Date(year, month, 1 - startDow);
      const today = new Date();
      const todayYmd = this.toYmd(today);
      const days = [];
      for (let i = 0; i < 42; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const ymd = this.toYmd(d);
        const inMonth = d.getMonth() === month;
        days.push({
          date: d, ymd, day: d.getDate(), inMonth, isToday: ymd === todayYmd,
          events: this.calendarEventMap[ymd] || [],
        });
      }
      return days;
    }
  },
  async mounted() { await Promise.all([this.loadHot(), this.loadList()]); },
  methods: {
    isAuthed() {
      const a = this.auth;
      if (!a) return false;
      if (typeof a.isLoggedIn === "boolean") return a.isLoggedIn;
      if (a.accessToken) return true;
      return false;
    },
    toYmd(dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    },
    parseYmd(dateLike) {
      if (!dateLike) return null;
      const s0 = String(dateLike).trim();
      const s1 = s0.split("T")[0].replaceAll(".", "-");
      const m = s1.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!m) return null;
      const y = m[1];
      const mm = String(Number(m[2])).padStart(2, "0");
      const dd = String(Number(m[3])).padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    },
    formatYmd(ymd) { return String(ymd || "").replaceAll("-", "."); },
    ymdToDate(ymd) {
      const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return null;
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    },
    isYmdInMonth(ymd, monthStart, monthEnd) {
      const d = this.ymdToDate(ymd);
      if (!d) return false;
      return d >= monthStart && d <= monthEnd;
    },
    enumerateYmdRange(startYmd, endYmd, maxDays = 60) {
      const out = [];
      const s = this.ymdToDate(startYmd);
      const e = this.ymdToDate(endYmd);
      if (!s || !e) return out;
      const dir = s <= e ? 1 : -1;
      let cur = new Date(s);
      let guard = 0;
      while (guard < maxDays) {
        out.push(this.toYmd(cur));
        if (this.toYmd(cur) === this.toYmd(e)) break;
        cur.setDate(cur.getDate() + dir);
        guard += 1;
      }
      return out;
    },
    chipClass(ev) {
      if (!ev) return {};
      return {
        announce: ev.kind === "announce",
        range: ev.kind === "range",
        "range-start": !!ev.isStart,
        "range-end": !!ev.isEnd,
        "range-mid": !!ev.isMid,
      };
    },
    openDayModal(dayObj) {
      if (!dayObj || !dayObj.ymd) return;
      this.dayModal.open = true;
      this.dayModal.ymd = dayObj.ymd;
      this.dayModal.events = Array.isArray(dayObj.events) ? dayObj.events : [];
    },
    closeDayModal() {
      this.dayModal.open = false;
      this.dayModal.ymd = "";
      this.dayModal.events = [];
    },
    async setViewMode(mode) {
      if (mode === this.viewMode) return;
      this.viewMode = mode;
      if (mode === "calendar") {
        if (this.selectedFilter !== "subscription") this.selectedFilter = "subscription";
        await this.loadCalendarEvents();
      } else {
        await this.loadList();
      }
    },
    async moveMonth(delta) {
      const y = this.calendarCursor.getFullYear();
      const m = this.calendarCursor.getMonth();
      this.calendarCursor = new Date(y, m + delta, 1);
      await this.loadCalendarEvents();
    },
    async loadCalendarEvents() {
      this.calendarLoading = true;
      try {
        const cursor = this.calendarCursor;
        const year = cursor.getFullYear();
        const month = cursor.getMonth() + 1; 
        const res = await fetchNoticeCalendar({ year, month });
        const rows = res?.items || res?.list || [];
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        const evs = [];
        for (const r of rows) {
          const id = r.subscriptionId;
          const title = r.name;
          const announceYmd = this.parseYmd(r.announcementDate);
          const startYmd = this.parseYmd(r.startDate);
          const endYmd = this.parseYmd(r.endDate);
          if (announceYmd && this.isYmdInMonth(announceYmd, monthStart, monthEnd)) {
            evs.push({ id, title, ymd: announceYmd, kind: "announce", kindLabel: "공고", _key: `ann-${id}-${announceYmd}` });
          }
          if (startYmd && endYmd) {
            const range = this.enumerateYmdRange(startYmd, endYmd, 62);
            for (const ymd of range) {
              if (!this.isYmdInMonth(ymd, monthStart, monthEnd)) continue;
              const isStart = ymd === startYmd;
              const isEnd = ymd === endYmd;
              evs.push({ id, title, ymd, kind: "range", kindLabel: isStart ? "시작" : isEnd ? "마감" : "진행", rangeLabel: `${this.formatYmd(startYmd)}~${this.formatYmd(endYmd)}`, isStart, isEnd, isMid: !isStart && !isEnd, _key: `rng-${id}-${ymd}` });
            }
          }
        }
        this.calendarEvents = evs;
      } catch (e) {
        console.error("캘린더 로딩 실패", e);
        this.calendarEvents = [];
      } finally { this.calendarLoading = false; }
    },
    toTypeFilter(filterId) {
      if (filterId === "subscription") return "청약";
      if (filterId === "news") return "뉴스";
      return "ALL";
    },
    formatDate(dateLike) {
      if (!dateLike) return "";
      const s = String(dateLike);
      return s.includes("-") ? s.replaceAll("-", ".") : s;
    },
    mapSummaryToCard(x) {
      return { id: x.noticeId, type: x.type, date: this.formatDate(x.registDate), title: x.title };
    },
    async loadHot() {
      try {
        const res = await fetchNoticeMain({ typeFilter: "ALL", sort: "hot" });
        const merged = [...(res.pinned || []), ...(res.notices || [])];
        const seen = new Set();
        const top5 = [];
        for (const x of merged) {
          if (!x?.noticeId) continue;
          if (seen.has(x.noticeId)) continue;
          seen.add(x.noticeId);
          top5.push(this.mapSummaryToCard(x));
          if (top5.length >= 5) break;
        }
        this.hotNews = top5;
      } catch (e) { console.warn("HOT 로딩 실패", e); this.hotNews = []; }
    },
    async loadList() {
      try {
        const typeFilter = this.toTypeFilter(this.selectedFilter);
        const res = await fetchNoticeList({ typeFilter, sort: "latest", page: this.currentPage });
        this.totalItems = Number(res.totalItems || 0);
        this.allNews = (res.notices || []).map(this.mapSummaryToCard);
      } catch (e) { console.error("공지 로딩 실패", e); this.totalItems = 0; this.allNews = []; }
    },
    async selectFilter(filterId) {
      if (this.viewMode === "calendar" && filterId !== "subscription") {
        this.viewMode = "list";
        this.selectedFilter = filterId;
        this.currentPage = 1;
        await this.loadList();
        return;
      }
      this.selectedFilter = filterId;
      this.currentPage = 1;
      if (this.viewMode === "calendar") await this.loadCalendarEvents();
      else await this.loadList();
    },
    async goPage(page) {
      const p = Number(page);
      if (p < 1 || p > this.totalPages) return;
      this.currentPage = p;
      await this.loadList();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    goDetail(id) {
      if (!this.isAuthed()) { alert("로그인 하여야 접근 가능합니다."); this.$router.push("/login"); return; }
      this.$router.push({ name: "NoticeDetail", params: { noticeId: id } });
    },
  },
};
</script>

<style scoped>
/* ----------- Layout ----------- */
.notices-page {
  min-height: 100vh;
  background-color: var(--tothezip-beige-01);
  color: var(--tothezip-brown-09);
  font-family: "Pretendard", sans-serif;
}
.content-wrapper {
  max-width: 1240px;
  margin: 0 auto;
  padding: 60px 24px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}
.notices-page.calendar-mode .content-wrapper { max-width: 1600px; }
.sidebar-area { width: 280px; flex-shrink: 0; position: sticky; top: 100px; }
.notices-main { flex: 1; min-width: 0; }

/* Filter & Toggle */
.filter-section { margin-bottom: 24px; }
.filter-row { display: flex; justify-content: space-between; align-items: center; }
.filter-tags { display: flex; gap: 8px; }
.filter-tag {
  padding: 8px 16px; border-radius: 99px; border: 1px solid var(--tothezip-beige-04);
  background: var(--tothezip-cream-01); color: var(--tothezip-brown-06);
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.filter-tag:hover { background: var(--tothezip-beige-02); color: var(--tothezip-brown-08); }
.filter-tag.active { background: var(--tothezip-orange-04); border-color: var(--tothezip-orange-04); color: #fff; }

.view-toggle {
  display: flex; gap: 6px; background: var(--tothezip-cream-01);
  padding: 4px; border-radius: 12px; border: 1px solid var(--tothezip-beige-03);
}
.view-btn {
  width: 36px; height: 36px; border-radius: 8px; border: none; background: transparent;
  color: var(--tothezip-brown-04); cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: all 0.2s;
}
.view-btn:hover { background: var(--tothezip-beige-02); color: var(--tothezip-brown-06); }
.view-btn.active { background: #fff; color: var(--tothezip-orange-04); box-shadow: 0 2px 6px rgba(0,0,0,0.05); font-weight: bold; }

/* News Grid */
.news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.pagination { display: flex; justify-content: center; gap: 8px; margin-top: 40px; }
.page-btn {
  width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--tothezip-beige-03);
  background: var(--tothezip-cream-01); color: var(--tothezip-brown-06);
  font-size: 14px; cursor: pointer; transition: all 0.2s;
}
.page-btn:hover:not(:disabled) { border-color: var(--tothezip-orange-03); color: var(--tothezip-orange-06); }
.page-btn.active { background: var(--tothezip-orange-04); border-color: var(--tothezip-orange-04); color: #fff; }
.page-btn:disabled { opacity: 0.5; cursor: default; }

/* ----------- Calendar ----------- */
.calendar-wrapper {
  background: var(--tothezip-cream-01);
  border: 1px solid var(--tothezip-beige-03);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(75, 29, 28, 0.04);
}

/* Header Row (Nav + Legend) */
.calendar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.calendar-nav-group {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
}

.calendar-title {
  font-size: 22px; font-weight: 800; color: var(--tothezip-brown-09); margin: 0;
}

.cal-nav {
  width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--tothezip-beige-03);
  background: #fff; color: var(--tothezip-brown-06); display: flex;
  align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
}
.cal-nav:hover { background: var(--tothezip-beige-01); border-color: var(--tothezip-brown-04); }

/* Legend */
.calendar-legend {
  margin-left: auto; /* 우측 정렬 */
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 99px;
  border: 1px solid var(--tothezip-beige-02);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.legend-dot.orange { background-color: var(--tothezip-orange-04); }
.legend-dot.brown { background-color: var(--tothezip-brown-06); }

.legend-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--tothezip-brown-07);
}

/* Grid */
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.calendar-weekday { text-align: center; font-weight: 700; color: var(--tothezip-brown-05); font-size: 14px; padding-bottom: 8px; }
.calendar-weekday.sun { color: var(--tothezip-ruby-05); }
.calendar-weekday.sat { color: var(--tothezip-brown-06); }

.calendar-day {
  min-height: 110px; background: #fff; border: 1px solid var(--tothezip-beige-02);
  border-radius: 12px; padding: 8px; display: flex; flex-direction: column;
  gap: 4px; transition: all 0.2s; min-width: 0; overflow: hidden;
}
.calendar-day:hover { border-color: var(--tothezip-beige-04); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.calendar-day.out { background: var(--tothezip-beige-01); opacity: 0.6; }
.calendar-day.today { border: 2px solid var(--tothezip-orange-03); background: #fff8f0; }

.day-header { display: flex; justify-content: flex-end; }
.day-number { font-size: 13px; font-weight: 700; color: var(--tothezip-brown-06); }
.today .day-number { color: var(--tothezip-orange-06); }

/* Chips */
.event-chip {
  width: 100%; border: none; background: transparent; padding: 4px 6px; border-radius: 6px;
  text-align: left; display: flex; align-items: center; gap: 6px; cursor: pointer;
  font-size: 12px; transition: background-color 0.2s; overflow: hidden;
}
.event-chip:hover { background-color: var(--tothezip-beige-02); }

.chip-dot { width: 6px; height: 6px; border-radius: 50%; background-color: var(--tothezip-orange-04); flex-shrink: 0; }
.event-chip.announce .chip-dot { background-color: var(--tothezip-brown-06); }

.chip-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--tothezip-brown-08); font-weight: 500; min-width: 0; }
.chip-kind-label { font-size: 10px; color: #fff; background-color: var(--tothezip-brown-06); padding: 1px 4px; border-radius: 4px; flex-shrink: 0; }
.more-chip { border: none; background: transparent; color: var(--tothezip-brown-04); font-size: 11px; font-weight: 600; text-align: left; padding: 2px 4px; cursor: pointer; }
.more-chip:hover { text-decoration: underline; }

/* Modal etc... */
.day-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.day-modal { width: 100%; max-width: 480px; background: #fff; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); overflow: hidden; }
.day-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--tothezip-beige-01); border-bottom: 1px solid var(--tothezip-beige-03); }
.day-modal-title { font-size: 18px; font-weight: 800; color: var(--tothezip-brown-09); }
.day-modal-close { background: transparent; border: none; font-size: 18px; color: var(--tothezip-brown-05); cursor: pointer; }
.day-modal-list { padding: 16px; display: flex; flex-direction: column; gap: 8px; max-height: 60vh; overflow-y: auto; }
.day-modal-item { width: 100%; text-align: left; background: #fff; border: 1px solid var(--tothezip-beige-03); padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
.day-modal-item:hover { border-color: var(--tothezip-orange-03); background: var(--tothezip-orange-01); }
.modal-chip-tag { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 700; background: var(--tothezip-orange-02); color: var(--tothezip-orange-08); flex-shrink: 0; }
.modal-chip-tag.announce { background: var(--tothezip-brown-02); color: var(--tothezip-brown-08); }
.day-modal-item-title { flex: 1; font-weight: 600; color: var(--tothezip-brown-09); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.day-modal-item-range { font-size: 12px; color: var(--tothezip-brown-05); flex-shrink: 0; }
.calendar-loading, .calendar-empty { text-align: center; padding: 40px; color: var(--tothezip-brown-05); font-size: 14px; }
.spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid var(--tothezip-beige-04); border-top-color: var(--tothezip-orange-04); border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 1024px) {
  .content-wrapper { flex-direction: column; padding: 40px 20px; }
  .sidebar-area { width: 100%; position: static; margin-bottom: 24px; }
  .news-grid { grid-template-columns: repeat(2, 1fr); }
  .notices-page.calendar-mode .content-wrapper { max-width: 100%; }
  /* 모바일에서 헤더 Nav, Legend 배치 조정 */
  .calendar-header-row { flex-direction: column; gap: 12px; }
  .calendar-nav-group { position: static; transform: none; }
  .calendar-legend { margin-left: 0; }
}
@media (max-width: 768px) {
  .news-grid { grid-template-columns: 1fr; }
  .calendar-day { min-height: 80px; }
  .event-chip { padding: 2px 4px; }
  .chip-dot { width: 4px; height: 4px; }
  .chip-title { font-size: 11px; }
}
</style>