import request from '../utils/request';

export function queryUsers() {
  return request('/api/users');
}
