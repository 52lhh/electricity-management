<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb style="margin-bottom: 15px">
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="showCateDialogVisible"
            style="margin-bottom: 20px"
          >
            添加分类
          </el-button>
        </el-col>
      </el-row>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCatedialogVisible"
        width="50%"
        @close="addDialogClose"
      >
        <!-- 添加分类表单 -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- options指定的是分类数据源 -->
            <!-- props指定的是配置项 -->
            <el-cascader
              :options="parentsCateList"
              :props="cascaderProps"
              expandTrigger="hover"
              v-model="selectCateKeys"
              @change="selectCateKeysChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCatedialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCateInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :show-index="true"
        :border="true"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-show="(scope.row.cat_deleted = true)"
            style="color: green"
          ></i>
          <i
            class="el-icon-error"
            v-show="(scope.row.cat_deleted = false)"
            style="color: red"
          ></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-show="scope.row.cat_level === 0">标签一</el-tag>
          <el-tag type="success" v-show="scope.row.cat_level === 1"
            >标签二</el-tag
          >
          <el-tag type="warning" v-show="scope.row.cat_level === 2"
            >标签三</el-tag
          >
        </template>
        <!-- 操作列 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="editCateNameForm(scope.row.cat_id)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="removeCateForm(scope.row.cat_id)"
          >
            删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.querInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改分类列表的分类名称对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editCateNameDialogVisible"
      width="30%"
      @close="editDialogClose"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateNameDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateNameInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "cate",
  created() {
    this.getCateList();
  },
  data() {
    return {
      // 商品分类数据
      cateList: [],
      // 商品分类数据的条数
      total: 0,
      // 发送请求商品分类数据的参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
          width: "400px",
        },
        {
          label: "是否有效",
          minWidth: "100px",
          // 表示当前列被定义为模板列
          type: "template",
          // 表示当前列引用的模板
          template: "isOk",
        },
        {
          label: "排序",
          minWidth: "100px",
          // 表示当前列被定义为模板列
          type: "template",
          // 表示当前列引用的模板
          template: "order",
        },
        {
          label: "操作",
          minWidth: "100px",
          // 表示当前列被定义为模板列
          type: "template",
          // 表示当前列引用的模板
          template: "opt",
        },
      ],
      // 控制添加分类弹框的出现与隐藏
      addCatedialogVisible: false,
      // 添加分类的分类名称表单的验证属性
      // 添加分类的表单数据对象
      addCateForm: {
        // 要添加分类的名称
        cat_name: "",
        // 要添加父级分类的id
        cat_pid: 0,
        // 要添加分类的等级，默认为一级
        cat_level: 0,
      },
      // 添加分类的表单数据对象中属性的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 1, max: 8, message: "长度在 1 到 8 个字符", trigger: "blur" },
        ],
      },
      // 父级分类数据列表
      parentsCateList: [],
      // 指定父级分类的配置项
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: "true",
      },
      // 级联选择器选择的父级元素的id
      // selectCateKeys必须为一个数组，因为其中包含的不止一个父级的id，比如父级和祖先级
      selectCateKeys: [],
      // 修改分类名称对话框表单的验证属性
      editCateForm: {},
      // 修改分类名称对话框表单的验证属性的验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 1, max: 8, message: "长度在 1 到 8 个字符", trigger: "blur" },
        ],
      },
      // 控制修改分类名称的弹框出现与隐藏
      editCateNameDialogVisible: false,
    };
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });

      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类数据失败");
      } else {
        // 将数据存入cateList数组中
        this.cateList = res.data.result;
        this.total = res.data.total;
      }
    },
    // 根据pageSize进行调整，控制每页多少条
    handleSizeChange(newsize) {
      this.querInfo.pagesize = newsize;
      this.getCateList();
    },
    handleCurrentChange(newnum) {
      this.querInfo.pagenum = newnum;
      this.getCateList();
    },
    // 弹出分类对话框
    showCateDialogVisible() {
      // 当弹出分类对话框时，调用获取父类数据的列表方法
      this.getParentsCateList();
      this.addCatedialogVisible = true;
    },
    // 获取商品分类的数据列表
    async getParentsCateList() {
      // 请求成功后，返回Promise对象，为方便处理则使用await
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });

      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类数据失败");
      } else {
        this.parentsCateList = res.data;
        console.log(this.parentsCateList);
      }
    },
    // 对添加分类的表单进行数据验证，验证成功则提交
    editCateInfo() {
      this.$refs.addCateFormRef.validate(async (vaild) => {
        if (!vaild) {
          // 若表单检验未通过，则不允许点击确定按钮提交数据
          return;
        } else {
          const { data: res } = await this.$http.post(
            "categories",
            this.addCateForm
          );
          if (res.meta.status !== 201) {
            this.$message.error("添加分类失败");
          } else {
            this.$message.success("添加分类成功");
            this.getCateList();
            this.addCatedialogVisible = false;
          }
        }
      });
    },
    // 监听级联选择器选择的元素变化时，触发这个函数（改变selectCateKeys数组中的值）
    selectCateKeysChange() {
      // 通过判断selectCateKeys数组长度来确定，添加的分类为几级分类
      if (this.selectCateKeys.length === 0) {
        // 若selectCateKeys数组长度为0，则添加分类为一级分类
        this.addCateForm.cat_pid = 0;
        this.addCatesForm.cat_level = 0;
      } else {
        // 当联机选择器选择父级后，selectCateKeys数组长度不为0
        // 则addCateForm.cat_pid为最近一级父级的id
        // addCateForm.cat_level为几级分类（相当数组长度）
        this.addCateForm.cat_pid =
          this.selectCateKeys[this.selectCateKeys.length - 1];
        this.addCateForm.cat_level = this.selectCateKeys.length;
      }
      console.log(this.addCateForm);
      console.log(this.selectCateKeys);
    },
    // 监听关闭分类对话框时清空表单和级联选择器绑定的父级数组
    addDialogClose() {
      this.$refs.addCateFormRef.resetFields();

      this.selectCateKeys = [];
    },
    // 监听关闭修改分类名称对话框时清空表单
    editDialogClose() {
      this.$refs.editCateFormRef.resetFields();
    },
    // 弹出修改分类名称的对话框，并根据id查询当前分类的信息
    async editCateNameForm(id) {
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) {
        this.$message.error("获取当前分类信息失败");
      } else {
        this.editCateForm = res.data;
      }

      this.editCateNameDialogVisible = true;
    },
    // 提交修改名称表单的内容
    async editCateNameInfo() {
      const { data: res } = await this.$http.put(
        "categories/" + this.editCateForm.cat_id,
        { cat_name: this.editCateForm.cat_name }
      );
      if (res.meta.status !== 200) {
        this.$message.error("修改分类名称失败");
      } else {
        this.editCateNameDialogVisible = false;
        this.getCateList();
        return this.$message.success("修改分类名称成功");
      }
    },
    // 删除某个分类
    async removeCateForm(id) {
      // 返回值为Promise，为了方便处理则使用await
      // confirmResult值为confirm（确定删除返回）和cancel（取消删除返回）
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除用户信息");
      } else {
        const { data: res } = await this.$http.delete("categories/" + id);
        if (res.meta.status !== 200) {
          this.$message.error("删除分类失败");
        } else {
          this.editCateNameDialogVisible = false;
          this.getCateList();
          return this.$message.success("删除分类成功");
        }
      }
    },
  },
};
</script>

<style lang="less" , scoped>
.el-cascader {
  width: 100%;
}
</style>