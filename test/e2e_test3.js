// *** Modules
Jimp = require('jimp');

// *** Functions
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
dropAlpha = (imgArray) => {
  let result = [];
  for (let i = 0; i < imgArray.length; i += 4) {
    result.push(...imgArray.slice(i, i + 3));
  }  
  return result;
};

// SD of difference scores
// Based on https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Na%C3%AFve_algorithm
let sdOfDifferences = function (left, right) {
  let sum = 0, sumSq = 0, dif;
  for (let i = 1; i < left.length; i++ ) {
    dif = left[i] - right[i];
    sum += dif;
    sumSq += dif * dif;
  }
  return Math.sqrt((sumSq - (sum * sum) / left.length) / left.length);
};

describe('test3', () => {
  let screenshotFull; // Screenshot of page
  let platform;       // Prefix used for screenshots
  let canvas;
  
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
    // Take screenshot
    let screenshotBase64 = await browser.takeScreenshot();
    screenshotFull = await Jimp.read(new Buffer.from(screenshotBase64, 'base64'));
    screenshotFull.write('.tmp/screenshots/' + platform + ' dialog.png');    
  })

  it('start experiment', () => {
    $('#buttonOk').click();
    canvas = $('<canvas />')
    canvas.waitForExist();
  });

  it('canvas screenshot', async () => {
    let canvasId = await browser.findElement("tag name", "canvas");
    let screenshotBase64 = await browser.takeElementScreenshot(
      Object.values(canvasId)[0]            
    );
    // Convert to PNG
    screenshotFull = await Jimp.read(new Buffer.from(screenshotBase64, 'base64'));
    screenshotFull.write('.tmp/screenshots/' + platform + ' canvasElement.png');
    
    
    // Take screenshot
    screenshotBase64 = await browser.takeScreenshot();
    // Convert to PNG
    screenshotFull = await Jimp.read(new Buffer.from(screenshotBase64, 'base64'));
    screenshotFull.write('.tmp/screenshots/' + platform + ' canvasFull.png');
  });
  
  it('width is fullscreen', async () => {
    // Compare screenshot width with screen width
    let screenWidth = await browser.execute(() => { return screen.width });
    expect(screenshotFull.bitmap.width).toBe(screenWidth);    
  });
  
  it("height is fullscreen", async () => {
  // Compare screenshot width with screen width
    let screenHeight = await browser.execute(() => { return screen.height });
    expect(screenshotFull.bitmap.height).toBe(screenHeight);
  });
  
  it('has graphics match refence', async () => {
    // Read reference image, convert to array, drop alpha
    let referenceSquare = await Jimp.read('reference_img/test3.png');
    // Crop out square
    let screenshotSquare = cropToSquare(screenshotFull);
    screenshotSquare.write('.tmp/screenshots/' + platform + ' canvasSquare.png');    
    // Resize to reference
    let screenshotScaled = screenshotSquare.resize(referenceSquare.bitmap.width, referenceSquare.bitmap.width);
    // Convert screenshot and reference to array, and drop alpha
    let screenshotArray = dropAlpha([...screenshotScaled.bitmap.data]);
    let referenceArray = dropAlpha([...referenceSquare.bitmap.data]);
    // Compare
    rms = sdOfDifferences(screenshotArray, referenceArray);
    // DEBUG
    screenshotSquare.write('.tmp/screenshots/' + platform + ' canvasScaled.png');    
    fail(rms);
  });
});
