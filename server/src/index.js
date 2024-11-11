import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
dotenv.config();

import AuthRoutes from "./routes/authRoutes.js";
import ChartRoutes from "./routes/charts.js";
import EstoqueRoutes from "./routes/estoque.js";
import FinaneiroRoutes from "./routes/financeiro.js";

import checkToken from "./utils/checkToken.js";

const app = express();
const port = 2399;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/auth", AuthRoutes);
app.use("/estoque", EstoqueRoutes)
app.use("/financeiro", FinaneiroRoutes)
app.use("/chart", ChartRoutes)

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
    message: "Erro interno do servidor. Entre em contato com o suporte (75) 982466703",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

server.listen(port, () => {
  console.log("Server listening on port: ", port);
});
