require("dotenv").config()
const request = require('request')
const client = require("https")
const fs = require('fs')
const axios = require("axios")

const { add_credit, add_episode, last_episode_saved } = require("./db")

const { extractor, newest_episode } = require("./extractor")

const process_episode = async (episode_num = null) => {
  if (episode_num == null) {
    episode_num = parseInt(await last_episode_saved()) + 1
  }

  const html = await extractor(episode_num)

  const episode_date = html.epDate
  const episode_title = html.epTitle
  const episode_length = html.epLength
  const episode_artist = html.epArtist
  const executive_producers = html.epExecs
  const associcate_producers = html.epAssocs

  console.log(`======== Start processing episode ${episode_num} ========`)

  for (let i = 0; i < executive_producers.length; i++) {
    const credit = {
      producer: executive_producers[i],
      type: "Executive",
      episode_number: episode_num,
    }
    await add_credit(credit)
  }

  for (let i = 0; i < associcate_producers.length; i++) {
    const credit = {
      producer: associcate_producers[i],
      type: "Associcate",
      episode_number: episode_num,
    }
    await add_credit(credit)
  }

  const episode = {
    number: episode_num,
    title: episode_title,
    date: episode_date,
    length: episode_length,
    artist: episode_artist,
  }

  add_episode(episode)  

  const art_credit = {
    producer: episode_artist,
    type: "Artist",
    episode_number: episode_num,
  }

  await add_credit(art_credit)

  console.log(`======== Finished processing episode ${episode_num} ========`)
}

const update_database = async () => {
  const latest_saved = await last_episode_saved()
  const newest_ep = await newest_episode()
  if (latest_saved == newest_ep) {
    console.log("The database is up to date")
    return 0
  }
  for (let i = latest_saved + 1; i <= newest_ep; i++) {
    await process_episode(i)
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
//process_batch(616, 1520)
update_database()