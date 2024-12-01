// 제한된 동시성(concurrency)을 유지하면서 비동기 작업을 실행하는 패턴
// 한 번에 지정된 수(concurrency)의 작업만 실행하도록 제한하면서도, 모든 작업이 완료될 때까지 동작

const task = [
  // ...
];

const concurrency = 2; // 동시에 실행할 수 있는 최대 작업 수
let running = 0; // 현재 실행 중인 작업 수
let completed = 0; // 완료된 작업 수
let index = 0; // 다음에 실행할 작업의 tasks 배열 인덱스

function next() {
  while (running < concurrency && index < tasks.length) {
    const task = tasks[index++];
    task(() => {
      if (++completed === tasks.length) {
        return finish();
      }
      running--;
      next();
    });
    running++;
  }
}
next();

function finish() {
  //...
}
