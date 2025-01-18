import { Router } from "express";
import nodeMailer from "nodemailer";
import checkToken from "../utils/checkToken.js";

const router = Router();

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

router.post("/send-help-email", async (req, res, next) => {
  try {
    const { problem, description } = req.body;

    await transporter
      .sendMail({
        to: "hendriusfelix.dev@gmail.com",
        subject: `⚠️Ajuda Reciplast⚠️ - ${problem}`,
        html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #d9534f; font-size: 24px; margin: 0;">⚠️ Ajuda Reciplast ⚠️</h1>
      </div>

      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #0056b3; font-size: 20px; margin: 0 0 10px;">Problema Reportado:</h2>
        <p style="font-size: 16px; color: #555; margin: 10px 0;"><strong>Problema:</strong> ${problem}</p>
        <p style="font-size: 16px; color: #555; margin: 10px 0;"><strong>Descrição:</strong> ${description}</p>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
        <p>Este email foi gerado automaticamente. Por favor, não responda.</p>
        <p>Em caso de dúvidas, entre em contato pelo suporte: <a href="mailto:support@reciplast.com" style="color: #0056b3; text-decoration: none;">support@reciplast.com</a></p>
      </div>
  </div>
`,
      })
      .then(() => {
        console.log("Email sent");
        return res.status(200).json({ message: "Email enviado com sucesso. Responderei assim que possível." });
      })
      .catch((error) => {
        console.error("Erro ao enviar email: ", error);
        return res.status(500).json({ message: "Erro ao enviar email. Por favor, tente novamente" });
      });
  } catch (error) {
    // next(error);
    console.error(error);
  }
});

export default router;
