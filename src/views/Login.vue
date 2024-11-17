<template>
  <div class="login-container d-flex align-items-center">
    <div
      class="login-form bg-light rounded-4 shadow p-4 d-flex flex-column justify-content-center align-items-center row col-12 flex-wrap"
    >
      <div class="login-title">
        <h4 class="text-success text-center">Login</h4>
      </div>

      <v-text-field
        class="col-6"
        v-model="userCpf"
        variant="outlined"
        color="success"
        label="Usuario/Cpf"
      />
      <v-text-field
        class="col-6"
        v-model="password"
        variant="outlined"
        color="success"
        type="password"
        label="Senha"
      />

      <v-btn @click="login" class="col-6" variant="outlined" color="success">Entrar</v-btn>
    </div>
  </div>
	<alert-component ref="alert"/>
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
    };
  },

  mounted() {},
  methods: {
    login() {
      const data = {
        userCpf: this.userCpf,
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
  background: rgba(255, 255, 255, 0.5); /* Ajuste a opacidade conforme necessário */
  backdrop-filter: blur(10px); /* Ajuste o valor do desfoque conforme necessário */
  z-index: 1;
}

.login-form {
  position: relative;
  z-index: 2;
  max-width: 600px;
}
</style>
