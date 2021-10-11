import Vue from 'vue'
// 通过CDN优化ElementUI的打包
// import ElementUI from 'element-ui'
import App from './App.vue'
import router from './router/index.js'
import axios from 'axios'
// 引入表格树插件
import TreeTable from 'vue-table-with-tree-grid'
// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入全局css
import './assets/css/global.css'
// 导入element-ui的css文件
// 在public/index.html文件的头部引入
// import 'element-ui/lib/theme-chalk/index.css'
// 导入字体图标
import '@/assets/font/style.css'

// // 导入富文本编辑器相关样式
// 在public/index.html文件的头部引入
// import 'quill/dist/quill.core.css' // import styles
// import 'quill/dist/quill.snow.css' // for snow theme
// import 'quill/dist/quill.bubble.css' // for bubble theme

// 在public/index.html文件的头部引入
// 通过CDN优化ElementUI的打包
// 对Element-ui中的组件进行按需导入
// import { Form, FormItem, Input, Button, Message, Container, Header, Aside, Main, Row, Col, Menu, Submenu, MenuItemGroup, MenuItem, Breadcrumb, TableColumn, Table, Tooltip, Pagination, Dialog, MessageBox, Card, Tag, Tree, Select, Option, Cascader, Alert, Steps, Step, Tabs, CheckboxGroup, Checkbox, Upload, Timeline } from 'element-ui'

// Vue.use(Form);
// Vue.use(FormItem)
// Vue.use(Input)
// Vue.use(Button)
// Vue.use(Container)
// Vue.use(Header)
// Vue.use(Aside)
// Vue.use(Main)
// Vue.use(Menu)
// Vue.use(Col)
// Vue.use(Row)
// Vue.use(Submenu)
// Vue.use(MenuItemGroup)
// Vue.use(MenuItem)
// Vue.use(Breadcrumb)
// Vue.use(TableColumn)
// Vue.use(Table)
// Vue.use(Tooltip)
// Vue.use(Pagination)
// Vue.use(Dialog)
// Vue.use(Card)
// Vue.use(Tag)
// Vue.use(Tree)
// Vue.use(Select)
// Vue.use(Option)
// Vue.use(Cascader)
// Vue.use(Alert)
// Vue.use(Steps)
// Vue.use(Step)
// Vue.use(Tabs)
// Vue.use(Checkbox)
// Vue.use(CheckboxGroup)
// Vue.use(Upload)
// Vue.use(Timeline)
// 将Element-ui中的Message消息提示组件进行挂载
// Vue.prototype.$massage = Message
// 将Element-ui中的MessageBox消息弹框组件进行挂载
// Vue.prototype.$confirm = MessageBox

// Vue.use(ElementUI);

// 全局注册表格树组件
Vue.component("tree-table", TreeTable)
// 全局注册富文本编辑器
Vue.use(VueQuillEditor)

// 配置请求的根路径，全局配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1';
// 给Vue的原型添加一个自定义属性$http，属性值为axios
// 这样可以在每一个组件上通过this.$http获取axios，而不用每次import axios
Vue.prototype.$http = axios

// 全局注册一个时间处理的过滤器
Vue.filter('dateFormat', function (originVal) {
  const time = new Date(originVal);

  // 年
  const year = time.getFullYear();
  // 月
  const m = time.getMonth() + 1;
  const month = m < 10 ? '0' + m : m;
  // 日
  const d = time.getDate();
  const day = d < 10 ? '0' + d : d;
  // 时
  const h = time.getHours();
  const hour = h < 10 ? '0' + h : h;
  // 分
  const mt = time.getMinutes();
  const minute = mt < 10 ? '0' + mt : mt;
  // 秒
  const sd = time.getSeconds();
  const second = sd < 10 ? '0' + sd : sd;

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})

Vue.config.productionTip = false

// 导入Nprogress包对应的js和css
import NProgress from "nprogress"
// 在public/index.html文件的头部引入
// import "nprogress/nprogress.css"

// 请求拦截
// 在request拦截器中，显示加载页面进度条：NProgress.start();
axios.interceptors.request.use(config => {
  // 根据接口文档，将config数据拦截后，给请求头Authorization提供token令牌
  config.headers.Authorization = window.sessionStorage.getItem("token");
  // console.log(config);
  NProgress.start();
  // 拦截请求后，必须对config进行返回
  return config;
})

// 在response拦截器中，显示加载页面进度条：NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done();
  return config
})


new Vue({
  router,
  render: h => h(App),
}).$mount('#app')