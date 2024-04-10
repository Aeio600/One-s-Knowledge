type Comm = {
  name: string,
  execute: (...arg:any) => "stop" | void
}

class Command {
  commandsList: Comm[] = []
  /**
   * 添加
   * @param {Object} command 接受一个对象 {name: String,execute: Function}
   */
  add(command: Comm) {
    this.commandsList.push(command)
  }
  remove(name: string) {
    for(var i = 0; i < this.commandsList.length; i++) {
      let command = this.commandsList[i]
    }
  }
}