import request from '@/uitils/axios/index'
export const searchAPI = ({ url, params }) => {
  return request({
    url: `${url}`,
    method: 'get',
    params
  })
}

export const getListAPI = (params) => {
  return request({
    url: '/list',
    method: 'get',
    params
  })
}
export const addSiteAPI = (data) => {
  return request({
    url: '/saveOrUpdate',
    method: 'post',
    data
  })
}
export const delSiteAPI = (data) => {
  return request({
    url: `/delete?field0001=${data}`,
    method: 'post'
  })
}
