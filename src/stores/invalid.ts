// src/stores/invalid.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInvalidStore = defineStore('invalid', () => {
  const invalidUrls = ref<string[]>([])

  const load = () => {
    try {
      const data = localStorage.getItem('invalid_stations')
      if (data) invalidUrls.value = JSON.parse(data)
    } catch {}
  }

  const add = (url: string) => {
    if (!invalidUrls.value.includes(url)) {
      invalidUrls.value.push(url)
      save()
    }
  }

  const remove = (url: string) => {
    invalidUrls.value = invalidUrls.value.filter(u => u !== url)
    save()
  }

  const save = () => {
    localStorage.setItem('invalid_stations', JSON.stringify(invalidUrls.value))
  }

  const isInvalid = (url: string) => invalidUrls.value.includes(url)

  load()
  return { invalidUrls, add, remove, isInvalid }
})
