import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT;

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../build/trialgrounds.html"));
});

app.get("/trialgrounds", function (req, res) {
  res.sendFile(path.join(__dirname, "../build/trialgrounds.html"));
});

app.get("/trialgrounds.css", function (req, res) {
  res.sendFile(path.join(__dirname, "../build/trialgrounds.css"));
});

app.get("/trialgrounds.js", function (req, res) {
  res.sendFile(path.join(__dirname, "../build/trialgrounds.js"));
});

app.listen(PORT, () => {
  console.log(`⚡️[Trialgrounds]: Server is running at http://localhost:${PORT}`);
});
