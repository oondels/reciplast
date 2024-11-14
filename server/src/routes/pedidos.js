import { Router } from "express";
import pool from "../config/db/connection.js";

const router = Router();

router.post("/post-pedido", async (req, res, next) => {
  try {
    let { material_id, quantidade, unidade, saida, data, username, cliente, valor } = req.body;

    //Verificar disponibilidade de material
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

    const postPedido = await pool.query(
      `
			INSERT INTO reciplast.pedidos 
			(cliente, user_create, data, created_at, updated_at)
			VALUES ($1, $2, $3, NOW() AT TIME ZONE 'America/Sao_Paulo', NOW() AT TIME ZONE 'America/Sao_Paulo')
			RETURNING id
			`,
      [cliente, username, data]
    );

    if (postPedido.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Erro ao criar pedido. Verifique as informações e tente novamente." });
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
        Number(valor) / Number(quantidade),
        username,
        valor,
        postPedido.rows[0].id,
      ]
    );

    res.status(201).json({ message: "Pedido concluído com sucesso.", pedido: postPedido.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
