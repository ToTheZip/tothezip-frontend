<template>
  <div class="review-item">
    <img
      class="avatar"
      :src="resolveImg(review.profileImg)"
      alt="profile"
      @error="onImgError"
    />
    <div class="review-body">
      <div class="review-top">
        <!-- 편집 중이 아닐 때만 별점 표시 -->
        <div v-if="!isEditing" class="stars">
          <span
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ filled: i <= rating }"
          >
            ★
          </span>
        </div>
        <span v-if="!isEditing" class="date">{{ formattedDate }}</span>
      </div>

      <!-- 편집 모드 -->
      <div v-if="isEditing" class="edit-area">
        <div class="rating-row small">
          <span
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ filled: i <= editRating }"
            @click="editRating = i"
          >
            ★
          </span>
        </div>

        <textarea v-model="editContent" class="content-input" rows="3" />
        <p v-if="editError" class="submit-error">{{ editError }}</p>

        <div class="write-actions">
          <button class="cancel" type="button" @click="$emit('cancel-edit')">
            취소
          </button>
          <button
            class="submit"
            type="button"
            :disabled="editing"
            @click="handleSaveEdit"
          >
            {{ editing ? "저장 중..." : "저장" }}
          </button>
        </div>
      </div>

      <!-- 일반 모드 -->
      <div v-else class="content">{{ review.reviewContent }}</div>

      <!-- 버튼 (내 리뷰이고 편집 중이 아닐 때) -->
      <div v-if="isMine && !isEditing" class="review-actions-row">
        <button class="action-btn" type="button" @click.stop="$emit('edit')">
          편집
        </button>
        <button
          class="action-btn danger"
          type="button"
          @click.stop="$emit('delete')"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import defaultProfile from "@/assets/images/default_profile.png";

export default {
  name: "ReviewItem",
  props: {
    review: {
      type: Object,
      required: true,
    },
    isMine: {
      type: Boolean,
      default: false,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    editing: {
      type: Boolean,
      default: false,
    },
    editError: {
      type: String,
      default: "",
    },
  },
  emits: ["edit", "delete", "save-edit", "cancel-edit"],
  data() {
    return {
      editContent: "",
      editRating: 5,
    };
  },
  computed: {
    rating() {
      return Number(this.review.reviewRating) || 0;
    },
    formattedDate() {
      if (!this.review.reviewDate) return "";
      const d = new Date(this.review.reviewDate);
      return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    },
  },
  watch: {
    isEditing: {
      immediate: true,
      handler(val) {
        if (val) {
          this.editContent = this.review.reviewContent || "";
          this.editRating = this.rating || 5;
        }
      },
    },
  },
  methods: {
    resolveImg(profileImg) {
      return profileImg && profileImg.trim() ? profileImg : defaultProfile;
    },
    onImgError(e) {
      e.target.src = defaultProfile;
    },
    handleSaveEdit() {
      const content = this.editContent.trim();
      if (!content) {
        this.$emit("save-edit", {
          content: "",
          rating: this.editRating,
          error: "내용을 입력해주세요.",
        });
        return;
      }
      if (this.editRating < 1 || this.editRating > 5) {
        this.$emit("save-edit", {
          content,
          rating: this.editRating,
          error: "별점은 1~5점이어야 해요.",
        });
        return;
      }
      this.$emit("save-edit", {
        content,
        rating: this.editRating,
        error: "",
      });
    },
  },
};
</script>

<style scoped>
.review-item {
  display: flex;
  gap: 10px;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 8px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

.review-body {
  flex: 1;
  min-width: 0;
}

.review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.date {
  font-size: 10px;
  font-weight: 500;
  color: var(--tothezip-gray-04);
  white-space: nowrap;
  line-height: 1;
}

.stars {
  display: inline-flex;
  gap: 1px;
  line-height: 1;
}

.star {
  font-size: 14px;
  opacity: 0.25;
  cursor: pointer;
}

.star.filled {
  opacity: 1;
  color: var(--tothezip-ruby-06);
}

.content {
  font-size: 11px;
  margin-top: 4px;
}

.review-actions-row {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.action-btn {
  border: none;
  background: rgba(255, 237, 219, 0.95);
  color: #f08a3c;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn:hover {
  opacity: 0.85;
}

.action-btn.danger {
  background: rgba(255, 230, 230, 0.95);
  color: #d64b4b;
}

.edit-area {
  margin-top: 8px;
}

.rating-row.small {
  display: flex;
  gap: 1px;
  margin-bottom: 8px;
  line-height: 1;
}

.rating-row.small .star {
  font-size: 13px;
}

.content-input {
  width: 100%;
  border: 1px solid var(--tothezip-brown-01);
  border-radius: 8px;
  padding: 6px;
  font-size: 11px;
  box-sizing: border-box;
}

.submit-error {
  margin-top: 6px;
  font-size: 10px;
  color: #d22;
}

.write-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
}

.write-actions .cancel {
  border: 1px solid var(--tothezip-brown-01);
  background: #fff;
  border-radius: 8px;
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

.write-actions .submit {
  background: var(--tothezip-brown-07);
  color: #fff;
  border: none;
  border-radius: 8px;
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}
</style>
