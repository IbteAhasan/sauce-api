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
    const hasNext = !$("ul.pagination-list>li:last-child").hasClass("selected");
    res.status(200).json({
      page: pageNo ? pageNo : 1,
      hasNextPage: hasNext,
      results: recentEpisodes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "internal error!",
    });
  }
});
//Get anime info
router.get("/anime-info/:id", async (req, res) => {
  try {
    let response = await axios.get(`${base_url}/category/${req.params.id}`);
    let $ = cheerio.load(response.data);
    const animeInfo = {
      title: $("div.anime_info_body").find("h1").text(),
      type: $("div.anime_info_body").find("p:nth-of-type(2)>a").attr("title"),
      img: $("div.anime_info_body_bg").find("img").attr("src"),
      desc: $("div.anime_info_body")
        .find("p:nth-of-type(3)")
        .text()
        .split(": ")[1],
      released: parseInt(
        $("div.anime_info_body").find("p:nth-of-type(5)").text().split(": ")[1]
      ),
      status: $("div.anime_info_body").find("p:nth-of-type(6)>a").text(),
    };
    //genre
    const genre = [];
    $("div.anime_info_body")
      .find("p:nth-of-type(4)>a")
      .each((i, element) => {
        genre.push($(element).attr("title"));
      });
    animeInfo.genre = genre;
    //Episode info
    const episodeStart = $("div.anime_video_body>ul>li")
      .find("a")
      .attr("ep_start");
    const episodeEnd = $("div.anime_video_body>ul>li:last-of-type")
      .find("a")
      .attr("ep_end");
    const movieId = $("div.anime_info_episodes")
      .find("input#movie_id")
      .attr("value");
    animeInfo.totalEpisodes = parseInt(episodeEnd)
    response = await axios.get(
      `${ajax_url}/load-list-episode?ep_start=${episodeStart}&ep_end=${episodeEnd}&id=${movieId}&default_ep=0&alias=${req.params.id}`
    );
    console.log(response.data);
    $ = cheerio.load(response.data);
    const episodes = [];
    $("ul#episode_related > li").each((i, element) => {
      episodes.push({
        id: $(element).find("a").attr("href").split("/")[1],
        episodeNo: parseInt(
          $(element).find("a").attr("href").split("episode-")[1]
        ),
        episodeUrl:
          base_url + $(element).find("a").attr("href").replace(" ", ""),
      });
    });
    console.log(episodes);
    animeInfo.episodes = episodes.reverse();
    res.status(200).json(animeInfo);
  } catch (error) {
    res.status(500).json({ msg: "err", err: error });
  }
});
//Popular animes
router.get("/popular", async (req, res) => {
  try {
    const pageNo = parseInt(req.query.page);

    const response = await axios.get(
      `${base_url}/popular.html?page=${pageNo ? pageNo : 1}`
    );
    const $ = cheerio.load(response.data);
    const popular = [];
    $("div.last_episodes > ul > li").each((i, element) => {
      popular.push({
        id: $(element)
          .find("p > a")
          .attr("href")
          .split("/")[2]
          .split("-episode")[0],
        title: $(element).find("p.name>a").text(),
        released: parseInt($(element).find("p.released").text().replace(/[^0-9]/g, ''))
        ,
        imgUrl: $(element).find("img").attr("src"),
        episodeUrl: base_url + $(element).find("a").attr("href"),
      });
    });
    const hasNext = !$("ul.pagination-list>li:last-child").hasClass("selected");
    res.status(200).json({
      page: pageNo ? pageNo : 1,
      hasNextPage: hasNext,
      results: popular,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "internal error!",
    });
  }
});
module.exports = router;
