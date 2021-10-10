<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb style="margin-bottom: 15px">
      <el-breadcrumb-item to="/users">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 第二步：为echarts定义一个容器 -->
      <div id="main" style="width: 800px; height: 500px"></div>
    </el-card>
  </div>
</template>

<script>
// 第一步：引入echarts
import * as echarts from "echarts";
// 引入lodash
import _ from "lodash";

export default {
  name: "report",
  data() {
    return {
      // api中图表的配置项和数据需要进行合并的选项
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },
  // 生命周期钩子函数：等到整个视图都渲染完毕再执行某些操作
  async mounted() {
    // 第三步：基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById("main"));

    // 发起获取数据统计图表的数据请求
    const { data: res } = await this.$http.get("reports/type/1");

    if (res.meta.status !== 200) {
      this.$message.error("获取数据失败");
    }

    // 第四步：指定图表的配置项和数据
    // var option = {
    //   title: {
    //     text: "ECharts 入门示例",
    //   },
    //   tooltip: {},
    //   legend: {
    //     data: ["销量"],
    //   },
    //   xAxis: {
    //     data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
    //   },
    //   yAxis: {},
    //   series: [
    //     {
    //       name: "销量",
    //       type: "bar",
    //       data: [5, 20, 36, 10, 10, 20],
    //     },
    //   ],
    // };

    // 使用lodash将两个数据进行合并
    const result = _.merge(res.data, this.options);

    // 第四步：指定图表的配置项和数据res.data
    // 第五步：使用刚指定的配置项和数据显示图表
    myChart.setOption(result);
  },
};
</script>

<style lang="less" scoped>
</style>