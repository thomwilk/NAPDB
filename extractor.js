const { response } = require('@hapi/hapi/lib/validation');
const fs = require('fs')
const fsp = require('fs').promises
const axios = require('axios');
const cheerio = require('cheerio');

async function extractor(epNum) {
  const html = await axios.get("https://www.noagendashow.net/listen/"+epNum)
    .then(response => response.data).catch(error => {
      console.log(error)
    })
    const $ = cheerio.load(html);
    let episode_date = $('#swup > section:nth-child(5) > div.section-buttons-full > a:nth-child(1)').attr('href').split(/NA-\d{3,4}-/)[1].split(/-Final/i)[0]
    let episode_title = $('title').text().split(/No Agenda \d{3,5}: /)[1]
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

async function newest_episode() {
  const html = await axios.get(`https://www.noagendashow.net`).then(response => response.data);
  const $ = cheerio.load(html);
  let episode_num = $('#swup > section:nth-child(2) > div.episodes > a:nth-child(2) > h3').text().split(/:/)[0]
  return episode_num
}

async function download_art(epNum) {
  url = "https://www.noagendashow.net/media/cache/cover_small/" + epNum + ".png"
  try {
      const response = await axios({
          method: "GET",
          url: url,
          responseType: "stream"
      })
      const dir = './art/';
      try {
          await fsp.stat(dir)
      } catch (err) {
          if (err.code === 'ENOENT') {
              await fsp.mkdir(dir)
          }
      }
      const fileName = `${dir}${epNum}.png`
      const file = fs.createWriteStream(fileName)
      response.data.pipe(file)
      file.on('finish', () => {
          console.log("Episode's art has been saved")
      })
      return fileName
  } catch (error) {
      console.log(error)
  }
}


module.exports = {
  extractor,
  newest_episode,
  download_art,
}
