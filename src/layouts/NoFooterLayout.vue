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
