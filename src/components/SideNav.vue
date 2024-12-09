<template>
  <aside class="side-nav m-2" :class="showSideNav ? 'show' : ''">
    <router-link to="/">
      <img class="mw-100" src="logo.png" alt="logo reciplast" />
    </router-link>

    <div class="w-auto">
      <ul class="navbar-nav">
        <router-link class="nav-button" to="/" active-class="active">
          <i class="mdi mdi-home"></i>Início
        </router-link>

        <router-link
          v-if="decodeJwt() && decodeJwt().admin"
          class="nav-button"
          to="/dashboard"
          active-class="active"
        >
          <i class="mdi mdi-view-dashboard"></i>Gerenciamento
        </router-link>

        <router-link class="nav-button" to="/registros" active-class="active">
          <i class="mdi mdi-chart-bar"></i>Registros
        </router-link>

        <!-- <span class="nav-button" :class="{ active: isActive('/profile') }">
          <i role="button" class="mdi mdi-account-circle"></i>Perfil
        </span> -->
      </ul>
    </div>
  </aside>
</template>

<script>
import VueJwtDecode from "vue-jwt-decode";

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

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    isActive(route) {
      return this.$route.path === route;
    },
  },
};
</script>

<style scoped>
.active {
  background-color: #42b983 !important;
}

.side-nav {
  height: 95vh;
  position: fixed;
  left: -280px;
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
  background-color: rgba(92, 255, 146, 0.5);
}

.nav-button i {
  margin-right: 10px;
  font-size: 20px;
}

@media (min-width: 1200px) {
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
