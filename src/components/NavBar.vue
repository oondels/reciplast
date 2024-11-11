<template>
  <nav class="shadow-none navbar navbar-main navbar-expand-lg border-radius-xl" data-scroll="true">
    <div class="px-3 py-1 container-fluid">
      <div class="pag-atual">{{pageName()}}</div>

      <div class="actions">
        <span role="button" class="mdi mdi-account-circle fs-3 text-danger mr-3"></span>
        <span
          @click="toggleSideMenu"
          role="button"
          class="fs-3 text-success mdi"
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
    return {sideNav: false};
  },

  computed: {
		
	},

  methods: {
    toggleSideMenu() {
			this.sideNav = !this.sideNav
      this.$emit('toggle-sidebar');
    },

		pageName() {
      return this.$route.name
    }
  },
};
</script>

<style scoped></style>
