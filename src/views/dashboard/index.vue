<template>
  <div class="dashboard-container">
    <el-card class="rank-card">
      <div slot="header" class="rank-header">
        <span>开发者排行榜</span>
        <div class="header-right">
          <el-button 
            type="primary" 
            icon="el-icon-refresh"
            @click="fetchDevelopers"
            :loading="loading"
          >刷新数据</el-button>
          <el-input
            v-model="searchQuery"
            placeholder="搜索开发者"
            prefix-icon="el-icon-search"
            class="search-input"
          />
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="filteredDevelopers"
        style="width: 100%"
        :row-class-name="tableRowClassName">
        <el-table-column
          type="index"
          label="排名"
          width="80"
          align="center">
          <template slot-scope="scope">
            <div class="rank-number" :class="getRankClass(scope.$index)">
              {{ scope.$index + 1 }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="开发者" width="250">
          <template slot-scope="scope">
            <div class="developer-info">
              <el-avatar :src="scope.row.avatarUrl" :size="40"></el-avatar>
              <span class="developer-name">{{ scope.row.name || scope.row.login }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="rank"
          label="分数"
          width="120"
          align="center">
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="120"
          align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="showDeveloperDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 开发者详情弹窗 -->
    <el-dialog
      title="开发者详情"
      :visible.sync="dialogVisible"
      width="80%">
      <div v-if="currentDeveloper" class="developer-detail">
        <div class="info-grid">
          <!-- 头像和项目模块 -->
          <el-card class="info-card personal-details">
            <div class="avatar-section">
              <el-avatar :src="currentDeveloper.avatarUrl" :size="80"></el-avatar>
              <h2>{{ currentDeveloper.login }}</h2>
            </div>
            <h3>项目列表</h3>
            <el-scrollbar style="height: 200px;">
              <el-table
                :data="currentDeveloper.projectList"
                style="width: 100%"
                height="200">
                <el-table-column
                  label="项目名称"
                  width="200">
                  <template slot-scope="scope">
                    <a :href="scope.row.url" target="_blank">{{ scope.row.projectName }}</a>
                  </template>
                </el-table-column>
          
                <el-table-column
                  label="类型"
                  width="120">
                  <template slot-scope="scope">
                    {{ getClassificationDescription(scope.row.classification) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="starCount"
                  label="Star数"
                  width="200">
                </el-table-column>
              </el-table>
            </el-scrollbar>
          </el-card>

          <!-- 关系网络图模块 -->
          <el-card class="info-card network-graph">
            <h3>关系网络图</h3>
            <div class="network-graph-wrapper">
              <!-- 这里可以放置关系网络图的实现 -->
              <p>关系网络图内容</p>
            </div>
          </el-card>

          <!-- 社区活跃情况九宫格 -->
          <el-card class="info-card community-activity">
            <h3>社区活跃情况</h3>
            <div class="small-grid">
              <el-card class="small-card" v-for="(value, key) in communityDetails" :key="key">
                <el-divider>{{ key }}</el-divider>
                <p>{{ value }}</p>
              </el-card>
            </div>
          </el-card>

          <!-- 历史分数模块 -->
          <el-card class="info-card score-history-section">
            <h3>历史得分趋势</h3>
            <div class="chart-wrapper">
              <div 
                ref="scoreChart" 
                style="width: 100%; height: 300px;">
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTalentRank } from '@/api/user'

export default {
  name: 'Dashboard',

  data() {
    return {
      developers: [],
      searchQuery: '',
      dialogVisible: false,
      currentDeveloper: null,
      loading: false,
      chart: null
    }
  },
  computed: {
    filteredDevelopers() {
      return this.developers.filter(dev => {
        const searchLower = this.searchQuery.toLowerCase()
        return (dev.name?.toLowerCase().includes(searchLower) ||
               dev.login?.toLowerCase().includes(searchLower))
      })
    },
    hasValidScoreHistory() {
      return this.currentDeveloper?.scoreHistory?.some(score => score !== null)
    },
    communityDetails() {
      if (!this.currentDeveloper) return {}
      return {
        'Follower数': this.currentDeveloper.followersCount,
        'Following数量': this.currentDeveloper.followingCount,
        'Repos数': this.currentDeveloper.publicReposCount,
        'Gist数': this.currentDeveloper.publicGistsCount,
        '总Commit数': this.currentDeveloper.commitCount,
        '总Comment数': this.currentDeveloper.commentCount,
        'PR Review数': this.currentDeveloper.prCount
      }
    }
  },
  methods: {
    async fetchDevelopers() {
      console.log('开始请求数据...')
      this.loading = true
      try {
        const response = await getTalentRank()
        console.log('接口返回数据：', response)
        
        if (response.data && Array.isArray(response.data.data)) {
          this.developers = response.data.data.map(dev => ({
            ...dev,
            rank: dev.talentRank || '-',
            projectList: Array.isArray(dev.projectList) ? dev.projectList : [],
            scoreHistory: Array.isArray(dev.scoreHistory) 
              ? dev.scoreHistory.filter(score => score !== null && score !== undefined)
              : [],
            bio: dev.bio || '',
            location: dev.location || '',
            areas: dev.areas || '',
            locationCredence: dev.locationCredence || 'N/A',
            areaCredence: dev.areaCredence || 'N/A'
          }))
          this.developers.sort((a, b) => b.rank - a.rank)
        } else {
          this.$message.error('获取数据格式错误')
        }
      } catch (error) {
        console.error('请求失败：', error)
        this.$message.error(error?.message || '获取开发者数据失败')
      } finally {
        this.loading = false
      }
    },
    getRankClass(index) {
      const classes = ['gold', 'silver', 'bronze']
      return index < 3 ? classes[index] : ''
    },
    tableRowClassName({ rowIndex }) {
      if (rowIndex < 3) {
        return `top-${rowIndex + 1}`
      }
      return ''
    },
    showDeveloperDetail(developer) {
      this.currentDeveloper = { ...developer }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.initChart()
      })
    },
    initChart() {
      this.chart = this.$echarts.init(this.$refs.scoreChart)
      this.updateChartData()
    },
    updateChartData() {
      if (!this.chart) return

      const scores = this.formatScoreHistory()
      console.log('处理后的分数数据:', scores) // 调试用

      const option = {
        title: {
          text: '开发者得分趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name}<br/>得分: ${params[0].value.toFixed(2)}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: scores.length }, (_, i) => `第${i + 1}次`),
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: '得分',
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [
          {
            name: '得分',
            type: 'line',
            data: scores,
            smooth: true,
            lineStyle: {
              color: '#409EFF'
            }
          }
        ]
      }

      this.chart.setOption(option)
    },
    formatScoreHistory() {
      if (!this.currentDeveloper?.scoreHistory?.length) {
        return []
      }
      
      // 确保数据是数字类型，并保留原始顺序（不反转）
      const scores = this.currentDeveloper.scoreHistory
        .filter(score => score !== null && score !== undefined)
        .map(score => parseFloat(score))
      
      console.log('原始分数数据:', this.currentDeveloper.scoreHistory) // 调试用
      console.log('格式化后的分数:', scores) // 调试用
      
      return scores
    },
    handleResize() {
      this.chart && this.chart.resize()
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
        }
      return descriptions[classification] || 'Unknown Classification'
    }
  },
  created() {
    this.fetchDevelopers()
  },
  watch: {
    currentDeveloper: {
      handler(newVal) {
        console.log('当前开发者数据:', newVal) // 调试用
        if (newVal && this.chart) {
          this.$nextTick(() => {
            this.updateChartData()
          })
        }
      },
      deep: true
    },
    dialogVisible(newVal) {
      if (newVal && this.chart) {
        this.$nextTick(() => {
          this.chart.resize()
          this.updateChartData()
        })
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f0f0f0; /* Light grey background */
  color: #333; /* Dark grey text */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  .rank-card {
    width: 100%;
    margin-bottom: 20px;
    
    .rank-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-right {
        display: flex;
        gap: 10px;
        align-items: center;
        
        .search-input {
          width: 200px;
        }
      }
    }
  }
  
  .developer-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .rank-number {
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50%;
    text-align: center;
    margin: 0 auto;
    
    &.gold {
      background: #FFD700;
      color: #fff;
    }
    &.silver {
      background: #C0C0C0;
      color: #fff;
    }
    &.bronze {
      background: #CD7F32;
      color: #fff;
    }
  }
}

.developer-detail {
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .avatar-section {
    text-align: center;
    margin-bottom: 20px;
  }

  .small-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .small-card {
    text-align: center;
    font-size: 12px; /* Smaller font size */
    white-space: nowrap; /* Prevent text from wrapping */
  }
}

.info-card {
  background-color: #ffffff; /* White background */
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Light shadow */
  padding: 10px;
  color: #333; /* Dark grey text */
  border: 1px solid #ddd; /* Light grey border */
  transition: transform 0.3s;
}

.info-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); /* Slightly darker shadow on hover */
}

.project-item {
  margin-bottom: 5px;
  color: #333; /* Dark grey text */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-wrapper {
  background: #ffffff; /* White background */
  border-radius: 8px;
}

.network-graph-wrapper {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ddd;
}

:deep(.top-1) {
  background-color: rgba(255, 215, 0, 0.1);
}
:deep(.top-2) {
  background-color: rgba(192, 192, 192, 0.1);
}
:deep(.top-3) {
  background-color: rgba(205, 127, 50, 0.1);
}
</style>
