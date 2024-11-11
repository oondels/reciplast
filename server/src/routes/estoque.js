import { Router } from "express";
import pool from "../config/db/connection.js";

const router = Router();

// Estoque de Material
router.get("/get-estoque", async (req, res, next) => {
  try {
    const id = req.query.id;
    const fornecedor = req.query.fornecedor;
    const data = req.query.data;
    const type = req.query.type;

    let params = [];
    if (id) params.push(id);

    let query = `
		SELECT 
			p.nome,
			SUM(e.quantidade) AS quantidade, SUM(e.total_custo) AS custo_total 
			${fornecedor ? ", e.fornecedor" : ""}
			${data ? ", e.data" : ""}`;

    query += `
			FROM reciplast.produtos p
			LEFT JOIN reciplast.estoque e ON p.id = e.material_id
			WHERE ${id ? "p.id = $1 AND" : ""} ${type === "compra" ? "entrada" : "saida"} = true 
			GROUP BY p.nome ${fornecedor ? ", e.fornecedor" : ""} ${data ? ", e.data" : ""}`;

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post("/post-material", async (req, res, next) => {
  try {
    let {
      material_id,
      quantidade,
      unidade,
      entrada,
      saida,
      data,
      custo_compra,
      custo_venda,
      fornecedor,
      username,
      user_id,
    } = req.body;

    const queryMaterial = await pool.query(
      `
			SELECT * FROM reciplast.produtos
			WHERE id = $1	
		`,
      [material_id]
    );

    // Atualizar financeiro
    const attFinance = async (tipo, produto, valor) => {
      let descricao = `${tipo === "compra" ? "Compra" : "Venda"} de ${produto.nome} `;
      let query = `
				INSERT INTO reciplast.financeiro (descricao, valor, data, user_create, user_id, metodo_pagamento, tipo, categoria_id)
				VALUES ($1, $2, $3, $4, $5, 'PIX', '${tipo === "compra" ? "despesa" : "receita"}', ${
        produto.type === "materia-prima" ? 2 : 1
      })
				RETURNING *
			`;

      const postFinance = await pool.query(query, [descricao, valor, data, username, user_id]);
      if (postFinance.rows.length === 0) {
        return res.status(400).json({ message: "Erro ao atualizar estoque. Tente novamente." });
      }
    };

    let total_custo;
    if (custo_compra) {
      total_custo = custo_compra * quantidade;
      attFinance("compra", queryMaterial.rows[0], total_custo);
    }

    if (custo_venda) {
      total_custo = custo_venda * quantidade;
      attFinance("venda", queryMaterial.rows[0], total_custo);
    }

    const postMaterial = await pool.query(
      `INSERT INTO reciplast.estoque 
			(material_id, quantidade, unidade, entrada, saida, data, custo_compra, custo_venda, fornecedor, username, user_id, total_custo, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
			RETURNING *`,
      [
        material_id,
        quantidade,
        unidade,
        entrada,
        saida,
        data,
        custo_compra,
        custo_venda,
        fornecedor,
        username,
        user_id,
        total_custo,
      ]
    );

    if (postMaterial.rows.length === 0) {
      return res.status(400).json({
        message: "Erro ao atualizar estoque. Verifique as informações e tente novamente.",
      });
    }

    return res.status(201).json({ message: "Estoque atualizado com sucesso." });
  } catch (error) {
    next(error);
  }
});

router.get("/get-residuo", async (req, res, next) => {
  try {
    const id = req.query.id;
    const data = req.query.data;

    let params = [];
    if (id) params.push(id);

    let query = `
			SELECT p.nome, SUM(r.quantidade) AS total_residuo ${data ? ", r.data" : ""}
			FROM reciplast.produtos p
			LEFT JOIN reciplast.residuo r ON p.id = r.produto_id
			${id ? "WHERE p.id = $1" : ""}
			GROUP BY p.nome${data ? ", r.data" : ""}
		`;

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post("/post-residuo", async (req, res, next) => {
  try {
    const { produto_id, quantidade, descricao, user_create } = req.body;

    const fetchProduto = await pool.query(
      `
			SELECT nome FROM reciplast.produtos	WHERE id = $1
		`,
      [produto_id]
    );

    const insertResiduo = await pool.query(
      `INSERT INTO reciplast.residuo 
      (produto_id, quantidade, descricao, data, user_create)
      VALUES ($1, $2, $3, NOW(), $4)
      RETURNING *`,
      [produto_id, quantidade, descricao, user_create]
    );

    if (insertResiduo.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Erro ao Inserir Resíduo, verifique as informações e tente novamente." });
    }

    res
      .status(201)
      .json({ message: `Resíduo de ${fetchProduto.rows[0].nome} inserido com sucesso.` });
  } catch (error) {
    next(error);
  }
});

// Tipos de Produtos
router.post("/post-produto", async (req, res, next) => {
  try {
    const { nome, tag, type, user_create } = req.body;

    const insertProduto = await pool.query(
      `INSERT INTO reciplast.produtos 
      (nome, tag, type, user_create, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *`,
      [nome, tag, type, user_create]
    );

    if (insertProduto.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Erro ao Cadastrar Produto. Verifique as informações e tente novamente" });
    }

    res.status(201).json(insertProduto.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
