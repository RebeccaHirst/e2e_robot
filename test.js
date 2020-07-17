const fs = require('fs');

if (!fs.existsSync('.tmp/')) {
  fs.mkdirSync('.tmp/');
};
let paths = ['.tmp/json_logs', '.tmp/screenshots', '.tmp/custom_logs'];
let files, path;
for (let path_i in paths) {
  path = paths[path_i];
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  } else {
    files = fs.readdirSync(path);
    for (let file_i in files) {
      fs.unlinkSync(path + '/' + files[file_i]);
    }
  }
} 