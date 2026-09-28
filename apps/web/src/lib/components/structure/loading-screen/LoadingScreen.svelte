<script lang="ts">
  import { fade } from 'svelte/transition';
</script>

<aside
  class="fixed inset-0 z-10 flex h-screen w-full items-center justify-center bg-linear-to-b from-slate-200 via-white to-slate-300"
  transition:fade={{ duration: 400 }}
>
  <div class="flex flex-col items-center justify-center gap-2">
    <figure class="relative flex w-60 items-center justify-center">
      <img src="/crypto_king.png" alt="Crypto King" class="w-full object-contain" />
    </figure>
    <p class="font-secondary text-sm text-gray-700">Загрузка...</p>
  </div>
</aside>
