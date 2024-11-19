<template>
  <div class="login-container d-flex align-items-center">
    <v-card
      class="login-form bg-light rounded-4 shadow p-4 d-flex flex-column justify-content-center align-items-center row col-12 flex-wrap"
    >
      <v-card-title
        class="bg-success d-flex justify-content-between align-items-center rounded text-white text-center text-bold mb-3"
      >
        Login
        <span class="mdi mdi-account-circle fs-3 mr-3"></span>
      </v-card-title>

      <v-text-field
        v-model="userCpf"
        required
        :rules="requiredField()"
        variant="outlined"
        color="success"
        label="Usuario/Cpf"
      />
      <v-text-field
        v-model="password"
        required
        :rules="requiredField()"
        variant="outlined"
        color="success"
        type="password"
        label="Senha"
        @keyup.enter="login"
      />

      <v-btn
        @click="login"
        :disabled="!password || !userCpf"
        class="col-11"
        variant="outlined"
        color="success"
        :loading="loadingLogin"
      >
        Entrar
        <template v-slot:loader>
          <v-progress-circular indeterminate></v-progress-circular>
        </template>
      </v-btn>

      <div class="d-flex flex-row justify-content-center align-items-center mt-3">
        <p class="m-0 mr-1">Esqueceu a Senha?</p>

        <v-dialog max-width="400">
          <template v-slot:activator="{ props: activatorProps }">
            <span class="m-0 text-danger" role="button" v-bind="activatorProps"> Recuperar</span>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card>
              <v-card-title
                class="bg-danger d-flex justify-content-between align-items-center rounded text-white text-center text-bold m-3"
              >
                Recuperar Senha
                <i
                  class="mdi mdi-close-circle fs-3"
                  role="button"
                  @click="isActive.value = false"
                ></i
              ></v-card-title>

              <v-card-text>
                <v-text-field
                  v-model="recoverCpf"
                  required
                  :rules="requiredField()"
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
                    :rules="requiredField()"
                    variant="outlined"
                    color="success"
                    label="Nova Senha"
                  />
                  <v-text-field
                    type="password"
                    v-model="repeatNewPassword"
                    required
                    :rules="requiredField()"
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
    </v-card>
  </div>
  <alert-component ref="alert" />
  <Footer />
</template>

<script>
import AlertComponent from "@/components/Alert.vue";
import Footer from "@/components/Footer.vue";
import axios from "axios";
import ip from "../ip";

export default {
  name: "LoginRoute",
  components: { Footer, AlertComponent },

  data() {
    return {
      userCpf: null,
      password: null,

      loadingLogin: false,
      loadingNewPassword: false,
      loading: false,
      validCpf: false,
      recoverCpf: null,
      newPassword: null,
      repeatNewPassword: null,
    };
  },

  mounted() {},
  methods: {
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
          this.loadingLogin = !this.loadingLogin;
          this.$refs.alert.mostrarAlerta(
            "success",
            "check_circle",
            "Sucesso",
            response.data.message
          );

          setTimeout(() => {
            this.$router.push({ name: "Registro Fabricação" });
          }, 1200);
        })
        .catch((error) => {
          this.loadingLogin = !this.loadingLogin;
          console.error("Erro ao fazer login", error);
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
            this.$refs.alert.mostrarAlerta(
              "warning",
              "warning",
              "Erro",
              error.response.data.message
            );
          });
      }
    },

    recoverPassword() {
      if (!this.newPassword || !this.repeatNewPassword || !this.recoverCpf) {
        return this.$refs.alert.mostrarAlerta(
          "warning",
          "warning",
          "Erro",
          "Preencha todos os campos"
        );
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
          this.$refs.alert.mostrarAlerta(
            "success",
            "check_circle",
            "Sucesso",
            response.data.message
          );

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

    requiredField() {
      return [(v) => !!v || "Campo Obrigatório"];
    },
  },
};
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: url("../../public/recycle-bg.jpg") no-repeat center center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.login-form {
  position: relative;
  z-index: 2;
  max-width: 500px;
}
</style>
