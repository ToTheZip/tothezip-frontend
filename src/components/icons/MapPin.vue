<template>
  <svg :width="size" :height="size" viewBox="0 0 12 12" fill="none">
    <path
      d="M6 1.5C4.62 1.5 3.5 2.62 3.5 4C3.5 6 6 8.5 6 8.5C6 8.5 8.5 6 8.5 4C8.5 2.62 7.38 1.5 6 1.5Z"
      :stroke="color"
      stroke-width="1.2"
      stroke-linejoin="round"
      stroke-linecap="round"
      fill="none"
    />
    <circle cx="6" cy="4" r="0.8" :fill="color" />
  </svg>
</template>

<script>
export default {
  name: "MapPin",
  props: {
    size: {
      type: [Number, String],
      default: 12,
    },
    color: {
      type: String,
      default: "#A3978F",
    },
  },
};
</script>
