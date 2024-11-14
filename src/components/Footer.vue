<template>
  <footer class="footer">
    <div class="footer-content">
      <p>© 2024 Reciplast. Todos os direitos reservados.</p>

      <p>
        Desenvolvido por <a href="https://hendriusfelix.com.br/" target="_blank">Hendrius Félix</a>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "FooterComponent",
};
</script>

<style scoped>
.footer {
  background-color: #2f4f2f;
  color: #ffffff;
  padding: 20px;
  text-align: center;
  font-size: 0.9em;
}

.footer-content {
  max-width: 800px;
  margin: auto;
}

.footer p {
  margin: 5px 0;
}

.footer a {
  color: #66bb6a;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
