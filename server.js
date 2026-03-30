import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    
  origin: [
   "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
   ], // your Vercel URL
  methods: ["POST"],
}));

// Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS,   // Gmail app password (not your real password)
  },
});

// Contact route
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,       // sends to yourself
    replyTo: email,                   // so you can reply directly to the sender
    subject: `Portfolio Contact — ${name}`,
    html: `
      <h2>New message from your portfolio</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully"); 
    res.status(200).json({ success: "Message sent successfully!" });
  } catch (error) {
   console.error("❌ Email error:", error.message);
    res.status(500).json({ error: "Failed to send message. Try again." });
  }
});

// Health check route (Render needs this)
app.get("/", (req, res) => {
  res.send("Backend is running.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});