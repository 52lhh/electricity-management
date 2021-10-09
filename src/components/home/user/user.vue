<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索框区域 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <div style="margin-top: 15px">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </div>
      </el-col>
      <!-- 添加用户按钮 -->
      <el-col :span="3" style="margin-top: 15px">
        <el-button type="primary" @click="dialogVisible = !dialogVisible">
          添加用户
        </el-button>
      </el-col>
      <!-- 添加用户的表单弹框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        width="50%"
        @close="dialogClose"
      >
        <el-form
          :model="userRuleForm"
          :rules="userRules"
          ref="ruleFormRef"
          label-width="80px"
        >
          <!-- 验证表单用户名称 -->
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="userRuleForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="userRuleForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userRuleForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="userRuleForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 表单确定取消按钮 -->
        <span slot="footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUSer"> 确 定 </el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息的表单弹框 -->
      <el-dialog title="修改信息" :visible.sync="editDialogVisible" width="30%">
        <!-- 用户名不可修改 -->
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="100px"
        >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo"> 确 定 </el-button>
        </span>
      </el-dialog>
    </el-row>
    <!-- 表格区域 -->
    <el-table :data="userList" style="width: 100%" stripe border>
      <!-- 序号 -->
      <el-table-column
        type="index"
        label="序号"
        width="100"
        align="center"
      ></el-table-column>
      <!-- 姓名 -->
      <el-table-column prop="username" label="姓名" width="200" align="center">
      </el-table-column>
      <!-- 邮箱 -->
      <el-table-column prop="email" label="邮箱" width="200" align="center">
      </el-table-column>
      <!-- 电话 -->
      <el-table-column prop="mobile" label="电话" width="200" align="center">
      </el-table-column>
      <!-- 角色 -->
      <el-table-column prop="role_name" label="角色" width="200" align="center">
      </el-table-column>
      <!-- 状态 -->
      <el-table-column prop="" label="状态" align="center">
        <template slot-scope="scope">
          <!-- @change="changeMgState(scope.row)中函数的参数为：本行的数据 -->
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeMgState(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column prop="" label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-tooltip content="修改用户信息" placement="top" :enterable="false">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
          </el-tooltip>
          <!-- 删除按钮 -->
          <el-tooltip content="删除用户信息" placement="top" :enterable="false">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="showDeleteDialog(scope.row.id)"
            ></el-button>
          </el-tooltip>
          <!-- 分配按钮 -->
          <el-tooltip content="分配用户" placement="top" :enterable="false">
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="small"
              @click="setRole(scope.row)"
            ></el-button>
          </el-tooltip>
          <!-- 分配用户角色对话框 -->
          <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="30%"
            @close="resetRoleDialog"
          >
            <div>
              <p>当前的用户：{{ userInfo.username }}</p>
              <p>当前的角色：{{ userInfo.role_name }}</p>
              <p>
                <!-- 分配角色的选择器 -->
                分配新角色：
                <el-select v-model="selectRoleId" placeholder="请选择">
                  <el-option
                    v-for="item in rolesList"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </p>
            </div>
            <span slot="footer">
              <el-button @click="setRoleDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="saveRoleInfo">
                确 定
              </el-button>
            </span>
          </el-dialog>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "user",
  created() {
    // 当页面加载后，立即调用该函数，请求列表数据
    this.getUserList();
  },
  data() {
    var checkEmail = (rule, value, callback) => {
      // 判断邮箱的正则表达式
      const resEmail = /^([a-zA-Z0-9_ -])+@([a-zA-Z0-9])+(\.[a-zA-Z0-9_-])+/;
      // 验证正则表达式
      if (resEmail.test(value)) {
        return callback();
      } else {
        callback(new Error("请输入合法的邮箱"));
      }
    };
    var checkMobile = (rule, value, callback) => {
      // 判断邮箱的正则表达式
      const resMobile =
        /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      // 验证正则表达式
      if (resMobile.test(value)) {
        return callback();
      } else {
        callback(new Error("请输入合法的手机号码"));
      }
    };
    return {
      // 列表数据
      userList: [],
      // 数据条数
      total: 0,
      // 对话框是否显示
      dialogVisible: false,
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前所在的页数
        pagenum: 1,
        // 当前页的数据数量
        pagesize: 2,
      },
      // 表单验证属性
      userRuleForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 控制分配用户角色对话框显示与隐藏
      setRoleDialogVisible: false,
      // 为用户分配角色，获取该用户信息
      userInfo: {},
      // 所有角色列表信息
      rolesList: [],
      // 选择项与表单双向绑定的数据
      selectRoleId: "",

      // 表单验证规则
      userRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 3 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 用于保存查询的数据信息
      // 修改用户信息表单的验证属性
      editForm: {},
      // 修改用户信息表单的验证规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 用于控制编辑用户弹框的出现与消失
      editDialogVisible: false,
    };
  },
  methods: {
    // 获取数据
    async getUserList() {
      // 请求成功后，返回Promise对象，为方便处理则使用await
      // 对响应数据中的data对象进行结构赋值
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("列表数据获取失败");
      } else {
        this.userList = res.data.users;
        this.total = res.data.total;
        console.log(this.userList);
      }
    },
    // 监听页码大小变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页面变动
    handleCurrentChange(newCurrent) {
      this.queryInfo.pagenum = newCurrent;
      this.getUserList();
    },
    // 更新用户的状态
    async changeMgState(userinfo) {
      console.log(userinfo);
      // 因为id值和type是不确定的，因此使用模板字符串
      // 请求数据的返回值为Promise，为了方便处理则使用await
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        // 若状态修改失败，则让修改的状态取反
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("修改用户状态失败");
      } else {
        return this.$message.success("修改用户状态成功");
      }
    },
    // 监听表单关闭，并重置表单
    dialogClose() {
      this.$refs.ruleFormRef.resetFields();
    },
    // 提交用户信息时的表单验证
    addUSer() {
      this.$refs.ruleFormRef.validate(async (valid) => {
        if (!valid) {
          return false;
        } else {
          // 因为请求返回的数据类型为Promise，因此使用await方便处理
          const { data: res } = await this.$http.post(
            "users",
            this.userRuleForm
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加用户失败");
          } else {
            // 添加成功后，关闭表单弹框
            this.dialogVisible = false;
            // 添加用户成功后，重新获取数据
            this.getUserList();
            return this.$message.success("添加用户成功");
          }
        }
      });
    },
    // 展示编辑弹框，并将根据id将对应的该行数据同步给弹框中的表单中
    async showEditDialog(id) {
      // 请求数据的返回值为Promise，为了方便处理则使用await
      // 发起查询用户信息的请求
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询数据失败");
      } else {
        this.editDialogVisible = true;
        this.editForm = res.data;
        return this.$message.success("查询数据成功");
      }
    },
    // 修改用户信息时，点击确定验证数据，数据符合要求即发送请求修改
    editUserInfo() {
      this.$refs.editFormRef.validate(async (vaild) => {
        if (!vaild) {
          return;
        } else {
          // 发起修改用户信息的请求
          const { data: res } = await this.$http.put(
            "users/" + this.editForm.id,
            {
              email: this.editForm.email,
              mobile: this.editForm.mobile,
            }
          );

          if (res.meta.status !== 200) {
            return this.$message.error("修改数据失败");
          } else {
            this.editDialogVisible = false;
            this.getUserList();
            return this.$message.success("修改数据成功");
          }
        }
      });
    },
    // 删除用户信息方法
    async showDeleteDialog(id) {
      // 返回值为Promise，为了方便处理则使用await
      // confirmResult值为confirm（确定删除返回）和cancel（取消删除返回）
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 根据confirmResult返回值决定是否删除用户信息
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除用户信息");
      } else {
        const { data: res } = await this.$http.delete("users/" + id);
        if (res.meta.status !== 200) {
          console.log(res.meta);
          return this.$message.error("删除用户信息失败");
        } else {
          this.getUserList();
          return this.$message.success("删除用户信息成功");
        }
      }
    },
    // 为用户分配角色
    async setRole(userInfo) {
      // userInfo为当前的用户信息，将用户信息赋值给userInfo对象
      this.userInfo = userInfo;
      console.log(this.userInfo);

      // 获取角色列表保存到roleList数组中
      // 返回值为Promise，为了方便处理则使用await
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        this.$message.error("获取角色列表失败");
      } else {
        this.rolesList = res.data;
      }

      this.setRoleDialogVisible = true;
    },
    // 分配用户角色
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error("请选择要分配的角色");
      }

      // 返回值为Promise，为了方便处理则使用await
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectRoleId,
        }
      );
      if (res.meta.status !== 200) {
        this.$message.error("分配用户角色失败");
      } else {
        this.$message.success("分配用户角色成功");
        this.getUserList();
        this.setRoleDialogVisible = false;
      }
    },
    // 给分配用户角色对话框添加关闭监听事件
    resetRoleDialog() {
      this.selectRoleId = "";
      this.userInfo = "";
    },
  },
};
</script>

<style lang="less" scoped>
</style>