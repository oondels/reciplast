import jwt from "jsonwebtoken";

const checkToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Você precisa estar logado para prosseguir!", error: true });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) return res.status(403).json({ message: "Sessão Inválida. Faça Login novamente." });

    req.user = user;
    next();
  });
};

export default checkToken;
