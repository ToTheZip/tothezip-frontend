<template>
  <div class="notices-page" :class="{ 'calendar-mode': viewMode === 'calendar' }">
    <div class="content-wrapper">
      <!-- HOT 뉴스 사이드바 -->
      <HotNewsSidebar :hotNews="hotNews" />

      <!-- 메인 공지사항 영역 -->
      <div class="notices-main">
        <!-- 필터 옵션 -->
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

            <!-- ✅ 보기 토글 (목록 / 캘린더) -->
            <div class="view-toggle" aria-label="보기 전환">
              <button
                class="view-btn"
                :class="{ active: viewMode === 'list' }"
                @click="setViewMode('list')"
                title="목록"
                aria-label="목록 보기"
              >
                <!-- list icon -->
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button
                class="view-btn"
                :class="{ active: viewMode === 'calendar' }"
                @click="setViewMode('calendar')"
                title="캘린더"
                aria-label="캘린더 보기"
              >
                <!-- calendar icon -->
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M7 3v3M17 3v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M4 7h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
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
            <div class="calendar-header">
              <button class="cal-nav" @click="moveMonth(-1)" aria-label="이전 달">‹</button>
              <div class="calendar-title">{{ calendarTitle }}</div>
              <button class="cal-nav" @click="moveMonth(1)" aria-label="다음 달">›</button>
            </div>

            <div class="calendar-grid" role="grid" aria-label="청약 일정 캘린더">
              <div class="calendar-weekday" v-for="w in weekdays" :key="w">{{ w }}</div>

              <div
                v-for="d in calendarDays"
                :key="d.ymd"
                class="calendar-day"
                :class="{ out: !d.inMonth, today: d.isToday }"
                role="gridcell"
                @click.self="d.events.length > 2 && openDayModal(d)"
              >
              <div class="day-number">{{ d.day }}</div>

              <div class="day-events">
                <button
                  v-for="ev in d.events.slice(0, 2)"
                  :key="ev._key"
                  class="event-chip"
                  :class="chipClass(ev)"
                  @click="goDetail(ev.id)"
                  :title="ev.title"
                >
                  <span class="chip-tag" :class="ev.kind">{{ ev.kindLabel }}</span>
                  <span class="chip-title">{{ ev.title }}</span>
                </button>

                <button
                  v-if="d.events.length > 2"
                  type="button"
                  class="more-chip"
                  @click="openDayModal(d)"
                  :aria-label="`${d.day}일 일정 더보기`"
                >
                  +{{ d.events.length - 2 }}
                </button>
              </div>
            </div>
          </div>

            <!-- ✅ (3개 이상) 날짜 클릭 모달 -->
            <div v-if="dayModal.open" class="day-modal-overlay" @click.self="closeDayModal">
              <div class="day-modal" role="dialog" aria-modal="true">
                <div class="day-modal-header">
                  <div class="day-modal-title">{{ formatYmd(dayModal.ymd) }}</div>
                  <button class="day-modal-close" @click="closeDayModal" aria-label="닫기">×</button>
                </div>

                <div class="day-modal-list">
                  <button
                    v-for="ev in dayModal.events"
                    :key="ev._key"
                    type="button"
                    class="day-modal-item"
                    @click="goDetail(ev.id)"
                  >
                    <span class="chip-tag" :class="ev.kind">{{ ev.kindLabel }}</span>
                    <span class="day-modal-item-title">{{ ev.title }}</span>
                    <span v-if="ev.kind === 'range'" class="day-modal-item-range">({{ ev.rangeLabel }})</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="calendarLoading" class="calendar-loading">일정을 불러오는 중…</div>
            <div v-else-if="calendarEvents.length === 0" class="calendar-empty">이번 달 청약 일정이 없어요.</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import NewsCard from "@/components/home/NewsCard.vue";
import HotNewsSidebar from "@/components/notices/HotNewsSidebar.vue";

import { fetchNoticeList, fetchNoticeMain, fetchNoticeCalendar } from "@/api/notice";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "NoticesPage",
  components: {
    NewsCard,
    HotNewsSidebar,
  },
  data() {
    return {
      // UI 상태
      selectedFilter: "all",
      currentPage: 1,
      pageSize: 15,

      // 보기 모드
      viewMode: "list", // 'list' | 'calendar'
      calendarCursor: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      calendarLoading: false,
      calendarEvents: [], // { id, title, ymd, kind, kindLabel, rangeLabel, isStart, isEnd, _key }

      // (3개 이상) 날짜 클릭 모달
      dayModal: {
        open: false,
        ymd: "",
        events: [],
      },

      // auth store
      auth: null,

      // 서버 데이터
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
  },

  computed: {
    totalPages() {
      const t = Number(this.totalItems || 0);
      return Math.max(1, Math.ceil(t / this.pageSize));
    },

    // 페이지 버튼 5칸
    visiblePages() {
      const total = this.totalPages;
      const cur = this.currentPage;
      const maxButtons = 5;

      if (total <= maxButtons) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const half = Math.floor(maxButtons / 2);
      let start = cur - half;
      let end = cur + half;

      if (start < 1) {
        start = 1;
        end = start + maxButtons - 1;
      }
      if (end > total) {
        end = total;
        start = end - maxButtons + 1;
      }

      const pages = [];
      for (let p = start; p <= end; p++) pages.push(p);
      return pages;
    },
    weekdays() {
      return ["일", "월", "화", "수", "목", "금", "토"]; // Sunday start
    },

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
      // 같은 날짜 내 정렬: 공고(announce) 먼저, 그 다음 접수기간(range)
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
      const month = cursor.getMonth(); // 0-based

      const first = new Date(year, month, 1);
      const startDow = first.getDay(); // 0=Sun
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
          date: d,
          ymd,
          day: d.getDate(),
          inMonth,
          isToday: ymd === todayYmd,
          events: this.calendarEventMap[ymd] || [],
        });
      }
      return days;
    },
    calendarWeeks() {
      const weeks = [];
      let week = [];

      for (const d of this.calendarDays) {
        week.push(d);
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      return weeks;
    }
  },

  async mounted() {
    await Promise.all([this.loadHot(), this.loadList()]);
  },

  methods: {
    isAuthed() {
      const a = this.auth;
      if (!a) return false;
      if (typeof a.isLoggedIn === "boolean") return a.isLoggedIn;
      if (a.accessToken) return true;
      if (a.user && (a.user.userId || a.user.id)) return true;
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
      // 2025-12-24 / 2025.12.24 / 2025-12-24T00:00:00
      const s1 = s0.split("T")[0].replaceAll(".", "-");
      const m = s1.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!m) return null;
      const y = m[1];
      const mm = String(Number(m[2])).padStart(2, "0");
      const dd = String(Number(m[3])).padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    },

    // YYYY-MM-DD -> YYYY.MM.DD
    formatYmd(ymd) {
      if (!ymd) return "";
      return String(ymd).replaceAll("-", ".");
    },

    // raw 객체에서 후보 키 중 처음 발견되는 값을 반환
    getFirstField(obj, keys) {
      if (!obj) return null;
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") {
          return obj[k];
        }
      }
      return null;
    },

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

    // start~end (inclusive) 펼치기. maxDays로 폭주 방지
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
        // 캘린더는 '청약 일정'만
        if (this.selectedFilter !== "subscription") {
          this.selectedFilter = "subscription";
        }
        await this.loadCalendarEvents();
      } else {
        // 목록으로 돌아오면 현재 필터 기준으로 다시 로딩
        await this.loadList();
      }
    },

    async moveMonth(delta) {
      const y = this.calendarCursor.getFullYear();
      const m = this.calendarCursor.getMonth();
      this.calendarCursor = new Date(y, m + delta, 1);
      await this.loadCalendarEvents();
    },

    // async loadCalendarEvents() {
    //   this.calendarLoading = true;
    //   try {
    //     // subscription 전체를 페이지 단위로 쭉 가져온 뒤, 현재 달만 필터
    //     const typeFilter = "청약";
    //     const cursor = this.calendarCursor;
    //     const y = cursor.getFullYear();
    //     const m = cursor.getMonth();
    //     const monthStart = new Date(y, m, 1);
    //     const monthEnd = new Date(y, m + 1, 0); // last day

    //     const maxPages = 20; // 안전장치
    //     let page = 1;
    //     let totalPages = 1;
    //     const acc = [];

    //     while (page <= totalPages && page <= maxPages) {
    //       const res = await fetchNoticeList({
    //         typeFilter,
    //         sort: "latest",
    //         page,
    //       });

    //       const totalItems = Number(res.totalItems || 0);
    //       totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));

    //       // 캘린더는 날짜 필드(start/end/announcement)를 써야 해서 raw를 유지
    //       const items = res.notices || [];
    //       acc.push(...items);

    //       // 다음 페이지
    //       page += 1;
    //     }

    //     const evs = [];

    //     // 날짜 필드 추정(백엔드 DTO가 camelCase일 확률이 높지만, snake_case도 방어)
    //     const announceKeys = [
    //       "announcementDate",
    //       "announceDate",
    //       "announcement_date",
    //       "registDate",
    //       "regist_date",
    //       "createdAt",
    //       "created_at",
    //       "noticeDate",
    //       "notice_date",
    //       "date",
    //     ];
    //     const startKeys = [
    //       "startDate",
    //       "start_date",
    //       "applyStartDate",
    //       "apply_start_date",
    //       "subscriptionStartDate",
    //       "subscription_start_date",
    //       "receiptStartDate",
    //       "receipt_start_date",
    //     ];
    //     const endKeys = [
    //       "endDate",
    //       "end_date",
    //       "applyEndDate",
    //       "apply_end_date",
    //       "subscriptionEndDate",
    //       "subscription_end_date",
    //       "receiptEndDate",
    //       "receipt_end_date",
    //     ];

    //     for (const x of acc) {
    //       const id = x.noticeId ?? x.id;
    //       const title = x.title ?? "";
    //       // const type = x.type; // 필요하면 분기용으로 사용

    //       const announceYmd = this.parseYmd(this.getFirstField(x, announceKeys));
    //       let startYmd = this.parseYmd(this.getFirstField(x, startKeys));
    //       let endYmd = this.parseYmd(this.getFirstField(x, endKeys));

    //       // 1) 공고일(announcement_date) 이벤트
    //       if (announceYmd && this.isYmdInMonth(announceYmd, monthStart, monthEnd)) {
    //         evs.push({
    //           id,
    //           title,
    //           ymd: announceYmd,
    //           kind: "announce",
    //           kindLabel: "공고",
    //           _key: `${id}-announce-${announceYmd}`,
    //         });
    //       }

    //       // 2) 접수기간(start_date ~ end_date) 이벤트 (범위는 날짜별로 펼쳐서 표시)
    //       if (startYmd && endYmd) {
    //         // start > end 케이스 방어
    //         if (startYmd > endYmd) {
    //           const tmp = startYmd;
    //           startYmd = endYmd;
    //           endYmd = tmp;
    //         }

    //         const range = this.enumerateYmdRange(startYmd, endYmd, 60);
    //         for (const ymd of range) {
    //           if (!this.isYmdInMonth(ymd, monthStart, monthEnd)) continue;
    //           const isStart = ymd === startYmd;
    //           const isEnd = ymd === endYmd;
    //           evs.push({
    //             id,
    //             title,
    //             ymd,
    //             kind: "range",
    //             kindLabel: isStart && isEnd ? "접수" : isStart ? "접수 시작" : isEnd ? "접수 마감" : "접수",
    //             rangeLabel: `${this.formatYmd(startYmd)}~${this.formatYmd(endYmd)}`,
    //             isStart,
    //             isEnd,
    //             isMid: !isStart && !isEnd,
    //             _key: `${id}-range-${ymd}`,
    //           });
    //         }
    //       } else {
    //         // start/end 둘 중 하나만 있으면 단일 '접수'로 표시
    //         const single = startYmd || endYmd;
    //         if (single && this.isYmdInMonth(single, monthStart, monthEnd)) {
    //           evs.push({
    //             id,
    //             title,
    //             ymd: single,
    //             kind: "range",
    //             kindLabel: "접수",
    //             rangeLabel: this.formatYmd(single),
    //             isStart: true,
    //             isEnd: true,
    //             isMid: false,
    //             _key: `${id}-range-${single}`,
    //           });
    //         }
    //       }
    //     }

    //     this.calendarEvents = evs;
    //   } catch (e) {
    //     console.error("캘린더 일정 로딩 실패", e);
    //     this.calendarEvents = [];
    //   } finally {
    //     this.calendarLoading = false;
    //   }
    // },
    async loadCalendarEvents() {
      this.calendarLoading = true;

      try {
        const cursor = this.calendarCursor;
        const year = cursor.getFullYear();
        const month = cursor.getMonth() + 1; // ✅ 1~12

        const res = await fetchNoticeCalendar({ year, month });

        // CalendarListDto 대응
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

          /* 1️⃣ 공고일 (announcement_date) */
          if (announceYmd && this.isYmdInMonth(announceYmd, monthStart, monthEnd)) {
            evs.push({
              id,
              title,
              ymd: announceYmd,
              kind: "announce",
              kindLabel: "발표",
              _key: `ann-${id}-${announceYmd}`,
            });
          }

          /* 2️⃣ 접수기간 (start ~ end) */
          if (startYmd && endYmd) {
            const range = this.enumerateYmdRange(startYmd, endYmd, 62);

            for (const ymd of range) {
              if (!this.isYmdInMonth(ymd, monthStart, monthEnd)) continue;

              const isStart = ymd === startYmd;
              const isEnd = ymd === endYmd;

              evs.push({
                id,
                title,
                ymd,
                kind: "range",
                kindLabel: isStart
                  ? "접수 시작"
                  : isEnd
                  ? "접수 마감"
                  : "접수 중",
                rangeLabel: `${this.formatYmd(startYmd)}~${this.formatYmd(endYmd)}`,
                isStart,
                isEnd,
                isMid: !isStart && !isEnd,
                _key: `rng-${id}-${ymd}`,
              });
            }
          }
        }

        this.calendarEvents = evs;
      } catch (e) {
        console.error("캘린더 일정 로딩 실패", e);
        this.calendarEvents = [];
      } finally {
        this.calendarLoading = false;
      }
    },

    // UI 필터 id -> 백엔드 typeFilter 값 매핑
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
      return {
        id: x.noticeId,
        type: x.type,
        date: this.formatDate(x.registDate),
        title: x.title,
      };
    },

    async loadHot() {
      // HOT = /notice/main?sort=hot
      try {
        const res = await fetchNoticeMain({ typeFilter: "ALL", sort: "hot" });

        // pinned + notices 섞여 내려오면 중복 제거해서 5개만
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
      } catch (e) {
        console.warn("HOT 로딩 실패", e);
        this.hotNews = [];
      }
    },

    async loadList() {
      try {
        const typeFilter = this.toTypeFilter(this.selectedFilter);

        const res = await fetchNoticeList({
          typeFilter,
          sort: "latest",
          page: this.currentPage,
        });

        // totalItems로 totalPages 계산해야 함
        this.totalItems = Number(res.totalItems || 0);

        // 목록은 notices만 그리드에 뿌리자(핫/고정은 사이드바에서 사용)
        this.allNews = (res.notices || []).map(this.mapSummaryToCard);
      } catch (e) {
        console.error("공지 목록 로딩 실패", e);
        this.totalItems = 0;
        this.allNews = [];
      }
    },

    async selectFilter(filterId) {
      if (this.viewMode === "calendar" && filterId !== "subscription") {
        this.viewMode = "list";

        this.selectedFilter = filterId;
        this.currentPage = 1;

        await this.loadList();

        window.scrollTo({ top: 80, behavior: "smooth" });
        return;
      }

      this.selectedFilter = filterId;
      this.currentPage = 1;
      if (this.viewMode === "calendar") {
        await this.loadCalendarEvents();
      } else {
        await this.loadList();
      }

      window.scrollTo({ top: 80, behavior: "smooth" });
    },

    async goPage(page) {
      const p = Number(page);
      if (!Number.isFinite(p)) return;
      if (p < 1 || p > this.totalPages) return;

      this.currentPage = p;
      await this.loadList();

      window.scrollTo({ top: 80, behavior: "smooth" });
    },

    goDetail(id) {
      // ✅ 상세보기는 로그인 필요
      if (!this.isAuthed()) {
        alert("로그인 하여야 접근 가능합니다.");
        this.$router.push("/login");
        return;
      }
      this.$router.push({ name: "NoticeDetail", params: { noticeId: id } });
    },

    getWeekRangeBars(week) {
      const bars = [];

      // 같은 subscriptionId끼리 묶기
      const rangeEvents = this.calendarEvents.filter(e => e.kind === "range");

      const byId = {};
      for (const ev of rangeEvents) {
        if (!byId[ev.id]) byId[ev.id] = [];
        byId[ev.id].push(ev);
      }

      for (const id in byId) {
        const evs = byId[id];

        // 이 주에 걸치는 날짜만
        const inWeek = evs.filter(e =>
          week.some(d => d.ymd === e.ymd)
        );
        if (inWeek.length === 0) continue;

        const cols = inWeek.map(e =>
          week.findIndex(d => d.ymd === e.ymd)
        );

        bars.push({
          id,
          title: inWeek[0].title,
          startCol: Math.min(...cols),
          span: Math.max(...cols) - Math.min(...cols) + 1,
          isStart: inWeek.some(e => e.isStart),
          isEnd: inWeek.some(e => e.isEnd),
        });
      }
      return bars;
    }

  },
};
</script>

<style scoped>
.notices-page {
  min-height: 100vh;
  background-color: #fff;
}

/* 콘텐츠 영역 */
/* .content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 42px 46px;
  display: flex;
  gap: clamp(20px, 3vw, 36px);
  align-items: flex-start;
} */
 .content-wrapper {
  max-width: min(1800px, 96vw);
  margin: 0 auto;
  padding: 36px 32px;
  display: flex;
  gap: 28px;
}


/* 메인 공지사항 영역 */
.notices-main {
  flex: 1;
  min-width: 0;
  max-width: 1280px;
}
 
.notices-page.calendar-mode .notices-main {
  max-width: none;
}

/* 필터 섹션 */
.filter-section {
  margin-bottom: 24px;
}

.filter-tags {
  display: flex;
  gap: 10px;
  padding: 12px 2px;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #dcd4cf;
  background: #fff;
  color: #6f3d32;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: rgba(255, 156, 51, 0.12);
}

.view-btn.active {
  background: #ff9c33;
  border-color: #d37d33;
  color: #fff;
}

.filter-tag {
  min-width: 68px;
  padding: 5px 8px;
  border-radius: 50px;
  border: 1px solid #a3978f;
  background: transparent;
  color: #a3978f;
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tag.active {
  background-color: #ff9c33;
  border-color: #d37d33;
  color: #fff;
}

.filter-tag:hover {
  opacity: 0.8;
}

/* 뉴스 그리드 */
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

/* 캘린더 */
.calendar-wrapper {
  margin-top: 6px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 6px 0 14px;
}

.calendar-title {
  font-family: "Pretendard", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #6f3d32;
}

.cal-nav {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid #dcd4cf;
  background: #fff;
  font-size: 18px;
  color: #6f3d32;
  cursor: pointer;
  transition: all 0.2s;
}

.cal-nav:hover {
  background: rgba(255, 156, 51, 0.12);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.calendar-weekday {
  text-align: center;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #a3978f;
  padding: 6px 0;
}

.calendar-day {
  min-height: 96px;
  border-radius: 18px;
  border: 1px solid #efe7e2;
  background: #fff;
  padding: 10px 10px 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.calendar-day.out {
  opacity: 0.45;
}

.calendar-day.today {
  border-color: rgba(255, 156, 51, 0.55);
}

.day-number {
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #6f3d32;
  margin-bottom: 6px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-chip {
  width: 100%;
  text-align: left;
  border: 0;
  border-radius: 12px;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 156, 51, 0.14);
  color: #6f3d32;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-chip:hover {
  background: rgba(255, 156, 51, 0.22);
}

.chip-tag {
  flex: 0 0 auto;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
  background: rgba(255, 156, 51, 0.24);
  color: #6f3d32;
}

.chip-tag.announce {
  background: rgba(67, 132, 255, 0.18);
  color: #27407a;
}

.chip-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 공고(announcement_date) */
.event-chip.announce {
  background: rgba(67, 132, 255, 0.12);
  color: #27407a;
}

.event-chip.announce:hover {
  background: rgba(67, 132, 255, 0.2);
}

/* 접수기간(start_date~end_date) */
.event-chip.range {
  background: rgba(255, 156, 51, 0.14);
  color: #6f3d32;
}

/* 기간을 "연결"해 보이는 힌트(좌/우 모서리) */
.event-chip.range.range-start {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.event-chip.range.range-end {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.event-chip.range.range-mid {
  border-radius: 6px;
}

.more-chip {
  border: 0;
  background: transparent;
  text-align: left;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #a3978f;
  padding-left: 2px;
  cursor: pointer;
}

.more-chip:hover {
  text-decoration: underline;
}

/* (3개 이상) 모달 */
.day-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
}

.day-modal {
  width: min(520px, 92vw);
  max-height: 72vh;
  overflow: hidden;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #efe7e2;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.day-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1ebe6;
}

.day-modal-title {
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #6f3d32;
}

.day-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  border: 1px solid #dcd4cf;
  background: #fff;
  color: #6f3d32;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.day-modal-close:hover {
  background: rgba(255, 156, 51, 0.12);
}

.day-modal-list {
  padding: 12px;
  overflow: auto;
  max-height: calc(72vh - 56px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-modal-item {
  width: 100%;
  border: 1px solid #efe7e2;
  border-radius: 14px;
  background: #fff;
  padding: 10px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  cursor: pointer;
}

.day-modal-item:hover {
  background: rgba(255, 156, 51, 0.08);
}

.day-modal-item-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #6f3d32;
}

.day-modal-item-range {
  flex: 0 0 auto;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #a3978f;
  white-space: nowrap;
}

.calendar-loading,
.calendar-empty {
  margin-top: 14px;
  text-align: center;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  color: #a3978f;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 36px;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #dcd4cf;
  background: #fff;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #6f3d32;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 156, 51, 0.12);
}

.page-btn.active {
  background: #ff9c33;
  border-color: #d37d33;
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

/* 반응형 */
@media (max-width: 1100px) {
  .content-wrapper {
    padding: 34px 24px;
  }
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .content-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .notices-main {
    max-width: 100%;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
