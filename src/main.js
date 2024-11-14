import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import "material-design-icons-iconfont/dist/material-design-icons.css";
import "material-icons/iconfont/filled.css";
import "material-icons/iconfont/material-icons.css";
import "material-icons/iconfont/outlined.css";
import "material-icons/iconfont/round.css";

import '@mdi/font/css/materialdesignicons.css';
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';

import VueApexCharts from "vue3-apexcharts";

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(VueApexCharts);
app.mount('#app')