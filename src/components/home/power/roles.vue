<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb style="margin-bottom: 15px">
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addRolesVisible = true">
        添加角色
      </el-button>
      <!-- 添加角色弹框 -->
      <el-dialog
        title="角色信息添加"
        :visible.sync="addRolesVisible"
        width="30%"
        @close="dialogClose"
      >
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addRolesVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRolesInfo"> 确 定 </el-button>
        </span>
      </el-dialog>
      <!-- 权限管理列表区域 -->
      <template>
        <el-table :data="rolesList" border stripe style="width: 100%">
          <el-table-column type="expand">
            <!-- 权限列表区域 -->
            <template slot-scope="scope">
              <!-- 使用Bootstrap布局，将页面分为25份 -->
              <!-- 这里添加边框线，也可使用伪类选择器:nth-child -->
              <el-row
                :class="['bmborder', i1 === 0 ? 'tpborder' : '']"
                v-for="(item1, i1) in scope.row.children"
                :key="item1.id"
              >
                <!-- 一级权限列表 -->
                <el-col :span="5">
                  <el-tag
                    style="margin-left: 20px"
                    closable
                    @close="removeTagsById(scope.row, item1.id)"
                  >
                    {{ item1.authName }}
                  </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级和三级权限列表 -->
                <el-col :span="19">
                  <el-row
                    :class="[i2 === 0 ? '' : 'tpborder']"
                    v-for="(item2, i2) in item1.children"
                    :key="item2.id"
                  >
                    <el-col :span="6">
                      <el-tag
                        type="success"
                        closable
                        @close="removeTagsById(scope.row, item2.id)"
                        >{{ item2.authName }}</el-tag
                      >
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag
                        v-for="item3 in item2.children"
                        :key="item3.id"
                        type="warning"
                        closable
                        @close="removeTagsById(scope.row, item3.id)"
                      >
                        {{ item3.authName }}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index" label="序号" width="100" align="center">
          </el-table-column>
          <el-table-column
            prop="roleName"
            label="角色名称"
            width="250"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="roleDesc"
            label="角色描述"
            width="400"
            align="center"
          >
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="showEditDialog(scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="removeRoles(scope.row.id)"
              >
                删除
              </el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="setRightDialogVisible(scope.row)"
              >
                权限分配
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 编辑弹框 -->
      <el-dialog
        title="角色信息修改"
        :visible.sync="editRolesVisible"
        width="30%"
      >
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editRolesVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRolesInfo"> 确 定 </el-button>
        </span>
      </el-dialog>
    </el-card>

    <!-- 分配权限的弹框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightDialogVisible"
      width="50%"
      @close="resetRightDialog"
    >
      <!-- 树结构控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "roles",
  created() {
    this.getRolesList();
  },
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 控制编辑角色信息表单是否出现与隐藏
      editRolesVisible: false,
      // 控制添加角色信息表单是否出现与隐藏
      addRolesVisible: false,
      // 编辑角色信息表单验证属性
      editForm: {},
      // 控制分配权限的弹框的出现与隐藏
      rightDialogVisible: false,
      // 存放每个用户的权限
      rightsList: [],
      // 数据的树结构绑定的属性
      treeProps: {
        children: "children",
        label: "authName",
      },
      // 默认选中的三级节点的id值数组
      defKeys: [],
      // 即将要分配权限的角色id值
      roleId: "",
      // 编辑角色信息表单验证规则
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "长度在 1 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
      // 双向绑定添加表单的输入内容
      // 添加角色信息表单验证属性
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加角色信息表单验证规则
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "长度在 1 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    // 获取权限列表数据
    async getRolesList() {
      // 请求成功后，返回Promise对象，为方便处理则使用await
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("请求角色列表失败");
      } else {
        this.rolesList = res.data;
      }
    },
    // 展示编辑弹框，并将根据id将对应的该行数据同步给弹框中的表单中
    async showEditDialog(id) {
      this.editRolesVisible = true;
      // 根据id查询角色信息
      // 请求成功后，返回Promise对象，为方便处理则使用await
      const { data: res } = await this.$http.get("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("获取当前用户信息失败");
      } else {
        this.editForm = res.data;
      }
    },
    // 修改角色信息时，点击确定验证数据，数据符合要求即发送请求修改
    editRolesInfo() {
      this.$refs.editFormRef.validate(async (vaild) => {
        if (!vaild) {
          // 验证失败
          return;
        } else {
          // 验证成功，将表单数据进行交互修改数据
          // 请求成功后，返回Promise对象，为方便处理则使用await
          const { data: res } = await this.$http.put(
            "roles/" + this.editForm.roleId,
            {
              roleName: this.editForm.roleName,
              roleDesc: this.editForm.roleDesc,
            }
          );

          console.log(this.editForm.roleId);
          // 判断编辑修改是否成功
          if (res.meta.status !== 200) {
            return this.$message.error("修改角色信息失败");
          } else {
            this.editRolesVisible = false;
            this.getRolesList();
            return this.$message.success("修改角色信息成功");
          }
        }
      });
    },
    // 删除角色
    async removeRoles(id) {
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
        // 请求成功后，返回Promise对象，为方便处理则使用await
        const { data: res } = await this.$http.delete("roles/" + id);
        if (res.meta.status !== 200) {
          this.$message.error("删除角色失败");
        } else {
          this.getRolesList();
          this.$message.success("删除角色成功");
        }
      }
    },
    // 添加角色信息进行信息验证
    addRolesInfo() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        } else {
          const { data: res } = await this.$http.post("roles", this.addForm);

          if (res.meta.status !== 201) {
            this.$message.error("添加角色失败");
          } else {
            this.addRolesVisible = false;
            this.getRolesList();
            this.$message.success("添加角色成功");
          }
        }
      });
    },
    // 监听表单关闭，并重置表单
    dialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 删除权限
    async removeTagsById(role, rightId) {
      // 请求成功后，返回Promise对象，为方便处理则使用await
      // respondResult接收响应数据，confirm为删除成功返回数据，cancel为删除失败返回数据
      const respondResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      console.log(respondResult);
      if (respondResult !== "confirm") {
        return this.$message.info("取消了删除权限操作");
      }

      // 点击确定删除后，发起删除角色权限请求
      // 请求成功后，返回Promise对象，为方便处理则使用await
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        this.$message.error("角色权限删除失败");
      }
      // 不使用this.getRolesList()，因为此方法会重新获取列表数据就会使权限展开栏收起，造成不好的体验感
      // this.getRolesList()
      // 返回的data, 是当前角色下最新的权限数据
      // 使用以下方式，将最新权限数据给角色
      role.children = res.data;
      this.$message.success("成功删除了该权限");
    },
    // 设置权限分配的弹框
    async setRightDialogVisible(role) {
      // 将当前角色的id值给roleId（分配权限时使用）
      this.roleId = role.id;
      // 发起访问用户权限的请求
      // 请求成功后，返回Promise对象，为方便处理则使用await
      const { data: res } = await this.$http.get("rights/tree");

      if (res.meta.status !== 200) {
        this.$message.error("分配用户权限失败");
      }

      // 将返回的权限数据赋值给rightsList
      this.rightsList = res.data;
      console.log(this.rightsList);

      // 根据存入defKeys数组中的三级权限id值进行默认勾选复选框
      this.getLeafKeys(role, this.defKeys);
      console.log(this.defKeys);

      this.rightDialogVisible = true;
    },
    // 通过递归的方法，获取所有三级权限的id值，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 判断节点是否为三级权限，若为三级权限，则将该节点的id值放入defKeys数组中
      // 判断是否为三级权限方法：判断该节点是否有children属性
      if (!node.children) {
        return arr.push(node.id);
      }

      // 若不为三级权限，则循环遍历进行递归
      node.children.forEach((item) =>
        // 将遍历出的子节点item，利用item再次调用getLeafKeys()函数
        this.getLeafKeys(item, arr)
      );
    },
    // 监听每次关闭分配权限的弹框时，清空权限复选选中的状态
    resetRightDialog() {
      this.defKeys = [];
    },
    // 为角色分配权限
    async allotRights() {
      const keys = [
        // 对当前角色被选中的权限的id，利用扩展运算符放入数组中
        ...this.$refs.treeRef.getCheckedKeys(),
        // 对当前角色被半选中的权限的id，利用扩展运算符放入数组中
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];

      // 发送请求时，请求体参数rids为以","分隔的字符串
      const idStr = keys.join(",");

      // 发送请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );

      if (res.meta.status !== 200) {
        this.$message.error("分配权限失败");
      } else {
        this.$message.success("分配权限成功");
        this.getRolesList();
        this.rightDialogVisible = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}

.tpborder {
  border-top: 1px solid #eee;
}

.bmborder {
  border-bottom: 1px solid #eee;
}

.el-row {
  display: flex;
  align-items: center;
}
</style>