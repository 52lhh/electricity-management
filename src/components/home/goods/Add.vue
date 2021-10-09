<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb style="margin-bottom: 15px">
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示消息 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        :align-center="true"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- Tabs标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="tabPosition"
          v-model="activeIndex"
          :before-leave="beforeTagLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                expandTrigger="hover"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <!-- 复选框选项 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(checkbox, i) in item.attr_vals"
                  :label="checkbox"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"> </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <el-button type="primary" @click="add" style="margin-top: 15px">
              添加商品
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 弹出图片的对话框 -->
    <el-dialog title="查看图片" :visible.sync="picDialogVisible" width="50%">
      <img :src="picURL" class="checkPic" alt="" />
    </el-dialog>
  </div>
</template>


<script>
import _ from "lodash";

export default {
  name: "add",
  created() {
    // 在当前页面加载完毕后，立即获取商品分类数据
    this.getCateList();
  },
  data() {
    return {
      // 控制Tabs标签页的位置
      tabPosition: "left",
      // 控制步骤条和Tabs标签页同步显示
      activeIndex: "0",
      // 添加商品表单的数据对象
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        // 级联选择器v-model绑定的是选择分类数据的id值
        // 因为选择三级分类时，会有三个id值因此使用数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的描述
        goods_introduce: "",
        // 商品的参数
        attrs: [],
      },
      // 添加商品表单的数据对象中属性的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      // 商品分类数据
      cateList: [],
      // 级联选择器的配置项
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 图片上传的地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 在图片上传时，需要设置上传的请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 图片的URL地址
      picURL: "",
      // 控制查看图片对话框的显示与隐藏
      picDialogVisible: false,
      // 因为发送提交添加商品请求时，goods_cat是以为','分割的分类列表
      // 如果将addForm中的goods_cat(数组)修改为字符串形式上传
      // 则会与级联选择器选择分类存储id值必须使用数组产生冲突
      // 因此创建一个新的Form，用于最后提交添加商品的情求
      Form: {},
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");

      if (res.meta.status !== 200) {
        this.$message.error("商品分类数据获取失败");
      } else {
        this.cateList = res.data;
        console.log(this.cateList);
      }
    },
    handleChange() {
      // 控制级联选择器只能选取三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
      console.log(this.addForm.goods_cat);
    },
    // 控制标签页之间的跳转
    beforeTagLeave(activeName, oldActiveName) {
      // activeName: 即将进入标签的标签名
      // oldActiveName: 即将离开标签的标签名
      // 当处于第一个标签页，并且没有选择三级分类时，不允许跳转标签页
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择三级分类");
        return false;
      }
    },
    // 当tab标签页被点击时触发
    async tabClick() {
      // 当标签页name="1", 为商品参数页时，发起参数请求获取动态参数
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "many" } }
        );

        if (res.meta.status !== 200) {
          this.$message.error("获取参数列表失败");
        } else {
          // 将res.data.attr_vals转为数组
          res.data.forEach((item) => {
            item.attr_vals =
              item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
          });
          this.manyTableData = res.data;
          console.log(this.manyTableData);
        }
        // 当标签页name="2", 为商品参数页时，发起参数请求获取静态属性
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "only" } }
        );

        if (res.meta.status !== 200) {
          this.$message.error("获取属性列表失败");
        } else {
          this.onlyTableData = res.data;
          console.log(this.onlyTableData);
        }
      }
    },
    // 点击文件列表中已上传的文件时触发
    handlePreview(file) {
      // 当点击上传的文件时，则弹出对话框查看文件
      this.picURL = file.response.data.url;
      this.picDialogVisible = true;
      console.log(this.picURL);
    },
    // 文件列表移除文件时触发
    handleRemove(file) {
      // 移除文件分为三步
      // 第一步：获取被移除文件的临时路径
      const filePath = file.response.data.tmp_path;
      // 第二步：在addForm中pics数组中找到与删除文件相同的filePath
      const index = this.addForm.pics.findIndex((x) => x.pic === filePath);
      // 第三步：移除addForm中pics数组中的这个元素
      this.addForm.pics.splice(index, 1);
      console.log(this.addForm);
    },
    // 文件上传成功时触发
    // 因为在添加商品时，需要上传参数pics，因此在文件上传成功后，需要给addFrom添加pics属性
    handleSuccess(response) {
      console.log(response);
      const picInfo = { pic: response.data.tmp_path };
      // 将图片信息参数添加到pics数组中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 提交商品时触发
    add() {
      this.$refs.addFormRef.validate(async (vaild) => {
        if (!vaild) {
          this.$message.error("请填写必要的表单项");
          return;
        } else {
          // 添加动态参数
          this.manyTableData.forEach((item) => {
            const manyInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(","),
            };
            this.addForm.attrs.push(manyInfo);
          });
          // 添加静态属性
          this.onlyTableData.forEach((item) => {
            const onlyInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals,
            };
            this.addForm.attrs.push(onlyInfo);
          });
          // 将addFrom深克隆一份，复制给Form，最后有Form作为参数发送请求
          this.Form = _.cloneDeep(this.addForm);
          // 将Form中goods_cat属性值转化为字符串类型
          this.Form.goods_cat = this.addForm.goods_cat.join(",");
          // console.log(Object.is(this.Form, this.addForm)); // false

          // 添加商品
          const { data: res } = await this.$http.post("goods", this.Form);
          if (res.meta.status !== 201) {
            this.$message.error("添加商品失败");
          } else {
            this.$message.success("添加商品成功");
            this.$router.push("/goods");
          }
        }
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      } else {
        return null;
      }
    },
  },
};
</script>

<style lang='less' scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.checkPic {
  width: 100%;
}
</style>