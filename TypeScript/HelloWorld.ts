// 7种基础类型: string, number, null, undefined, boolean, void, symbol
let a:string = "HelloWworld"
console.log(a)

// 4种对象类型:(1)基础对象类型 (2)数组类型 (3)类 类型 (4)函数类型
// (1)
const xiaoJie:{
  name: string,
  age: number
} = {
  name: "123",
  age: 12
}
// (2)
const xiaoJies:string[]=['foo','foo1','123']
// (3)
class Person{}
const dajiao:Person = new Person()
// (4)
// ()=>string   返回字符串的一个函数
const jianXiaoJieJie:()=>string = ()=> { return '123'}

// type annotation 类型注解
// type inference 类型推断
// 工作使用问题:如果ts能自动分析变量类型,我们就什么也不需要做了;如果无法分析变量类型的话,我们就需要使用类型注解
function getTotal(one:number, two:number){
  return one + two
}
const total = getTotal(1,2)

// 函数参数和返回类型的注解
function getTotalData(one:number, two:number):number{
  return one + two
}
const totalData = getTotalData(1,2)

function sayHello():void { // void 无返回值
  console.log('foo')
}

function errorFunction():never { // never 永远执行不完(死循环)
  throw new Error()
  console.log('foo')
}

function add({one, two}:{one: number, two: number}){
  return one + two
}
const totalAdd = add({one:1, two:2})

// type alias 类型别名
type Lady = { name:string, age:number }
class Madam {
  name: string;
  age: number
}
const sisters: Lady[] = [
  {name:'foo', age:18},
  {name:'foo1', age:19},
]
const sisters1: Madam[] = [
  {name:'foo', age:18},
  {name:'foo1', age:19},
]

// 接口interface
interface foo {
  name: string;
  age: number;
  sex?: string;
  // 属性名称是字符串类型,属性值是任何类型
  [propname:string]: any;
  // say方法,返回string
  say(): string;
}

