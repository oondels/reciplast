<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>Bem-vindo à Reciplast</h1>
        <p>Líder em reciclagem e fabricação de sacolas sustentáveis.</p>
        <button class="cta-button"><i class="mdi mdi-recycle fs-2"></i></button>
      </div>
    </section>

    <section class="about-section">
      <div class="info-card">
        <i class="icon mdi mdi-map-marker"></i>
        <h3>Localidade</h3>
        <p>Av. Paraguasssu/Faz. Magalhaes, 715. Santo Estêvão, Bahia, Brasil</p>
      </div>
      <div class="info-card">
        <i class="icon mdi mdi-calendar"></i>
        <h3>Fundação</h3>
        <p>Fundada em 2022</p>
      </div>
      <div class="info-card">
        <i class="icon mdi mdi-leaf"></i>
        <h3>Missão</h3>
        <p>
          Promover a sustentabilidade por meio da reciclagem e da produção de sacolas de qualidade.
        </p>
      </div>
      <div class="info-card">
        <i class="icon mdi mdi-heart"></i>
        <h3>Valores</h3>
        <p>Respeito ao meio ambiente, inovação e compromisso social.</p>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script>
import Footer from "@/components/Footer.vue";

export default {
  name: "HomeView",
  components: { Footer },
  data() {
    return {
      company: {
        name: "Reciplast",
        description: "Líder em reciclagem e fabricação de sacolas sustentáveis.",
        location: "Santo Estêvão, Bahia, Brasil",
        foundation: "Fundada em 2010",
        mission:
          "Promover a sustentabilidade por meio da reciclagem e da produção de sacolas de qualidade.",
        values: "Respeito ao meio ambiente, inovação e compromisso social.",
      },
    };
  },
};
</script>

<style scoped>
/* Estilos principais */
.home {
  font-family: Arial, sans-serif;
  color: #2f4f2f;
}

/* Hero Section */
.hero {
  background-color: #eaf6e9;
  text-align: center;
  padding: 60px 20px;
}

.hero-content h1 {
  font-size: 3em;
  color: #1f5e1f;
}

.hero-content p {
  font-size: 1.5em;
  color: #3b643b;
  margin: 20px 0;
}

.cta-button {
  padding: 10px 20px;
  font-size: 1.2em;
  color: white;
  background-color: #1f5e1f;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #176d17;
}

/* About Section */
.about-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f0fbf0;
}

.info-card {
  background-color: #d9f5d9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 220px;
  text-align: center;
  transition: transform 0.3s;
}

.info-card:hover {
  transform: scale(1.05);
}

.info-card h3 {
  font-size: 1.3em;
  color: #1f5e1f;
  margin-top: 10px;
}

.info-card p {
  font-size: 1em;
  color: #3c763d;
}

/* Icones */
.icon {
  font-size: 2.5em;
  color: #3b643b;
}
</style>
