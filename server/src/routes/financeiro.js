import { Router } from "express";
import pool from "../config/db/connection.js";
import checkToken from "../utils/checkToken.js";

const router = Router();

router.post("/post-financeiro", checkToken, async (req, res, next) => {
  try {
    const { tipo, categoria_id, descricao, valor, data, metodo_pagamento, user_create, categoria } = req.body;

    let params = [tipo, categoria_id, descricao, valor, data, metodo_pagamento, user_create];

    if (categoria === "Salários") params.push(req.body.employeeId);
    if (categoria === "Manutenção") params.push(req.body.maintenanceService);

    let query = `
      INSERT INTO reciplast.financeiro (tipo, categoria_id, descricao, valor, data, metodo_pagamento, user_create
      ${categoria === "Salários" ? ", nome_funcionario" : ""}
      ${categoria === "Manutenção" ? ", servico_manutencao" : ""}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7
      ${categoria === "Salários" ? ", $8" : ""}
      ${categoria === "Manutenção" ? ", $8" : ""})
      RETURNING *
    `;

    // Verificar se é compra de materia prima para atualizar estoque
    if (categoria_id === 3) {
      const updateEstqueMateriaPrima = await pool.query(
        `
    		INSERT INTO reciplast.estoque
    		(quantidade, unidade, entrada, saida, data, username, fornecedor, total_custo, material_id, custo_compra, created_at, updated_at)
    		VALUES ($1, 'KG', true, false, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    		RETURNING *
    	`,
        [
          req.body.quantidade,
          data,
          user_create,
          req.body.fornecedor,
          valor,
          req.body.material_id,
          req.body.custo_compra,
        ]
      );

      if (updateEstqueMateriaPrima.rows.length === 0) {
        return res.status(400).json({
          message: "Erro ao atualizar materia prima. Verifique as informações e tente novamente.",
        });
      }
    }

    const postFinance = await pool.query(query, params);

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

router.get("/fetch-maintenance-services", async (req, res, next) => {
  try {
    const services = await pool.query(`
      SELECT servico_manutencao
      FROM reciplast.financeiro
      WHERE categoria_id = 2
      ORDER BY servico_manutencao
      ASC
    `);

    return res.status(200).json(services.rows);
  } catch (error) {
    next(error);
  }
});

router.get("/get-categoria", checkToken, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT categoria, descricao, id FROM reciplast.financeiro_categoria");

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
