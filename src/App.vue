<template>
  <SideNav :showSideNav="showSideNav" />
  <main class="main-content position-relative max-height-vh-100 h-100 overflow-x-hidden">
    <NavBar @toggle-sidebar="toggleSideMenu" />
    <router-view />
  </main>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import SideNav from "@/components/SideNav.vue";

export default {
  name: "App",
  components: { NavBar, SideNav },
  data() {
    return { 
			showSideNav: false,
		};
  },

  methods: {
    toggleSideMenu() {
      this.showSideNav = !this.showSideNav;
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
