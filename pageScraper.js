require("dotenv").config()

const {
  add_credit,
  add_episode,
  last_episode_saved
} = require("./db")

const {
  get_latest_episode_number,
  get_episode_date,
  get_episode_html,
  get_episode_length,
  get_episode_title,
  get_artist,
  get_producers,
  download_art,
} = require("./dataExtract")

const process_episode = async (episode_num = null) => {
  console.log("Episode Num " + episode_num)
  if (episode_num == null) {
    episode_num = await get_latest_episode_number()
  }
  const episode_html = await get_episode_html(`${episode_num}`)
  const episode_date = await get_episode_date(episode_html)
  const episode_title = await get_episode_title(episode_html)
  const episode_length = await get_episode_length(episode_html)
  const episode_artist = await get_artist(episode_html)
  const executive_producers = await get_producers(episode_html, "exec")
  const associcate_producers = await get_producers(episode_html, "assoc")

  console.log(`======== Start processing episode ${episode_num} ========`)

  for (let i = 0; i < executive_producers.length; i++) {
    const credit = {
      "producer": executive_producers[i],
      "type": "Executive",
      "episode_number": episode_num
    }
    await add_credit(credit)
  }

  for (let i = 0; i < associcate_producers.length; i++) {
    const credit = {
      "producer": associcate_producers[i],
      "type": "Associcate",
      "episode_number": episode_num
    }
    await add_credit(credit)
  }

  const episode = {
    "number": episode_num,
    "title": episode_title,
    "date": episode_date,
    "length": episode_length,
    "artist": episode_artist,
  }

  add_episode(episode)

  await download_art(`${episode_num}`)

  const art_credit = {
    "producer": episode_artist,
    "type": "Artist",
    "episode_number": episode_num
  }

  await add_credit(art_credit)

  console.log(`======== Finished processing episode ${episode_num} ========`)
}

const update_database = async() => {
  const latest_saved = await last_episode_saved()
  const latest_published = await get_latest_episode_number()
  if (latest_saved == latest_published) {
    console.log("The database is up to date")
  }
  else {
    for (let i = latest_saved + 1; i <= latest_published; i++) {
      await process_episode(i)
    }
  }
  process.exit(0)
}

const process_batch = async (first, last) => {
  for (let i = first; i <= last; i++) {
    await process_episode(i)
  }
  process.exit(0)
}

//process_episode(612)
//process_batch(612, 1474)
update_database()