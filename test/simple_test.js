Jimp = require('jimp');
fs = require('fs');

describe('simple_test', () => {
  let platform;       // Prefix used for screenshots
  
  it('setup platform label', () => {
    platform =
      browser.capabilities.platformName + "-" +
      browser.capabilities.platformVersion + "-" +
      browser.capabilities.browserName + "-" +
      browser.capabilities.browserVersion;
  });
    
  it('loads page', () =>  {
    // Navigate to experiment URL and wait until everything is ready
    browser.url('https://thomaspronk.com/temp/simple_test.html');
    $('#startCanvas').waitForExist();
    $('#startCanvas').click();
    browser.pause(100);
  });
  
  it('take screenshot', async () => {
    // Take screenshot
    let screenshotBase64 = await browser.takeScreenshot();
    screenshotFull = await Jimp.read(new Buffer.from(screenshotBase64, 'base64'));
    screenshotFull.write('.tmp/screenshots/' + platform + ' simple_test.png');
  });
  
  it('custom log', () => {
    // @ sotiri, here I'm setting up a custom file for additional logs; work in progress
    console.log(browser.capabilities['webdriver.remote.sessionid']);
    fs.writeFileSync(
      '.tmp/custom_logs/' + browser.capabilities['webdriver.remote.sessionid'] + '.json',
      JSON.stringify({
        'label': platform,
        'rms': 20,
        'capabilities': browser.capabilities
      })
    );
  });
});
