const {
  last_ten_credits,
  last_ten_episodes,
  top_twenty_producers,
  producer_credits,
  episode_credits,
  get_episode_info,
  search_credits,
} = require('./functions')

const {
  indexFunction,
  producerFunction,
  episodeFunction,
  searchFunction,
} = require('./views')

module.exports = function (app) {
  app.get("/", async (req, res) => {
    const episodes = await last_ten_episodes();
    const credits = await last_ten_credits();
    const producers = await top_twenty_producers();

    res.send(
      indexFunction({
        episodeCredits: episodes,
        recentCredits: credits,
        freqProducers: producers,
      })
    );
  });

  //==========================================================

  app.get("/search/", async (req, res) => {
    const searchQuery = req.query.searchQuery;
    const producerCredits = await search_credits(searchQuery)
    
    for (const credit of producerCredits) {
      if (credit.episode_number === undefined) credit.episode_number = credit.epNum
      const episode = await get_episode_info(credit.episode_number);
      producerCredits.push({
        producer: credit.producer,
        epNum: credit.episode_number,
        epTitle: episode.title,
        epDate: episode.date,
        credType: credit.type,
      });
    }
    
    res.send(
      searchFunction({
        searchQuery,
        producerCredits,
      })
    );
  });

  app.get("/producer/:alias?", async (req, res) => {
    const alias = req.params.alias;
    const credits = await producer_credits(alias);
    let producerCredits = Array();

    for (const credit of credits) {
      const episode = await get_episode_info(credit.episode_number);
      producerCredits.push({
        producer: credit.producer,
        epNum: credit.episode_number,
        epTitle: episode.title,
        epDate: episode.date,
        credType: credit.type,
      });
    }

    res.send(
      producerFunction({
        producerCredits: producerCredits,
      })
    );
  });

  //==========================================================

  app.get("/episode/:searchQuery?", async (req, res) => {
    const searchQuery = req.params.searchQuery;
    const credits = await episode_credits(searchQuery);
    let episodeCredits = Array();

    for (const credit of credits) {
      const episode = await get_episode_info(credit.episode_number);
      episodeCredits.push({
        episode_number: credit.episode_number,
        type: credit.type,
        producer: credit.producer,
        title: episode.title,
        episode_length: episode.length,
        episode_date: episode.date,
        episode_artist: episode.artist,
      });
    }
    res.send(
      episodeFunction({
        episodeCredits,
      })
    );
  });
};