<script setup lang="ts">
import { onMounted } from 'vue'
import { provide } from 'vue'
import { loadingKey, loadingState } from '@/components/Loading'
import { useAppInit } from '@/composables/useAppInit'

// import PlayMusic from '@/components/PlayMusic/index.vue'

provide(loadingKey, loadingState)

// 应用初始化
const { isLoading, errorMsg, initApp } = useAppInit()

onMounted(() => {
  initApp()
})
</script>

<template>
  <!-- 加载中状态 -->
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-base-200">
    <div class="text-center">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4">正在初始化...</p>
    </div>
  </div>

  <!-- 错误提示 -->
  <div v-else-if="errorMsg" class="fixed inset-0 z-50 flex items-center justify-center bg-base-200">
    <div class="alert alert-error max-w-md">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ errorMsg }}</span>
    </div>
  </div>

  <!-- 正常渲染 -->
  <router-view v-else />
</template>

<style scoped lang="scss"></style>
