<template>
  <transition name="slide-down">
    <section v-if="ui.showFavoriteCalendar" class="fav-calendar">
        <div class="calendar-header">
            <h3>📌 찜한 청약 일정</h3>
            <button @click="ui.closeFavoriteCalendar">닫기</button>
        </div>

        <ul class="fav-list">
            <li
            v-for="ev in events"
            :key="ev.noticeId"
            class="fav-item"
            @click="goDetail(ev.noticeId)"
            >
            <div class="title">{{ ev.name }}</div>
            <div class="date">
                {{ ev.startDate }} ~ {{ ev.endDate }}
            </div>
            </li>

            <li v-if="events.length === 0" class="empty">
            찜한 청약 일정이 없어요.
            </li>
        </ul>
        </section>
  </transition>
</template>

<script setup>
    import { ref, watch } from "vue";
    import { useUIStore } from "@/stores/ui";
    import { useAuthStore } from "@/stores/auth";
    import { fetchNoticeCalendar } from "@/api/notice";
    import { useRouter } from "vue-router";

    const API_BASE = import.meta.env.VITE_API_BASE;

    const router = useRouter();
    const ui = useUIStore();
    const auth = useAuthStore();
    const events = ref([]);

    async function loadFavoriteCalendar() {
    // 로그인 안 됐으면 비우고 종료
    if (!auth.accessToken && !auth.user) {
        events.value = [];
        return;
    }

    const headers = {};
    if (auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`;

    const favRes = await fetch(`${API_BASE}/favorite?type=청약`, {
        method: "GET",
        headers,
        credentials: "include",
    });

    if (!favRes.ok) {
        console.error("favorite fetch failed:", favRes.status);
        events.value = [];
        return;
    }

    // favorites: [noticeId, ...]
    const favIdsRaw = await favRes.json();
    const favIdSet = new Set((favIdsRaw || []).map((x) => Number(x)));

    const now = new Date();
    const res = await fetchNoticeCalendar({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
    });

    const items = res?.items || [];

    events.value = items
    .map((ev) => {
        const nid = Number(ev.noticeId ?? ev.subscriptionId ?? ev.id); // ✅ 여기서 통일
        return {
        ...ev,
        noticeId: nid,                      // ✅ 템플릿/클릭이 이걸 쓰게 됨
        name: ev.name ?? ev.title ?? "",    // ✅ 혹시 title로 오면 표시
        startDate: ev.startDate ?? ev.start ?? "",
        endDate: ev.endDate ?? ev.end ?? "",
        };
    })
    .filter((ev) => Number.isFinite(ev.noticeId) && favIdSet.has(ev.noticeId));
        

    }

    // ✅ “열릴 때마다” 로드
    watch(
    () => ui.showFavoriteCalendar,
    async (open) => {
        if (open) await loadFavoriteCalendar();
    }
    );

    function goDetail(id) {
  const nid = Number(id);
  if (!Number.isFinite(nid)) {
    console.error("goDetail: invalid noticeId", id);
    return;
  }
  ui.closeFavoriteCalendar();
  router.push({ name: "NoticeDetail", params: { noticeId: nid } });
}

</script>


<style scoped>
    .fav-calendar {
    background: #fff;
    border-bottom: 1px solid #efe7e2;
    padding: 20px 32px;
    position: relative;
    z-index: 900; /* header(1000) 바로 아래 */
    }

    .slide-down-enter-active,
    .slide-down-leave-active {
    transition: all 0.35s ease;
    }

    .slide-down-enter-from {
    max-height: 0;
    opacity: 0;
    transform: translateY(-12px);
    }

    .slide-down-enter-to {
    max-height: 900px;
    opacity: 1;
    transform: translateY(0);
    }

    .slide-down-leave-from {
    max-height: 900px;
    opacity: 1;
    }

    .slide-down-leave-to {
    max-height: 0;
    opacity: 0;
    }

    .fav-list {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        }

        .fav-item {
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid #efe7e2;
        background: #fff;
        cursor: pointer;
        transition: background 0.2s;
        }

        .fav-item:hover {
        background: rgba(255, 156, 51, 0.08);
        }

        .fav-item .title {
        font-weight: 700;
        font-size: 14px;
        color: #6f3d32;
        }

        .fav-item .date {
        margin-top: 4px;
        font-size: 12px;
        color: #a3978f;
        }

        .empty {
        text-align: center;
        color: #a3978f;
        padding: 20px 0;
        }


</style>