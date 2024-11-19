<template>
  <div class="registros-container">
    <h4 class="register-title">Registro de Produção</h4>
    <div class="form">
      <Info
        :infoDescription="'Registro da produção de fardos do produto selecionado (Sacola de Plástico ou Grãos). O registro atualiza automaticamente o estoque do produto final e dos materiais utilizados no processo de fabricação.'"
      />

      <div class="register" v-for="produto in filterProdutos()" :key="produto.id">
        <p class="p-2 alert alert-primary rounded">Produção de {{ produto.nome }}</p>

        <div class="actions">
          <v-select
            v-if="produto.nome === 'Sacola de Plástico' && fardoSacola"
            clearable
            label="Fardo (Kg)"
            :items="fardoSacola"
            v-model="selectedFardoSacola"
          />
          <v-select
            v-if="produto.nome === 'Grão de Plástico Reciplast' && fardoGrao"
            clearable
            label="Fardo (Kg)"
            :items="fardoGrao"
            v-model="selectedFardoGrao"
          />

          <v-btn
            v-if="produto.nome === 'Sacola de Plástico'"
            @click="postProdutoEstoque(produto.id, selectedFardoSacola)"
            prepend-icon="mdi mdi-plus-circle"
            variant="outlined"
            color="primary"
            :loading="loadingProducao"
          >
            Adicionar
            <template v-slot:loader>
              <v-progress-linear indeterminate></v-progress-linear>
            </template>
          </v-btn>

          <v-btn
            v-if="produto.nome === 'Grão de Plástico Reciplast'"
            @click="postProdutoEstoque(produto.id, selectedFardoGrao)"
            prepend-icon="mdi mdi-plus-circle"
            variant="outlined"
            color="primary"
            :loading="loadingProducao"
          >
            Adicionar
            <template v-slot:loader>
              <v-progress-linear indeterminate></v-progress-linear>
            </template>
          </v-btn>
        </div>
      </div>
    </div>

    <v-divider :thickness="3" class="border-opacity-25 spacer" color="success"></v-divider>

    <h4 class="register-title">Pedidos</h4>
    <div class="form">
      <Info
        :infoDescription="'Registro de pedidos concluídos. Nesta seção, é realizado a liberação de produtos vendidos para clientes. É necessário informar o produto, a quantidade vendida (em quilos), o valor do produto por quilo, o cliente e a data da transação.'"
      />

      <v-container>
        <v-card class="mx-auto">
          <p class="m-3 p-2 alert alert-primary rounded">
            Registro de pedidos de produtos. Atualizando também o estoque e consumo de material.
          </p>
          <v-card-text>
            <!-- Seleção do Produto -->
            <v-row>
              <v-col class="m-0">
                <v-select
                  v-model="pedido.produto"
                  label="Selecione o Produto"
                  :items="filterProdutos()"
                  item-title="nome"
                  item-value="id"
                  variant="outlined"
                  clearable
                  required
                ></v-select>
              </v-col>
            </v-row>

            <!-- Campo de Quantidade -->
            <div class="col-12 d-flex flex-row flex-wrap">
              <v-select
                v-if="pedido.produto && pedido.produto === 3"
                class="col-12 col-md-6 mb-2"
                v-model="pedido.quantidade"
                variant="outlined"
                label="Fardo (Kg)"
                :items="fardoGrao"
              ></v-select>

              <v-select
                v-if="pedido.produto && pedido.produto === 4"
                class="col-12 col-md-6 mb-2"
                v-model="pedido.quantidade"
                variant="outlined"
                label="Fardo (Kg)"
                :items="fardoSacola"
              ></v-select>

              <v-text-field
                v-if="pedido.produto"
                class="col-12 col-md-6 mb-2"
                v-model="pedido.valor"
                label="Valor/Kg (R$)"
                type="number"
                variant="outlined"
                required
              ></v-text-field>
            </div>

            <!-- Seleção de Cliente -->
            <v-row>
              <v-col>
                <v-combobox
                  v-if="!newClient"
                  v-model="pedido.cliente"
                  label="Clientes Antigos"
                  :items="clientes"
                  clearable
                  variant="outlined"
                  required
                ></v-combobox>

                <!-- Cliente Novo -->
                <v-checkbox v-model="newClient" label="Novo Cliente?"></v-checkbox>
                <v-text-field
                  v-if="newClient"
                  v-model="pedido.cliente"
                  label="Cliente Novo"
                  clearable
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Data do Pedido -->
            <v-row>
              <v-col>
                <v-text-field
                  v-model="pedido.data"
                  label="Data do Pedido"
                  type="date"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Botão de Registro -->
          <v-card-actions class="justify-center">
            <v-btn @click="postPedido" color="primary" variant="outlined" :loading="loadingPedido">
              Registrar Pedido

              <template v-slot:loader>
                <v-progress-linear indeterminate></v-progress-linear>
              </template>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </div>

    <v-divider :thickness="3" class="border-opacity-25 spacer" color="success"></v-divider>

    <h4 class="register-title">
      <i class="material-icons mr-2 text-success">account_balance_wallet</i>
      Registro Financeiro / Materia Prima
    </h4>
    <div class="form">
      <Info
        :infoDescription="'Registro Financeiro. Nesta seção, é realizado o registro das despesas da empresa. É necessário selecionar a categoria da despesa e informar o valor total gasto. Para despesas relacionadas à matéria-prima, é necessário especificar o valor por quilograma, o material adquirido, a quantidade em quilogramas e o fornecedor.'"
      />

      <div class="register d-flex flex-column justify-content-center align-items-center">
        <p class="m-3 p-2 alert alert-primary rounded">
          Sessão designada para registro das despesas da empresa no decorrer do mês e registro de
          compra de matéria prima.
        </p>

        <div class="col-12 d-flex flex-row flex-wrap">
          <v-combobox
            class="col-12 col-md-6 mb-2"
            v-if="categoriasFinancerio"
            :items="categoriasFinancerio"
            item-value="id"
            item-title="categoria"
            v-model="categoriaFinancerioSelecionada"
            clearable
            label="Selecione uma Opção"
            variant="outlined"
          />

          <v-text-field
            class="col-12 col-md-6 mb-2"
            color="success"
            v-model="valorFinanceiro"
            :disabled="!categoriaFinancerioSelecionada"
            type="number"
            :label="
              categoriaFinancerioSelecionada &&
              categoriaFinancerioSelecionada.categoria === 'Compra de Matéria-prima'
                ? 'Valor por KG'
                : 'Valor'
            "
            variant="outlined"
          />
        </div>

        <div
          class="col-12"
          v-if="
            categoriaFinancerioSelecionada &&
            categoriaFinancerioSelecionada.categoria === 'Compra de Matéria-prima'
          "
        >
          <v-combobox
            v-model="materialPrimaSelecionada"
            clearable
            label="Materia Prima"
            class="mr-2"
            :items="filterMateriaPrima()"
            item-value="id"
            item-title="nome"
            variant="outlined"
          />

          <v-text-field
            v-model="quantidadeKgMateriaPrima"
            variant="outlined"
            class="mr-2"
            label="Quantidade (KG)"
          />

          <v-combobox
            v-if="!newFornecedor"
            v-model="fornecedor"
            :items="fornecedores"
            clearable
            variant="outlined"
            label="Fornecedores Antigos"
          />

          <!-- Fornecedor Novo -->
          <v-checkbox v-model="newFornecedor" label="Novo Fornecedor?"></v-checkbox>
          <v-text-field
            v-if="newFornecedor"
            v-model="fornecedor"
            variant="outlined"
            label="Novo Fornecedor"
          />
        </div>

        <p v-if="categoriaFinancerioSelecionada" class="descricao-financeiro">
          {{ financeiroDescricao[categoriaFinancerioSelecionada] }}
        </p>

        <v-btn
          v-if="
            categoriaFinancerioSelecionada &&
            categoriaFinancerioSelecionada.categoria !== 'Compra de Matéria-prima'
          "
          color="success"
          :disabled="!valorFinanceiro"
          @click="postFinanceiro('despesa-geral')"
          :loading="loadingFinance"
        >
          Registrar

          <template v-slot:loader>
            <v-progress-linear indeterminate></v-progress-linear>
          </template>
        </v-btn>

        <!-- Botão para materia prima -->
        <v-btn
          v-if="
            categoriaFinancerioSelecionada &&
            categoriaFinancerioSelecionada.categoria === 'Compra de Matéria-prima'
          "
          color="success"
          :disabled="
            !valorFinanceiro ||
            !quantidadeKgMateriaPrima ||
            !materialPrimaSelecionada ||
            !fornecedor
          "
          @click="postFinanceiro('materia-prima')"
          :loading="loadingFinance"
        >
          Registrar

          <template v-slot:loader>
            <v-progress-linear indeterminate></v-progress-linear>
          </template>
        </v-btn>
      </div>
    </div>

    <!-- <v-divider :thickness="3" class="border-opacity-25 spacer" color="success"></v-divider> -->
    <!-- <h4 class="register-title">Modificação de Estoque</h4>
    <div class="form">
      <div class="register row justify-content-center align-items-center">
        <div class="col-md-6">
          <v-combobox
            clearable
            v-model="selectedProduto"
            :items="produtosNome"
            label="Produtos"
            class="w-100"
          />
        </div>

        <div class="col-md-6 d-flex justify-content-center align-items-center">
          <div class="w-75">
            <span class="d-block text-center">Estoque atual:</span>
            <v-text-field
              class="mt-2 w-100"
              :disabled="!selectedProduto || !editProduto"
              :label="produtoEstoque[selectedProduto]"
              v-model="newProductStock"
              type="number"
            />
          </div>
          <i
            class="mdi fs-3 ms-2"
            :class="editProduto ? 'mdi-pencil' : 'mdi-playlist-edit'"
            role="button"
            @click="toggleEditProduto"
          ></i>
        </div>

        <v-btn v-if="newProductStock" color="success">Atualizar</v-btn>
      </div>
    </div> -->

    <Footer />
  </div>

  <alert ref="alert"></alert>
</template>

<script>
import Alert from "@/components/Alert.vue";
import Footer from "@/components/Footer.vue";
import Info from "@/components/Info.vue";
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../ip";

export default {
  name: "RegistrosApp",
  components: { Alert, Footer, Info },
  props: {},

  data() {
    return {
      loadingProducao: false,
      fardoSacola: null,
      fardoGrao: null,
      selectedFardoSacola: null,
      selectedFardoGrao: null,

      produtosNome: [],

      produtos: [],
      produtoEstoque: {},
      selectedProduto: null,
      editProduto: false,
      newProductStock: null,

      loadingFinance: false,
      categoriasFinancerio: [],
      financeiroDescricao: {},
      categoriaFinancerioSelecionada: null,
      valorFinanceiro: null,

      materialPrimaSelecionada: null,
      quantidadeKgMateriaPrima: null,
      fornecedor: null,

      clientes: [],
      newClient: false,
      fornecedores: [],
      newFornecedor: false,

      loadingPedido: false,
      pedido: {
        produto: "",
        quantidade: null,
        cliente: "",
        data: "",
        valor: null,
      },
    };
  },

  mounted() {
    this.fecthFardoSacola();
    this.fecthFardoGrao();
    this.fetchProdutos();
    this.fetchCategoriaFinanceiro();

    this.fetchClients();
    this.fetchFornecedores();
  },

  methods: {
    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    fecthFardoSacola() {
      axios
        .get(`${ip}/estoque/fardo-produto/3`, {withCredentials: true})
        .then((response) => {
          this.fardoSacola = response.data[0].producao;
        })
        .catch((error) => {
          console.error("Erro ao consultar fardos: ", error);
        });
    },

    fecthFardoGrao() {
      axios
        .get(`${ip}/estoque/fardo-produto/4`, {withCredentials: true})
        .then((response) => {
          this.fardoGrao = response.data[0].producao;
        })
        .catch((error) => {
          console.error("Erro ao consultar fardos: ", error);
        });
    },

    fetchProdutos() {
      axios
        .get(`${ip}/estoque/get-produtos`, {withCredentials: true})
        .then((response) => {
          this.produtos = response.data;
          response.data.forEach((produto) => {
            this.produtoEstoque[produto.nome] = produto.quantidade;
            this.produtosNome.push(produto.nome);
          });
        })
        .catch((error) => {
          console.error("Erro ao consultar produtos: ", error);
        });
    },

    filterProdutos() {
      return this.produtos.filter((produto) => produto.type === "produto-final");
    },

    filterMateriaPrima() {
      let materiaPrima = [];
      this.produtos.forEach((produto) => {
        if (produto.type === "materia-prima") {
          materiaPrima.push(produto);
        }
      });
      return materiaPrima;
    },

    toggleEditProduto() {
      this.editProduto = !this.editProduto;
    },

    fetchCategoriaFinanceiro() {
      axios
        .get(`${ip}/financeiro/get-categoria`, {withCredentials: true})
        .then((response) => {
          response.data.forEach((categoria) => {
            if (categoria.categoria !== "Vendas") {
              this.categoriasFinancerio.push(categoria);
            }
            this.financeiroDescricao[categoria.categoria] = categoria.descricao;
          });
        })
        .catch((error) => {
          console.error("Erro ao consultar categorias financeiras: ", error);
        });
    },

    postProdutoEstoque(id, quantidade) {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Erro",
          "Você precisa estar logado para continuar!"
        );
      }

      if (!quantidade) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Erro",
          "Selecione um fardo para continuar!"
        );
      }

      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 3);
      const data = {
        material_id: id,
        quantidade: quantidade,
        unidade: "KG",
        entrada: true,
        saida: false,
        data: currentDate,
        custo_compra: null,
        custo_venda: null,
        fornecedor: "Produção Interna",
        username: this.decodeJwt().username,
        user_id: 1,
      };

      this.loadingProducao = !this.loadingProducao;
      axios
        .post(`${ip}/estoque/post-produto-estoque`, data, {withCredentials: true})
        .then((response) => {
          this.selectedFardoGrao = null;
          this.selectedFardoSacola = null;

          this.loadingProducao = !this.loadingProducao;
          return this.$refs.alert.mostrarAlerta(
            "success",
            "check_circle",
            "Sucesso",
            response.data.message
          );
        })
        .catch((error) => {
          this.loadingProducao = !this.loadingProducao;
          console.error("Erro ao registrar produção: ", error);
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "error",
            "Erro",
            error.response.data.message
          );
        });
    },

    postFinanceiro(categoria) {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Erro",
          "Você precisa estar logado para continuar!"
        );
      }

      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 3);
      let data = {};

      if (categoria === "materia-prima") {
        const valor = this.valorFinanceiro * this.quantidadeKgMateriaPrima;

        data = {
          tipo: "despesa",
          categoria_id: this.categoriaFinancerioSelecionada.id,
          material_id: this.materialPrimaSelecionada.id,
          descricao: this.categoriaFinancerioSelecionada.descricao,
          valor: valor,
          metodo_pagamento: "PIX",
          data: currentDate,
          user_create: this.decodeJwt().username,
          quantidade: this.quantidadeKgMateriaPrima,
          fornecedor: this.fornecedor,
          custo_compra: this.valorFinanceiro,
        };
      }

      if (categoria === "despesa-geral") {
        data = {
          tipo: "despesa",
          categoria_id: this.categoriaFinancerioSelecionada.id,
          descricao: this.categoriaFinancerioSelecionada.descricao,
          valor: this.valorFinanceiro,
          metodo_pagamento: "PIX",
          data: currentDate,
          user_create: this.decodeJwt().username,
        };
      }

      this.loadingFinance = !this.loadingFinance;
      axios
        .post(`${ip}/financeiro/post-financeiro`, data, {withCredentials: true})
        .then((response) => {
          this.categoriaFinancerioSelecionada = null;
          this.valorFinanceiro = null;
          this.materialPrimaSelecionada = null;
          this.quantidadeKgMateriaPrima = null;
          this.fornecedor = null;

          this.loadingFinance = !this.loadingFinance;
          return this.$refs.alert.mostrarAlerta(
            "success",
            "check_circle",
            "Sucesso",
            response.data.message
          );
        })
        .catch((error) => {
          this.loadingFinance = !this.loadingFinance;
          console.error("Erro ao registrar financeiro: ", error);
          this.refs.alert.mostrarAlerta("warning", "error", "Erro", error.response.data.message);
        });
    },

    postPedido() {
      if (!this.decodeJwt()) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Erro",
          "Você precisa estar logado para continuar!"
        );
      }

      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 3);

      let data = {
        material_id: this.pedido.produto,
        quantidade: this.pedido.quantidade,
        unidade: "KG",
        saida: true,
        data: this.pedido.data,
        cliente: this.pedido.cliente,
        username: this.decodeJwt().username,
        valor: this.pedido.valor,
      };

      this.loadingPedido = !this.loadingPedido;
      axios
        .post(`${ip}/pedido/post-pedido`, data, {withCredentials: true})
        .then((response) => {
          this.pedido.produto = "";
          this.pedido.quantidade = null;
          this.pedido.cliente = "";
          this.pedido.data = "";
          this.pedido.valor = null;

          this.loadingPedido = !this.loadingPedido;
          return this.$refs.alert.mostrarAlerta(
            "success",
            "check_circle",
            "Sucesso",
            response.data.message
          );
        })
        .catch((error) => {
          this.loadingPedido = !this.loadingPedido;
          console.error("Erro ao registrar pedido: ", error);
          return this.$refs.alert.mostrarAlerta(
            "warning",
            "error",
            "Erro",
            error.response.data.message
          );
        });
    },

    fetchClients() {
      axios
        .get(`${ip}/pedido/get-clients`, {withCredentials: true})
        .then((response) => {
          response.data.forEach((cliente) => {
            this.clientes.push(cliente.cliente);
          });
        })
        .catch((error) => {
          console.error("Erro ao consultar clientes: ", error);
        });
    },

    fetchFornecedores() {
      axios
        .get(`${ip}/estoque/get-fornecedores`, {withCredentials: true})
        .then((response) => {
          response.data.forEach((fornecedor) => {
            this.fornecedores.push(fornecedor.fornecedor);
          });
        })
        .catch((error) => {
          console.error("Erro ao consultar fornecedores: ", error);
        });
    },
  },
};
</script>

<style scoped>
.registros-container {
  min-height: 100vh;
}

.form {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  width: 100%;
  margin-bottom: 20px;
}

.register {
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  min-height: 150px;
  margin-right: 20px;
  margin-left: 20px;
}

.register-title {
  font-size: 1.8em;
  color: #2f4f2f;
  text-align: center;
  margin: 20px 0;
  font-weight: bold;
  position: relative;
}

@media screen and (max-width: 768px) {
  .register-title {
    font-size: 1.5em;
  }
}

@media screen and (max-width: 600px) {
  .register-title {
    font-size: 1.2em;
  }
}

@media (max-width: 390px) {
  .v-text-field {
    width: 100% !important;
  }
}

.register-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  background-color: #66bb6a;
  margin: 8px auto 0;
  border-radius: 5px;
}

.spacer {
  margin-bottom: 30px;
  margin-top: 30px;
}
</style>
