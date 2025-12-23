<template>
  <teleport to="body">
    <transition name="gallery">
      <div v-if="isOpen" class="gallery-backdrop" @click="$emit('close')">
        <div class="gallery-modal" @click.stop>
          <!-- 닫기 -->
          <button
            class="gallery-close"
            type="button"
            @click="$emit('close')"
            aria-label="닫기"
          >
            ✕
          </button>

          <!-- 좌/우 -->
          <button
            class="gallery-nav left"
            type="button"
            @click.stop="$emit('prev')"
            aria-label="이전 이미지"
          >
            ‹
          </button>

          <img
            class="gallery-image"
            :src="images[currentIndex]"
            :alt="`${altText} ${currentIndex + 1}`"
          />

          <button
            class="gallery-nav right"
            type="button"
            @click.stop="$emit('next')"
            aria-label="다음 이미지"
          >
            ›
          </button>

          <div class="gallery-footer">
            <span class="gallery-count">
              {{ currentIndex + 1 }} / {{ images.length }}
            </span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: "ImageGallery",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    images: {
      type: Array,
      required: true,
    },
    currentIndex: {
      type: Number,
      default: 0,
    },
    altText: {
      type: String,
      default: "image",
    },
  },
  emits: ["close", "prev", "next"],
  watch: {
    isOpen: {
      immediate: true,
      handler(val) {
        if (val) {
          window.addEventListener("keydown", this.onKeydown);
          document.body.style.overflow = "hidden";
        } else {
          window.removeEventListener("keydown", this.onKeydown);
          document.body.style.overflow = "";
        }
      },
    },
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeydown);
    document.body.style.overflow = "";
  },
  methods: {
    onKeydown(e) {
      if (!this.isOpen) return;

      if (e.key === "Escape") this.$emit("close");
      if (e.key === "ArrowLeft") this.$emit("prev");
      if (e.key === "ArrowRight") this.$emit("next");
    },
  },
};
</script>

<style scoped>
.gallery-backdrop {
  position: fixed;
  inset: 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 2147483647;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.gallery-modal {
  position: relative;
  width: min(92vw, 720px);
  height: min(82vh, 520px);
  background: rgba(20, 20, 20, 0.95);
  border-radius: 16px;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.gallery-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  cursor: pointer;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 26px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-nav.left {
  left: 10px;
}

.gallery-nav.right {
  right: 10px;
}

.gallery-footer {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 12px;
}

.gallery-enter-active,
.gallery-leave-active {
  transition: opacity 0.18s ease;
}

.gallery-enter-from,
.gallery-leave-to {
  opacity: 0;
}
</style>
