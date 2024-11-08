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

export default router;
