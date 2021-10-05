<template>
  <!-- 窗口可视区 -->
  <div class="login_container">
    <!-- 登陆区 -->
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="~@/assets/img/证件照.jpg" alt="" />
      </div>
      <!-- 登陆表单区 -->
      <!-- 为表单赋予ref引用 -->
      <el-form
        label-width="80px"
        class="login_form"
        :model="loginFrom"
        :rules="loginFromRules"
        ref="loginFromref"
      >
        <!-- input区 -->
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="icon-user"
            v-model="loginFrom.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="icon-lock"
            type="password"
            v-model="loginFrom.password"
          ></el-input>
        </el-form-item>
        <!-- button区 -->
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginFrom">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      // 登陆表单数据绑定对象
      loginFrom: {
        username: "admin",
        password: "123456",
      },
      // 表单的验证规则对象
      loginFromRules: {
        // 用户名规则
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
        // 密码规则
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    resetLoginFrom() {
      // resetFields()：对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
      // $refs获取ref引用
      this.$refs.loginFromref.resetFields();
    },
    login() {
      // validate()：对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise
      // 验证成功：回调函数参数valid为true，反之为false
      // await只能出现在async函数中
      this.$refs.loginFromref.validate(async (valid) => {
        // return console.log(valid);
        // 若校验失败，则不发送请求
        if (!valid) return;

        // 校验成功，发送请求
        // 根据接口文档要求发送请求
        // await返回一个Promise对象resolve的值
        // 将返回的resolve值中的data对象（真实数据）进行解构
        const { data: res } = await this.$http.post("login", this.loginFrom);
        // console.log(res);
        // 当状态码为200时，登陆成功
        if (res.meta.status !== 200) {
          // error()为Message组件的失败弹窗方法
          this.$message.error("登陆失败");
        } else {
          // success()为Message组件的成功弹窗方法
          this.$message.success("登陆成功");

          // 登陆成功后，页面跳转到home页面，并且将token保存到客户端的sessionStorage
          // 1.1 只有登陆后，才能访问到其他api接口
          // 1.2 token只有在访问该页面时生效，因此token使用sessionStorage保存
          window.sessionStorage.setItem("token", res.data.token);
          // 登陆成功后跳转Home页面
          this.$router.push("./home");
        }
      });
    },
  },
};
</script>
 
<style lang='less' scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  position: relative;

  .login_box {
    width: 450px;
    height: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    .avatar_box {
      position: absolute;
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      background-color: #fff;
      padding: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
      left: 50%;
      transform: translate(-50%, -50%);

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .el-form {
      margin-left: -40px;
    }

    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .btn {
        display: flex;
        justify-content: end;
      }
    }
  }
}
</style>