<template>
  <div class="background-effects fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <!-- 浮动粒子 -->
    <div
      v-for="i in particleCount"
      :key="i"
      class="particle"
      :style="getParticleStyle(i)"
    ></div>
    
    <!-- 渐变光晕 -->
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>
    <div class="glow glow-3"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const isMobile = computed(() => window.innerWidth < 768)
const particleCount = computed(() => isMobile.value ? 15 : 30)

const getParticleStyle = (index: number) => {
  const size = 2 + Math.random() * 6
  const x = Math.random() * 100
  const y = Math.random() * 100
  const duration = 15 + Math.random() * 25
  const delay = Math.random() * 20
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity: 0.1 + Math.random() * 0.3
  }
}
</script>

<style scoped>
.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.1));
  animation: float-particle linear infinite;
  pointer-events: none;
}

@keyframes float-particle {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translate(30px, -40px) scale(1.2);
    opacity: 0.6;
  }
  50% {
    transform: translate(-20px, -80px) scale(0.8);
    opacity: 0.4;
  }
  75% {
    transform: translate(40px, -120px) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: translate(-10px, -160px) scale(1);
    opacity: 0.2;
  }
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: pulse-glow 8s ease-in-out infinite alternate;
}

.glow-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  background: radial-gradient(circle, #667eea, transparent);
}

.glow-2 {
  width: 500px;
  height: 500px;
  bottom: -150px;
  left: -150px;
  background: radial-gradient(circle, #764ba2, transparent);
  animation-delay: 2s;
}

.glow-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, #f093fb, transparent);
  animation-delay: 4s;
  opacity: 0.08;
}

@keyframes pulse-glow {
  0% { transform: scale(1); opacity: 0.15; }
  100% { transform: scale(1.2); opacity: 0.25; }
}

/* 暗色模式调整 */
.dark .particle {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.05));
}

.dark .glow {
  opacity: 0.08;
}

.dark .glow-1 {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent);
}

.dark .glow-2 {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent);
}

.dark .glow-3 {
  background: radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent);
}
</style>
