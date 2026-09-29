<script lang="ts">
  import { fade } from 'svelte/transition';

  // Props
  let {
    ...other
  }: {
    class?: string;
  } = $props();
</script>

<div class="{other?.class || ''} breed-state" transition:fade={{ duration: 300 }}>
  {#each Array(15) as _}
    <p class="heart"></p>
  {/each}
  <div class="breed-state--glow"></div>
</div>

<style scoped>
  @reference "#theme.css";

  .breed-state {
    @apply relative w-full overflow-hidden;
    @apply pointer-events-none;
    @apply h-full min-h-0;
    background-color: #fd52f50e;
  }

  .breed-state--glow {
    @apply h-24;
    @apply opacity-80;
    @apply absolute bottom-0 left-[16%] h-0 w-4/6 rounded-[2em];
    box-shadow:
      0 0 30px 5px #8e35b17c,
      0 0 90px 10px #f320e891;
  }

  @keyframes fly {
    0% {
      transform: translateY(0px) rotate(var(--initial-rotation)) scale(0.5);
      opacity: 0.8;
    }
    100% {
      transform: translateY(-100px) rotate(var(--initial-rotation)) scale(1);
      opacity: -1;
    }
  }

  .heart {
    position: absolute;
    bottom: -16px;
    background-image: url('/party.png');
    background-size: contain;
    background-repeat: no-repeat;
    animation: fly 8s linear infinite;
    opacity: 0;
  }

  .heart:nth-child(1) {
    --initial-rotation: 45deg;
    left: 5%;
    width: 22px;
    height: 22px;
    animation-duration: 1.5s;
    animation-delay: 0s;
  }

  .heart:nth-child(2) {
    --initial-rotation: 90deg;
    left: 10%;
    width: 25px;
    height: 25px;
    animation-duration: 2s;
    animation-delay: 1s;
  }

  .heart:nth-child(3) {
    --initial-rotation: 30deg;
    left: 15%;
    width: 23px;
    height: 23px;
    animation-duration: 2.5s;
    animation-delay: 2s;
  }

  .heart:nth-child(4) {
    --initial-rotation: 0deg;
    left: 20%;
    width: 20px;
    height: 20px;
    animation-duration: 1.75s;
    animation-delay: 0.5s;
  }

  .heart:nth-child(5) {
    --initial-rotation: -45deg;
    left: 25%;
    width: 22px;
    height: 22px;
    animation-duration: 2.25s;
    animation-delay: 1.5s;
  }

  .heart:nth-child(6) {
    --initial-rotation: 270deg;
    left: 30%;
    width: 25px;
    height: 25px;
    animation-duration: 1.6s;
    animation-delay: 0.2s;
  }

  .heart:nth-child(7) {
    --initial-rotation: 20deg;
    left: 35%;
    width: 28px;
    height: 28px;
    animation-duration: 2.1s;
    animation-delay: 1.2s;
  }

  .heart:nth-child(8) {
    --initial-rotation: 30deg;
    left: 40%;
    width: 20px;
    height: 20px;
    animation-duration: 2.6s;
    animation-delay: 2.2s;
  }

  .heart:nth-child(9) {
    --initial-rotation: 0deg;
    left: 45%;
    width: 22px;
    height: 22px;
    animation-duration: 1.9s;
    animation-delay: 0.8s;
  }

  .heart:nth-child(10) {
    --initial-rotation: 60deg;
    left: 50%;
    width: 25px;
    height: 25px;
    animation-duration: 2.4s;
    animation-delay: 1.8s;
  }

  .heart:nth-child(11) {
    --initial-rotation: 0deg;
    left: 55%;
    width: 27px;
    height: 27px;
    animation-duration: 1.65s;
    animation-delay: 0.3s;
  }

  .heart:nth-child(12) {
    --initial-rotation: 30deg;
    left: 60%;
    width: 20px;
    height: 20px;
    animation-duration: 2.15s;
    animation-delay: 1.3s;
  }

  .heart:nth-child(13) {
    --initial-rotation: -30deg;
    left: 65%;
    width: 25px;
    height: 25px;
    animation-duration: 2.65s;
    animation-delay: 2.3s;
  }

  .heart:nth-child(14) {
    --initial-rotation: 0deg;
    left: 70%;
    width: 27px;
    height: 27px;
    animation-duration: 1.8s;
    animation-delay: 0.6s;
  }

  .heart:nth-child(15) {
    --initial-rotation: 15deg;
    left: 75%;
    width: 20px;
    height: 20px;
    animation-duration: 2.3s;
    animation-delay: 1.6s;
  }
</style>
