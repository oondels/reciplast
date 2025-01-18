<template>
  <nav class="shadow-none navbar navbar-main navbar-expand-lg border-radius-xl" data-scroll="true">
    <div class="px-3 py-1 container-fluid">
      <div class="pag-atual">
        <router-link to="/"> Início </router-link> /
        {{ pageName() === "Início" ? "" : pageName() }}
      </div>

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
                <i class="mdi mdi-close-circle fs-3" role="button" @click="isActive.value = false"></i>
              </v-card-title>

              <v-card-text>
                <v-text-field
                  :rules="[required]"
                  label="Usuário/CPF"
                  variant="outlined"
                  color="success"
                  v-model="userCpf"
                  clearable
                ></v-text-field>

                <v-text-field
                  @keyup.enter="login"
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
                  :disabled="!password || !userCpf"
                  class="mb-0 bg-gradient-danger btn-md w-100 null my-4 mb-2"
                  color="success"
                  :loading="loadingLogin"
                >
                  Entrar
                  <template v-slot:loader>
                    <v-progress-circular indeterminate></v-progress-circular>
                  </template>
                </v-btn>

                <div class="forgot d-flex flex-row justify-content-center align-items-center">
                  <p class="m-0 mr-1">Esqueceu a Senha?</p>

                  <v-dialog max-width="400">
                    <template v-slot:activator="{ props: activatorProps }">
                      <span class="m-0 text-danger" role="button" v-bind="activatorProps"> Recuperar </span>
                    </template>

                    <template v-slot:default="{ isActive }">
                      <v-card>
                        <v-card-title
                          class="bg-danger d-flex justify-content-between align-items-center rounded text-white text-center text-bold m-3"
                        >
                          Recuperar Senha
                          <i class="mdi mdi-close-circle fs-3" role="button" @click="isActive.value = false"></i
                        ></v-card-title>

                        <v-card-text>
                          <v-text-field
                            v-model="recoverCpf"
                            required
                            :rules="[required]"
                            variant="outlined"
                            color="success"
                            label="CPF"
                            @update:modelValue="checkRecoverCpf"
                          />

                          <div v-if="loading" class="d-flex justify-content-center">
                            <v-progress-circular indeterminate :size="90" :width="6"></v-progress-circular>
                          </div>

                          <div v-if="validCpf">
                            <v-text-field
                              type="password"
                              v-model="newPassword"
                              required
                              :rules="[required]"
                              variant="outlined"
                              color="success"
                              label="Nova Senha"
                            />
                            <v-text-field
                              type="password"
                              v-model="repeatNewPassword"
                              required
                              :rules="[required]"
                              variant="outlined"
                              color="success"
                              label="Repitir Senha"
                            />
                          </div>

                          <v-btn
                            @click="recoverPassword"
                            :disabled="!validCpf"
                            :loading="loadingNewPassword"
                            block
                            variant="flat"
                            color="danger"
                          >
                            Recuperar

                            <template v-slot:loader>
                              <v-progress-linear indeterminate></v-progress-linear>
                            </template>
                          </v-btn>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
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
                <i class="mdi mdi-close-circle fs-3" role="button" @click="isActive.value = false"></i>
              </v-card-title>

              <v-card-text>
                <p v-if="usuarioLogado" class="text-center fs-5">{{ usuarioLogado.username }}</p>
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
  emits: ["toggle-sidebar"],

  data() {
    return {
      sideNav: false,
      userCpf: null,
      password: null,

      usuarioLogado: null,

      loadingLogin: false,
      loadingNewPassword: false,
      loading: false,
      validCpf: false,
      recoverCpf: null,
      newPassword: null,
      repeatNewPassword: null,
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
        userCpf: this.userCpf,
        password: this.password,
      };

      this.loadingLogin = !this.loadingLogin;
      axios
        .post(`${ip}/auth/login`, data, { withCredentials: true })
        .then((response) => {
          const token = response.data.token;
          sessionStorage.setItem("token", token);

          this.$refs.alert.mostrarAlerta("success", "check_circle", "Sucesso", response.data.message);

          this.loadingLogin = !this.loadingLogin;
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        })
        .catch((error) => {
          this.loadingLogin = !this.loadingLogin;
          console.error("Erro ao fazer login", error);
          this.$refs.alert.mostrarAlerta("warning", "warning", "Erro", error.response.data.message);
        });
    },

    logout() {
      sessionStorage.removeItem("token");
      this.usuarioLogado = null;

      axios
        .post(`${ip}/auth/logout`, {}, { withCredentials: true })
        .then((response) => {
          this.$refs.alert.mostrarAlerta("success", "check_circle", "Sucesso", response.data.message);

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          console.error("Erro ao fazer logout", error);
          this.$refs.alert.mostrarAlerta("warning", "warning", "Erro", error.response.data.message);
        });
    },

    checkRecoverCpf() {
      if (this.recoverCpf.length === 11) {
        this.loading = !this.loading;
        axios
          .post(`${ip}/auth/check-recover-cpf`, {
            cpf: this.recoverCpf,
          })
          .then((response) => {
            this.loading = !this.loading;
            this.validCpf = true;
          })
          .catch((error) => {
            this.loading = !this.loading;
            console.error("Erro ao verificar cpf", error);
            this.$refs.alert.mostrarAlerta("warning", "warning", "Erro", error.response.data.message);
          });
      }
    },

    recoverPassword() {
      if (!this.newPassword || !this.repeatNewPassword || !this.recoverCpf) {
        return this.$refs.alert.mostrarAlerta("warning", "warning", "Erro", "Preencha todos os campos");
      }

      this.loadingNewPassword = !this.loadingNewPassword;
      axios
        .post(`${ip}/auth/recover`, {
          cpf: this.recoverCpf,
          newPassword: this.newPassword,
          repeatNewPassword: this.repeatNewPassword,
        })
        .then((response) => {
          this.loadingNewPassword = !this.loadingNewPassword;
          this.$refs.alert.mostrarAlerta("success", "check_circle", "Sucesso", response.data.message);

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          this.loadingNewPassword = !this.loadingNewPassword;
          console.error("Erro ao recuperar senha", error);
          this.$refs.alert.mostrarAlerta("warning", "warning", "Erro", error.response.data.message);
        });
    },

    required(v) {
      return !!v || "Campo Obrigatório";
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
  color: black;
}
</style>
