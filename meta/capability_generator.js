// *** CONFIGURATION
const outputFile = 'capabilities.json';
const config = {
  build: 'production',
  name: 'rms',        
  project: 'test3',  
  'browserstack.local' : "false",
  'browserstack.video' : "false",   
};
const platforms = [
  {
    "os": "Windows",
    "os_version": "10",
    "browserNames": ["Chrome", "Edge", "Firefox", "IE"]
  },
  {
    "os": "OS X",
    "os_version": "Catalina",
    "browserNames": ["Chrome", "Edge", "Firefox", "Safari"]
  }
];

// *** ALGORITHM
const fs = require("fs");
let output = [], capability, platform;
for (let platform_i in platforms) {
  platform = platforms[platform_i];
  for (let browser_i in platform.browserNames) {
    capability = JSON.parse(JSON.stringify(config));
    capability.os = platform.os;
    capability.os_version = platform.os_version;
    capability.browserName = platform.browserNames[browser_i];
    output.push(capability);
  }
}
console.log(output);