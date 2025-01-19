import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'http://localhost:9004/auth/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: 'http://localhost:9004/auth/findUserInfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}

export function getTalentRank() {
  console.log('getTalentRank 被调用')  // 添加调试日志    
  return request({
    url: 'http://localhost:9004/api/info/findAll',
    method: 'get',
  })
}
