import { spider } from "./spider.js";

spider(process.argv[2], (err, filename, downloaded) => {
  if (err) {
    console.error(err);
  } else if (downloaded) {
    console.log(`${filename} 다운로드 완료`);
  } else {
    console.log(`${filename}은 이미 다운로드 받았음`);
  }
});
