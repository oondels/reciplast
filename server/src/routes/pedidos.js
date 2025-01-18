import { Router } from "express";
import pool from "../config/db/connection.js";
import checkToken from "../utils/checkToken.js";

const router = Router();

router.post("/post-pedido", checkToken, async (req, res, next) => {
  try {
    let { material_id, quantidade, unidade, saida, data, username, cliente, valor, tamanho, metodo_pagamento } =
      req.body;

    // Verificando de produto não é prestação de serviço
    if (material_id !== 5) {
      // Verificar disponibilidade de material
      const checkEstque = await pool.query(
        `
        SELECT
          SUM(case when entrada then quantidade else 0 end) -
          SUM(case when saida then quantidade else 0 end) AS "quantidade"
        FROM reciplast.estoque
        WHERE material_id = $1
        `,
        [material_id]
      );

      if (Number(checkEstque.rows[0].quantidade) < Number(quantidade)) {
        return res.status(400).json({ message: "Quantidade insuficiente em estoque." });
      }
    }

    let params_pedido = [cliente, username, data];
    // Verificando se Pedido é de Sacola
    if (material_id === 1) {
      params_pedido.push(tamanho);
    }
    const postPedido = await pool.query(
      `
    	INSERT INTO reciplast.pedidos
    	(cliente, user_create, data, ${material_id === 1 ? "tamanho_sacola, " : ""} created_at, updated_at )
    	VALUES ($1, $2, $3 ${
        material_id === 1 ? ", $4" : ""
      } , NOW() AT TIME ZONE 'America/Sao_Paulo', NOW() AT TIME ZONE 'America/Sao_Paulo')
    	RETURNING id
    	`,
      params_pedido
    );

    if (postPedido.rows.length === 0) {
      return res.status(400).json({ message: "Erro ao criar pedido. Verifique as informações e tente novamente." });
    }

    const updateEstoque = await pool.query(
      `
    	INSERT INTO reciplast.estoque
    	(material_id, quantidade, unidade, saida, data, custo_venda, username, total_custo, pedido_id, created_at, updated_at)
    	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() AT TIME ZONE 'America/Sao_Paulo', NOW() AT TIME ZONE 'America/Sao_Paulo')
    	RETURNING *
    `,
      [
        material_id,
        quantidade,
        unidade,
        saida,
        data,
        valor,
        username,
        Number(valor) * Number(quantidade),
        postPedido.rows[0].id,
      ]
    );

    if (updateEstoque.rows.length === 0) {
      return res.status(400).json({ message: "Erro ao criar pedido. Verifique as informações e tente novamente." });
    }

    const updateFinanceiro = await pool.query(
      `
    	INSERT INTO reciplast.financeiro (descricao, valor, data, user_create, metodo_pagamento, tipo, categoria_id)
    	VALUES ('Venda de ${quantidade}Kg de ${material_id === 4 ? "Grão de Plástico Reciplast" : "Sacola de Plástico"}',
    	$1, $2, $3, $4, 'receita', 4)
    	RETURNING *
    `,
      [Number(valor) * Number(quantidade), data, username, metodo_pagamento]
    );

    if (updateFinanceiro.rows.length === 0) {
      return res.status(400).json({ message: "Erro ao criar pedido. Verifique as informações e tente novamente." });
    }

    res.status(201).json({ message: "Pedido concluído com sucesso.", pedido: postPedido.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.get("/get-clients", checkToken, async (req, res, next) => {
  try {
    const clients = await pool.query(
      `SELECT cliente
			FROM reciplast.pedidos
			GROUP BY cliente`
    );

    res.status(200).json(clients.rows);
  } catch (error) {
    next(error);
  }
});

router.get("/fetch-employee", async (req, res, next) => {
  try {
    const employees = await pool.query(`
      Select id, nome
      FROM reciplast.funcionarios
    `);

    return res.status(200).json(employees.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
