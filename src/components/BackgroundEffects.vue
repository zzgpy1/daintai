<template>
  <div class="background-effects">
    <!-- 装饰性浮动球体 -->
    <div class="decoration-orb orb-1"></div>
    <div class="decoration-orb orb-2"></div>
    <div class="decoration-orb orb-3"></div>
    <div class="decoration-orb orb-4"></div>
    <div class="decoration-orb orb-5"></div>
    
    <!-- 粒子效果 -->
    <div class="particle particle-1"></div>
    <div class="particle particle-2"></div>
    <div class="particle particle-3"></div>
    <div class="particle particle-4"></div>
    <div class="particle particle-5"></div>
  </div>
</template>

<script setup lang="ts">
// 纯CSS动画组件，无需JavaScript逻辑
</script>

<style scoped>
.background-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* ============================================
   装饰性浮动球体
   ============================================ */
.decoration-orb {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08));
  animation: floatOrb 20s ease-in-out infinite;
}

.orb-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
  animation-duration: 25s;
}

.orb-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 10%;
  animation-delay: -5s;
  animation-duration: 30s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 15%;
  animation-delay: -10s;
  animation-duration: 35s;
}

.orb-4 {
  width: 60px;
  height: 60px;
  top: 30%;
  right: 25%;
  animation-delay: -15s;
  animation-duration: 28s;
}

.orb-5 {
  width: 140px;
  height: 140px;
  bottom: 10%;
  right: 5%;
  animation-delay: -20s;
  animation-duration: 32s;
}

@keyframes floatOrb {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-30px) translateX(15px) scale(1.05);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-15px) translateX(-20px) scale(0.95);
    opacity: 0.2;
  }
  75% {
    transform: translateY(20px) translateX(10px) scale(1.02);
    opacity: 0.4;
  }
}

/* ============================================
   粒子效果
   ============================================ */
.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.15);
  animation: floatParticle 15s infinite linear;
}

.particle-1 {
  width: 8px;
  height: 8px;
  top: 15%;
  left: 25%;
  animation-delay: -2s;
  animation-duration: 18s;
}

.particle-2 {
  width: 12px;
  height: 12px;
  top: 45%;
  left: 75%;
  animation-delay: -6s;
  animation-duration: 22s;
}

.particle-3 {
  width: 6px;
  height: 6px;
  top: 75%;
  left: 15%;
  animation-delay: -4s;
  animation-duration: 16s;
}

.particle-4 {
  width: 10px;
  height: 10px;
  top: 25%;
  right: 20%;
  animation-delay: -8s;
  animation-duration: 20s;
}

.particle-5 {
  width: 5px;
  height: 5px;
  bottom: 35%;
  left: 60%;
  animation-delay: -3s;
  animation-duration: 19s;
}

@keyframes floatParticle {
  0% {
    transform: translateY(0px) translateX(0px);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-120px) translateX(40px);
    opacity: 0;
  }
}

/* ============================================
   响应式优化
   ============================================ */
@media (max-width: 768px) {
  .decoration-orb {
    animation-duration: 40s !important;
  }
  
  /* 小屏幕隐藏部分装饰以提升性能 */
  .orb-4, .orb-5 {
    display: none;
  }
  
  .particle-4, .particle-5 {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .decoration-orb,
  .particle {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

/* ============================================
   暗色模式调整
   ============================================ */
@media (prefers-color-scheme: dark) {
  .decoration-orb {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(147, 51, 234, 0.04));
  }
  
  .particle {
    background: rgba(59, 130, 246, 0.08);
  }
}
</style>
