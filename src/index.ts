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
    headless: true,
  })
  const page = await browser.newPage()

  // Navigate the page to a URL
  await page.goto(
    'https://ge.globo.com/rs/futebol/times/gremio/noticia/2023/07/27/luan-chega-a-porto-alegre-para-assinar-com-gremio-e-e-recebido-com-festa-pela-torcida.ghtml'
  )

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 })
  await page.waitForSelector('figure.content-media-figure img')

  const imagesUrls = await page.evaluate(() => {
    const images: any[] = Array.from(
      document.querySelectorAll('figure.content-media-figure img')
    )

    return images.map((image) => image.src)
  })

  // const images = await Promise.all(imagesUrls.map(downloadImage));

  console.log('imagesUrls', imagesUrls)

  for await (const [index, imageUrl] of imagesUrls.entries()) {
    console.log(`Baixando imagem ${index + 1} de ${imagesUrls.length}...`)

    await downloadImage(imageUrl, path.resolve(__dirname, `${index}.jpg`))
  }

  // console.log('imagesUrl', imagesUrl)

  // // Type into search box
  // await page.type('.search-box__input', 'automate beyond recorder')

  // // Wait and click on first result
  // const searchResultSelector = '.search-box__link'
  // await page.waitForSelector(searchResultSelector)
  // await page.click(searchResultSelector)

  // // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector('text/Customize and automate')
  // const fullTitle = await textSelector?.evaluate((el) => el.textContent)

  // // Print the full title
  // console.log('The title of this blog post is "%s".', fullTitle)

  await browser.close()
})()
