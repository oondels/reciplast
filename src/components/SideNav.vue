<template>
  <aside class="side-nav m-2" :class="showSideNav ? 'show' : ''">
    <div class="w-auto">
      <ul class="navbar-nav">
        <router-link class="nav-button" to="/"> <i class="mdi mdi-home"></i>Início</router-link>
        <router-link class="nav-button" to="/dashboard">
          <i class="mdi mdi-apps"></i>Gerenciamento
        </router-link>
        <span class="nav-button"><i role="button" class="mdi mdi-account-circle"></i>Perfil</span>
      </ul>
    </div>
  </aside>
</template>

<script>
export default {
  name: "SideNav",
  components: {},
  props: {
    showSideNav: {
      type: Boolean,
    },
  },

  data() {
    return {};
  },

  computed() {},

  methods: {},
};
</script>

<style scoped>
.side-nav {
  height: 95vh;
  position: fixed;
  left: -250px;
  top: 0;
  max-width: 250px;
  border-radius: 10px;
  background-color: #333;
  transition: left 0.3s;
  padding: 15px;
  z-index: 1000;
}

.side-nav.show {
  left: 0;
}

.nav-button {
  padding: 10px;
  margin: 3px;
  text-decoration: none;
  cursor: pointer;
  transition: 0.2s ease-in all;
  border-radius: 8px;
  color: white;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.nav-button i {
  margin-right: 10px;
  font-size: 20px;
}

@media (min-width: 1000px) {
  .side-nav {
    left: 0;
    position: relative;
    width: 250px;
  }

  .side-nav.show {
    left: 0;
  }
}
</style>
