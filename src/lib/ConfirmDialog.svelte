<script lang="ts">
  import "../app.css";
  import { createEventDispatcher } from "svelte";

  export let open = false;
  export let amount: number | null = null;
  export let masjidName: string | null = null;

  const dispatch = createEventDispatcher<{ confirm: void; cancel: void }>();

  function handleConfirm() {
    dispatch("confirm");
  }

  function handleCancel() {
    dispatch("cancel");
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="card-soft w-full max-w-md mx-4 px-6 py-6 relative">
      <h2 class="text-lg font-semibold text-emerald-950 mb-2">Confirm submission</h2>
      <p class="text-sm text-slate-600 mb-4">
        You are about to add
        <span class="font-semibold text-emerald-800">
          {amount?.toLocaleString() ?? "0"} istighfar(s)
        </span>
        {#if masjidName}
          to
          <span class="font-semibold text-emerald-900">{masjidName}</span>.
        {/if}
      </p>
      <p class="text-xs text-slate-500 mb-5">
        Please double check the amount. This will immediately update the live counter
        for everyone viewing this masjid.
      </p>

      <div class="flex justify-end gap-2 text-sm">
        <button
          type="button"
          class="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          on:click={handleCancel}
        >
          Cancel
        </button>
        <button type="button" class="btn-primary px-4" on:click={handleConfirm}>
          Confirm
        </button>
      </div>
    </div>
  </div>
{/if}
