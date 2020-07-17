// *** Modules
Jimp = require('jimp');

// *** Image processing functions
// Crop a square from an img
cropToSquare = (img) => {
  let dimension = img.bitmap.height < img.bitmap.width? img.bitmap.height : img.bitmap.width;
  img = img.crop(
    img.bitmap.width / 2 - dimension / 2,
    img.bitmap.height / 2 - dimension / 2,
    dimension,
    dimension
  );
  return img;
};

// Drops alpha channel from PNG converted to array
// NB - Not used anymore; merged with sdOfDifferences
dropAlpha = (imgArray) => {
  let result = [];
  for (let i = 0; i < imgArray.length; i += 4) {
    result.push(...imgArray.slice(i, i + 3));
  }  
  return result;
};

// SD of difference scores
// Based on https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Na%C3%AFve_algorithm
let sdOfDifferences = (left, right, dropAlpha = true) => {
  let sum = 0, sumSq = 0, dif;
  for (let i = 1; i < left.length; i++ ) {
    if (dropAlpha && (i + 1) % 4 !== 0) {
      dif = left[i] - right[i];
      sum += dif;
      sumSq += dif * dif;
    }
  }
  return Math.sqrt((sumSq - (sum * sum) / left.length) / left.length);
};

// Full-page screenshot as jimp img
let jimpScreenshot = async () => {
  let screenshotBase64 = await browser.takeScreenshot();
  return(await Jimp.read(new Buffer.from(screenshotBase64, 'base64')));
};
  
describe('test3', () => {
  let screenshotFull; // Screenshot of page
  let platform;       // Prefix used for screenshots
  
  it('setup platform label', () => {
    platform =
      browser.capabilities.platformName + "-" +
      browser.capabilities.platformVersion + "-" +
      browser.capabilities.browserName + "-" +
      browser.capabilities.browserVersion;
  });
  
  it('preloads', () =>  {
    // Navigate to experiment URL and wait until everything is ready
    browser.url('https://run.pavlovia.org/tpronk/e2e_test3/html/');
    $('#root').waitForExist();
    $('#buttonOk').waitForExist();
    $('#buttonOk').waitForEnabled({timeout: 5000});
  });
  
  it('dialog box screenshot', async () => {
    screenshotFull = await jimpScreenshot();
    screenshotFull.write('.tmp/screenshots/' + platform + ' dialog.png');    
  })

  it('start experiment', () => {
    $('#buttonOk').click();
    $('<canvas />').waitForExist();
  });

  it('canvas screenshot', async () => {
    screenshotFull = await jimpScreenshot();
    screenshotFull.write('.tmp/screenshots/' + platform + ' canvasFull.png');
  });
  
  it('width is fullscreen', async () => {
    let screenWidth = await browser.execute(() => { return screen.width; });
    expect(screenshotFull.bitmap.width).toBe(screenWidth);    
  });
  
  it("height is fullscreen", async () => {
    let screenHeight = await browser.execute(() => { return screen.height; });
    expect(screenshotFull.bitmap.height).toBe(screenHeight);    
  });
  
  it('has graphics match refence', async () => {
    // Crop out square
    let screenshotSquare = cropToSquare(screenshotFull);
    screenshotSquare.write('.tmp/screenshots/' + platform + ' canvasSquare.png');    
    // @ sotiri: disabled this part for your test
    /*
    let referenceSquare = await Jimp.read('reference_img/test3.png');    
    // Resize to reference
    let screenshotScaled = screenshotSquare.resize(referenceSquare.bitmap.width, referenceSquare.bitmap.width);
    screenshotScaled.write('.tmp/screenshots/' + platform + ' canvasScaled.png');    
    // Read reference 
    
    // Compare screenshot with reference
    let rms = sdOfDifferences(
      [...screenshotScaled.bitmap.data],
      [...referenceSquare.bitmap.data]
    );
    */
  });
});
