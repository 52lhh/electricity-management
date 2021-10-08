<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb style="margin-bottom: 15px">
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            style="width: 350px"
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            expandTrigger="hover"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTagClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >
            添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" style="width: 100%">
            <!-- 展开列 -->
            <el-table-column type="expand" width="50">
              <template slot-scope="scope">
                <!-- 遍历数据中attr_vals数组，将数组元素渲染为标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="closeTag(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 标签与表单之间的切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" width="50"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  icon="el-icon-edit"
                  type="primary"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button
                  icon="el-icon-delete"
                  type="danger"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >
            添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" style="width: 100%">
            <!-- 展开列 -->
            <el-table-column type="expand" width="50">
              <template slot-scope="scope">
                <!-- 遍历数据中attr_vals数组，将数组元素渲染为标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="closeTag(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 标签与表单之间的切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" width="50"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  icon="el-icon-edit"
                  type="primary"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button
                  icon="el-icon-delete"
                  type="danger"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数/添加属性弹框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClose"
    >
      <!-- 添加参数/添加属性表单 -->
      <el-form
        :model="addFrom"
        :rules="addFromRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText + '：'" prop="attr_name">
          <el-input v-model="addFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams"> 确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 点击编辑按钮，修改动态参数名称/静态属性名称 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClose"
    >
      <!-- 修改参数/修改属性表单 -->
      <el-form
        :model="editFrom"
        :rules="editFromRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText + '：'" prop="attr_name">
          <el-input v-model="editFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "params",
  created() {
    this.getCateList();
  },
  data() {
    return {
      // 获取的商品分类数据列表数组
      cateList: [],
      // 级联选择器的配置选项
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 与级联选择表单选择项内容进行双向
      // 当前选中的三级分类数组，其中数组元素为三级分类各自的id
      selectedCateKeys: [],
      // Tag标签页切换时，通过双向绑定正在活跃标签页的名称
      activeName: "many",
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制添加参数/添加属性弹框出现与隐藏
      addDialogVisible: false,
      // 绑定添加表单验证的属性
      addFrom: {
        attr_name: "",
      },
      // 绑定添加表单验证属性的规则
      addFromRules: {
        attr_name: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur",
          },
          { min: 1, max: 8, message: "长度在 1 到 8 个字符", trigger: "blur" },
        ],
      },
      // 控制修改动态参数名称/静态属性名称的出现与隐藏
      editDialogVisible: false,
      // 绑定修改表单验证的属性
      editFrom: {},
      // 绑定修改表单验证属性的规则
      editFromRules: {
        attr_name: [
          {
            required: true,
            message: "请输入修改的名称",
            trigger: "blur",
          },
          { min: 1, max: 8, message: "长度在 1 到 8 个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 获取的商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories", { type: 3 });

      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类数据失败");
      } else {
        this.cateList = res.data;
      }
    },
    // 让选择器只能选择三级分类
    handleChange() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      } else {
        console.log(this.selectedCateKeys);
        // 当级联选择器选择三级分类后，默认调用的是动态数据（因为默认标签页为动态参数页面）
        this.getParamsData();
      }
    },
    // 标签页点击切换的处理函数，
    handleTagClick() {
      // 每当标签页切换都需要切换获取动态或静态参数
      this.getParamsData();
    },

    // 获取当前级联选择器选取的三级分类的数据
    async getParamsData() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );

      if (res.meta.status !== 200) {
        this.$message.error("获取参数列表失败");
      } else {
        // 在将res.data数据存入数组前
        // 为了后面更方便的渲染商品标签，需要把res.data中的attr_vals属性值改为数组形式
        res.data.forEach((item) => {
          // 当item.attr_vals的属性值字符串为空时，直接把item.attr_vals赋值为空数组
          item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];

          // 在动态参数表格和静态属性表格中，inputVisible和inputValue属性控制了各自所在表格的所有参数的切换表单标签
          // 这样就会导致，在给某一个表格中参数添加标签时，使该表格内所有参数同时添加同一个标签
          // 因此就需要单独给表格内每一个参数都赋予inputVisible和inputValue属性，来控制单独某一个参数添加标签
          item.inputVisible = false;
          item.inputValue = "";
        });

        console.log(res.data);
        // 将根据many和only获取到的参数分别存储
        if (this.activeName === "many") {
          this.manyTableData = res.data;
        } else {
          this.onlyTableData = res.data;
        }
      }
    },
    // 弹框关闭后，对添加表单进行重置
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    //  校验表单发送请求，并添加动态参数或者静态属性
    addParams() {
      this.$refs.addFormRef.validate(async (vaild) => {
        if (!vaild) {
          return;
        } else {
          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addFrom.attr_name,
              attr_sel: this.activeName,
            }
          );

          if (res.meta.status !== 201) {
            this.$message.error("添加失败");
          } else {
            this.$message.success("添加成功");
            this.getParamsData();
            this.addDialogVisible = false;
          }
        }
      });
    },
    // 弹出编辑修改动态参数名称/静态属性名称的表单
    async showEditDialog(attrId) {
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      );
      if (res.meta.status !== 200) {
        this.$message.error("获取参数失败");
      } else {
        this.editFrom = res.data;
      }

      this.editDialogVisible = true;
    },
    // 弹框关闭后，对编辑表单进行重置
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    //  校验表单发送请求，并编辑动态参数或者静态属性名称
    editParams() {
      this.$refs.editFormRef.validate(async (vaild) => {
        if (!vaild) {
          return;
        } else {
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.editFrom.attr_id}`,
            {
              attr_name: this.editFrom.attr_name,
              attr_sel: this.activeName,
            }
          );

          if (res.meta.status !== 200) {
            this.$message.error("修改参数失败");
          } else {
            this.$message.success("修改参数成功");
            this.getParamsData();
            this.editDialogVisible = false;
          }
        }
      });
    },
    // 发送请求，删除参数
    async removeParams(attrId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("您取消了删除");
      } else {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attrId}`
        );
        if (res.meta.status !== 200) {
          this.$message.error("参数删除失败");
        } else {
          this.$message.success("参数删除成功");
          this.getParamsData();
        }
      }
    },
    async handleInputConfirm(row) {
      // 若添加标签的表单中，添加的元素为空，则return停止添加标签
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false;
        return;
      } else {
        // 添加标签时，当按下enter键或添加表单失去焦点时
        // 将添加表单中的数据push到attr_vals数组中
        row.attr_vals.push(row.inputValue);
        row.inputValue = "";
        row.inputVisible = false;

        // 以上操作只是将标签数据临时添加成功，并没有存储到数据库中
        // 发起网络请求，编辑提交参数
        this.savaAttrVal(row);
      }
    },
    // 编辑提交参数的请求
    async savaAttrVal(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(","),
        }
      );

      if (res.meta.status !== 200) {
        this.$message.error("编辑参数失败");
      } else {
        this.$message.success("编辑参数成功");
      }
    },
    showInput(row) {
      row.inputVisible = true;
      // $nextTick为生命周期钩子函数
      // 表示只有在元素渲染完毕后，才会执行回调函数中的代码
      this.$nextTick(function () {
        // 让表单自动获取焦点
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除对应的参数标签
    closeTag(i, row) {
      row.attr_vals.splice(i, 1);
      // 发送编辑提交参数的情求
      this.savaAttrVal(row);
    },
  },
  computed: {
    // 控制按钮只有在选中三级分类时才可以启用
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      } else {
        return false;
      }
    },
    // 级联选择器中选取三级分类参数的id值
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      } else {
        return null;
      }
    },
    // 控制添加参数/添加属性弹框的名称
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>