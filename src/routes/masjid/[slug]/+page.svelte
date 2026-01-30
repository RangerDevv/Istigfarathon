<script lang="ts">
    import "../../../app.css";
    import { MainDB, Collection } from "$lib/ids";
    import type { Masjid , Activity } from "$lib/db";
    import { tablesDB , Query , client } from "$lib/appwrite";
    import { ID } from "appwrite";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { on } from "svelte/events";
    
    export let data: { slug: string };
    console.log(data.slug);

    let masjids: Masjid[] = [];
    let activities: Activity[] = [];

    let activityCount= 0;

    onMount(async () => {
        const response = await tablesDB.listRows({
        databaseId: MainDB,
        tableId: Collection.Masjid,
        queries: [Query.equal("$id", data.slug)]
        });
        masjids = response.rows as unknown as Masjid[];
        });

    const unsubscribe = browser ? client.subscribe(`databases.${MainDB}.collections.${Collection.Activity}.documents`, (response:any) => {
        const isCreateEvent = response.events.some(
            (event:any) =>
                event.startsWith(`databases.${MainDB}.collections.${Collection.Activity}.documents.`) &&
                event.endsWith(".create")
        );

        if (!isCreateEvent) return;

        const relatedMasjid = response.payload.masjid as  Masjid | undefined;

        if (relatedMasjid && relatedMasjid.$id === data.slug) {
            // Update the local activity amount input
            activityCount = response.payload.Count;

            // Live-update the displayed masjid total Count
            if (masjids.length > 0) {
                masjids = [
                    {
                        ...masjids[0],
                        Count: relatedMasjid.Count,
                    },
                ];
            }
        }
    }) : null;

    onMount(() => {
        return () => {
            unsubscribe!();
        }
    });

    async function addActivity() {
        await tablesDB.createRow({
            databaseId: MainDB,
            tableId: Collection.Activity,
            rowId: ID.unique(),
            data: {
                masjid: data.slug,
                Count: activityCount
            }
        }).then(async(response) => {
            await tablesDB.incrementRowColumn({
                databaseId: MainDB,
                tableId: Collection.Masjid,
                rowId: data.slug,
                column: "Count",
                value: activityCount
            });
        });
    }

</script>

<main class="p-4">
    {#if masjids.length > 0}
        <h1 class="text-2xl font-bold mb-4">{masjids[0].Name}</h1>
        <p class="mb-4">Location: {masjids[0].Location}</p>
        <p class="mb-4">Current Activity Count: {masjids[0].Count}</p>

        <div class="mb-4">
            <label for="activityCount" class="block mb-2">Add Activity Count:</label>
            <input type="number" id="activityCount" bind:value={activityCount} class="border p-2 w-full" />
        </div>
        <button on:click={addActivity} class="bg-blue-500 text-white px-4 py-2 rounded">Add Activity</button>
    {:else}
        <p>Loading masjid data...</p>
    {/if}
</main>