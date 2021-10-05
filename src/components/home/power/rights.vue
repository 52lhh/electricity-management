<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb style="margin-bottom: 15px">
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 权限管理列表区域 -->
      <template>
        <el-table :data="rightsList" border stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="100" align="center">
          </el-table-column>
          <el-table-column
            prop="authName"
            label="权限名称"
            width="400"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="path" label="路径" width="400" align="center">
          </el-table-column>
          <el-table-column prop="level" label="权限等级" align="center">
            <template slot-scope="scope">
              <el-tag v-show="scope.row.level == 0">一级</el-tag>
              <el-tag type="success" v-show="scope.row.level == 1">
                二级
              </el-tag>
              <el-tag type="warning" v-show="scope.row.level == 2">三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "rights",
  created() {
    this.getRightsList();
  },
  data() {
    return {
      // 权限列表数据
      rightsList: [],
    };
  },
  methods: {
    async getRightsList() {
      // 请求成功后，返回Promise对象，为方便处理则使用await
      const { data: res } = await this.$http.get("rights/list");

      if (res.meta.status !== 200) {
        return this.$massage.error("获取权限列表失败");
      } else {
        this.rightsList = res.data;
        console.log(this.rightsList);
      }
    },
  },
};
</script>

<style lang='less' scoped>
</style>