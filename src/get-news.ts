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
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ['--disable-extensions'],
    headless: false,
  })
  const page = await browser.newPage()

  // Navigate the page to a URL
  await page.goto('https://ge.globo.com/')

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 })
  await page.waitForSelector('.bstn-hl.type-materia.with-photo')

  const urls = await page.evaluate(() => {
    const anchors: any[] = Array.from(
      document.querySelectorAll('.bstn-hl.type-materia.with-photo a')
    )

    return anchors.map((image) => image.href)
  })

  console.log('urls', urls)

  const slicedUrls = urls.slice(0, 3)

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
        path.resolve(__dirname, `page-${urlIndex}-${imageIndex}.jpg`)
      )
    }
  }

  await browser.close()
})()
