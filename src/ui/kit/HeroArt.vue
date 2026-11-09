<script setup lang="ts">
/** 首页横幅的背景：夜空、山、城堡（占位插画，纯图形，颜色全部来自令牌；Gate 6 视觉增强再换正式主视觉）。 */
</script>

<template>
  <svg class="trpg-hero__art" viewBox="0 0 960 168" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
    <path class="far" d="M0 120L90 70L170 110L260 60L350 105L430 75L520 112L610 68L700 108L790 62L880 100L960 78V168H0Z" />
    <circle class="moon" cx="905" cy="36" r="12" />
    <path class="mid" d="M0 140L110 100L200 128L300 96L400 130L500 104L600 134L720 100L820 128L960 104V168H0Z" />
    <g class="castle"><rect x="660" y="112" width="190" height="40" /><rect x="720" y="64" width="60" height="76" /><rect x="690" y="84" width="26" height="56" /><rect x="784" y="78" width="30" height="62" /><path d="M720 64L750 34L780 64Z" /><path d="M690 84L703 60L716 84Z" /><path d="M784 78L799 50L814 78Z" /></g>
    <g class="lit"><rect x="746" y="86" width="8" height="12" rx="1" /><rect x="698" y="102" width="6" height="9" rx="1" /><rect x="796" y="96" width="6" height="9" rx="1" /></g>
    <path class="near" d="M0 150L120 132L260 148L420 130L580 150L760 134L960 150V168H0Z" />
  </svg>
</template>
