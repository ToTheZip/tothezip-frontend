<template>
  <div class="layout">
    <Header />
    <FavoriteMiniCalendar />
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script>
import Header from "@/components/common/Header.vue";
import FavoriteMiniCalendar from "@/components/calendar/FavoriteMiniCalendar.vue";

export default {
  components: { Header, FavoriteMiniCalendar },
};
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.content {
  height: calc(100vh - 80px);
  margin-top: 80px;
  padding: 0;
  overflow: hidden;
}

.content > * {
  width: 100%;
  height: 100%;
}
</style>
