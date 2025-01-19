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
      width="50%">
      <div v-if="currentDeveloper" class="developer-detail">
        <div class="detail-header">
          <el-avatar :src="currentDeveloper.avatarUrl" :size="80"></el-avatar>
          <h2>{{ currentDeveloper.name || currentDeveloper.login }}</h2>
        </div>
        
        <div class="detail-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="位置">
              <i class="el-icon-location"></i>
              地区：
              {{ currentDeveloper.location || '暂无' }}
              <el-tag size="small" type="info" v-if="currentDeveloper.locationCredence">
                可信度: {{ currentDeveloper.locationCredence }}
              </el-tag>
            </el-descriptions-item>
    
            <el-descriptions-item label="擅长领域">
              擅长领域：
              {{ currentDeveloper.areas || '暂无' }}
              <el-tag size="small" type="info" v-if="currentDeveloper.areaCredence">
                可信度: {{ currentDeveloper.areaCredence }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="得分">
             得分： {{ currentDeveloper.rank }}
            </el-descriptions-item>
  
          </el-descriptions>
          
          <div class="bio-section">
            <h3>自我介绍</h3>
            <p>{{ currentDeveloper.bio || '暂无介绍' }}</p>
          </div>
          
          <div class="projects-section">
            <h3>项目列表</h3>
            <template v-if="currentDeveloper.projectList && currentDeveloper.projectList.length">
              <el-card v-for="project in currentDeveloper.projectList" 
                       :key="project.id" 
                       class="project-card">
                <h4>{{ project.name }}</h4>
                <p>{{ project.description }}</p>
              </el-card>
            </template>
            <el-empty v-else description="暂无项目信息"></el-empty>
          </div>
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
      loading: false
    }
  },
  computed: {
    filteredDevelopers() {
      return this.developers.filter(dev => {
        const searchLower = this.searchQuery.toLowerCase()
        return (dev.name?.toLowerCase().includes(searchLower) ||
               dev.login?.toLowerCase().includes(searchLower))
      })
    }
  },
  methods: {
    async fetchDevelopers() {
      console.log('开始请求数据...')
      this.loading = true
      try {
        const response = await getTalentRank()
        console.log('接口返回数据：', response)
        
        // 检查响应数据的结构
        if (response.data && Array.isArray(response.data.data)) {
          // 处理数据
          this.developers = response.data.data.map(dev => ({
            ...dev,
            rank: dev.talentRank || '--',
            projectList: Array.isArray(dev.projectList) ? dev.projectList : [],
            scoreHistory: Array.isArray(dev.scoreHistory) 
              ? dev.scoreHistory.filter(score => score !== null) 
              : [],
            bio: dev.bio || '',
            location: dev.location || '',
            areas: dev.areas || '',
            locationCredence: dev.locationCredence || 'N/A',
            areaCredence: dev.areaCredence || 'N/A'
          }))
          // 按分数排序
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
    }
  },
  created() {
    this.fetchDevelopers()
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .rank-card {
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
  .detail-header {
    text-align: center;
    margin-bottom: 20px;
    
    h2 {
      margin-top: 10px;
    }
  }
  
  .bio-section, .projects-section {
    margin-top: 20px;
  }
  
  .project-card {
    margin-bottom: 10px;
    
    h4 {
      margin: 0 0 10px 0;
    }
    
    p {
      margin: 0;
      color: #666;
    }
  }
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
