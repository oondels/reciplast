import { Router } from "express";
import pool from "../config/db/connection.js";
import checkToken from "../utils/checkToken.js";

const router = Router();

// Report financeiro
router.get("/financeiro", async (req, res, next) => {
  try {
    const { dataInicial, dataFinal, categoria, moreDetails, detalhe } = req.query;
    // categoria -> Tipo de financeiro (Vendas, salarios, etc)
    // moreDetails -> Metodo de Pagamento
    // detalhe -> receita ou despesa

    let params = [];
    let conditions = [];

    // Função auxiliar para adicionar condições
    const addCondition = (condition, value) => {
      conditions.push(condition);
      params.push(value);
    };

    let query = `
			SELECT
				fc.categoria,
				f.descricao,
				SUM(f.valor) AS valor_total
				${detalhe ? ", f.tipo" : ""}
				${moreDetails ? ", f.metodo_pagamento" : ""}
				${dataInicial ? ", f.data" : ""}
			FROM
				reciplast.financeiro_categoria fc
			LEFT JOIN reciplast.financeiro f ON fc.id = f.categoria_id`;

    // Condições opcionais
    if (categoria) {
      addCondition(`fc.categoria = $${params.length + 1}`, categoria);
    }
    if (detalhe) {
      addCondition(`f.tipo = $${params.length + 1}`, detalhe.toLowerCase());
    }
    if (dataInicial && dataFinal) {
      addCondition(`f.data BETWEEN $${params.length + 1}`, dataInicial);
      addCondition(`$${params.length + 1}`, dataFinal);
    }

    // Adiciona as condições na query
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` GROUP BY
				f.descricao,
				fc.categoria
				${detalhe ? ", f.tipo" : ""}
				${moreDetails ? ", f.metodo_pagamento" : ""}
				${dataInicial && dataFinal ? ", f.data ORDER BY f.data ASC" : ""}`;

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get("/producao", async (req, res, next) => {
  try {
    const { dataInicial, dataFinal, categoria, moreDetails, detalhe } = req.query;
    // categoria -> Tipo de produção (Sacola, Grão)
    // moreDetails -> Fardo ou Cliente
    // detalhe -> Produção ou Venda

    let params = [];
    let conditions = [];

    // Função auxiliar para adicionar condições
    const addCondition = (condition, value) => {
      conditions.push(condition);
      params.push(value);
    };

    let producao = "";
    if (detalhe === "Produção") {
      producao = "e.entrada";
    } else if (detalhe === "Venda") {
      producao = "e.saida";
    }

    let query = `
			SELECT
				p.nome,
				e.quantidade
				${producao ? ", " + producao : ""}
				${dataInicial || !moreDetails === "Fardo" ? ", e.data" : ""}
			`;

    if (moreDetails === "Cliente") {
      query += `, rp.cliente `;
    } else if (moreDetails === "Fardo") {
      query += `, COUNT(e.id) as fardos `;
    }

    query += `FROM
			reciplast.produtos p
			LEFT JOIN reciplast.estoque e ON p.id = e.material_id
			`;

    if (moreDetails === "Cliente") {
      query += `INNER JOIN reciplast.pedidos rp ON e.pedido_id = rp.id`;
    }

    // Condições opcionais
    if (categoria) {
      if (categoria === "Sacolas") {
        addCondition(`e.material_id = $${params.length + 1}`, 3);
      }
      if (categoria === "Grãos") {
        addCondition(`e.material_id = $${params.length + 1}`, 4);
      }
    }

    if (detalhe && producao) {
      if (detalhe === "Produção") {
        addCondition(`e.entrada = $${params.length + 1} AND fornecedor = 'Produção Interna'`, true);
      } else if (detalhe === "Venda") {
        addCondition(`e.saida = $${params.length + 1}`, true);
      }
    }

    if (dataInicial && dataFinal) {
      addCondition(`e.data BETWEEN $${params.length + 1}`, dataInicial);
      addCondition(`$${params.length + 1}`, dataFinal);
    }

    // Adiciona as condições na query
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` GROUP BY
				p.nome,
				e.quantidade
				${moreDetails === "Cliente" ? ", rp.cliente" : ""}
				${moreDetails === "Fardo" ? ", e.quantidade" : ""}
				${producao ? ", " + producao : ""}
				${(dataInicial && dataFinal) || !moreDetails === "Fardo" ? ", e.data ORDER BY e.data ASC" : ""}`;

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get("/estoque", async (req, res, next) => {
  try {
    const { dataInicial, dataFinal, categoria, moreDetails, detalhe } = req.query;
    // categoria -> Plástico, sacola, grão
    // moreDetails -> Fornecedor
    // detalhe -> Entrada ou Saida
    let params = [];
    let query = `
		SELECT
			p.nome,
			SUM(e.quantidade) as quantidade,
			e.data
			${moreDetails ? ", e.fornecedor" : ""}
		FROM reciplast.produtos p
		LEFT JOIN reciplast.estoque e ON p.id = e.material_id
		WHERE
			e.data BETWEEN $1 AND $2`;
    params.push(dataInicial);
    params.push(dataFinal);

    if (categoria) {
      if (categoria === "Plástico") {
        query += ` AND e.material_id = 2`;
      }
      if (categoria === "Sacola de Plástico") {
        query += ` AND e.material_id = 3`;
      }
      if (categoria === "Grãos") {
        query += ` AND e.material_id = 4`;
      }
    }

    if (detalhe) {
      if (detalhe === "Entrada") {
        query += ` AND e.entrada = true`;
      }
      if (detalhe === "Saida") {
        query += ` AND e.saida = true`;
      }
    }

    query += `
		GROUP BY
			p.nome, e.data
			${moreDetails ? ", e.fornecedor" : ""}
		ORDER BY e.data ASC
		`;
    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get("/manutencao", async (req, res, next) => {
  try {
    const { dataInicial, dataFinal } = req.query;

    const query = await pool.query(
      `
			SELECT
				fc.categoria, f.descricao, f.valor, f.servico_manutencao, f.data
			FROM
				reciplast.financeiro_categoria fc
			INNER JOIN
				reciplast.financeiro f ON fc.id = f.categoria_id
			WHERE
				f.data BETWEEN $1 AND $2 AND
				fc.id = 5
			GROUP BY
				fc.categoria, f.descricao, f.valor, f.servico_manutencao, f.data
			ORDER BY
				f.data ASC
		`,
      [dataInicial, dataFinal]
    );

    return res.status(200).json(query.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
