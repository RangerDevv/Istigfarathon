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

<main class="min-h-screen flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh</h1>
    {#each masjids as masjid}
    <a href={"/masjid/" + masjid.$id} class="no-underline text-black">
      <div class="mb-2 p-4 border rounded shadow">
        <h2 class="text-2xl font-semibold">{masjid.Name}</h2>
        <p>{masjid.Count} Istigfars collected</p>
        <p>{masjid.Goal} Istigfars</p>
      </div>
    </a>
    {/each}
  </div>
</main>
