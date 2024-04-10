import _, { StringIterator } from "lodash"
import { Single } from "@/assets/js/single"
import D3 from "@/assets/js/d3";
import { Block } from "./Block"
import { ForkliftCar } from "./forkliftCar";
import { TopCar } from "./topCar";
import { Cabinet } from "./Cabinet"
export type CarList = {
  type: 'ForkliftCar' | 'TopCar',
  name: string,
  position: Base.Vec3,
  layer: '2F' | '3F' | '4F'
  // power: number,
  // state: 'await' | 'recharge' | 'run' // 状态
}
import { ExecuteStack } from "./ExecuteStack"
import { animationMap, getMarkStateMap } from "./animationMap"
import { ObjMarker, SpriteIcon } from "./spriteIcon";
import { RFID } from "./RFID";
import * as buildingApi from '@/api/building/buildingApi'
import { Road } from "@/assets/js/road";
import { PollingData } from "./PollingData";
import { RFIDPathPoint } from "./RFIDPathPoint";
import { WaterLeak } from "./WaterLeak";



export type D3State = {
  opacityLevel: number,
  menuActive: number,
  opacity: number,
  loading: boolean,
  showAll: boolean,
  // building?: BuildingGui,
  startAnimationFinish: boolean, //是否完成开始动画
  isSpread: boolean //楼层是否炸开
  dianJuanStart: boolean
  actionStepIndex: number
  infoBoxList: { component: string, id: string, group: THREE.Object3D | THREE.Vector3, data: any }[]
  CSS3DList: { component: string, id: string, position: THREE.Vector3 | (() => THREE.Vector3), scale?: number, data: any }[]
  CSS3DMarkerCodeList: { component: string, id: string, position: THREE.Vector3 | (() => THREE.Vector3), scale?: number, data: any }[]
  carList: CarList[]
  cursor: string,
  allCabinet?: THREE.Group,
  disinfectHouse: THREE.Object3D | null,
  dehumidifier50: THREE.Object3D[],
  dehumidifier180: THREE.Object3D[],
  temHum: THREE.Object3D[],
  MarkStateMap: ReturnType<typeof getMarkStateMap>,
  boxPath: boolean, // 料箱轨迹
  MarkerNntransparent: boolean,
  showBubbleButton: boolean, // 气泡按钮
  dataMap: {
    rooms: buildingApi.RoomStatus[],
    levelStatus?: buildingApi.LevelStatus,
    carList: buildingApi.CarState[]
  },
  transferOfRecords: {
    showTask: boolean
    showCarList: boolean
  },
  cameraVideoKeyYulan: string,
  cameraVideoKeyHuifang: string,
  dianjuanMonitor: string[],
  boxPathActive: {
    num: string
  }
  blockState: string,
  childMenuLength: number,
  allRoomList: buildingApi.Room[]
  layerFireState: { code: string, state: 0 | 1, layer: 'B1' | '1F' | '2F' | '3F' | '4F' | 'RF' }[] //0异常 1正常
}

type RefData = {
  d3?: D3,
  block?: Block
  markerGroupMap: Map<string, THREE.Group>
  carMap: Map<string, ForkliftCar | TopCar>
  liftGroupMap: Map<string, THREE.Group>
  cabinetAreaMap: Map<string, Cabinet>
  menuStack: ExecuteStack<typeof animationMap['first']>
  intersectObjs: THREE.Object3D[]
  modelCacheMap: Map<string, THREE.Object3D>
  stopMenuTweenList: any[],
  spriteIconMap: Map<string, SpriteIcon | RFID | ObjMarker | WaterLeak>
  RoadMap: Map<string, RFIDPathPoint>
  pollingData: PollingData
}
// 响应
const data: () => D3State = () => {
  return {
    opacityLevel: 0.08,//鼠标悬浮按钮除了报警之外的透明度
    menuActive: -1,
    opacity: 10,
    loading: true,
    showAll: true,
    startAnimationFinish: false,
    isSpread: false,
    actionStepIndex: 0,
    dianJuanStart: false,
    carList: [],
    infoBoxList: [],
    CSS3DList: [],
    CSS3DMarkerCodeList: [],
    boxPath: false,
    cursor: '',
    disinfectHouse: null,
    dehumidifier50: [],
    dehumidifier180: [],
    temHum: [],
    MarkStateMap: getMarkStateMap(),
    MarkerNntransparent: true,
    showBubbleButton: false,
    transferOfRecords: {
      showTask: false,
      showCarList: false
    },
    dataMap: {
      rooms: [],
      carList: [],
    },
    cameraVideoKeyYulan: '',
    cameraVideoKeyHuifang: '',
    dianjuanMonitor: [],
    boxPathActive: {
      num: ''
    },
    blockState: '',
    childMenuLength: 0,
    layerFireState: [],
    allRoomList: []
  }
}
// 不响应
const ref: () => RefData = () => {
  return {
    markerGroupMap: new Map(),
    liftGroupMap: new Map(),
    carMap: new Map(),
    cabinetAreaMap: new Map(),
    menuStack: new ExecuteStack(),
    intersectObjs: [],
    modelCacheMap: new Map(),
    stopMenuTweenList: [],
    spriteIconMap: new Map(),
    pollingData: new PollingData(),
    RoadMap: new Map(),
  }
}
// data可响应,ref不可响应
export const buildingStore = new Single(data, ref)
