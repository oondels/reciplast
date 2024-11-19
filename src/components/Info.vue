<template>
  <v-dialog  max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <i
        role="button"
        v-bind="activatorProps"
        class="info-button mdi mdi-help-circle-outline text-warning fs-3"
      ></i>
    </template>

    <template  v-slot:default="{ isActive }">
      <v-card class="bg-success" title="Ajuda">
        <v-card-text>
          <p>
            {{ infoDescription }}
          </p>
        </v-card-text>

        <v-card-actions>
					
          <v-spacer></v-spacer>
					
          <v-btn
            text="Fechar"
            variant="outlined"
            color="danger"
						class="text-white"
            @click="isActive.value = false"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
export default {
  name: "InfoComponent",
  components: {},
  props: {
    infoDescription: {
      type: String,
      required: true,
    },
  },

  data() {
    return {};
  },
};
</script>

<style scoped>
.info-button {
	position: absolute;
	right: 0;
	top: -10%;
}
</style>
