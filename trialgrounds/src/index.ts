import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT;

app.get("/trialgrounds", function (req, res) {
  res.sendFile(path.join(__dirname, "../build/trialgrounds.html"));
});

app.get("/trialgrounds/trialgrounds.css", function (req, res) {
  res.sendFile(path.join(__dirname, "../build/trialgrounds.css"));
});

app.get("/trialgrounds/trialgrounds.js", function (req, res) {
  res.sendFile(path.join(__dirname, "../build/trialgrounds.js"));
});

app.listen(PORT, () => {
  console.log(`⚡️[Trialgrounds]: Server is running at https://localhost:${PORT}`);
});
