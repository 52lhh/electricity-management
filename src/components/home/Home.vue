<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      电商后台管理系统
      <el-button @click="exit" type="info">退出登陆</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="menuFlag ? '64px' : '200px'">
        <div class="toggleButton" @click="isMenuFlag">|||</div>
        <el-col>
          <!-- 菜单区域 -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            unique-opened
            :collapse-transition="false"
            :collapse="menuFlag"
            router
            :default-active="isActivePath"
          >
            <!-- 菜单栏 -->
            <!-- :index绑定的值要为字符串 -->
            <el-submenu
              :index="item.id + ''"
              v-for="item in menuList"
              :key="item.id"
            >
              <!-- 每项菜单 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="fontList[item.id]"></i>
                <!-- 文字 -->
                <span>{{ item.authName }}</span>
              </template>
              <!-- 二级菜单组 -->
              <el-menu-item-group>
                <!-- 每个子菜单组中的子菜单项 -->
                <el-menu-item
                  :index="'/' + chlidItem.path"
                  v-for="chlidItem in item.children"
                  :key="chlidItem.id"
                  class="icon-menu"
                  @click="saveNavActive('/' + chlidItem.path)"
                >
                  {{ chlidItem.authName }}
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-col>
      </el-aside>
      <!-- 主体内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "home",
  // 先完成Home导航，然后在接下来的组件生命周期钩子中获取数据
  created() {
    // 当Home页面被加载时，立即执行getMenuList()函数，获取菜单列表
    this.getMenuList();
    // 将sessionStorage中的子菜单path赋值给isActivePath
    this.isActivePath = window.sessionStorage.getItem("activePath");
  },
  data() {
    return {
      menuList: [],
      fontList: {
        125: "icon-users",
        103: "icon-briefcase",
        101: "icon-cart",
        102: "icon-paste",
        145: "icon-stats-dots",
      },
      menuFlag: false,
      isActivePath: "",
    };
  },
  methods: {
    exit() {
      // 当点击退出登陆按钮后，清空浏览器sessionStorage中的token
      window.sessionStorage.clear();
      // 并且强制进入login登陆页面
      this.$router.push("/login");
    },
    // 获取菜单列表
    async getMenuList() {
      // 在接下来的组件生命周期钩子中获取数据
      // await返回一个Promise对象resolve的值
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) {
        return this.$massage.error("获取菜单列表失败");
      } else {
        this.menuList = res.data;
        console.log(this.menuList);
      }
    },
    // 控制侧边菜单是否展开
    isMenuFlag() {
      this.menuFlag = !this.menuFlag;
    },
    saveNavActive(activePath) {
      // 当子菜单被点击时，将当前被点击的子菜单的path存入sessionStorage
      window.sessionStorage.setItem("activePath", activePath);
      this.isActivePath = activePath;
    },
  },
};
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: 24px;
  color: #fff;
  background-color: rgb(54, 61, 64);
}

.el-aside {
  background-color: rgb(49, 55, 67);
}

i[class^="icon-"] {
  margin-right: 10px;
}

.el-menu {
  border-right: none;
}

.toggleButton {
  height: 30px;
  font-size: 15px;
  color: #fff;
  text-align: center;
  letter-spacing: 3px;
  cursor: pointer;
}
</style>
