import { shellQueryClient } from './queryClient.js'

export const ACTIVITY_QUERY_KEY = ['shell-activity']

export function withActivityRefresh(write) {
  return async (...args) => {
    const result = await write(...args)
    void shellQueryClient.invalidateQueries({ queryKey: ACTIVITY_QUERY_KEY })
    return result
  }
}
