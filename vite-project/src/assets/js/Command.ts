type Comm = {
  name: string,
  execute: (...arg: any) => "stop" | void
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
    for (var i = 0; i < this.commandsList.length; i++) {
      let command = this.commandsList[i]
      if (command.name == name) {
        this.commandsList.splice(i, 1)
        return
      }
    }
  }
  size() {
    return this.commandsList.length
  }
  has(name: string) {
    return !!~this.commandsList.findIndex(it => it.name == name)
  }
  // 执行
  execute(...arg: any) {
    if (!this.commandsList.length) return
    let res = null
    for (var i = 0, command; command = this.commandsList[i++];) {
      if (res == 'stop') {
        return
      }
      res = command.execute(...arg)

    }

  }
}

export default Command