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

export function fetchProjectClassificationList() {
  console.log('fetchProjectClassificationList 被调用'); // 添加调试日志
  return request({
    url: 'http://localhost:9004/api/info/projectClassificationList',
    method: 'get',
  });
}

export function fetchProjectClassificationCount() {
  console.log('fetchProjectClassificationCount 被调用');
  return request({
    url: 'http://localhost:9004/api/info/projectClassificationCount',
    method: 'get',
  });
}

/**
 * 获取开发者的关系数据
 * @param {string} login - 开发者的登录名
 * @returns {Promise<Object>} - 返回包含开发者关系数据的 Promise
 */
export function findRelationship(login) {
  const url = `http://localhost:9004/api/info/findByRelationShipByLogin?login=${login}`;
  return request({
    url: url,
    method: 'get',
  })
  .then(response => {
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch developer relationship data');
    }
  })
  .catch(error => {
    console.error('Error fetching developer relationship data:', error);
    throw error;
  });
}
