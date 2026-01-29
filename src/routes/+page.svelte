<script lang="ts">
  import "../app.css";
  import { MainDB, Collection } from "$lib/ids";
  import type { Masjid } from "$lib/db";
  import { databases } from "$lib/appwrite";
  import { onMount } from "svelte";

  let masjids: Masjid[] = [];
  onMount(async () => {
    const response = await databases.listDocuments(
      MainDB,
      Collection.Masjid
    );
    masjids = response.documents;
    console.log(masjids);
  });
</script>

<svelte:head>
  <title>Istigfarathon</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">Welcome to Istigfarathon</h1>
    <p class="text-lg text-gray-600">Your journey to spiritual growth starts here.</p>
  </div>
</main>
