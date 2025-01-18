<template>
  <div class="dashboard-container">
    <h1 class="text-center space">DashBoard de Gerenciamento</h1>

    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title class="fs-5 text-info">
          <i class="mdi mdi-file-document-outline mr-2"></i> Detalhamento de Indicadores
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div class="card">
            <div class="card-header">Baixar Indicadores</div>
            <div class="card-body">
              <p class="card-text">
                Faça download dos indicadores de produção, estoque e financeiro para análise detalhada.
              </p>

              <div class="container">
                <!-- Opções  e Período -->
                <div class="row">
                  <div class="col-12 col-md-4">
                    <v-combobox
                      clearable
                      label="Categoria"
                      v-model="reportCategory"
                      :items="['Financeiro', 'Produção', 'Estoque', 'Manutencao']"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <v-text-field v-model="reportData.dataInicial" label="Data Inicial" type="date" />
                  </div>
                  <div class="col-12 col-md-4">
                    <v-text-field v-model="reportData.dataFinal" label="Data Final" type="date" />
                  </div>
                </div>

                <!-- Detalhes -->
                <div class="row" v-if="reportCategory">
                  <div
                    v-if="reportDetails[reportCategory] && reportDetails[reportCategory].items"
                    class="col-12 col-md-6"
                  >
                    <v-combobox
                      clearable
                      label="Detalhes"
                      :items="reportDetails[reportCategory].items"
                      v-model="reportData.categoria"
                      :disabled="reportCategory === 'Financeiro' && !!reportData.detalhe"
                    />
                  </div>
                  <div
                    v-if="reportDetails[reportCategory] && reportDetails[reportCategory].details"
                    class="col-12 col-md-6"
                  >
                    <v-combobox
                      clearable
                      label="Detalhes"
                      :disabled="reportCategory === 'Financeiro' && !!reportData.categoria"
                      :items="reportDetails[reportCategory].details"
                      v-model="reportData.detalhe"
                    />
                  </div>
                </div>

                <!-- More Details -->
                <div
                  class="row"
                  v-if="reportDetails[reportCategory] && reportDetails[reportCategory].moreDetails && reportCategory"
                >
                  <div class="col-12">
                    <v-combobox
                      :disabled="reportCategory === 'Produção' && !reportData.detalhe"
                      clearable
                      label="Mais Detalhes"
                      :items="reportDetails[reportCategory].moreDetails"
                      v-model="reportData.moreDetails"
                    />
                  </div>
                </div>

                <!-- Download -->
                <div class="row">
                  <v-btn
                    @click="fetchReportData"
                    variant="flat"
                    color="info"
                    prepend-icon="mdi mdi-download"
                    :disabled="downloadReportConditions()"
                    :loading="loadingReport"
                  >
                    Baixar
                    <template v-slot:loader>
                      <v-progress-linear indeterminate></v-progress-linear>
                    </template>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="charts-container">
      <h3 class="dashboard-title">Produção Mensal</h3>
      <div v-if="producaoMensal && producaoMensal.length" class="min-charts-fardo space">
        <div v-for="producao in producaoMensal" :key="producao.id" class="chart-item">
          <div class="production-card">
            <div class="icon">
              <i class="mdi" :class="materialIcon[producao.nome]"></i>
            </div>

            <div class="details">
              <h3>Produção de {{ producao.nome }}</h3>

              <p class="quantity">{{ producao.fardos }} <span class="label">Fardos Produzidos</span></p>

              <p class="sub-info">Meta: 80 fardos</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="min-charts-fardo space shadow p-3 rounded-lg bg-white">
        <span class="mt-3 d-flex flex-row justify-content-center">
          <i class="mdi mdi-database-off mr-2 fs-5 text-primary"></i>
          <h5>Sem Dados no Sistema...</h5>
        </span>
      </div>

      <h4 class="dashboard-title">Armazenamento Geral</h4>
      <div v-if="estoqueIndividual && estoqueIndividual.length" class="min-charts space">
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
                <div class="min-chart-title d-flex flex-row justify-content-between align-items-center">
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

      <div v-else class="min-charts-fardo space shadow p-3 rounded-lg bg-white">
        <span class="mt-3 d-flex flex-row justify-content-center">
          <i class="mdi mdi-database-off mr-2 fs-5 text-primary"></i>
          <h5>Sem Dados no Sistema...</h5>
        </span>
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

          <div v-if="estoqueGeralOp && estoqueGeralSeries && estoqueGeralOp.xaxis.categories.length > 0">
            <ApexChart :options="estoqueGeralOp" :series="estoqueGeralSeries" :type="'bar'" />
          </div>

          <div v-else>
            <span class="mt-3 d-flex flex-row justify-content-center">
              <i class="mdi mdi-database-off mr-2 fs-5 text-primary"></i>
              <h5>Sem Dados no Sistema...</h5>
            </span>
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
                    generalExpensesData &&
                    generalExpensesData.options &&
                    generalExpensesData.series &&
                    generalExpensesData.series[0] != 0 &&
                    generalExpensesData.series[1] != 0
                  "
                >
                  <ApexCharts
                    max-width="400"
                    :options="generalExpensesData.options"
                    :series="generalExpensesData.series"
                    type="donut"
                  />
                </div>

                <div class="mt-3" v-else>
                  <span class="mt-3 d-flex flex-row justify-content-center">
                    <i class="mdi mdi-database-off mr-2 fs-5 text-primary"></i>
                    <h5>Sem Dados no Sistema...</h5>
                  </span>
                </div>
              </div>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card title="Receita X Despesa - Detalhado">
                <v-card-text>
                  <div
                    v-if="
                      detailedExpensesData && detailedExpensesData.optionsReceita && detailedExpensesData.seriesReceita
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
                  <v-btn text="Fechar" color="danger" variant="outlined" @click="isActive.value = false"></v-btn>
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
                expensesHistoryData &&
                expensesHistoryData.options &&
                expensesHistoryData.result &&
                expensesHistoryData.result.length > 0
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

            <div
              v-else
              class="chart-item chart-item-details d-flex flex-column justify-content-center align-items-center"
            >
              <span class="d-flex flex-row justify-content-center align-items-center">
                <i class="mdi mdi-currency-usd fs-4 text-primary"></i>
                <h4>Despesa X Receita - Por Mês R$</h4>
              </span>

              <span class="mt-3 d-flex flex-row justify-content-center">
                <i class="mdi mdi-database-off mr-2 fs-5 text-primary"></i>
                <h5>Sem Dados no Sistema...</h5>
              </span>
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
                  v-if="detailedSellHistoryData && detailedSellHistoryData.options && detailedSellHistoryData.series"
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

                <v-btn text="Fechar" variant="outlined" color="danger" @click="isActive.value = false"></v-btn>
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

          <div v-if="productionHistoryData && productionHistoryData.series && productionHistoryData.series.length">
            <ApexChart type="bar" :options="productionHistoryData.options" :series="productionHistoryData.series" />
          </div>

          <div class="mt-3" v-else>
            <span class="mt-3 d-flex flex-row justify-content-center">
              <i class="mdi mdi-database-off mr-2 fs-5 text-primary"></i>
              <h5>Sem Dados no Sistema...</h5>
            </span>
          </div>
        </div>

        <div class="chart-item">
          <span class="d-flex flex-row justify-content-between align-items-center">
            <i class="mdi mdi-factory fs-4 text-primary"></i>
            <h4>Sacolas X Grão (Kg)</h4>
          </span>

          <div v-if="productionHistoryData && productionHistoryData.donut && productionHistoryData.donut.series.length">
            <ApexChart
              type="donut"
              :options="productionHistoryData.donut.options"
              :series="productionHistoryData.donut.series"
            />
          </div>

          <div class="mt-3" v-else>
            <span class="mt-3 d-flex flex-row justify-content-center">
              <i class="mdi mdi-database-off mr-2 fs-5 text-primary"></i>
              <h5>Sem Dados no Sistema...</h5>
            </span>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>

  <alert ref="alert" />
</template>

<script>
import Alert from "@/components/Alert.vue";
import ApexChart from "@/components/ApexChart.vue";
import Footer from "@/components/Footer.vue";
import axios from "axios";
import ApexCharts from "vue3-apexcharts";
import ip from "../ip";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default {
  name: "DashBoard",
  components: { ApexChart, ApexCharts, Footer, Alert },

  data() {
    return {
      estoqueGeralOp: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: [],
        },
      },
      estoqueGeralSeries: [
        {
          name: "Sales",
          data: [],
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

      reportDetails: {
        Financeiro: {
          items: [
            "Todos",
            "Vendas",
            "Compra de Matéria-prima",
            "Salários",
            "Energia Elétrica",
            "Manutenção",
            "Impostos",
          ],
          details: ["Receita", "Despesa"],
          moreDetails: ["Metodo Pagamento"],
        },
        Produção: {
          items: ["Todos", "Sacolas", "Grãos"],
          details: ["Produção", "Venda"],
          moreDetails: ["Fardo", "Cliente"],
        },
        Estoque: {
          items: ["Todos", "Plástico", "Sacola de Plástico", "Grãos"],
          details: ["Entrada", "Saida"],
          moreDetails: ["Fornecedor"],
        },
        Manutencao: {
          items: null,
          details: null,
          moreDetails: null,
        },
      },
      reportCategory: "",
      reportData: {
        dataInicial: null,
        dataFinal: null,
        categoria: "",
        detalhe: "",
        moreDetails: "",
      },
      loadingReport: false,
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
        .get(`${ip}/chart/estoqueGeral-chart-data`, { withCredentials: true })
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
        .get(`${ip}/chart/estoqueIndividual-chart-data`, { withCredentials: true })
        .then((response) => {
          this.estoqueIndividual = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados gerais do estoque: ", error);
        });
    },

    getProducaoFardo() {
      axios
        .get(`${ip}/chart/producao-mensal`, { withCredentials: true })
        .then((response) => {
          this.producaoMensal = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados de produção mensal: ", error);
        });
    },

    stockHistory(material) {
      axios
        .get(`${ip}/chart/stock-history/${material}`, { withCredentials: true })
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
        .get(`${ip}/chart/general-expenses`, { withCredentials: true })
        .then((response) => {
          this.generalExpensesData = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados gerais de despesas: ", error);
        });
    },

    detailedExpenses() {
      axios
        .get(`${ip}/chart/detailed-expenses`, { withCredentials: true })
        .then((response) => {
          this.detailedExpensesData = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados detalhados de despesas: ", error);
        });
    },

    expensesHistory() {
      axios
        .get(`${ip}/chart/expenses-history`, { withCredentials: true })
        .then((response) => {
          this.expensesHistoryData = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados detalhados de despesas: ", error);
        });
    },

    detailedSellHistory() {
      axios
        .get(`${ip}/chart/detailed-sell-history`, { withCredentials: true })
        .then((response) => {
          this.detailedSellHistoryData = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados detalhados de vendas: ", error);
        });
    },

    productionHistory() {
      axios
        .get(`${ip}/chart/production-history`, { withCredentials: true })
        .then((response) => {
          this.productionHistoryData = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar dados de produção: ", error);
        });
    },

    individualQuantidade(material) {
      const estoque = this.estoqueIndividual.find((estoque) => estoque.nome === material);
      return estoque ? estoque : 0;
    },

    downloadReportConditions() {
      return (
        // Verifica se a data foi especificada
        !this.reportData.dataInicial ||
        !this.reportData.dataFinal ||
        // Filtro de Cliente + Produção não retorna nada
        (this.reportData.moreDetails === "Cliente" && this.reportData.detalhe === "Produção") ||
        // Filtro sem especificar tipo de saida retorna dado sem relevância
        // (this.reportCategory && !this.reportData.detalhe) ||
        // Filtro de Fornecedor + Saida não retorna valor relevante
        (this.reportData.moreDetails === "Fornecedor" && this.reportData.detalhe === "Saida")
      );
    },

    fetchReportData() {
      const reportUrl = {
        Financeiro: `${ip}/report/financeiro/`,
        Produção: `${ip}/report/producao/`,
        Estoque: `${ip}/report/estoque/`,
        Manutencao: `${ip}/report/manutencao/`,
      };

      this.loadingReport = !this.loadingReport;
      axios
        .get(reportUrl[this.reportCategory], {
          params: this.reportData,
          withCredentials: true,
        })
        .then((response) => {
          this.downloadReport(response.data);
        })
        .catch((error) => {
          this.loadingReport = !this.loadingReport;
          console.error("Erro ao baixar relatório: ", error);
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "error",
            "Erro",
            "Erro ao fazer download do relatório. Entre em contato com o suporte no botão de ajuda!"
          );
        });
    },

    downloadReport(data) {
      const formateDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      };

      const workBook = XLSX.utils.book_new();

      let workSheetData = [
        ["Relatório de Produção/Estoque/Financeiro"], // Título
        [`Categoria: ${this.reportCategory}`], // Categoria
        [`Período: ${this.reportData.dataInicial} - ${this.reportData.dataFinal}`], // Período
        [], // Linha vazia
      ];

      if (this.reportCategory === "Financeiro") {
        // Adiciona os Titulos das Colunas
        workSheetData.push([
          "Data",
          "Categoria",
          "Valor (R$)",
          "Descrição",
          "Tipo (Receita, Despesa)",
          "Método de Pagamento",
        ]);

        // Adicionar os dados iterados
        data.forEach((item) => {
          workSheetData.push([
            formatDateTime(item.data),
            item.categoria,
            item.valor_total,
            item.descricao,
            item.tipo ? item.tipo : "",
            item.metodo_pagamento ? item.metodo_pagamento : "",
          ]);
        });
      } else if (this.reportCategory === "Estoque") {
        // Informações de Detalhamento
        if (this.reportData.detalhe) {
          workSheetData.push([`Detalhamento para ${this.reportData.detalhe} de materiais`]);
        }
        if (this.reportData.moreDetails) {
          workSheetData.push([`Especificação de Detalhes para ${this.reportData.moreDetails}`]);
        }
        workSheetData.push(["Data", "Produto", "Quantidade (Kg)", "Fornecedor"]);

        data.forEach((item) => {
          workSheetData.push([
            formatDateTime(item.data),
            item.nome,
            item.quantidade,
            item.fornecedor ? item.fornecedor : "",
          ]);
        });
      } else if (this.reportCategory === "Produção") {
        // Informações de Detalhamento
        if (this.reportData.detalhe) {
          workSheetData.push([`Detalhamento para ${this.reportData.detalhe}`]);
        }
        if (this.reportData.moreDetails) {
          workSheetData.push([`Especificação de Detalhes para ${this.reportData.moreDetails}`]);
        }

        workSheetData.push(["Data", "Produto", "Quantidade (Kg)", "Fardos (und)", "Cliente"]);

        data.forEach((item) => {
          workSheetData.push([
            formatDateTime(item.data),
            item.nome,
            item.quantidade,
            item.fardos ? item.fardos : "",
            item.cliente ? item.cliente : "",
          ]);
        });
      } else if (this.reportCategory === "Manutencao") {
        workSheetData.push(["Data", "Categoria", "Descrição", "Serviço", "Valor (R$)"]);

        data.forEach((item) => {
          workSheetData.push([
            formatDateTime(item.data),
            item.categoria,
            item.descricao,
            item.servico_manutencao,
            item.valor,
          ]);
        });
      }

      // Criar a planilha
      const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);

      // Mesclar as células para o título principal
      workSheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Mesclar título
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Mesclar categoria
        { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // Mesclar período
      ];

      // Ajustar largura das colunas
      workSheet["!cols"] = [
        { wch: 15 }, // Largura para Data
        { wch: 25 }, // Largura para Produto
        { wch: 20 }, // Largura para Quantidade
      ];

      // Adicionar a planilha ao workbook
      XLSX.utils.book_append_sheet(workBook, workSheet, "Relatório");

      // Gerar o arquivo Excel
      const xlsxBuffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
      const currentDate = new Date();

      saveAs(
        new Blob([xlsxBuffer], { type: "application/octet-stream" }),
        `Relatório-${this.reportCategory}-${formateDate(currentDate)}.xlsx`
      );

      this.loadingReport = !this.loadingReport;
      this.resetReport();
    },

    resetReport() {
      this.reportCategory = "";
      this.reportData = {
        dataInicial: null,
        dataFinal: null,
        categoria: "",
        detalhe: "",
        moreDetails: "",
      };
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
