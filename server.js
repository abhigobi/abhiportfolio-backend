import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL,
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
}));

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running.");
});

// Contact route
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>", // free default sender
      to: process.env.EMAIL_TO,                          // your Gmail address
      replyTo: email,
      subject: `Portfolio Contact — ${name}`,
      html: `
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log("✅ Email sent successfully");
    res.status(200).json({ success: "Message sent successfully!" });

  } catch (error) {
    console.error("❌ Email error:", error.message);
    res.status(500).json({ error: "Failed to send message. Try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});