<template>
  <div class="layout">
    <Header />
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script>
import Header from "@/components/common/Header.vue";

export default {
  components: { Header },
};
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.content {
  flex: 1;
  padding-top: 80px; /* Header height */
}
</style>
