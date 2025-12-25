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
  top: calc(100% + 14px);
  right: 0;
  width: 200px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05); /* Softer, deeper shadow */
  padding: 8px;
  z-index: 20000;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transform-origin: top right;
  animation: menuPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes menuPop {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  border-radius: 12px;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-item:hover {
  background: #fff4ed; /* Light warm cream color */
  color: #000;
  transform: translateX(2px);
}

.menu-item.danger {
  color: #ff4d4f;
}

.menu-item.danger:hover {
  background: #fff1f0;
}
</style>
