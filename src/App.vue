<template>
  <SideNav v-if="pageName() !== 'Autenticação'" :showSideNav="showSideNav" />
  <main class="main-content position-relative max-height-vh-100 h-100 overflow-x-hidden">
    <NavBar v-if="pageName() !== 'Autenticação'" @toggle-sidebar="toggleSideMenu" />
    <router-view />

    <Help v-if="decodeJwt()" />
  </main>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import SideNav from "@/components/SideNav.vue";
import VueJwtDecode from "vue-jwt-decode";
import Help from "./components/Help.vue";

export default {
  name: "App",
  components: { NavBar, SideNav, Help },
  data() {
    return {
      showSideNav: false,
    };
  },

  mounted() {},

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    toggleSideMenu() {
      this.showSideNav = !this.showSideNav;
    },

    pageName() {
      return this.$route.name;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f0f2f5;
  display: flex;
  overflow: hidden !important;
}

main {
  flex: 1;
  position: relative;
  max-height: 100vh;
  overflow-y: auto;
}
</style>
