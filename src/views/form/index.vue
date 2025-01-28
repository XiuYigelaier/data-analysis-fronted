<template>
  <div class="project-ranking">
    
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane
        v-for="(category, index) in projectData"
        :key="index"
        :label="getClassificationDescription(category.projectClassification)"
        :name="category.projectClassification"
      >
        <el-table :data="category.projects" style="width: 90%">
          <el-table-column prop="projectName" label="项目名称" width="300">
            <template slot-scope="scope">
              <a :href="scope.row.url" target="_blank">{{ scope.row.projectName }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述"></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <div class="fixed-category-box">
      <h4>项目分类</h4>
      <ul>
        <li v-for="(count, category) in classificationCount" :key="category">
          {{ getClassificationDescription(category) }}: {{ count }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { fetchProjectClassificationList, fetchProjectClassificationCount } from '@/api/user';

export default {
  data() {
    return {
      activeTab: 'GAME_DEVELOPMENT',
      projectData: [],
      classificationCount: {}
    };
  },
  created() {
    this.loadProjectData();
    this.loadClassificationCount();
  },
  methods: {
    async loadProjectData() {
      try {
        const response = await fetchProjectClassificationList();
        if (response.data.success) {
          this.projectData = response.data.data;
        } else {
          console.error('Failed to load project data');
        }
      } catch (error) {
        console.error('Error loading project data:', error);
      }
    },
    async loadClassificationCount() {
      try {
        const response = await fetchProjectClassificationCount();
        if (response.data.success) {
          this.classificationCount = response.data.data;
          this.initChart();
        } else {
          console.error('Failed to load classification count');
        }
      } catch (error) {
        console.error('Error loading classification count:', error);
      }
    },
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
          data: categories,
          axisLabel: {
            fontSize: 12 // 确保字体大小适中
          }
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
    handleTabClick(tab) {
      console.log('Tab clicked:', tab.name);
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
.project-ranking {
  padding: 20px;
}

.chart-container {
  width: 70%; /* 增加图表宽度 */
  height: 200px; /* 增加图表高度 */
  margin: 20px auto; /* 居中显示 */
}

.fixed-category-box {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 200px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
}

.fixed-category-box h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  text-align: center;
}

.fixed-category-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.fixed-category-box li {
  font-size: 12px;
  margin-bottom: 5px;
}
</style>
