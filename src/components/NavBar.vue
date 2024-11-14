<template>
  <nav class="shadow-none navbar navbar-main navbar-expand-lg border-radius-xl" data-scroll="true">
    <div class="px-3 py-1 container-fluid">
      <div class="pag-atual">{{ pageName() }}</div>

      <div class="actions">
        <v-dialog max-width="400">
          <template v-slot:activator="{ props: activatorProps }">
            <span
              v-bind="activatorProps"
              role="button"
              class="mdi mdi-account-circle fs-3 mr-3"
              :class="verificaLogin() ? 'text-success' : 'text-danger'"
            ></span>
          </template>

          <template v-if="!verificaLogin()" v-slot:default="{ isActive }">
            <v-card>
              <v-card-title
                class="bg-success d-flex justify-content-between align-items-center rounded text-white text-center text-bold m-3"
              >
                Login
                <i
                  class="mdi mdi-close-circle fs-3"
                  role="button"
                  @click="isActive.value = false"
                ></i>
              </v-card-title>

              <v-card-text>
                <v-text-field
                  :rules="[required]"
                  label="Usuário/CPF"
                  variant="outlined"
                  color="success"
                  v-model="user"
                  clearable
                ></v-text-field>

                <v-text-field
                  :rules="[required]"
									type="password"
                  label="Senha"
                  variant="outlined"
                  color="success"
                  v-model="password"
                  clearable
                ></v-text-field>

                <v-btn
                  @click="login"
                  class="mb-0 bg-gradient-danger btn-md w-100 null my-4 mb-2"
                  color="success"
                >
                  Entrar
                </v-btn>

                <div class="forgot d-flex flex-column justify-content-center align-items-center">
                  <p class="m-0">Esqueceu a Senha?</p>
                  <span class="m-0 text-danger" role="button"> Recuperar</span>
                </div>
              </v-card-text>
            </v-card>
          </template>

					<!-- User Logado -->
          <template v-else v-slot:default="{ isActive }">
            <v-card>
              <v-card-title
                class="bg-success d-flex justify-content-between align-items-center rounded text-white text-center text-bold m-3"
              >
                Sessão Atual
                <i
                  class="mdi mdi-close-circle fs-3"
                  role="button"
                  @click="isActive.value = false"
                ></i>
              </v-card-title>

              <v-card-text>
                <h5 v-if="usuarioLogado" class="text-center">{{ usuarioLogado.username }}</h5>
                <v-btn
                  @click="logout"
                  class="mb-0 bg-gradient-danger text-white btn-md w-100 null my-4 mb-2"
                  color="danger"
                >
                  Sair
                </v-btn>
              </v-card-text>
            </v-card>
          </template>
        </v-dialog>

        <span
          @click="toggleSideMenu"
          role="button"
          class="fs-3 text-success mdi"
          :class="sideNav ? 'mdi-menu-open' : 'mdi-menu'"
        ></span>
      </div>
    </div>
  </nav>

  <alert-component ref="alert"></alert-component>
</template>

<script>
import axios from "axios";
import VueJwtDecode from "vue-jwt-decode";
import ip from "../ip";
import AlertComponent from "./Alert.vue";

export default {
  name: "NavBar",
  components: { AlertComponent },

  data() {
    return {
      sideNav: false,
      user: null,
      password: null,

      usuarioLogado: null,
    };
  },

  mounted() {
    this.verificaLogin();
  },

  methods: {
    verificaLogin() {
      let token = sessionStorage.getItem("token");
      if (token) {
        this.usuarioLogado = this.decodeJwt();
        return true;
      } else {
        return false;
      }
    },

    decodeJwt() {
      let token = sessionStorage.getItem("token");
      if (token) {
        return VueJwtDecode.decode(token);
      }
    },

    toggleSideMenu() {
      this.sideNav = !this.sideNav;
      this.$emit("toggle-sidebar");
    },

    pageName() {
      return this.$route.name;
    },

    login() {
      const data = {
        userCpf: this.user,
        password: this.password,
      };

      axios
        .post(`${ip}/auth/login`, data)
        .then((response) => {
          const token = response.data.token;
          sessionStorage.setItem("token", token);

          console.log(response.data);
          this.$refs.alert.mostrarAlerta(
            "success",
            "check_circle",
            "Sucesso",
            response.data.message
          );

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        })
        .catch((error) => {
          console.error("Erro ao fazer login", error);
          this.$refs.alert.mostrarAlerta("warning", "warning", "Erro", error.response.data.message);
        });
    },

    logout() {
      sessionStorage.removeItem("token");
      this.usuarioLogado = null;
      this.$refs.alert.mostrarAlerta(
        "success",
        "check_circle",
        "Sucesso",
        "Logout efetuado com sucesso"
      );

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },

    required(v) {
      return !!v || "Campo Obrigatório";
    },
  },
};
</script>

<style scoped></style>
