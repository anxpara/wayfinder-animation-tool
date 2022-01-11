import express from "express";
import path from "path";

const app = express();
const PORT = 8000;

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
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
