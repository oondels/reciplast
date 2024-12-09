<template>
  <div class="fixed-fab">
    <v-dialog max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-fab v-bind="activatorProps" icon="mdi mdi-chat-question-outline" color="primary" variant="flat"></v-fab>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card>
          <v-card-title
            class="bg-warning d-flex justify-content-between align-items-center rounded text-white text-center text-bold m-3"
          >
            Reportar Problema

            <i class="mdi mdi-close-circle fs-3" role="button" @click="isActive.value = false"></i>
          </v-card-title>

          <v-card-text>
            <p class="alert alert-warning rounded">
              <i class="mdi mdi-information-slab-box fs-5 text-warning"></i>
              Apenas utilize este recurso se o aplicativo estiver apresentando algum erro.
            </p>

            <div>
              <v-combobox
                :items="[
                  'Registrar produção',
                  'Registrar Financeiro',
                  'Registrar Pedido',
                  'Gerenciamento',
                  'Gráficos Errados',
                  'Informações Erradas',
                  'Outros',
                ]"
                v-model="problema"
                label="Problema"
                hint="Selecione o problema que está ocorrendo."
                persistent-hint
                clearable
              />

              <v-text-field
                v-if="problema === 'Outros'"
                label="Qual o Problema?"
                v-model="outroProblema"
              ></v-text-field>

              <v-textarea
                :disabled="!problema || (problema === 'Outros' && !outroProblema)"
                label="Descrição"
                hint="Descreva o problema com detalhes."
                v-model="descricao"
                persistent-hint
                clearable
              ></v-textarea>

              <div class="d-flex flex-row justify-content-center align-items-center mt-4">
                <v-btn
                  color="success"
                  :disabled="(!problema && !descricao) || (!outroProblema && !descricao)"
                  variant="tonal"
                  prepend-icon="mdi mdi-send-circle"
                  @click="sendEmail"
                  :loading="loadingEmail"
                >
                  Enviar

                  <template v-slot:loader>
                    <v-progress-circular indeterminate color="white"></v-progress-circular>
                  </template>
                </v-btn>

                <v-btn
                  class="ml-1"
                  color="warning"
                  :disabled="(!problema && !descricao) || (!outroProblema && !descricao)"
                  variant="tonal"
                  prepend-icon="mdi mdi-close"
                  @click="clear"
                >
                  Limpar
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </template>
    </v-dialog>

    <alert ref="alert" />
  </div>
</template>

<script>
import Alert from "@/components/Alert.vue";
import axios from "axios";
import ip from "../ip";

export default {
  name: "HelpComponent",
  components: { Alert },

  data() {
    return {
      loadingEmail: false,
      problema: "",
      outroProblema: "",
      descricao: "",
    };
  },

  mounted() {},
  methods: {
    clear() {
      this.problema = "";
      this.outroProblema = "";
      this.descricao = "";
    },

    sendEmail() {
      if (this.problema === "Outros") {
        this.problema = this.outroProblema;
      }

      this.loadingEmail = !this.loadingEmail;
      axios
        .post(`${ip}/email/send-help-email`, {
          problem: this.problema,
          description: this.descricao,
        }, { withCredentials: true })
        .then((response) => {
          this.loadingEmail = !this.loadingEmail;
          this.$refs.alert.mostrarAlerta(
            "success",
            "check_circle",
            "Sucesso",
            response.data.message
          );
					this.clearEmail();
        })
        .catch((error) => {
          this.loadingEmail = !this.loadingEmail;
          console.error("Erro ao enviar email: ", error);
          this.$refs.alert.mostrarAlerta("warning", "warning", "Erro", error.response.data.message);
        });
    },

		clearEmail() {
			this.problema = "";
			this.outroProblema = "";
			this.descricao = "";
		},
  },
};
</script>

<style scoped>
.fixed-fab {
  position: fixed !important;
  bottom: 50px !important;
  right: 100px !important;
  z-index: 1000 !important;
}
</style>
