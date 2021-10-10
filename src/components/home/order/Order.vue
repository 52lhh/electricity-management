<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb style="margin-bottom: 15px">
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <!-- 将表单中输入的值双向绑定到发送请求商品列表数据的参数中 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-show="scope.row.order_pay === '1'">
              已付款
            </el-tag>
            <el-tag type="danger" v-show="scope.row.order_pay === '0'">
              未付款
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            <!-- 调用filter全局过滤器dateFormat，将add_time过滤为时间格式 -->
            <!-- "|"管道符号，表示调用全局过滤器 -->
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showAddress"
          ></el-button>
          <!-- 获取物流位置按钮 -->
          <el-button
            type="success"
            icon="el-icon-location-information"
            size="mini"
            @click="showProgressDialog"
          ></el-button>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="closeAddressDialog"
    >
      <!-- 修改地址表单 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        label-width="100px"
        ref="addressFormRef"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="checkAddress"> 确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 显示物流位置的对话框 -->
    <el-dialog title="物流状态" :visible.sync="progressVisible" width="50%">
      <!-- 物流时间线 -->
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(progress, index) in progressInfo"
          :key="index"
          :timestamp="progress.time"
        >
          {{ progress.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="progressVisible = false">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 局部导入省市区/县联动选择js文件
import cityData from "./citydata.js";

export default {
  name: "order",
  created() {
    this.getOrderList();
  },
  data() {
    return {
      // 发起获取订单列表请求的请求参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      // 订单列表
      orderList: [],
      // 订单数据总条数
      total: 0,
      // 控制修改地址对话框的显示与隐藏
      addressVisible: false,
      // 修改地址表单绑定的地址对象
      addressForm: {
        // address1为省市区/县联动选择，使用数组分别保存省市区/县数据
        address1: [],
        // address2为详细地址，为字符串
        address2: "",
      },
      // 修改地址表单绑定的地址对象的验证规则
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      // 使用省市区/县联动选择组件
      cityData: cityData,
      // 控制物流位置的对话框显示隐藏
      progressVisible: false,
      // 保存物流信息
      progressInfo: [],
    };
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        this.$message.error("获取订单列表失败");
      } else {
        this.orderList = res.data.goods;
        this.total = res.data.total;
      }
    },
    // 当每页显示条数发生改变时触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 当页码发生改变时触发
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getOrderList();
    },
    // 显示修改地址对话框
    showAddress() {
      this.addressVisible = true;
    },
    // 关闭地址对话框触发
    closeAddressDialog() {
      this.$refs.addressFormRef.resetFields();
    },
    // 点击地址对话框确定按钮，进行表单校验
    checkAddress() {
      this.$refs.addressFormRef.validate((vaild) => {
        if (!vaild) {
          return;
        } else {
          this.addressVisible = false;
        }
      });
    },
    // 点击显示物流位置的对话框
    async showProgressDialog() {
      // 查看物流信息

      // 由于后台api接口存在问题，因此无法发送查看物流信息的请求
      // const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      // console.log(res.meta.status);
      // if (res.meta.status !== 200) {
      //   this.$message.error("获取物流信息失败");
      // } else {
      //   this.progressInfo = res.data;
      // }

      // 因此写一个临时数据，以便实现后续功能
      this.progressInfo = [
        {
          time: "2018-05-10 09:39:00",
          ftime: "2018-05-10 09:39:00",
          context: "已签收,感谢使用顺丰,期待再次为您服务",
          location: "",
        },
        {
          time: "2018-05-10 08:23:00",
          ftime: "2018-05-10 08:23:00",
          context:
            "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
          location: "",
        },
        {
          time: "2018-05-10 07:32:00",
          ftime: "2018-05-10 07:32:00",
          context: "快件到达 [北京海淀育新小区营业点]",
          location: "",
        },
        {
          time: "2018-05-10 02:03:00",
          ftime: "2018-05-10 02:03:00",
          context:
            "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
          location: "",
        },
        {
          time: "2018-05-09 23:05:00",
          ftime: "2018-05-09 23:05:00",
          context: "快件到达 [北京顺义集散中心]",
          location: "",
        },
        {
          time: "2018-05-09 21:21:00",
          ftime: "2018-05-09 21:21:00",
          context: "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
          location: "",
        },
        {
          time: "2018-05-09 13:07:00",
          ftime: "2018-05-09 13:07:00",
          context: "顺丰速运 已收取快件",
          location: "",
        },
        {
          time: "2018-05-09 12:25:03",
          ftime: "2018-05-09 12:25:03",
          context: "卖家发货",
          location: "",
        },
        {
          time: "2018-05-09 12:22:24",
          ftime: "2018-05-09 12:22:24",
          context: "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
          location: "",
        },
        {
          time: "2018-05-08 21:36:04",
          ftime: "2018-05-08 21:36:04",
          context: "商品已经下单",
          location: "",
        },
      ];
      console.log(this.progressInfo);
      this.progressVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>