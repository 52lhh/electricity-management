import Vue from 'vue'
// 导入路由对象
import Router from 'vue-router'
// 使用路由
Vue.use(Router);

// 使用懒加载加载路由组件
const Login = () => import('@/components/Login.vue');
const Home = () => import("@/components/home/Home.vue");
const Welcome = () => import("@/components/home/Welcome.vue")
const Users = () => import("@/components/home/user/User.vue")
const Rights = () => import("@/components/home/power/Rights.vue")
const Rloes = () => import("@/components/home/power/Roles.vue")
const Cate = () => import("@/components/home/goods/Cate.vue")
const Params = () => import("@/components/home/goods/Params.vue")
const Goods = () => import("@/components/home/goods/Goods.vue")
const Add = () => import("@/components/home/goods/Add.vue")
const Order = () => import("@/components/home/order/Order.vue")

// 创建路由映射
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome,
      },
      {
        path: '/users',
        component: Users
      }, {
        path: '/rights',
        component: Rights
      }, {
        path: '/roles',
        component: Rloes
      }, {
        path: '/categories',
        component: Cate
      }, {
        path: "/params",
        component: Params
      },
      {
        path: "/goods",
        component: Goods,
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      }
    ]
  }
]


// 创建路由实例
const router = new Router({
  // routes: routes 可简写为以下形式
  routes,
  // 将哈希模式更改为html5的history模式
  mode: 'history'
})

// 创建全局导航守卫，当浏览器sessionStorage中没有token时，只允许访问login登陆界面
// to：即将要进入的目标的路由对象
// from：当前导航即将要离开的路由对象
// next：调用该方法后，才能进入下一个钩子(相当于放行) --- next()：放行、next('/login')：强制跳转
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    // 当直接访问login登陆界面时，直接放行
    return next();
  } else {
    // 获取浏览器sessionStorage中的token
    const isToken = window.sessionStorage.getItem('token');
    // 如果浏览器sessionStorage中没有token，则强制跳转login登陆界面
    if (!isToken) {
      return next('/login');
    } else {
      return next();
    }
  }
})

// 在Vue实例中挂载创建的路由实例
export default router;

