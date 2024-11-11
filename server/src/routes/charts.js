import { Router } from "express";
import pool from "../config/db/connection.js";

const router = Router();

// Estoque Geral dos Materiais
router.get("/estoqueGeral-chart-data", async (req, res, next) => {
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
router.get("/estoqueIndividual-chart-data", async (req, res, next) => {
  try {
    let query = `
			SELECT 
				p.nome, p.tag, p.type, p.id,
				SUM(e.quantidade) AS quantidade
			FROM
				reciplast.produtos p
			LEFT JOIN 
				reciplast.estoque e ON p.id = e.material_id
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
router.get("/stock-history/:materialId", async (req, res, next) => {
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

// Despesas
router.get("/general-expenses", async (req, res, next) => {
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

router.get("/detailed-expenses", async (req, res, next) => {
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

    return res
      .status(200)
      .json({
        optionsDespesa: chartOptions,
        seriesDespesa: chartSeries,
        optionsReceita: chartOptionsReceita,
        seriesReceita: chartSeriesReceita,
      });
  } catch (error) {
    next(error);
  }
});

export default router;
