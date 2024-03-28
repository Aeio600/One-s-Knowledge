
/* 7种基础类型: string, number, null, undefined, boolean, void, symbol */
// let a:string = "HelloWworld"
// console.log(a)

/* 4种对象类型: (1)基础对象类型 (2)数组类型 (3)类 类型 (4)函数类型 */
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

/* type annotation类型注解   type inference类型推断 */
// 工作使用问题:如果ts能自动分析变量类型,我们就什么也不需要做了;如果无法分析变量类型的话,我们就需要使用类型注解
function getTotal(one:number, two:number){
  return one + two
}
const total = getTotal(1,2)

/* 函数参数和返回类型的注解 */
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

/* type alias 类型别名 */
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

/* 接口interface */
interface foo {
  name: string;
  age: number;
  sex?: string;
  // 属性名称是字符串类型,属性值是任何类型
  [propname:string]: any;
  // say方法,返回string
  say(): string;
}
// implements实现  当类实现接口的时候，类要实现接口中所有的方法。否则，类必须声明为抽象的类
// 格式如下:
// class 类名称  implements 接口名称{ 

// }
class Foo implements foo{
  name = 'foo';
  age =  18;
  sex = 'girl';
  say(){
    return 'foo'
  } 
}
//extends继承  申明一个类是从另外一个类继承而来的 (包含原有的属性,且可以继续添加属性)
interface Foo1 extends foo {
  teach(): string
}
// extends 与 implements 比较
// extends 是继承某个类, 继承之后可以使用父类的方法, 也可以重写父类的方法;
// implements 是实现多个接口, 接口的方法一般为空的, 必须重写才能使用


/* 类的概念与使用 */
class Lady1{
  content = 'Hi'
  sayHello() {
    return this.content
  }
}
class XiaoJieJie extends Lady1{
  sayHello(){
    // super关键字 表示父类
    return super.sayHello() + '.你好!'
  }
}
const goddess = new XiaoJieJie()
console.log(goddess.sayHello())

/* 类的访问类型 private protected public */
// public  类的内部和外部,都可以被调用
// private  只能在类的内部被调用
// protected  只能在类的内部被调用;但继承的时候,可以在类的外部被调用

/* 类的构造函数 */
class Person1 {
  // public name: string;
  // constructor(name: string){
  //   this.name = name
  // }
  //上面三行简化成如下代码
  constructor(public name: string){}
}
const person = new Person1('jsPang')
console.log(person.name) 




