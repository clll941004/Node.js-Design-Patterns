import fs from "fs";
import path from "path";
import superagent from "superagent";
import mkdirp from "mkdirp";
import { urlToFilename, getPageLinks } from "./utils.js";

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

function spiderLinks(currentUrl, body, nesting, cb) {
  if (nesting === 0) {
    return process.nextTick(cb);
  }

  // getPageLinks() : 페이지에 포함된 모든 링크를 획득 ( 동일 호스트 네임의 링크만 반환 )
  const links = getPageLinks(currentUrl, body);
  if (links.length === 0) {
    return process.nextTick(cb);
  }

  // 링크 length만큼 반복
  function iterate(index) {
    if (index === links.length) {
      return cb();
    }

    // 링크를 처리하기 위한 모든 준비가 완료
    spider(links[index], nesting - 1, function (err) {
      if (err) {
        return cb(err);
      }
      iterate(index + 1);
    });
  }

  // 반복 시작
  iterate(0);
}

export function spider(url, nesting, cb) {
  const filename = urlToFilename(url);

  fs.readFile(filename, "utf8", (err, fileContent) => {
    if (err) {
      if (err.code !== "ENOENT") {
        return cb(err);
      }

      // 파일이 존재하지 않아 다운로드
      return download(url, filename, (err, requestContent) => {
        if (err) {
          return cb(err);
        }
        spiderLinks(url, requestContent, nesting, cb);
      });
    }
    // 파일이 존재해 링크를 처리
    spiderLinks(url, fileContent, nesting, cb);
  });
}
