import fs from "fs";
import path from "path";
import superagent from "superagent";
import mkdirp from "mkdirp";
import { urlToFilename } from "./utils.js";

function saveFile(filename, contents, cb) {
  // 저장될 디렉토리가 있는지 확인
  mkdirp(path.dirname(filename), (err) => {
    if (err) {
      return cb(err);
    }
    // HTTP 응답의 내용을 파일 시스템에 씀
    fs.writeFile(filename, contents, cb);
  });
}

function download(url, filename, cb) {
  console.log(`"${url}" 다운로드중...`);
  superagent.get(url).end((err, res) => {
    if (err) {
      return cb(err);
    }
    saveFile(filename, res.text, (err) => {
      if (err) {
        return cb(err);
      }
      console.log(`"${url}" 다운로드 및 저장 완료`);
      cb(null, res.text);
    });
  });
}

export function spider(url, cb) {
  const filename = urlToFilename(url);
  fs.access(filename, (err) => {
    if (!err || err.code !== "ENOENT") {
      return cb(null, filename, false);
    }
    download(url, filename, (err) => {
      if (err) {
        return cb(err);
      }
      cb(null, filename, true);
    });
  });
}
