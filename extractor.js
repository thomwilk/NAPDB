const fs = require('fs')
const request = require('request');
const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');

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
  const url = `https://www.noagendashow.net/media/cache/cover_small/${epNum}.png`;
  const dest = `./art/${epNum}.png`;

  /* Create an empty file where we can save data */
  const file = fs.createWriteStream(dest);

  /* Using Promises so that we can use the ASYNC AWAIT syntax */
  await new Promise((resolve, reject) => {
    request({
      uri: url,
      gzip: true,
    })
      .pipe(file)
      .on('finish', async () => {
        console.log(`Episode ${epNum}'s art downloaded`);
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  })
    .catch((error) => {
      console.log(`Error: ${error}`);
    });

  /* Get the metadata of the image to determine its format */
  const metadata = await sharp(dest).metadata();
  if (!metadata.format) {
    console.log(`Error: Episode ${epNum}'s art format is unsupported`);
    fs.unlink(dest, (err) => {
      if (err) {
        console.log(`Error deleting ${dest}: ${err}`);
      } else {
        console.log(`Deleted ${dest}`);
      }
    });
    return;
  }

  /* Check if the image format is supported */
  const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'heif', 'avif'];
  if (!supportedFormats.includes(metadata.format.toLowerCase())) {
    console.log(`Error: Episode ${epNum}'s art format is unsupported`);
    fs.unlink(dest, (err) => {
      if (err) {
        console.log(`Error deleting ${dest}: ${err}`);
      } else {
        console.log(`Deleted ${dest}`);
      }
    });
    return;
  }

  /* Resize the image to 80x80 */
  await sharp(dest)
    .resize(80, 80)
    .toFile(`./art/${epNum}-resized.png`, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log(`Episode ${epNum}'s art resized`);
        /* Delete the original file */
        fs.unlink(dest, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log(`Episode ${epNum}'s original art deleted`);
          }
        });
        /* Rename the resized file */
        fs.rename(`./art/${epNum}-resized.png`, `./art/${epNum}.png`, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log(`Episode ${epNum}'s resized art renamed`);
          }
        });
      }
    });
}



module.exports = {
  extractor,
  newest_episode,
  download_art,
}
