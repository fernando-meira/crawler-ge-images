import fs from 'fs'
import path from 'path'
import axios from 'axios'

function downloadVideo(url, filepath) {
  return axios({
    url,
    method: 'GET',
    responseType: 'stream',
  }).then((response) => {
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath)
      response.data.pipe(writer)
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  })
}

;(async () => {
  // Create a folder with the current date to save videos
  const currentDate = new Date().toISOString().slice(0, 10)
  const downloadFolderPath = path.resolve(__dirname, `vid-${currentDate}`)
  if (!fs.existsSync(downloadFolderPath)) {
    fs.mkdirSync(downloadFolderPath)
  }

  const videosUrls = [
    'https://v4.cdnpk.net/videvo_files/video/free/video0466/large_watermarked/_import_61490450321f37.49858282_FPpreview.mp4',
  ]

  // Download the videos
  for await (const [videoIndex, videoUrl] of videosUrls.entries()) {
    console.log(`Baixando vídeo ${videoIndex + 1} de ${videosUrls.length}...`)

    const videoFilename = `video-${videoIndex}.mp4`
    const videoSavePath = path.resolve(downloadFolderPath, videoFilename)

    await downloadVideo(videoUrl, videoSavePath)
  }
})()
