import jwt from "jsonwebtoken";

const checkToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token not provided", error: true });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) return res.status(403).json({ message: "Invalid Token" });

    req.user = user;
    next();
  });
};

export default checkToken;
