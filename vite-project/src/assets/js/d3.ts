import Command from "./Command.js";
import TWEEN from "@tweenjs/tween.js";
// * as 代表 一次性全部导入模块的所有变量
import * as THREE from "three";
// Stats(帧率面板)
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// UnrealBloomPass是实现辉光的主要方法,副作用是锯齿和条带. 解决锯齿是通过FXAAShader实现的. 解决条带是通过SSAARenderPass实现的
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js"
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

// RenderPass(会在当前场景和摄像机的基础上渲染出一个新场景，这个通道只会渲染场景，但不会把结果输出到场景上)
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// RGBELoader环境纹理加载
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

//
import { GroundProjectedEnv } from 'three/examples/jsm/objects/GroundProjectedEnv';

// VertexNormalsHelper 渲染箭头辅助对象 arrows 来模拟顶点的法线
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';

import _ from "lodash";

// 平面光光源从一个矩形平面上均匀地发射光线。这种光源可以用来模拟像明亮的窗户或者条状灯光光源
// 必须在你的场景中加入 RectAreaLightUniformsLib ，并调用init()。
import { RectAreaLight } from "three";
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

// CSS2DRenderer 和 CSS2DObject 是用于创建二维元素并渲染到三维场景中的工具
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js"

// DoubleSide 双面渲染
const materialCssPlane = new THREE.MeshBasicMaterial({
  color: 0x00000000, wireframe: true, wireframeLinewidth: 1, side: THREE.DoubleSide
})

type Vec3 = [number, number, number]

class D3 {
  dom: {
    el: HTMLElement,
    width: number,
    height: number
  }
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  raycaster?: THREE.Raycaster;
  onMousemove?: ((e: THREE.Raycaster) => void);
  onMousemoveCommand = new Command()
  onClick?: ((e: THREE.Raycaster) => void);
  onClickCommand = new Command()
  scene?: THREE.Scene;
  resizeCommand: Command
  composer?: EffectComposer // EffectComposer(效果合成器,在场景渲染完毕后再增加一些特效)
  env?: GroundProjectedEnv
  tween: {
    render: boolean
  }
  controls?: OrbitControls // OrbitControls(相机控件)可以对三维场景进行缩放、平移、旋转，本质上改变的不是场景，而是相机的参数，相机的位置角度不同，同一个场景的渲染效果是不一样，比如相机围绕着一个场景旋转，就像场景旋转一样
  controlsCommand?: Command
  _controlsCommandTimer?: number
  isControlsChange?: boolean
  onControls?: (() => void);
  _mouse?: THREE.Vector2
  outlinePass?: OutlinePass // OutlinePass(一个后处理效果，它用于在渲染的场景中添加轮廓线，这种效果通常用于突出显示场景中的特定对象或区域，OutlinePass可以设置轮廓线的颜色，样式，宽度等。)
  effectFXAA?: ShaderPass // ShaderPass(是一个自定义着色器的通道。它允许你指定自定义的着色器代码,并将其应用于场景的渲染结果。这样你可以创建各种各样的图形效果,如高斯模糊、后处理效果等)
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
  cube




}








