<template>
  <div class="dashboard-container">
    <h1 class="text-center">DashBoard de Gerenciamento</h1>

    <div class="charts-container">
      <div class="min-charts">
        <div
          v-for="(material, materialIndex) in estoqueIndividual"
          :key="materialIndex"
          class="chart-item col"
          role="button"
        >
          <v-dialog max-width="700">
            <template v-slot:activator="{ props: activatorProps }">
              <div
                v-bind="activatorProps"
                @click="
                  detailedStockHistory = null;
                  stockHistory(material.id);
                "
              >
                <div
                  class="min-chart-title d-flex flex-row justify-content-between align-items-center"
                >
                  <i :class="materialIcon[material.nome]"></i>
                  <h5 class="text-center">{{ material.nome }}</h5>
                </div>

                <div class="text-center" v-if="estoqueIndividual">
                  {{ individualQuantidade(material.nome).quantidade }} Kg

                  <span>add grafico crítico</span>
                </div>
              </div>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card :title="material.nome">
                <v-card-text>
                  <div v-if="detailedStockHistory">
                    <ApexChart
                      :options="detailedStockHistory.options"
                      :series="detailedStockHistory.series"
                      type="line"
                    />
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    text="Fechar"
                    color="danger"
                    variant="outlined"
                    @click="
                      isActive.value = false;
                      detailedStockHistory = null;
                    "
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </div>
      </div>

      <div class="charts">
        <!-- Estoque -->
        <div class="chart-item">
          <span class="d-flex flex-row justify-content-between align-items-center">
            <i class="mdi mdi-package-variant fs-4 text-primary"></i>
            <h4>Estoque Geral</h4>
          </span>

          <div v-if="estoqueGeralOp && estoqueGeralSeries">
            <ApexChart :options="estoqueGeralOp" :series="estoqueGeralSeries" :type="'bar'" />
          </div>
        </div>

        <div role="button" class="chart-item">
          <v-dialog max-width="700">
            <template v-slot:activator="{ props: activatorProps }">
              <div v-bind="activatorProps" @click="detailedExpenses">
                <span class="d-flex flex-row justify-content-between align-items-center">
                  <i class="mdi mdi-currency-usd fs-4 text-primary"></i>
                  <h4>Receita X Despesa R$</h4>
                </span>

                <div
                  v-if="
                    generalExpensesData && generalExpensesData.options && generalExpensesData.series
                  "
                >
                  <ApexCharts
                    max-width="500"
                    :options="generalExpensesData.options"
                    :series="generalExpensesData.series"
                    type="donut"
                  />
                </div>
              </div>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card title="Receita X Despesa - Detalhado">
                <v-card-text>
									<div v-if="detailedExpensesData && detailedExpensesData.optionsReceita && detailedExpensesData.seriesReceita">
										<ApexCharts type="donut" :options="detailedExpensesData.optionsDespesa" :series="detailedExpensesData.seriesDespesa" />

									<ApexCharts type="donut" :options="detailedExpensesData.optionsReceita" :series="detailedExpensesData.seriesReceita" />
									</div>
								</v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    text="Fechar"
                    color="danger"
                    variant="outlined"
                    @click="isActive.value = false"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </div>

        <div class="chart-item"></div>
      </div>
    </div>
  </div>
</template>

<script>
import ApexChart from "@/components/ApexChart.vue";
import axios from "axios";
import ApexCharts from "vue3-apexcharts";
import ip from "../ip";

export default {
  name: "DashBoard",
  components: { ApexChart, ApexCharts },

  data() {
    return {
      estoqueGeralOp: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
        },
      },
      estoqueGeralSeries: [
        {
          name: "Sales",
          data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 100, 120, 150],
        },
      ],
      estoqueIndividual: [],
      detailedStockHistory: null,

      generalExpensesData: null,
			detailedExpensesData: null,

      materialIcon: {
        Plástico: "mdi mdi-recycle fs-5",
        "Sacola de Plástico": "mdi mdi-shopping fs-5",
        "Grão de Plástico": "mdi mdi-grain fs-5",
        "Grão de Plástico Reciplast": "mdi mdi-grain fs-5",
      },
    };
  },

  mounted() {
    this.getEstoqueGeral();
    this.getEstoqueIndividual();
    this.generalExpenses();
  },
  methods: {
    getEstoqueGeral() {
      axios
        .get(`${ip}/chart/estoqueGeral-chart-data`)
        .then((response) => {
          this.estoqueGeralOp = response.data.options;
          this.estoqueGeralSeries = response.data.series;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados gerais do estoque: ", error);
        });
    },

    getEstoqueIndividual() {
      axios
        .get(`${ip}/chart/estoqueIndividual-chart-data`)
        .then((response) => {
          this.estoqueIndividual = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados gerais do estoque: ", error);
        });
    },

    stockHistory(material) {
      axios
        .get(`${ip}/chart/stock-history/${material}`)
        .then((response) => {
          if (response.data && response.data.series && response.data.options) {
            this.detailedStockHistory = response.data;
          } else {
            console.error("Dados inesperados recebidos: ", response.data);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar dados individuais dos materiais: ", error);
        });
    },

    generalExpenses() {
      axios
        .get(`${ip}/chart/general-expenses`)
        .then((response) => {
          this.generalExpensesData = response.data;
          console.log(this.generalExpensesData.options);
        })
        .catch((error) => {
          console.error("Erro ao buscar dados gerais de despesas: ", error);
        });
    },

		detailedExpenses() {
			axios
				.get(`${ip}/chart/detailed-expenses`)
				.then((response) => {
					this.detailedExpensesData = response.data;
				})
				.catch((error) => {
					console.error("Erro ao buscar dados detalhados de despesas: ", error);
				});
		},

    individualQuantidade(material) {
      const estoque = this.estoqueIndividual.find((estoque) => estoque.nome === material);
      return estoque ? estoque : 0;
    },
  },
};
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  padding: 10px;
}

.charts-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  width: 100%;
  margin-bottom: 20px;
}

.chart-item {
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  height: auto;
  box-shadow: 0 1rem 1.5rem rgba(68, 71, 90, 0.18);
  transition: all ease-in-out 0.2s;
}

.chart-item:hover {
  background-color: #dbff7d;
  box-shadow: 0 1rem 1.5rem rgba(68, 71, 90, 0.18);
}

.min-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}

.min-chart-title h5 {
  font-size: 18px;
}

.min-chart-title i {
  padding: 5px 9px;
  border-radius: 50%;
  background-color: #5fdaa2;
}
</style>
