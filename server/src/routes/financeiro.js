import { Router } from "express";
import pool from "../config/db/connection.js";

const router = Router();

router.get("/get-financeiro", async (req, res, next) => {
  try {
    const { data, categoriaId, metodo_pagamento, tipoFinanceiro } = req.query;

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
				SUM(f.valor) AS valor_total
				${tipoFinanceiro ? ", f.tipo" : ""}
				${metodo_pagamento ? ", f.metodo_pagamento" : ""}
				${data ? ", f.data" : ""}
			FROM
				reciplast.financeiro_categoria fc
			LEFT JOIN reciplast.financeiro f ON fc.id = f.categoria_id
		`;

    // Condições opcionais
    if (categoriaId) {
      addCondition(`fc.id = $${params.length + 1}`, categoriaId);
    }
    if (tipoFinanceiro && tipoFinanceiro !== "geral") {
      addCondition(`f.tipo = $${params.length + 1}`, tipoFinanceiro);
    }
    if (data && data !== "geral") {
      addCondition(`f.data = $${params.length + 1}`, data);
    }
    if (metodo_pagamento && metodo_pagamento !== "geral") {
      addCondition(`f.metodo_pagamento = $${params.length + 1}`, metodo_pagamento);
    }

    // Adiciona as condições na query
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += `
		GROUP BY
				fc.categoria
				${tipoFinanceiro ? ", f.tipo" : ""}
				${metodo_pagamento ? ", f.metodo_pagamento" : ""}
				${data ? ", f.data" : ""}`;

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post("/post-financeiro", async (req, res, next) => {
  try {
    const { tipo, categoria_id, descricao, valor, data, metodo_pagamento, user_create } = req.body;

    let query = `
		INSERT INTO reciplast.financeiro (tipo, categoria_id, descricao, valor, data, metodo_pagamento, user_create)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING *
		`;

    // Verificar se é compra de materia prima para atualizar estoque
    if (categoria_id === 2) {
      const updateEstqueMateriaPrima = await pool.query(
        `
				INSERT INTO reciplast.estoque
				(quantidade, unidade, entrada, saida, data, username, fornecedor, total_custo, material_id, custo_compra, created_at, updated_at)
				VALUES ($1, 'KG', true, false, $2, $3, $4, $5, $6, $7, NOW(), NOW())	
				RETURNING *
			`,
        [req.body.quantidade, data, user_create, req.body.fornecedor, valor, req.body.material_id, req.body.custo_compra]
      );

      if (updateEstqueMateriaPrima.rows.length === 0) {
        return res.status(400).json({
          message: "Erro ao atualizar materia prima. Verifique as informações e tente novamente.",
        });
      }
    }

    const postFinance = await pool.query(query, [
      tipo,
      categoria_id,
      descricao,
      valor,
      data,
      metodo_pagamento,
      user_create,
    ]);

    if (postFinance.rows.length === 0) {
      return res.status(400).json({
        message: "Erro ao atualizar financeiro. Verifique as informações e tente novamente.",
      });
    }

		if (categoria_id === 2) {
			return res.status(201).json({ message: "Financeiro e Estoque de Materia Prima Atualizado com Sucesso!" });
		}
    return res.status(201).json({ message: "Financeiro atualizado com sucesso!" });
  } catch (error) {
    next(error);
  }
});

router.get("/get-categoria", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT categoria, descricao, id FROM reciplast.financeiro_categoria"
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
