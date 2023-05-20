const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server running!");
});
app.use("/api/anime/gogoanime", require("./routes/anime/gogo"));
app.use("/api/anime/9anime", require("./routes/anime/9anime"));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
