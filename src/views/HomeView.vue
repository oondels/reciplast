<template>
  <div class="home">
    <header class="header">
      <h1>{{ company.name }}</h1>
      <p>{{ company.description }}</p>
    </header>

    <section class="details">
      <div class="detail">
        <h3>Localidade</h3>
        <p>{{ company.location }}</p>
      </div>
      <div class="detail">
        <h3>Fundação</h3>
        <p>{{ company.foundation }}</p>
      </div>
      <div class="detail">
        <h3>Missão</h3>
        <p>{{ company.mission }}</p>
      </div>
      <div class="detail">
        <h3>Valores</h3>
        <p>{{ company.values }}</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      company: {
        name: "Reciplast",
        description: "Líder em reciclagem e fabricação de sacolas sustentáveis.",
        location: "Santo Estêvão, Bahia, Brasil",
        foundation: "Fundada em 2010",
        mission: "Promover a sustentabilidade por meio da reciclagem e da produção de sacolas de qualidade.",
        values: "Respeito ao meio ambiente, inovação e compromisso social."
      }
    };
  }
};
</script>

<style scoped>
.home {
	height: 100vh;
  font-family: Arial, sans-serif;
  color: #3c763d;
  padding: 20px;
}

.header {
  text-align: center;
  color: #2f5e2f;
}

.header h1 {
  font-size: 2.5em;
  color: #1d4f1d;
}

.header p {
  font-size: 1.2em;
  margin-top: 10px;
  color: #3b643b;
}

.details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 30px;
  justify-content: center;
}

.detail {
  background-color: #d7f2d6;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 220px;
  text-align: center;
}

.detail h3 {
  font-size: 1.4em;
  color: #1f4f1f;
  margin-bottom: 5px;
}

.detail p {
  font-size: 1.1em;
  color: #3c763d;
}
</style>
