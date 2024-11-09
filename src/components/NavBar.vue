<template>
  <nav class="shadow-none navbar navbar-main navbar-expand-lg border-radius-xl" data-scroll="true">
    <div class="px-3 py-1 container-fluid">
      <div class="pag-atual">Pagina Atual</div>

      <div class="actions">
        <span role="button" class="mdi mdi-account-circle"></span>
        <span
          @click="toggleSideMenu"
          role="button"
          class="mdi"
          :class="sideNav ? 'mdi-menu-open' : 'mdi-menu'"
        ></span>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavBar",
  components: {},

  data() {
    return {};
  },

  computed() {},

  methods: {
    toggleSideMenu() {
      this.$emit('toggle-sidebar');
    },
  },
};
</script>

<style scoped></style>
