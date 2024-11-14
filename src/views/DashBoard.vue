<template>
  <div class="dashboard-container">
    <h1 class="text-center space">DashBoard de Gerenciamento</h1>

    <div class="charts-container">
      <h3 class="dashboard-title">Produção Mensal</h3>
      <div class="min-charts-fardo space">
        <div v-for="producao in producaoMensal" :key="producao.id" class="chart-item">
          <div class="production-card">
            <div class="icon">
              <i class="mdi" :class="materialIcon[producao.nome]"></i>
            </div>

            <div class="details">
              <h3>Produção de {{ producao.nome }}</h3>

              <p class="quantity">
                {{ producao.fardos }} <span class="label">Fardos Produzidos</span>
              </p>

              <p class="sub-info">Meta: 80 fardos</p>
            </div>
          </div>
        </div>
      </div>

      <h4 class="dashboard-title">Armazenamento Geral</h4>
      <div class="min-charts space">
        <div
          v-for="(material, materialIndex) in estoqueIndividual"
          :key="materialIndex"
          class="chart-item chart-item-details col"
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

      <v-divider :thickness="2" class="border-opacity-25" color="success"></v-divider>

      <h4 class="dashboard-title space">Análise Geral</h4>
      <!-- Estoque e Finance Donut -->
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

        <div role="button" class="chart-item chart-item-details">
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
                    max-width="400"
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
                  <div
                    v-if="
                      detailedExpensesData &&
                      detailedExpensesData.optionsReceita &&
                      detailedExpensesData.seriesReceita
                    "
                  >
                    <h4 class="text-center">Detalhamento de Despesas</h4>
                    <ApexCharts
                      type="donut"
                      :options="detailedExpensesData.optionsDespesa"
                      :series="detailedExpensesData.seriesDespesa"
                    />
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
      </div>

      <!-- Despesa X Receita - Por Mês -->
      <div class="charts">
        <v-dialog max-width="700">
          <template v-slot:activator="{ props: activatorProps }">
            <div
              v-bind="activatorProps"
              role="button"
              @click="detailedSellHistory"
              v-if="
                expensesHistoryData && expensesHistoryData.options && expensesHistoryData.series
              "
              class="chart-item chart-item-details d-flex flex-column justify-content-center align-items-center"
            >
              <span class="d-flex flex-row justify-content-between align-items-center">
                <i class="mdi mdi-currency-usd fs-4 text-primary"></i>
                <h4>Despesa X Receita - Por Mês R$</h4>
              </span>

              <ApexCharts
                type="area"
                class="chart"
                :options="expensesHistoryData.options"
                :series="expensesHistoryData.series"
              />
            </div>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card>
              <!-- Colocar ícone -->
              <v-card-title>
                <span class="d-flex flex-row justify-content-center align-items-center">
                  <i class="mdi mdi-currency-usd fs-2 text-primary"></i>
                  <h4>Vendas de Produtos (R$)</h4>
                </span>
              </v-card-title>
              <v-card-text>
                <div
                  v-if="
                    detailedSellHistoryData &&
                    detailedSellHistoryData.options &&
                    detailedSellHistoryData.series
                  "
                >
                  <ApexCharts
                    type="bar"
                    :options="detailedSellHistoryData.options"
                    :series="detailedSellHistoryData.series"
                  />
                </div>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                  text="Fechar"
                  variant="outlined"
                  color="danger"
                  @click="isActive.value = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </div>

      <!-- Fabricação Sacola e Grão (Kg) -->
      <div class="charts">
        <div class="chart-item">
          <span class="d-flex flex-row justify-content-between align-items-center">
            <i class="mdi mdi-factory fs-4 text-primary"></i>
            <h4>Fabricação de Sacolas e Grão (Kg)</h4>
          </span>

          <div
            v-if="
              productionHistoryData && productionHistoryData.options && productionHistoryData.series
            "
          >
            <ApexChart
              type="bar"
              :options="productionHistoryData.options"
              :series="productionHistoryData.series"
            />
          </div>
        </div>

        <div class="chart-item">
          <span class="d-flex flex-row justify-content-between align-items-center">
            <i class="mdi mdi-factory fs-4 text-primary"></i>
            <h4>Sacolas X Grão (Kg)</h4>
          </span>

          <div v-if="productionHistoryData && productionHistoryData.donut">
            <ApexChart
              type="donut"
              :options="productionHistoryData.donut.options"
              :series="productionHistoryData.donut.series"
            />
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import ApexChart from "@/components/ApexChart.vue";
import Footer from "@/components/Footer.vue";
import axios from "axios";
import ApexCharts from "vue3-apexcharts";
import ip from "../ip";

export default {
  name: "DashBoard",
  components: { ApexChart, ApexCharts, Footer },

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
      expensesHistoryData: null,
      detailedSellHistoryData: null,

      productionHistoryData: null,
      producaoMensal: null,

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
    this.expensesHistory();
    this.productionHistory();
    this.getProducaoFardo();
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

    getProducaoFardo() {
      axios
        .get(`${ip}/chart/producao-mensal`)
        .then((response) => {
          this.producaoMensal = response.data;
          console.log(this.producaoMensal);
        })
        .catch((error) => {
          console.error("Erro ao buscar dados de produção mensal: ", error);
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

    expensesHistory() {
      axios
        .get(`${ip}/chart/expenses-history`)
        .then((response) => {
          this.expensesHistoryData = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados detalhados de despesas: ", error);
        });
    },

    detailedSellHistory() {
      axios
        .get(`${ip}/chart/detailed-sell-history`)
        .then((response) => {
          this.detailedSellHistoryData = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados detalhados de vendas: ", error);
        });
    },

    productionHistory() {
      axios
        .get(`${ip}/chart/production-history`)
        .then((response) => {
          this.productionHistoryData = response.data;
          console.log(this.productionHistoryData);
        })
        .catch((error) => {
          console.error("Erro ao buscar dados de produção: ", error);
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

.dashboard-title {
  font-size: 2em;
  color: #2f4f2f;
  text-align: center;
  margin: 20px 0;
  font-weight: bold;
  position: relative;
}

.dashboard-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  background-color: #66bb6a;
  margin: 8px auto 0;
  border-radius: 5px;
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
  box-shadow: 0 0.5rem 1rem rgba(68, 71, 90, 0.18);
}

.chart-item-details:hover {
  background-color: #ddece5;
  box-shadow: 0 0.5rem 1rem rgba(68, 71, 90, 0.18);
}

.min-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}

.min-charts-fardo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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

.production-card {
  display: flex;
  align-items: center;
  background-color: #f3f4f6;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.icon {
  background-color: #66bb6a;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.details h3 {
  font-size: 1.2em;
  margin: 0;
  color: #374151;
}

.quantity {
  font-size: 1.8em;
  color: #2f855a;
  margin: 5px 0;
}

.label {
  font-size: 0.8em;
  color: #374151;
}

.sub-info {
  font-size: 0.9em;
  color: #6b7280;
}

.chart {
  width: 60%;
  height: 300px;
}

.space {
  margin-bottom: 50px;
}

@media screen and (max-width: 890px) {
  .chart {
    width: 100%;
  }
}
</style>
