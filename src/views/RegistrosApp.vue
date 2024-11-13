<template>
  <div class="registros-container">
    <h4 class="register-title">Registro de Produção</h4>

    <div class="form">
			<!-- Refazer -> Fazer Loop for com os produtos para exibir os form e ficar mais clean -->
      <div class="register" v-if="fardoSacola">
        <p>
          Registrar produção de Sacola de Plástico:
          {{ selectedFardoSacola ? selectedFardoSacola + " Kg" : "Selecione um fardo" }}
        </p>

        <div class="actions">
          <v-select clearable :items="fardoSacola" v-model="selectedFardoSacola">
            Produção Sacola
          </v-select>

          <v-btn prepend-icon="mdi mdi-plus-circle">Adicionar</v-btn>
        </div>
      </div>

      <div class="register" v-if="fardoGrao">
        <p>
          Registrar produção de Grão de Plástico:
          {{ selectedFardoGrao ? selectedFardoGrao + " Kg" : "Selecione um fardo" }}
        </p>

        <div class="actions">
          <v-select clearable :items="fardoGrao" v-model="selectedFardoGrao">
            Produção Sacola
          </v-select>

          <v-btn prepend-icon="mdi mdi-plus-circle">Adicionar</v-btn>
        </div>
      </div>
    </div>

    <v-divider :thickness="3" class="border-opacity-25" color="success"></v-divider>

    <h4 class="register-title">Atualização de Estoque</h4>

    <div class="form">
      <div class="register row justify-content-center align-items-center">
        <!-- Combobox à esquerda -->
        <div class="col-md-6">
          <v-combobox
            clearable
            v-model="selectedProduto"
            :items="produtos"
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
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ip from "../ip";

export default {
  name: "RegistrosApp",
  components: {},
  props: {},

  data() {
    return {
      fardoSacola: null,
      fardoGrao: null,

      selectedFardoSacola: null,
      selectedFardoGrao: null,

      produtos: [],
      produtoEstoque: {},
      selectedProduto: null,
      editProduto: false,
      newProductStock: null,

    };
  },

  mounted() {
    this.fecthFardoSacola();
    this.fecthFardoGrao();
    this.fetchProdutos();
  },

  methods: {
    fecthFardoSacola() {
      axios
        .get(`${ip}/estoque/fardo-produto/3`)
        .then((response) => {
          this.fardoSacola = response.data[0].producao;
        })
        .catch((error) => {
          console.log("Erro ao consultar fardos: ", error);
        });
    },

    fecthFardoGrao() {
      axios
        .get(`${ip}/estoque/fardo-produto/4`)
        .then((response) => {
          this.fardoGrao = response.data[0].producao;
        })
        .catch((error) => {
          console.log("Erro ao consultar fardos: ", error);
        });
    },

    fetchProdutos() {
      axios
        .get(`${ip}/estoque/get-produtos`)
        .then((response) => {
          response.data.forEach((produto) => {
            this.produtos.push(produto.nome);

            this.produtoEstoque[produto.nome] = produto.quantidade;
          });
          console.log(response.data);
        })
        .catch((error) => {
          console.log("Erro ao consultar produtos: ", error);
        });
    },

    toggleEditProduto() {
      this.editProduto = !this.editProduto;
    },

    postProdutoEstoque() {
      // axios
      // .post(`${ip}/estoque/post-produto-estoque`, {
      // 	produto: this.selectedProduto,
      // 	quantidade: this.newProductStock
      // })
    },
  },
};
</script>

<style scoped>
.registros-container {
  height: 100vh;
}

.form {
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
}

.register-title {
  font-size: 2em;
  color: #2f4f2f;
  text-align: center;
  margin: 20px 0;
  font-weight: bold;
  position: relative;
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
</style>
