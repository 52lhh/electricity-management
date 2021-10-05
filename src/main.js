import Vue from 'vue'
import ElementUI from 'element-ui'
import App from './App.vue'
import router from './router/index.js'
import axios from 'axios'

// 导入全局css
import './assets/css/global.css'
// 导入element-ui的css文件
import 'element-ui/lib/theme-chalk/index.css'
// 导入字体图标
import '@/assets/font/style.css'

// 对Element-ui中的组件进行按需导入
import { Form, FormItem, Input, Button, Message, Container, Header, Aside, Main, Row, Col, Menu, Submenu, MenuItemGroup, MenuItem, Breadcrumb, TableColumn, Table, Tooltip, Pagination, Dialog, MessageBox, Card, Tag, Tree, Select, Option } from 'element-ui'

Vue.use(Form);
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Col)
Vue.use(Row)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Card)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)

// 配置请求的根路径，全局配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1';
// 给Vue的原型添加一个自定义属性$http，属性值为axios
// 这样可以在每一个组件上通过this.$http获取axios，而不用每次import axios
Vue.prototype.$http = axios
// 将Element-ui中的Message消息提示组件进行挂载
Vue.prototype.$massage = Message
// 将Element-ui中的MessageBox消息弹框组件进行挂载
Vue.prototype.$confirm = MessageBox

Vue.config.productionTip = false

Vue.use(ElementUI);

// 请求拦截
axios.interceptors.request.use(config => {
  // 根据接口文档，将config数据拦截后，给请求头Authorization提供token令牌
  config.headers.Authorization = window.sessionStorage.getItem("token");
  // console.log(config);
  // 拦截请求后，必须对config进行返回
  return config;
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')