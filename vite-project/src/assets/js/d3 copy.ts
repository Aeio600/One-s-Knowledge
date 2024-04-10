import Command from "./Command.js";
import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import util from "./d3Utils";
import Stats from "three/examples/jsm/libs/stats.module"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GroundProjectedEnv } from 'three/examples/jsm/objects/GroundProjectedEnv';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import _ from "lodash"
import { RectAreaLight } from "three";
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js"
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js"

const materialCssPlane = new THREE.MeshBasicMaterial({ color: 0x00000000, wireframe: true, wireframeLinewidth: 1, side: THREE.DoubleSide });
// const materialCssPlane = new THREE.MeshBasicMaterial({ color: 0x00000000, transparent: true, opacity: 0, alphaTest: 1, side: THREE.DoubleSide });

// 屏幕空间反射
// import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass.js';
// import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
// import { ReflectorForSSRPass } from 'three/examples/jsm/objects/ReflectorForSSRPass.js';

// import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator.js';

type Vec3 = [number, number, number]

class D3 {
  dom: {
    el: HTMLElement,
    width: number,
    height: number,
  }
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  onMousemove?: ((e: THREE.Raycaster) => void);
  onMousemoveCommand = new Command()
  onClick?: ((e: THREE.Raycaster) => void);
  onClickCommand = new Command()
  scene?: THREE.Scene;
  resizeCommand: Command
  composer?: EffectComposer
  env?: GroundProjectedEnv
  tween: {
    render: boolean
  }
  controls?: OrbitControls
  controlsCommand?: Command
  _controlCommandTimer?: number
  isControlsChange?: boolean
  onControls?: (() => void);
  _mouse?: THREE.Vector2
  outlinePass?: OutlinePass
  effectFXAA?: ShaderPass
  reques?: number
  clock: THREE.Clock
  timeS: number
  FPS: number
  renderT: number
  corrdinateXAxisreverse?: boolean
  sceneCorrdinate?: {
    zero: Vec3,
    rate: number,
  }
  stats?: Stats
  isCameraRotateMouseState: {
    down: boolean,
    downEvent?: MouseEvent,
    upEvent?: MouseEvent,
  } = {
      down: false,
      downEvent: undefined,
      upEvent: undefined
    }
  scale: number
  onrenderer?: (() => void)
  animateCommand: Command
  cameraRotateMouseup?: ((e: MouseEvent) => void)
  cameraRotateMousedown?: ((e: MouseEvent) => void)
  onWindowResizeEventFn?: (() => void)
  onResize?: (() => void)
  cubeCamera?: THREE.CubeCamera
  CSS3DScene?: THREE.Scene
  CSS2DRenderer?: CSS2DRenderer
  _ableRender = true
  _renderTimeout = 0
  _bodyMouseMove?: ((e: MouseEvent) => void)
  _bodyMouseMethod?: (e: any) => void
  CSS3DGroup?: THREE.Object3D
  offsetLeft: number | null = null
  offsetTop: number | null = null

  constructor(dom: HTMLElement) {
    this.dom = {
      el: dom,
      width: dom.offsetWidth,
      height: dom.offsetHeight
    };
    this.tween = {
      render: false,
    };

    // 光线投射器和鼠标向量
    this.raycaster = new THREE.Raycaster();

    // 控制帧率
    this.clock = new THREE.Clock();
    this.timeS = 0;
    // 设置渲染频率为30FBS，也就是每秒调用渲染器render方法大约30次
    this.FPS = import.meta.env.DEV ? 90 : 60;
    this.renderT = 1 / this.FPS;

    // 重置窗口 Command
    this.resizeCommand = new Command()
    this.scale = 1
    this.animateCommand = new Command()
  }

  async addHDR(conf?: {
    HDRSrc?: string,
    showBackground?: boolean
  }) {
    if (!(this.renderer && this.scene)) {
      throw "未初始化 renderer scene"
    }
    conf = Object.assign({
      HDRSrc: 'models/env/blouberg_sunrise_2_1k.hdr',
      showBackground: true
    }, conf)
    let envMap
    if (conf.HDRSrc!.endsWith('.hdr')) {
      const hdrLoader = new RGBELoader();
      envMap = await hdrLoader.loadAsync(conf.HDRSrc!);
    } else {
      envMap = await util.getTexture(conf.HDRSrc!);
    }
    envMap.mapping = THREE.EquirectangularReflectionMapping
    envMap.wrapS = THREE.RepeatWrapping;
    envMap.offset.x += 10
    // alphaTexture.repeat.set(Math.floor(this.allLong / 2), 1)
    if (conf.showBackground) {
      this.scene.background = envMap
    }
    this.scene.environment = envMap;
    return envMap

  }

  // 默认初始化
  init(callback?: () => {}) {
    this.initRender();
    this.initCamera();
    this.initScene();
    // this.initAmbientLight(); // 环境光
    this.initResize();

    callback && callback()

    // this.initEffectComposer()
    // this.addGridHelper();
    // this.addAxesHelper();

    this.animate();

    this.addMouseMoveEvent();
    this.addClickEvent();
    this.addMousewheel()
  }

  initRender(conf?: {
    shadows?: boolean,
    tone?: { // 色调映射
      mapping: THREE.ToneMapping,
      mappingExposure?: number,
      mappingWhitePoint?: number,
    }
  }) {
    conf = Object.assign({
      shadows: true,
      tone: {
        mapping: THREE.ACESFilmicToneMapping,
        mappingExposure: 1,
        // mappingWhitePoint: 8,
      }
    }, conf)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, // 是否执行抗锯齿。默认为false.
      alpha: true, // 透明背景
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.dom.width, this.dom.height);
    if (conf.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap// THREE.VSMShadowMap
    }
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // 定义gammaOutput和gammaFactor
    if (conf.tone) {
      this.renderer.toneMapping = conf.tone.mapping; // 曝光
      this.renderer.toneMappingExposure = conf.tone.mappingExposure!; // 曝光 越大越靓
      // this.renderer.toneMappingWhitePoint = tone.mappingWhitePoint // 白点 越小越量
    }

    this.dom.el.appendChild(this.renderer.domElement);
  }
  initCamera(conf?: {
    far?: number
    lookAt?: Vec3
    cameraPosition?: Vec3
    near?: number
  }) {
    conf = Object.assign({
      far: 1000,
      near: 0.1,
      lookAt: [0, 0, 0],
      cameraPosition: [0, 0, 500]
    }, conf)
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.dom.width / this.dom.height,
      conf.near,
      conf.far
    );
    conf.lookAt && this.camera.lookAt(...conf.lookAt);
    this.camera.position.set(...conf.cameraPosition!);
  }
  initScene() {
    this.scene = new THREE.Scene();
  }

  initCSS3D() {
    this.CSS3DScene = new THREE.Scene()

    if (this.offsetTop === null) {
      this.getElOffset()
    }
    this.CSS2DRenderer = new CSS2DRenderer()
    this.CSS2DRenderer.setSize(this.dom.width, this.dom.height)
    this.CSS2DRenderer.domElement.style.position = 'absolute'
    this.CSS2DRenderer.domElement.style.top = this.offsetTop + 'px'
    this.CSS2DRenderer.domElement.style.left = this.offsetLeft + 'px'
    this.CSS2DRenderer.domElement.style.pointerEvents = 'none'
    document.body.appendChild(this.CSS2DRenderer.domElement);
  }


  createCSS3DPlane(element: HTMLDivElement, width?: number, height?: number, pos?: THREE.Vector3, rot?: THREE.Euler, scale?: THREE.Vector3) {

    width = width || element.offsetWidth
    height = height || element.offsetHeight
    pos = pos || new THREE.Vector3()
    rot = rot || new THREE.Euler(0, 0, 0)
    scale = scale || new THREE.Vector3(1, 1, 1)

    const object = new CSS2DObject(element);
    object.position.copy(pos);
    object.rotation.copy(rot);
    object.scale.copy(scale)
    this.CSS3DScene && this.CSS3DScene.add(object);

    // const geometry = new THREE.PlaneGeometry(width, height);
    // const mesh = new THREE.Mesh(geometry, materialCssPlane);
    // mesh.position.copy(object.position);
    // mesh.rotation.copy(object.rotation);
    // mesh.scale.copy(scale)
    // let css3dGroup = this.getCSS3DGroup()
    // css3dGroup.add(mesh);
    return {
      // meshObject: mesh,
      CSS2DObject: object
    }
  }
  // 获取css3Dgroup
  getCSS3DGroup() {
    if (!this.CSS3DGroup) {
      this.CSS3DGroup = new THREE.Group()
      this.CSS3DGroup.name = 'CSS3DGroup'
      this.scene?.add(this.CSS3DGroup)
    }
    return this.CSS3DGroup
  }
  // 雾
  setFog(conf: Partial<{
    color: number,
    near: number,
    far: number,
    group: THREE.Object3D // 通过 group 来计算雾气
  }>) {
    conf = Object.assign({
      color: 0x001337,
      near: 10,
      far: 1000,
    }, conf)
    if (!this.scene) {
      throw "未初始化 scene"
    }
    if (conf.group) {
      let size = util.getSize(conf.group);
      let maxSize = Math.max(size.x, size.y, size.z);
      conf.near = maxSize * 0.5;
    }
    this.scene.fog = new THREE.Fog(conf.color!, conf.near);
  }
  initCameraRotate() {
    if (!this.camera) {
      throw "未初始化 camera"
    }
    let camera = this.camera
    camera.rotation.order = 'YXZ';
    this.dom.el.addEventListener('mousedown', (e) => {
      this.isCameraRotateMouseState.down = true
      this.isCameraRotateMouseState.downEvent = e
    });
    this.cameraRotateMouseup = (e: MouseEvent) => {
      this.isCameraRotateMouseState.down = false
      this.isCameraRotateMouseState.upEvent = e
    }
    this.cameraRotateMousedown = (event: MouseEvent) => {
      if (this.isCameraRotateMouseState.down) {
        camera.rotation.y += event.movementX / 500;
        camera.rotation.x += event.movementY / 500;
        // console.log('camera.rotation.y', camera.rotation.y);
        // 摄像机朝向 -z 为 0 度
      }
    }
    document.addEventListener('mouseup', this.cameraRotateMouseup);
    document.body.addEventListener('mousemove', this.cameraRotateMousedown);
  }
  // 环境光
  initAmbientLight(conf?: { color?: number, opacity?: number }) {
    if (!this.scene) {
      throw "未初始化 scene"
    }
    conf = Object.assign({
      color: 0xffffff,
      opacity: 0.8
    }, conf)
    var ambient = new THREE.AmbientLight(conf.color, conf.opacity);
    this.scene.add(ambient);
  }

  // 天光
  initHemisphereLight(conf?: Partial<{
    skyColor: number
    groundColor: number
    intensity: number
    position: Vec3,
    name: string
  }>) {
    if (!this.scene) {
      throw "未初始化 scene"
    }
    conf = {
      skyColor: 0x4488bb,
      groundColor: 0x002244,
      intensity: 0.5,
      position: [2, 1, 1],
      ...conf
    }
    const fillLight = new THREE.HemisphereLight(conf.skyColor, conf.groundColor, conf.intensity);
    conf.position && fillLight.position.set(...conf.position);
    conf.name && (fillLight.name = conf.name)
    this.scene.add(fillLight);
    return fillLight
  }
  //平面光光源
  initRectAreaLight(conf?: {
    width: number
    height: number
    intensity: number
    position: Vec3
    color: number
  }) {
    if (!this.scene) {
      throw "未初始化 scene"
    }
    conf = Object.assign({
      color: 0xffffff,
      width: 10,
      height: 0.1,
      intensity: 1,
      position: [5, 1, 3]
    }, conf)
    RectAreaLightUniformsLib.init();
    const rectLight = new RectAreaLight(conf.color, conf.intensity, conf.width, conf.height);
    rectLight.position.set(...conf.position);
    rectLight.lookAt(4, 1, 3)
    const geometry = new THREE.SphereGeometry(0.5, 32, 16);
    const material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0, metalness: 0.5 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(4, 1, 3)
    this.scene.add(sphere);
    this.scene.add(rectLight);
  }
  // 聚光灯
  addSpotLight(conf?: Partial<{
    position: Vec3
    lookAt: Vec3
    angle: number
    color: number
    intensity: number
    ableHelper: boolean
  }>) {
    conf = {
      position: [1, 2, 3],
      lookAt: [0, 0, 0],
      angle: Math.PI / 6,
      color: 0xffffff,
      intensity: 5,
      ableHelper: false,
      ...conf
    }
    if (!conf) return
    let spotLight = new THREE.SpotLight(conf.color, conf.intensity);
    let target = new THREE.Object3D()
    target.position.set(...conf.lookAt!)
    spotLight.position.set(...conf.position!);
    spotLight.angle = conf.angle!; // 锥体范围
    spotLight.penumbra = 1; // 聚光锥的半影衰减百分比。在0和1之间的值。默认为0。
    spotLight.decay = 2; // 沿着光照距离的衰减量
    spotLight.distance = 50; // 从光源发出光的最大距离，其强度根据光源的距离线性衰减。
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 20;
    spotLight.shadow.focus = 1;
    spotLight.target = target
    this.scene?.add(spotLight);
    this.scene?.add(target)

    if (conf.ableHelper) {
      let lightHelper = new THREE.SpotLightHelper(spotLight);
      lightHelper.lookAt(new THREE.Vector3(...conf.lookAt!))
      this.scene?.add(lightHelper);
    }
    return {
      spotLight,
      target
    }
  }

  // 平行光
  initDirectionalLight(conf?: {
    color?: number,
    intensity?: number
    position?: Vec3,
    name?: string,
  }) {
    if (!this.scene) {
      throw "未初始化 scene"
    }
    conf = Object.assign({
      color: 0xffffff,
      intensity: 0.8,
      position: [-5, 25, -1]
    }, conf)
    const directionalLight = new THREE.DirectionalLight(conf.color, conf.intensity);
    conf.position && directionalLight.position.set(...conf.position);
    conf.name && (directionalLight.name = conf.name)
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 1500;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.left = - 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = - 30;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = - 0.00006;
    this.scene.add(directionalLight);
    return directionalLight
  }

  // 帧率
  initStats() {
    try {
      this.stats = Stats();
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '0px';
      this.dom.el.appendChild(this.stats.domElement);
    } catch (error) {
      console.error(error)
    }
  }

  // 重置窗口
  initResize() {
    this.onWindowResizeEventFn = this.__onWindowResize.bind(this)
    window.addEventListener("resize", this.onWindowResizeEventFn, false);
  }
  initControls(camera?: THREE.PerspectiveCamera) {
    if (!(this.camera && this.renderer)) {
      throw "未初始化 camera renderer"
    }
    camera = camera || this.camera
    this.controls = new OrbitControls(camera, this.renderer.domElement);
    this.controlsCommand = new Command();
    // this.controls.name = 'OrbitControls'
    this.controlsCommand.add({
      name: "base",
      execute: () => { },
    });
    this.controls.addEventListener("change", this.__onControls.bind(this));
  }
  addAxesHelper() {
    // 辅助坐标轴
    // if (process.env.NODE_ENV == "development") {
    var axes = new THREE.AxesHelper(500);
    this.scene!.add(axes);
    this.scene?.children.forEach((item, i) => {
      var axes = new THREE.AxesHelper(500);
      item.add(axes);
    })
    // }
  }
  addMouseMoveEvent(mousemoveThreshhold?: number) {
    // 鼠标经过事件
    mousemoveThreshhold = mousemoveThreshhold || 80; // 节流间隔

    let MousemoveCommandThrottleFn = util.throttle(
      this.__onMousemove.bind(this),
      mousemoveThreshhold
    );
    this.dom.el.addEventListener(
      "mousemove",
      (e) => {
        // console.log(this.camera?.position)
        // if (this.isControlsChange) return;
        MousemoveCommandThrottleFn(e);
        // console.warn(Date.now() - start);
      },
      false
    );
  }
  //鼠标滚轮事件
  addMousewheel() {
    this.dom.el.addEventListener("wheel", this.__onMousewheel.bind(this), { passive: false });

  }
  __onMousewheel(event: WheelEvent) {
    if (!(this.renderer && this.raycaster && this.camera)) {
      throw "未初始化 renderer, raycaster, camera"
    }
    let ev = event || window.event
    let vector = new THREE.Vector3()
    this.camera.getWorldDirection(vector).normalize().multiplyScalar(0.1)
    if (ev.deltaY < 0) {
      this.camera.position.x += vector.x
      this.camera.position.z += vector.z
    } else if (ev.deltaY > 0) {
      this.camera.position.x -= vector.x
      this.camera.position.z -= vector.z
    }
  }
  getZoomScale() {
    //幂运算
    return Math.pow(0.95, 1);
  }
  dollyIn(dollyScale: number) {
    this.scale *= dollyScale;

  }
  dollyOut(dollyScale: number) {
    this.scale /= dollyScale;



  }

  addClickEvent() {
    let time = 0
    // 鼠标点击事件
    this.dom.el.addEventListener('mousedown', e => {
      time = Date.now()
    })
    this.dom.el.addEventListener('mouseup', e => {
      if (Date.now() - time < 200) {
        this.__onClick.call(this, e)
      }
    })
    // this.dom.el.addEventListener("click", this.__onClick.bind(this), false);
  }
  __onControls() {
    clearTimeout(this._controlCommandTimer);
    this.isControlsChange = true;
    this._controlCommandTimer = setTimeout(() => {
      this.isControlsChange = false;
    }, 800);
    this.onControls && this.onControls();
  }

  __onMousemove(event: MouseEvent) {

    if (!(this.renderer && this.raycaster && this.camera)) {
      throw "未初始化 renderer, raycaster, camera"
    }
    // if (this.isControlsChange) return;
    if (event.target != this.renderer.domElement) return;
    event.preventDefault();
    let mouse = this.getMouse(event)
    // 通过摄像机和鼠标位置更新射线
    this.raycaster.setFromCamera(mouse, this.camera);
    this.onMousemove && this.onMousemove(this.raycaster);
    this.onMousemoveCommand.size() && this.onMousemoveCommand.execute(this.raycaster)

  }


  getMouse(event: MouseEvent) {
    if (!this._mouse) {
      this._mouse = new THREE.Vector2();
    }
    if (this.offsetLeft == null || this.offsetTop == null) {
      this.getElOffset()
    }
    // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
    this._mouse.x = ((event.clientX - this.offsetLeft! - this.dom.el.offsetLeft) / this.dom.width) * 2 - 1;
    this._mouse.y = -((event.clientY - this.offsetTop! - this.dom.el.offsetTop) / this.dom.height) * 2 + 1;
    return this._mouse
  }

  getElOffset() {
    this.offsetLeft = 0
    this.offsetTop = 0
    let el: HTMLElement | null = this.dom.el
    while (el) {
      this.offsetLeft += el.offsetLeft
      this.offsetTop += el.offsetTop
      el = el.offsetParent as HTMLElement
    }
  }
  __onClick(event: MouseEvent) {
    if (!this.camera) {
      throw "未初始化 _mouse, camera"
    }
    let mouse = this.getMouse(event)
    // if (this.isControlsChange) return;
    event.preventDefault();
    this.raycaster.setFromCamera(mouse, this.camera!);
    this.onClick && this.onClick(this.raycaster);
    this.onClickCommand.size() && this.onClickCommand.execute(this.raycaster)
  }

  __onWindowResize() {
    if (!(this.camera && this.renderer)) {
      throw "未初始化 camera, renderer"
    }
    this.dom.width = this.dom.el.offsetWidth
    this.dom.height = this.dom.el.offsetHeight
    let width = this.dom.width
    let height = this.dom.height
    this.getElOffset()
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer && this.composer.setSize(width, height);

    this.CSS2DRenderer && this.CSS2DRenderer.setSize(width, height)

    this.onResize && this.onResize()
    this.resizeCommand.execute()

    // this.effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
  }

  initEffectComposer() {
    if (!(this.renderer && this.scene && this.camera)) {
      throw "请初始化 renderer"
    }
    this.composer = new EffectComposer(this.renderer);

    // this.composer.renderToScreen = true
    // this.composer.readBuffer.texture.encoding = this.renderer.outputEncoding

    var renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);



    this.resizeCommand.add({
      name: 'composer',
      execute: () => {
        this.composer!.setSize(this.dom.width, this.dom.height);
      }
    })

    // this.initOutLinePass()
  }

  // 辉光效果
  initUnrealBloomPass(obj?: {
    exposure: number,
    bloomStrength: number,
    bloomThreshold: number,
    bloomRadius: number
  }) {
    let params = Object.assign({
      exposure: 1, //曝光
      bloomStrength: 1,//泛光范围
      bloomThreshold: 0.5,//1 消失 0 显示
      bloomRadius: 0
    }, obj)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(this.dom.width, this.dom.height), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
    if (this.renderer) {
      this.renderer.toneMappingExposure = Math.pow(params.exposure, 4.0);
    }
    if (!this.composer) {
      this.initEffectComposer()
    } else {
      this.composer.addPass(bloomPass)
    }
  }

  // 初始化边缘发光效果
  initOutLinePass() {
    if (!this.composer) { this.initEffectComposer() }

    this.outlinePass = new OutlinePass(new THREE.Vector2(this.dom.width, this.dom.height), this.scene!, this.camera!);
    this.composer!.addPass(this.outlinePass);

    // this.effectFXAA = new ShaderPass(FXAAShader);
    // this.effectFXAA.uniforms['resolution'].value.set(1 / this.dom.width, 1 / this.dom.height);

    // if (this.renderer) {
    //   const pixelRatio = this.renderer.getPixelRatio()
    //   this.effectFXAA.material.uniforms['resolution'].value.x = 1 / (this.dom.width * pixelRatio)
    //   this.effectFXAA.material.uniforms['resolution'].value.y = 1 / (this.dom.height * pixelRatio)
    // }
    // this.composer!.addPass(this.effectFXAA);

    // this.resizeCommand.add({
    //   name: 'effectFXAA',
    //   execute: () => {
    //     this.effectFXAA!.uniforms['resolution'].value.set(1 / this.dom.width, 1 / this.dom.height);
    //   }
    // })
  }

  addSMAA() {
    if (!(this.renderer && this.composer)) return
    // 添加抗锯齿
    const pass = new SMAAPass(
      this.dom.width * this.renderer.getPixelRatio(),
      this.dom.height * this.renderer.getPixelRatio()
    );
    this.composer.addPass(pass);
  }

  // FXAA抗锯齿通道
  addFXAA() {
    if (!(this.renderer && this.composer)) return
    // 设置设备像素比，避免canvas画布输出模糊
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // .getPixelRatio()获取设备像素比 
    const pixelRatio = this.renderer.getPixelRatio();
    const FXAAPass = new ShaderPass(FXAAShader);
    // `.getPixelRatio()`获取`renderer.setPixelRatio()`设置的值

    // width、height是canva画布的宽高度
    FXAAPass.uniforms.resolution.value.x = 1 / (this.dom.width * pixelRatio);
    FXAAPass.uniforms.resolution.value.y = 1 / (this.dom.height * pixelRatio);
    this.composer.addPass(FXAAPass);
  }

  // 添加obj列表到边缘发光效果
  addOutLinePassSelectedObject(selectedObjects: THREE.Object3D[]) {
    if (_.isArray(selectedObjects)) {
      this.outlinePass!.selectedObjects = selectedObjects
    } else {
      console.warn('selectedObjects 不是数组');
    }
  }

  controlsRernder() {
    if (!(this.controls && this.renderer && this.scene && this.camera)) {
      return
    }
    this.controls.addEventListener("change", () => {
      this.autoAnimation()
    });
  }

  // 自适应渲染 只要调用这个就行
  startAutoRender() {
    this.ableRender = true
    this._bodyMouseMethod = () => {
      this.autoAnimation()
    }
    if (!this._bodyMouseMove) {
      this.dom.el.parentNode?.addEventListener('mousemove', this._bodyMouseMethod);
      this.dom.el.parentNode?.addEventListener('click', this._bodyMouseMethod);
      this.dom.el.parentNode?.addEventListener('wheel', this._bodyMouseMethod);
    }
  }

  // 是否启用渲染 需要手动控制时 给这个赋值为true则渲染
  set ableRender(state: boolean) {
    this._ableRender = state
    this.switchAnimate(this._ableRender)
  }

  get ableRender() {
    return this._ableRender
  }

  // 延迟关闭渲染 用于监听鼠标移动和点击时开始渲染
  autoAnimation() {
    this.ableRender = true
    clearTimeout(this._renderTimeout)
    this._renderTimeout = setTimeout(() => {
      this.ableRender = false
    }, 2000)
  }

  // 切换渲染 true 为开始渲染 false 为停止渲染
  // 当有 tween 动画时 会等动画走完
  switchAnimate(isStart: boolean) {
    if (isStart) {
      if (!this.reques) {
        this.animate()
      }
    } else {
      if (TWEEN.getAll().length) {
        return
      }
      this.reques && cancelAnimationFrame(this.reques);
      this.reques = undefined
    }
  }

  animate() {
    if (!(this.renderer && this.scene && this.camera)) {
      throw "未初始化 renderer, scene, camera"
    }

    this.reques = requestAnimationFrame(this.animate.bind(this));

    if (!this._ableRender && !TWEEN.getAll().length) {
      this.reques && cancelAnimationFrame(this.reques);
      this.reques = undefined
      return
    }

    // stats.begin();

    var T = this.clock.getDelta();
    this.timeS = this.timeS + T;
    if (this.timeS > this.renderT) {
      TWEEN.update();
      this.stats && this.stats.update();
      this.controls && this.controls.update();
      this.animateCommand && this.animateCommand.execute()

      // 使用composer 时不适用 renderer
      if (!this.composer) {
        this.renderer.setViewport(0, 0, this.dom.width, this.dom.height);
        this.renderer.render(this.scene, this.camera);
      }
      this.CSS2DRenderer && this.CSS3DScene && this.CSS2DRenderer.render(this.CSS3DScene, this.camera)

      this.onrenderer && this.onrenderer()
      this.cubeCamera && this.cubeCamera.update(this.renderer, this.scene);
      this.composer && this.composer.render();
      this.timeS = 0;
    }
    // stats.end();
  }

  // 设置摄像机位置 默认朝+x轴 45度俯视
  /**
   *
   * @param {Group} group THREE.Group
   * @param {Vec3}} targetVec3 目标点
   * @param {Number} rotate 弧度
   * @param {Number} offset 偏移量百分比
   */
  setCameraPosition(group: THREE.Object3D, targetVec3: THREE.Vector3, rotate = 0, offset = 1) {
    if (!(this.camera)) {
      throw "未初始化 camera"
    }
    let position = this.countCentetSize(group, targetVec3, rotate, offset);
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(targetVec3.x, targetVec3.y, targetVec3.z);
  }

  countCentetSize(group: THREE.Object3D, targetVec3: THREE.Vector3, rotate = 0, offset = 1, offsetY = 1) {
    if (!(this.camera)) {
      throw "未初始化 camera"
    }
    let size = util.getSize(group);
    targetVec3 = targetVec3 || util.getObjCenter(group);
    let fov = this.camera.fov;
    let maxSize = Math.max(size.x, size.y, size.z);
    let far = (maxSize / 2 / Math.tan((Math.PI / 180) * fov)) * offset;
    let position: THREE.Vector3 = new THREE.Vector3();
    position.x = targetVec3.x - Math.cos(rotate) * far;
    position.z = targetVec3.z + Math.sin(rotate) * far;
    position.y = targetVec3.y + far * offsetY;
    return position;
  }

  // 添加辅助网格
  addGridHelper(conf?: {
    size?: number,
    divisions?: number
  }) {
    if (!this.scene) {
      throw '未初始化 scene'
    }
    conf = Object.assign({
      size: 500,
      divisions: 50
    }, conf)

    var gridHelper = new THREE.GridHelper(conf.size, conf.divisions);
    gridHelper.position.y = 100
    this.scene.add(gridHelper);
  }

  // 移动摄像机
  creatCameraAnimation?(end: THREE.Vector3, target?: THREE.Vector3, time?: number, easing = TWEEN.Easing.Quadratic.InOut, onMove?: (target: THREE.Vector3, elapsed: number) => void) {
    if (!(this.camera)) {
      throw "未初始化 camera"
    }
    const camera = this.camera
    // let targetRotation: THREE.Euler;
    // let cameraBeforeRotation = camera.rotation.clone()
    // if (target) {
    //   let cam: THREE.Object3D | null = new THREE.PerspectiveCamera()
    //   cam.position.set(end.x, end.y, end.z)
    //   cam.rotation.order = camera.rotation.order
    //   cam.lookAt(target.x, target.y, target.z)
    //   targetRotation = cam.rotation.clone()
    //   cam = null
    //   console.log('targetRotation.y',cameraBeforeRotation.y,targetRotation.y)
    //   let sum = Math.abs(targetRotation.y - cameraBeforeRotation.y)
    //   if(Math.PI * 2 - sum < sum){
    //     console.log('<')
    //     targetRotation.y = Math.PI * 2 - Math.abs(targetRotation.y)
    //   }
    //   console.log('targetRotation.y',cameraBeforeRotation.y,targetRotation.y)
    // }
    TWEEN.removeAll();
    return new Promise((resolve, reject) => {
      let start = camera.position;
      time = time || 2000;
      var tween = new TWEEN.Tween(start)
        .to(end, time)
        .easing(easing)
        .onStart(function () { })
        .onUpdate(function (params, elapsed) {
          camera.position.set(params.x, params.y, params.z);

          if (target) {
            camera.lookAt(target)
            // camera.rotation.set(
            //   cameraBeforeRotation.x + (targetRotation.x - cameraBeforeRotation.x) * elapsed,
            //   cameraBeforeRotation.y + (targetRotation.y - cameraBeforeRotation.y) * elapsed,
            //   cameraBeforeRotation.z + (targetRotation.z - cameraBeforeRotation.z) * elapsed,
            // )
          }
          onMove && onMove(params, elapsed);
        })
        .onComplete((params) => {

          TWEEN.remove(tween);
          resolve(true);
          this.tween.render = false;
        });
      this.tween.render = true;
      tween.start();
    });
  }

  // 创建动画
  creatTween?(onMove?: (elapsed: number) => void, time: number = 2000) {
    return new Promise((resolve) => {
      var tween = new TWEEN.Tween({ x: 1 })
        .to({ x: 0 }, time)
        .easing(TWEEN.Easing.Circular.Out)
        .onStart(function () { })
        .onUpdate(function (params, elapsed) {
          onMove && onMove(elapsed);
        })
        .onComplete((params) => {
          TWEEN.remove(tween);
          resolve(true);
          this.tween.render = false;
        })
        .onStop(() => {
          console.log('onstop');
        })

      this.tween.render = true;
      tween.start();
    });
  }
  // 创建动画
  creatTween2<T extends ConstructorParameters<typeof TWEEN.Tween>[0]>(
    start: T,
    end: T,
    onMove?: (params: T, elapsed: number) => void,
    time: number = 2000,
    isRemoveALL: boolean = false,
    easing: ((amount: number) => number) = TWEEN.Easing.Circular.InOut
  ) {
    isRemoveALL && TWEEN.removeAll();
    return new Promise((resolve) => {
      var tween = new TWEEN.Tween(start)
        .to(end, time)
        .easing(easing)
        .onUpdate(function (params, elapsed) {
          onMove && onMove(params, elapsed);
        })
        .onComplete(() => {
          TWEEN.remove(tween);
          resolve(true);
        });
      tween.start();
    })
  }
  // 移动摄像机
  changeLookAtTween?(onMove?: (elapsed: number) => void, time: number = 2000) {
    return new Promise((resolve, reject) => {
      var tween = new TWEEN.Tween({ x: 1 })
        .to({ x: 0 }, time)
        .easing(TWEEN.Easing.Circular.Out)
        .onStart(function () { })
        .onUpdate(function (params, elapsed) {
          onMove && onMove(elapsed);
        })
        .onComplete((params) => {
          TWEEN.remove(tween);
          resolve(tween);
          this.tween.render = false;
        });
      this.tween.render = true;
    });
  }
  // setCursor(cursor) {
  //   this.dom.el.style.cursor = cursor;
  // }

  disposeThree() {
    this.reques && cancelAnimationFrame(this.reques);
    this.renderer && this.renderer.dispose();
    this.renderer && this.renderer.clear(true, true, true);
    // this.scene && (this.scene = null);
    // this.camera && (this.camera = null);
    // this.renderer && (this.renderer.domElement = null);
    // this.controls! = null;
    this.onWindowResizeEventFn && document.removeEventListener('resize', this.onWindowResizeEventFn)
    this.cameraRotateMouseup && document.removeEventListener('mouseup', this.cameraRotateMouseup)
    this.cameraRotateMousedown && document.removeEventListener('mousemove', this.cameraRotateMousedown)
    if (this._bodyMouseMethod) {
      this.dom.el.parentNode?.removeEventListener('mousemove', this._bodyMouseMethod)
      this.dom.el.parentNode?.removeEventListener('click', this._bodyMouseMethod)
      this.dom.el.parentNode?.removeEventListener('wheel', this._bodyMouseMethod)
    }
    TWEEN.removeAll();
  }

  /**
   * 根据地图坐标对应3d坐标
   * @param {*} coordinateA 坐标原点
   * @param {*} coordinateB 坐标参照点
   * @param {*} a 本地坐标原点
   * @param {*} b 本地坐标参照点
   * @param {*} reverse 颠倒方向 默认维度对应x轴方向
   */
  setSceneCorrdinate(zero: Vec3, coordinateA: Vec3, coordinateB: Vec3, a: Vec3, b: Vec3, reverse = false) {
    this.corrdinateXAxisreverse = reverse
    let x = 0
    let y = 1
    if (this.corrdinateXAxisreverse) {
      x = 1
      y = 0
    }
    // 求本地坐标距离
    let len1 = util.getVec2Length(a[x], a[y], b[x], b[y]);
    // 求经纬度坐标距离
    let len2 = util.getVec2Length(
      coordinateA[y],
      coordinateA[x],
      coordinateB[y],
      coordinateB[x]
    );
    this.sceneCorrdinate = {
      zero: zero,
      rate: len1 / len2,
    };
  }

  // 坐标点转场景位置
  getScenePositionOfCoordinate(coordinate: Vec3) {
    if (!(this.sceneCorrdinate)) {
      throw "未初始化 sceneCorrdinate"
    }
    let x = 0
    let y = 1
    if (this.corrdinateXAxisreverse) {
      x = 1
      y = 0
    }
    let position = [
      (coordinate[x] - this.sceneCorrdinate.zero[x]) *
      this.sceneCorrdinate.rate,
      (coordinate[y] - this.sceneCorrdinate.zero[y]) *
      this.sceneCorrdinate.rate,
    ];
    return position;
  }

  ableShadow(obj?: THREE.Object3D) {
    if (!obj) {
      obj = this.scene
    }
    obj?.traverse(child => {
      if (child.type == 'Mesh') {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  addNormalsHelper(mesh: THREE.Object3D, parent?: THREE.Object3D) {
    const helper = new VertexNormalsHelper(mesh, 2, 0x00ff00);
    parent ? parent.add(helper) : this.scene?.add(helper);
  }

  getCubeCameraTexture() {
    if (!this.scene || !this.renderer || !this.camera) {
      return
    }
    // Create cube render target
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });

    // Create cube camera
    this.cubeCamera = new THREE.CubeCamera(1, 100000, cubeRenderTarget);
    this.scene.add(this.cubeCamera);

    this.cubeCamera.position.set(0, 0, 0);

    this.renderer.render(this.scene, this.camera);

    console.log('cubeRenderTarget.texture', cubeRenderTarget.texture);
    return cubeRenderTarget.texture
  }

  // 设置相机中心点偏移
  setCameraSize() {
    let sceneWidth = this.dom.width;
    let sceneHeight = this.dom.height;
    const fullWidth = (sceneWidth + sceneWidth / 6);
    const fullHeight = (sceneHeight - sceneHeight / 8);

    if (this.camera && this.renderer) {
      this.camera.setViewOffset(fullWidth, fullHeight, 0, 0, sceneWidth, sceneHeight);
    }
  }

  testPrintKeydown(key = 'p', cb?: () => void) {
    document.addEventListener('keypress', e => {
      if (e.key == key && this.camera) {
        let { x: px, y: py, z: pz } = this.camera.position
        let { x: rx, y: ry, z: rz } = this.camera.rotation
        console.log(this)
        console.log('camera.position::', `${px}, ${py}, ${pz}`)
        console.log('camera.totation::', `${rx}, ${ry}, ${rz}`)
        cb && cb()
      }
    })
  }


}

export default D3;
