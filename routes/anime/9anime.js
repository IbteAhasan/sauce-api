const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const ajax_url = "https://ajax.gogo-load.com/ajax";
const base_url = "https://gogoanime.cl";
//Home page
router.get("/", (req, res) => {
  res.send("Gogo anime");
});
//Recent released episodes
router.get("/recent-release", async (req, res) => {
  try {
    const pageNo = parseInt(req.query.page);

    const response = await axios.get(
      `${ajax_url}/page-recent-release.html?page=${pageNo ? pageNo : 1}`
    );
    const $ = cheerio.load(response.data);
    const recentEpisodes = [];
    $("div.last_episodes.loaddub > ul > li").each((i, element) => {
      recentEpisodes.push({
        id: $(element)
          .find("a")
          .attr("href")
          .split("/")[1]
          .split("-episode")[0],
        title: $(element).find("p.name>a").attr("title"),
        episodeId: $(element).find("a").attr("href").split("/")[1],
        episodeNo: parseInt(
          $(element).find("a").attr("href").split("/")[1].split("-episode-")[1]
        ),
        imgUrl: $(element).find("img").attr("src"),
        episodeUrl: base_url + $(element).find("a").attr("href"),
      });
    });
   
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "internal error!",
    });
  }
});
//Get anime info

module.exports = router;