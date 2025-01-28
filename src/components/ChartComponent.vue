<template>
  <div ref="chart" class="chart-container"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    classificationCount: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.initChart();
  },
  methods: {
    initChart() {
      const chartDom = this.$refs.chart;
      const myChart = echarts.init(chartDom);
      const categories = Object.keys(this.classificationCount).map(this.getClassificationDescription);
      const counts = Object.values(this.classificationCount);

      const option = {
        title: {
          text: '项目分类数量',
          subtext: `最高分类: ${this.getMaxCategory()}`,
          left: 'center'
        },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: categories
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: counts,
          type: 'bar'
        }]
      };

      myChart.setOption(option);
    },
    getMaxCategory() {
      const maxCount = Math.max(...Object.values(this.classificationCount));
      const maxCategory = Object.keys(this.classificationCount).find(
        key => this.classificationCount[key] === maxCount
      );
      return this.getClassificationDescription(maxCategory);
    },
    getClassificationDescription(classification) {
      const descriptions = {
        'FRAMEWORK': '框架',
        'LIBRARY_OR_MODULE': '库或模块',
        'LARGE_MODEL_OR_MACHINE_LEARNING': '大模型或机器学习',
        'OPEN_SOURCE_OS_AND_TOOLS': '开源操作系统和系统工具',
        'FRONTEND_APPLICATION': '前端应用',
        'BACKEND_SERVICE': '后端服务',
        'WEB_FRAMEWORK': 'Web框架',
        'GAME_DEVELOPMENT': '游戏开发',
        'OPEN_SOURCE_SOFTWARE_DEVELOPMENT': '开源软件开发',
        'SCRIPTING_LANGUAGE': '脚本语言'
      };
      return descriptions[classification] || '未知分类';
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 50%;
  height: 150px;
  margin: 10px auto;
}
</style> 