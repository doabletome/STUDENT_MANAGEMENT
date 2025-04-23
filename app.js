import express from "express";
import dotenv from "dotenv";
import schoolRoutes from "./routes/schoolRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", schoolRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
