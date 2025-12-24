<template>
  <section class="profile-menu" @click.stop>
    <button class="menu-item" @click="$emit('editPreference')">
      내 관심 수정
    </button>

    <button class="menu-item" @click="$emit('logout')">로그아웃</button>
  </section>
</template>

<script setup>
defineEmits(["editPreference", "logout", "withdraw"]);
</script>

<style scoped>
.profile-menu {
  position: absolute;
  top: 64px;
  right: 20px;
  width: 180px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  z-index: 20000;
}
.menu-item {
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
}
.menu-item:hover {
  background: #f5f6f7;
}
.menu-item.danger {
  color: #e53935;
}
</style>
