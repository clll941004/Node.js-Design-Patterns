import fs from "fs";
import path from "path";
import superagent from "superagent";
import mkdirp from "mkdirp";
import { urlToFilename } from "./utils.js";

export function spider(url, cb) {
  const filename = urlToFilename(url);
  // 해당하는 파일이 존재하는지 확인해 해당 URL에서 이미 다운로드 했는지 검사
  // err가 정의되어 있고 타입이 ENOENT 라면 파일이 존재하지 않으므로 파일 생성에 문제가 없음
  fs.access(filename, (err) => {
    if (err && err.code === "ENOENT") {
      console.log(`${filename} 내에 ${url}을 다운로드 합니다.`);
      // 파일을 찾을 수 없는 경우 url 다운로드 시도
      superagent.get(url).end((err, res) => {
        if (err) {
          cb(err);
        } else {
          // 저장될 디렉토리가 있는지 확인
          mkdirp(path.dirname(filename), (err) => {
            if (err) {
              cb(err);
            } else {
              // HTTP 응답의 내용을 파일 시스템에 씀
              fs.writeFile(filename, res.text, (err) => {
                if (err) {
                  cb(err);
                } else {
                  cb(null, filename, true);
                }
              });
            }
          });
        }
      });
    } else {
      cb(null, filename, false);
    }
  });
}
