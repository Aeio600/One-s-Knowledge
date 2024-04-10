
import { createRouter, createWebHashHistory } from "vue-router";
 
// 路由
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
          path: '/',
          name: 'home',
          component: () => import('@/pages/dashboard/Dashboard.vue')
      },
      //{
          //配置404页面
          //path: '/:catchAll(.*)',
          //name: '404',
          //component: () => import(''),
      //}
  ]
})

// 导出
export default router
                        