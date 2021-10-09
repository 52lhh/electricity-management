<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb style="margin-bottom: 15px">
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 将表单中输入的值双向绑定到发送请求商品列表数据的参数中 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="goAppPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="120">
        </el-table-column>
        <el-table-column prop="goods_number" label="商品数量" width="100">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="200">
          <template slot-scope="scope">
            <!-- 调用filter过滤器dateFormat，将add_time过滤为时间格式 -->
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editById(scope.row.goods_id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>
    <!-- 编辑商品的弹出框 -->
    <el-dialog
      title="编辑商品信息"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form
        :model="goodsData"
        :rules="goodsDataRules"
        ref="goodsDataRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="goodsData.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="goodsData.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="goodsData.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="goodsData.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormInfo"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "goods",
  created() {
    // 当前页面一经加载，立刻获取商品列表数据
    this.getGoodsList();
  },
  data() {
    return {
      // 发送请求商品列表数据的参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      // 存储商品列表数据
      goodsList: [],
      // 商品列表数据总数
      total: 0,
      // 当前选中编辑的商品数据
      goodsData: {},
      // 编辑商品表单数据的验证规则
      goodsDataRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
      },
      // 控制编辑商品的弹出框的显示与隐藏
      editDialogVisible: false,
    };
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList() {
      // 发送get请求，必须使用params属性指定参数
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        this.$message.error("商品列表数据请求失败");
      } else {
        this.goodsList = res.data.goods;
        this.total = res.data.total;
        console.log(this.goodsList);
        console.log(this.total);
      }
    },

    // 当改变每页显示数据条数触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 当改变页数时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 删除商品
    async removeById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        this.$message.info("您取消了删除该商品");
      } else {
        const { data: res } = await this.$http.delete(`goods/${id}`);

        if (res.meta.status !== 200) {
          this.$message.error("删除商品失败");
        } else {
          this.$message.success("删除商品成功");
          this.getGoodsList();
        }
      }
    },
    // 编辑商品信息
    async editById(id) {
      // 编辑商品信息前先根据id查询当前商品信息
      const { data: res } = await this.$http.get(`goods/${id}`);
      if (res.meta.status !== 200) {
        this.$message.error("获取商品信息失败");
      } else {
        this.goodsData = res.data;
        console.log(this.goodsData);
      }
      this.editDialogVisible = true;
    },
    // 提交表单中编辑商品的信息
    editFormInfo() {
      this.$refs.goodsDataRef.validate(async (vaild) => {
        if (!vaild) {
          return;
        } else {
          const { data: res } = await this.$http.put(
            `goods/${this.goodsData.goods_id}`,
            this.goodsData
          );
          console.log(res.meta.status);

          if (res.meta.status !== 200) {
            this.$message.error("修改商品数据失败");
          } else {
            this.getGoodsList();
            this.editDialogVisible = false;
            return this.$message.success("修改数据成功");
          }
        }
      });
    },
    // 点击添加商品，跳转到添加商品页面
    goAppPage() {
      this.$router.push("/goods/add");
    },
  },
};
</script>

<style lang="less" scoped>
</style>