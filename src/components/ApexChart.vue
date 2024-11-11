<template>
	<ApexCharts  :type="type" :options="options" :series="series"/>
</template>

<script>
import ApexCharts from "vue3-apexcharts";

export default {
  name: "ApexChart",
  components: { ApexCharts },

  props: {
    options: {
      type: Object,
    },

    series: {
      type: Array,
    },

    type: {
      type: String,
    },
  },
};
</script>

<style scoped></style>
