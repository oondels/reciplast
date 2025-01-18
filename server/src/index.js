import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import pool from "./config/db/connection.js";
dotenv.config();

import AuthRoutes from "./routes/authRoutes.js";
import ChartRoutes from "./routes/charts.js";
import EstoqueRoutes from "./routes/estoque.js";
import FinaneiroRoutes from "./routes/financeiro.js";
import Pedidos from "./routes/pedidos.js";
import Report from "./routes/report.js";
import EmailService from "./services/EmailService.js";
import checkToken from "./utils/checkToken.js";

const app = express();
const port = 2399;

app.use(
  cors({
    origin: "https://reciplast.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://reciplast.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Verificação da conexão com o banco de dados
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Erro ao conectar ao banco de dados:", err.stack);
  }
  console.log("Conectado ao banco de dados");
  release();
});

app.use("/auth", AuthRoutes);
app.use("/estoque", EstoqueRoutes);
app.use("/financeiro", FinaneiroRoutes);
app.use("/chart", ChartRoutes);
app.use("/pedido", Pedidos);
app.use("/report", Report);
app.use("/email", EmailService);

io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.get("/protected", checkToken, (req, res) => {
  console.log(req.user);

  res.status(200).json({ message: "Protected Route." });
});

app.use((error, req, res, next) => {
  console.log(`Erro na rota ${req.method} ${req.originalUrl}: ${error}`);

  res.status(500).json({
    message: "Erro interno do servidor. Entre em contato com o suporte no botão de ajuda!",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

server.listen(port, () => {
  console.log("Server listening on port: ", port);
});
