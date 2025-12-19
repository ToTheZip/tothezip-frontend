<template>
  <div id="app">
    <SignupPage />
  </div>
</template>

<script>
import SignupPage from "./components/SignupPage.vue";

export default {
  name: "App",
  components: {
    SignupPage,
  },
};
</script>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
