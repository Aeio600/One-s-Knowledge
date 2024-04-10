import { reactive } from "vue";

export class Single<T extends object, K> {
  _data;
  store;
  _orgRef;
  ref;

  constructor(data: () => T, ref: () => K) {
    this._data = data
    this._orgRef = ref
    this.ref = this._orgRef()
    this.store = reactive(this._data()) // reactive响应式对象
  }

  init() {
    this.ref = this._orgRef()
    this.store = reactive(this._data()) 
  }

}