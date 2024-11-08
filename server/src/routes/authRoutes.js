import bcrypt from "bcrypt";
import Router from "express";
import jwt from "jsonwebtoken";
import nodeMailer from "nodemailer";
import validator from "validator";
import pool from "../config/db/connection.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, cpf, password } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(403).json({ message: "Invalid Email" });
    }

    const checkCpf = await pool.query("SELECT cpf FROM reciplast.users WHERE cpf = $1", [cpf]);

    if (checkCpf.rows.length > 0) {
      return res.status(403).json({ message: "Usuário já cadastrado com este CPF." });
    }

    const normalizeString = (str) => {
      return str
        .normalize("NFD") // Decompor caracteres especiais
        .replace(/[\u0300-\u036f]/g, "") // Remover acentos
        .replace(/ç/g, "c") // Substituir ç por c
        .replace(/[^a-zA-Z0-9\s]/g, "") // Remover caracteres especiais restantes
        .toUpperCase();
    };

    const username = `${normalizeString(name.split(" ")[0])}.${normalizeString(
      name.split(" ")[name.split(" ").length - 1]
    )}`;

    const hashedPassword = await bcrypt.hash(password, 8);

    const postUser = await pool.query(
      `INSERT INTO reciplast.users (name, cpf, email, username, password)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
      [name, cpf, email, username, hashedPassword]
    );

    return res
      .status(201)
      .json({ message: `Usuário ${postUser.rows[0].username} registrado com sucesso` });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    let { userCpf, password } = req.body;

    if (!parseFloat(userCpf)) {
      userCpf = userCpf.toUpperCase();
    }

    const fetchUser = await pool.query(
      `
    	SELECT * FROM reciplast.users
    	WHERE username = $1 OR cpf = $2
    `,
      [userCpf, userCpf]
    );

    if (fetchUser.rows.length === 0) {
      return res.status(404).json({
        message: "Usuário não encontrado. Verifique se Digitou Corretamente ou Cadastre-se.",
      });
    }
    const user = fetchUser.rows[0];

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res
        .status(403)
        .json({ message: "Senha incorreta. Tente novamente ou altere sua senha." });
    }

    const token = jwt.sign(
      {
        username: user.username,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: `Bem vindo ${user.username}`, token: token });
  } catch (error) {
    next(error);
  }
});

export default router;
