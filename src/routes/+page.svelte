<script lang="ts">
  import "../app.css";
  import { MainDB, Collection } from "$lib/ids";
  import type { Masjid } from "$lib/db";
  import { databases, tablesDB } from "$lib/appwrite";
  import { onMount } from "svelte";

  let masjids: Masjid[] = [];
  onMount(async () => {
    const response = await tablesDB.listRows({
      databaseId: MainDB,
      tableId: Collection.Masjid
    });
    masjids = response.rows as unknown as Masjid[];
  });
</script>

<svelte:head>
  <title>Istigfarathon</title>
</svelte:head>

<main class="app-shell">
  <div class="card-soft max-w-3xl w-full px-8 py-10 checker-background relative overflow-hidden">
    <header class="mb-8 text-center relative z-[1]">
      <div class="pill mb-3 inline-flex">Istighfarathon</div>
      <h1 class="text-3xl md:text-4xl font-semibold text-emerald-900 tracking-tight mb-3">
        Assalamu Alaikum wa Rahmatullahi wa Barakatuh
      </h1>
      <p class="text-sm md:text-base text-slate-600 max-w-xl mx-auto">
        Choose your masjid below and watch the bar grow with every remembrance.
      </p>
    </header>

    <section class="space-y-4 relative z-[1]">
      {#each masjids as masjid}
        {@const percent = masjid.Goal > 0
          ? Math.min(100, Math.round((masjid.Count / masjid.Goal) * 100))
          : 0}
        <a
          href={"/masjid/" + masjid.$id}
          class="block no-underline text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 rounded-2xl"
        >
          <div class="masjid-card px-5 py-4">
            <div class="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 class="text-lg md:text-xl font-semibold text-emerald-950 mb-1">
                  {masjid.Name}
                </h2>
                <p class="text-xs uppercase tracking-[0.18em] text-emerald-700/90">
                  {masjid.Location}
                </p>
              </div>
              <div class="text-right text-xs text-slate-600">
                <div class="font-semibold text-emerald-700 text-sm">
                  {masjid.Count.toLocaleString()} / {masjid.Goal.toLocaleString()}
                </div>
                <div class="text-[0.7rem]">Istighfars</div>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between text-[0.7rem] text-slate-500">
                <span>Progress</span>
                <span class="font-medium text-emerald-700">{percent}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style={`transform: scaleX(${percent / 100})`}></div>
              </div>
            </div>
          </div>
        </a>
      {/each}
    </section>
  </div>
</main>
