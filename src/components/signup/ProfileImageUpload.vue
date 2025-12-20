<template>
  <div class="profile-image-group">
    <div class="profile-image-wrapper">
      <!-- 미리보기 -->
      <img
        v-if="previewUrl"
        class="profile-image-preview"
        :src="previewUrl"
        alt="프로필 미리보기"
        draggable="false"
      />
      <div v-else class="profile-image-input"></div>

      <!-- 숨겨진 file input -->
      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept="image/*"
        @change="onChange"
      />

      <div class="profile-image-camera" @click="openPicker" role="button">
        <!-- 아이콘 동일 -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
            stroke="var(--tothezip-beige-07)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z"
            stroke="var(--tothezip-beige-07)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfileImageUpload",
  props: {
    previewUrl: { type: String, default: "" },
  },
  emits: ["file-selected"],
  methods: {
    openPicker() {
      this.$refs.fileInput?.click();
    },
    onChange(e) {
      const file = e.target.files?.[0];
      if (!file) return;

      // 간단 검증 - 백에서도 검증하긴 함
      const maxMb = 5;
      if (file.size > maxMb * 1024 * 1024) {
        alert(`이미지는 최대 ${maxMb}MB까지 업로드 가능합니다.`);
        e.target.value = "";
        return;
      }

      const url = URL.createObjectURL(file);
      this.$emit("file-selected", { file, previewUrl: url });
    },
  },
};
</script>

<style scoped>
.profile-image-group {
  display: flex;
  justify-content: center;
  margin-bottom: 0;
}

.profile-image-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  flex: 0 0 auto;
}

.profile-image-input {
  width: 80px;
  height: 80px;
  background: var(--tothezip-cream-02);
  border: 1px solid var(--tothezip-beige-02);
  border-radius: 50px;
}

.profile-image-preview {
  width: 80px;
  height: 80px;
  border-radius: 50px;
  object-fit: cover;
  border: 1px solid var(--tothezip-beige-02);
  display: block;
}

.file-input {
  display: none;
}

.profile-image-camera {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  background: rgba(44, 27, 0, 0.17);
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.profile-image-camera:hover {
  background: rgba(44, 27, 0, 0.25);
}
</style>
