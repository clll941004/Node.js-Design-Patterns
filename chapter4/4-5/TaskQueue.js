import { EventEmitter } from "events";

export class TaskQueue extends EventEmitter {
  constructor(concurrency) {
    super();
    this.concurrency = concurrency; // 동시에 실행할 수 있는 최대 작업 수만 입력받음
    this.running = 0; // 실행중인 모든 작업의 수
    this.queue = []; // 보류중인 작업들을 저장하는 큐
  }
  // 새 작업을 queue에 추가, 비동기적으로 this.next 호출
  pushTask(task) {
    this.queue.push(task);
    process.nextTick(this.next.bind(this)); // 컨텍스트를 잃지 않기 위해 bind 사용
    return this;
  }
  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit("empty"); // 작업완료, 실행중인 작업이 없고 queue가 비어있음
    }

    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      task((err) => {
        if (err) {
          this.emit("error", err);
          // 다음 작업을 실행하기 위해 return하지 않음
        }
        this.running--; // 작업 완료시 실행중인 작업의 수 - 갱신
        process.nextTick(this.next.bind(this)); // 비동기적으로 next() 실행해 다른 작업 실행
      });
      this.running++;
    }
  }
}
