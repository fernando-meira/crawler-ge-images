import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import download from 'image-downloader'

function downloadImage(url, filepath) {
  return download.image({
    url,
    dest: filepath,
  })
}

;(async () => {
  // Create a folder with the current date to save the images
  const currentDate = new Date().toISOString().slice(0, 10)
  const downloadFolderPath = path.resolve(__dirname, `img-${currentDate}`)
  if (!fs.existsSync(downloadFolderPath)) {
    fs.mkdirSync(downloadFolderPath)
  }

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ['--disable-extensions'],
    headless: true,
  })
  const page = await browser.newPage()

  // Navigate the page to a URL
  await page.goto('https://ge.globo.com/')

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 })
  await page.waitForSelector('.bstn-hl.type-materia.with-photo')

  // Get all image URLs
  const urls = await page.evaluate(() => {
    const anchors: any[] = Array.from(
      document.querySelectorAll('.bstn-hl.type-materia.with-photo a')
    )

    return anchors.map((image) => image.href)
  })

  console.log('urls', urls)

  // Get the first 3 URLs
  const slicedUrls = urls.slice(0, 3)

  // Download the images
  for await (const [urlIndex, url] of slicedUrls.entries()) {
    console.log(`Crawleando página ${urlIndex + 1} de ${slicedUrls.length}...`)

    await page.goto(url)

    await page.waitForSelector('figure.content-media-figure img')

    const imagesUrls = await page.evaluate(() => {
      const images: any[] = Array.from(
        document.querySelectorAll('figure.content-media-figure img')
      )

      return images.map((image) => image.src)
    })

    for await (const [imageIndex, imageUrl] of imagesUrls.entries()) {
      console.log(
        `Baixando imagem ${imageIndex + 1} de ${imagesUrls.length}...`
      )

      await downloadImage(
        imageUrl,
        path.resolve(downloadFolderPath, `page-${urlIndex}-${imageIndex}.jpg`)
      )
    }
  }

  await browser.close()
})()
