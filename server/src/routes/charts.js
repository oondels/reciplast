import { Router } from "express";
import pool from "../config/db/connection.js";
import checkToken from "../utils/checkToken.js";

const router = Router();

const meses = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};

// Estoque Geral dos Materiais
router.get("/estoqueGeral-chart-data", checkToken, async (req, res, next) => {
  try {
    let query = `
			SELECT
				p.nome, p.tag, p.type,
				SUM(CASE WHEN e.entrada THEN e.quantidade ELSE 0 END) -
    		SUM(CASE WHEN e.saida THEN e.quantidade ELSE 0 END) AS "quantidade"
			FROM
				reciplast.produtos p
			LEFT JOIN
				reciplast.estoque e ON p.id = e.material_id
			GROUP BY
				p.nome, p.tag, p.type
		`;

    const result = await pool.query(query);

    let chartOptions = {
      chart: {
        id: "estoque-geral",
      },
      xaxis: {
        categories: [],
      },
    };

    const chartSeries = [
      {
        name: "Estoque Geral",
        data: [],
      },
    ];

    result.rows.forEach((data) => {
      chartOptions.xaxis.categories.push(data.nome);
      chartSeries[0].data.push(data.quantidade);
    });

    return res.status(200).json({ options: chartOptions, series: chartSeries });
  } catch (error) {
    next(error);
  }
});

// Estoque Individual de cada material
router.get("/estoqueIndividual-chart-data", checkToken, async (req, res, next) => {
  try {
    let query = `
			SELECT
				p.nome, p.tag, p.type, p.id,
				SUM(CASE WHEN e.entrada THEN e.quantidade ELSE 0 END) -
    		SUM(CASE WHEN e.saida THEN e.quantidade ELSE 0 END) AS "quantidade"
			FROM
				reciplast.produtos p
			LEFT JOIN
				reciplast.estoque e ON p.id = e.material_id
      WHERE p.nome != 'Prestação de Serviços'
			GROUP BY
				p.nome, p.tag, p.type, p.id
		`;

    const result = await pool.query(query);

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Histórico de entradas e saídas de material
router.get("/stock-history/:materialId", checkToken, async (req, res, next) => {
  try {
    const materialId = req.params.materialId;

    const query = await pool.query(
      `
		SELECT
			p.nome, p.tag,
			SUM(e.quantidade) AS quantidade, e.entrada, e.saida, e.data AS data
		FROM
		 	reciplast.produtos p
		LEFT JOIN
			reciplast.estoque e ON p.id = e.material_id
		WHERE
			p.id = $1 AND EXTRACT(YEAR FROM e.data) = EXTRACT(YEAR FROM CURRENT_DATE)
		GROUP BY
			p.nome, p.tag, e.entrada, e.saida, e.data
		ORDER BY
		 e.data ASC
	`,
      [materialId]
    );

    let chartOptions = {
      chart: {
        id: "estoque-detalhado",
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: [],
      },
    };

    const chartSeries = [
      {
        name: "Saída",
        data: [],
      },
      {
        name: "Entrada",
        data: [],
      },
    ];

    query.rows.forEach((result) => {
      const dataCompleta = new Date(result.data).toLocaleDateString("pt-BR"); // Formato dd/mm/aaaa
      const quantidade = Number(result.quantidade);

      if (!chartOptions.xaxis.categories.includes(dataCompleta)) {
        chartOptions.xaxis.categories.push(dataCompleta);
        chartSeries[0].data.push(0);
        chartSeries[1].data.push(0);
      }

      const dataIndex = chartOptions.xaxis.categories.indexOf(dataCompleta);

      if (result.entrada) {
        chartSeries[1].data[dataIndex] += quantidade;
      } else if (result.saida) {
        chartSeries[0].data[dataIndex] += quantidade;
      }
    });

    res.status(200).json({ options: chartOptions, series: chartSeries });
  } catch (error) {
    next(error);
  }
});

// Financeiro
router.get("/general-expenses", checkToken, async (req, res, next) => {
  try {
    const query = `
			SELECT
				f.tipo, SUM(f.valor) AS valor
			FROM
				reciplast.financeiro_categoria c
			LEFT JOIN
				reciplast.financeiro f ON c.id = f.categoria_id
			WHERE
				EXTRACT(YEAR FROM f.data) = EXTRACT(YEAR FROM CURRENT_DATE)
			GROUP BY
				f.tipo
		`;

    const result = await pool.query(query);

    let chartOptions = {
      chart: {
        id: "expenses-donut-chart",
      },
      labels: ["Receita", "Despesa"],
    };

    const chartSeries = [0, 0];

    result.rows.forEach((data) => {
      if (data.tipo === "receita") {
        chartSeries[0] = Number(data.valor);
      } else if (data.tipo === "despesa") {
        chartSeries[1] = Number(data.valor);
      }
    });

    return res.status(200).json({ options: chartOptions, series: chartSeries });
  } catch (error) {
    next(error);
  }
});

router.get("/detailed-expenses", checkToken, async (req, res, next) => {
  try {
    const queryDespesa = `
			SELECT
				c.categoria, SUM(f.valor) AS valor
			FROM
				reciplast.financeiro_categoria c
			LEFT JOIN
				reciplast.financeiro f ON c.id = f.categoria_id
			WHERE
				EXTRACT(YEAR FROM f.data) = EXTRACT(YEAR FROM CURRENT_DATE) AND f.tipo = 'despesa'
			GROUP BY
				c.categoria
		`;

    const resultDespesa = await pool.query(queryDespesa);

    const queryReceita = `
			SELECT
				c.categoria, SUM(f.valor) AS valor
			FROM
				reciplast.financeiro_categoria c
			LEFT JOIN
				reciplast.financeiro f ON c.id = f.categoria_id
			WHERE
				EXTRACT(YEAR FROM f.data) = EXTRACT(YEAR FROM CURRENT_DATE) AND f.tipo = 'receita'
			GROUP BY
				c.categoria
		`;

    const resultReceita = await pool.query(queryReceita);

    let chartOptions = {
      chart: {
        id: "detailed-expenses-donut-chart",
      },
      labels: [],
    };

    const chartSeries = [];

    let chartOptionsReceita = {
      chart: {
        id: "detailed-expenses-donut-chart2",
      },
      labels: [],
    };

    const chartSeriesReceita = [];

    // Dados Despesa
    resultDespesa.rows.forEach((data) => {
      if (!chartOptions.labels.includes(data.categoria)) {
        chartOptions.labels.push(data.categoria);
        chartSeries.push(0);
      }
      let index = chartOptions.labels.indexOf(data.categoria);
      chartSeries[index] = Number(data.valor);
    });

    // Dados Receita
    resultReceita.rows.forEach((data) => {
      if (!chartOptionsReceita.labels.includes(data.categoria)) {
        chartOptionsReceita.labels.push(data.categoria);
        chartSeriesReceita.push(0);
      }
      let index = chartOptionsReceita.labels.indexOf(data.categoria);
      chartSeriesReceita[index] = Number(data.valor);
    });

    return res.status(200).json({
      optionsDespesa: chartOptions,
      seriesDespesa: chartSeries,
      optionsReceita: chartOptionsReceita,
      seriesReceita: chartSeriesReceita,
    });
  } catch (error) {
    next(error);
  }
});

// Gráfico de Linha de Receita e Despesa Mensal
router.get("/expenses-history", checkToken, async (req, res, next) => {
  try {
    const query = await pool.query(`
		SELECT
			tipo, SUM(valor) as valor_total_mes, EXTRACT(MONTH FROM data) as mes
		FROM
			reciplast.financeiro
		GROUP BY
			tipo, EXTRACT(MONTH FROM data)
		ORDER BY
			mes ASC
		`);

    let chartOptions = {
      chart: {
        id: "sell-history",
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: [],
      },
    };

    const chartSeries = [
      {
        name: "Receita",
        data: [],
      },
      {
        name: "Despesa",
        data: [],
      },
    ];

    query.rows.forEach((result) => {
      if (!chartOptions.xaxis.categories.includes(meses[result.mes])) {
        chartOptions.xaxis.categories.push(meses[result.mes]);
      }

      const dataIndex = chartOptions.xaxis.categories.indexOf(meses[result.mes]);

      if (result.tipo === "receita") {
        chartSeries[0].data[dataIndex] = Number(result.valor_total_mes);
      } else if (result.tipo === "despesa") {
        chartSeries[1].data[dataIndex] = Number(result.valor_total_mes);
      }
    });

    return res.status(200).json({ options: chartOptions, series: chartSeries, result: query.rows });
  } catch (error) {
    next(error);
  }
});

// Detalhamento de vendas/produto
router.get("/detailed-sell-history", checkToken, async (req, res, next) => {
  try {
    const query = await pool.query(`
			SELECT
				SUM(e.total_custo) as valor, EXTRACT(MONTH FROM e.data) as mes,
				e.saida, p.nome
			FROM
				reciplast.estoque e
			LEFT JOIN
				reciplast.produtos p ON e.material_id = p.id
			WHERE
				EXTRACT(YEAR FROM e.data) = EXTRACT(YEAR FROM CURRENT_DATE) AND
				e.material_id = 3 OR e.material_id = 4 AND e.saida = true
			GROUP BY
				EXTRACT(MONTH FROM e.data), e.saida, p.nome
			ORDER BY
				mes ASC
		`);

    let chartOptions = {
      chart: {
        id: "detailed-expense-history",
      },
      xaxis: {
        categories: [],
      },
    };

    const chartSeries = [];

    query.rows.forEach((result) => {
      let indexProduct;

      if (chartSeries.findIndex((item) => item.name === result.nome) === -1) {
        chartSeries.push({
          name: result.nome,
          data: Array(chartOptions.xaxis.categories.length).fill(0), // Inicializa os dados com 0 até o índice atual
        });
      }

      indexProduct = chartSeries.findIndex((item) => item.name === result.nome);

      if (chartOptions.xaxis.categories.indexOf(meses[result.mes]) === -1) {
        chartOptions.xaxis.categories.push(meses[result.mes]);

        // Adicionar 0 para todos os produtos na série para o novo mês
        chartSeries.forEach((item) => {
          item.data.push(0);
        });
      }

      // Atualizar o valor do produto para o mês específico
      const monthIndex = chartOptions.xaxis.categories.indexOf(meses[result.mes]);
      chartSeries[indexProduct].data[monthIndex] = Number(result.valor);
    });

    return res.status(200).json({ options: chartOptions, series: chartSeries, result: query.rows });
  } catch (error) {
    next(error);
  }
});

// Produção de Sacolas e Grãos
router.get("/production-history", checkToken, async (req, res, next) => {
  try {
    const query = await pool.query(`
			SELECT
				p.nome, SUM(e.quantidade) as total_quantidade, EXTRACT(MONTH FROM e.data) as mes
			FROM
				reciplast.produtos p
			LEFT JOIN
				reciplast.estoque e ON p.id = e.material_id
			WHERE
				p.type = 'produto-final' AND EXTRACT(YEAR FROM e.data) = EXTRACT(YEAR FROM CURRENT_DATE)
			GROUP BY
				p.nome, EXTRACT(MONTH FROM e.data)
			ORDER BY
				mes ASC
		`);

    // Grafico Pizza
    let donutOptions = {
      chart: {
        id: "production-donut-chart",
      },
      labels: [],
    };

    const donutSeries = [];

    // Gráfico de Barras
    let chartOptions = {
      chart: {
        id: "detailed-expense-history",
      },
      xaxis: {
        categories: [],
      },
    };

    const chartSeries = [];

    query.rows.forEach((result) => {
      let indexProduct;

      if (chartSeries.findIndex((item) => item.name === result.nome) === -1) {
        chartSeries.push({
          name: result.nome,
          data: Array(chartOptions.xaxis.categories.length).fill(0), // Inicializa os dados com 0 até o índice atual
        });
      }

      indexProduct = chartSeries.findIndex((item) => item.name === result.nome);

      if (chartOptions.xaxis.categories.indexOf(meses[result.mes]) === -1) {
        chartOptions.xaxis.categories.push(meses[result.mes]);

        // Adicionar 0 para todos os produtos na série para o novo mês
        chartSeries.forEach((item) => {
          item.data.push(0);
        });
      }

      // Atualizar o valor do produto para o mês específico
      const monthIndex = chartOptions.xaxis.categories.indexOf(meses[result.mes]);
      chartSeries[indexProduct].data[monthIndex] = Number(result.total_quantidade);
    });

    // Preenchendo gráfico de pizza
    chartSeries.forEach((serie, index) => {
      donutOptions.labels[index] = serie.name;
      donutSeries[index] = serie.data.reduce((acc, curr) => acc + curr);
    });

    return res.status(200).json({
      options: chartOptions,
      series: chartSeries,
      donut: { options: donutOptions, series: donutSeries },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/producao-mensal", checkToken, async (req, res, next) => {
  try {
    const query = await pool.query(`
			SELECT
				p.nome, p.type, COUNT(e.quantidade) as fardos, p.id
			FROM
				reciplast.produtos p
			LEFT JOIN
				reciplast.estoque e ON p.id = e.material_id
			WHERE
				p.type = 'produto-final' AND
				EXTRACT(YEAR FROM e.data) = EXTRACT(YEAR FROM CURRENT_DATE) AND
				EXTRACT(MONTH FROM e.data) = EXTRACT(MONTH FROM CURRENT_DATE) AND
				e.entrada = true AND e.saida = false
			GROUP BY
				p.nome, p.type, p.id
		`);

    return res.status(200).json(query.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
