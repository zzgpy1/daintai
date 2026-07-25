/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(later, wait)
    
    if (callNow) {
      func(...args)
    }
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
      func.apply(this, args)
    }
  }
}

/**
 * 防抖（带Promise返回）
 */
export function debouncePromise<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null
  let resolveList: ((value: ReturnType<T>) => void)[] = []

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      
      resolveList.push(resolve)
      
      timeout = setTimeout(() => {
        const result = func(...args)
        resolveList.forEach(r => r(result))
        resolveList = []
        timeout = null
      }, wait)
    })
  }
}
