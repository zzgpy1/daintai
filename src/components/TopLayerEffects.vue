<template>
  <div class="top-layer-effects">
    <div class="decoration-orb orb-1"></div>
    <div class="decoration-orb orb-2"></div>
    <div class="decoration-orb orb-3"></div>
    <div class="decoration-orb orb-4"></div>
    <div class="decoration-orb orb-5"></div>
  </div>
</template>

<style scoped>
.top-layer-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.decoration-orb {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08));
  animation: float 25s infinite ease-in-out;
}
.orb-1 { width: 120px; height: 120px; top: 10%; left: 5%; animation-duration: 25s; }
.orb-2 { width: 80px; height: 80px; top: 60%; right: 10%; animation-duration: 30s; animation-delay: -5s; }
.orb-3 { width: 100px; height: 100px; bottom: 20%; left: 15%; animation-duration: 35s; animation-delay: -10s; }
.orb-4 { width: 60px; height: 60px; top: 30%; right: 25%; animation-duration: 28s; animation-delay: -15s; }
.orb-5 { width: 140px; height: 140px; bottom: 10%; right: 5%; animation-duration: 32s; animation-delay: -20s; }

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
  25% { transform: translateY(-20px) translateX(10px) scale(1.1); opacity: 0.5; }
  50% { transform: translateY(-10px) translateX(-15px) scale(0.9); opacity: 0.2; }
  75% { transform: translateY(15px) translateX(5px) scale(1.05); opacity: 0.4; }
}

@media (max-width: 768px) {
  .decoration-orb { animation-duration: 40s !important; }
  .orb-4, .orb-5 { display: none; }
}
</style>
