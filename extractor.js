const request = require('request-promise-native');
const cheerio = require('cheerio');

async function extractor(epNum) {
    const html = await request.get(`https://www.noagendashow.net/listen/${epNum}`);
    const $ = cheerio.load(html);
    let episode_date = $('#swup > section:nth-child(5) > div.section-buttons-full > a:nth-child(1)').attr('href')
    let episode_title = $('title').text()
    let episode_length = $('.hero-text > div').text().split(" • ")[1];
    const episode_artist = $('#swup > section:nth-child(4) > div > p:nth-child(9)').text();
    const executive_producers = $('#swup > section:nth-child(4) > div > p:nth-child(5)').text().split(/, (?=[A-Z])/)
    const associcate_producers = $('#swup > section:nth-child(4) > div > p:nth-child(7)').text().split(/, (?=[A-Z])/)

  const epInfo = {
    epDate: episode_date, epTitle: episode_title, epLength: episode_length,
    epArtist: episode_artist, epExecs: executive_producers, epAssocs: associcate_producers
  }
  return epInfo
}

module.exports = {
  extractor,
}
