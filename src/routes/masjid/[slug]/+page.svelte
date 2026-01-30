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

<main class="app-shell">
    <div class="card-soft w-full max-w-6xl px-10 py-10 checker-background relative overflow-hidden">
        {#if masjids.length > 0}
            {@const masjid = masjids[0]}
            {@const percent = masjid.Goal > 0
                ? Math.min(100, Math.round((masjid.Count / masjid.Goal) * 100))
                : 0}

            <div class="relative z-[1] grid grid-cols-1 lg:grid-cols-[2.2fr,1.1fr] gap-10 items-center">
                <section class="space-y-7">
                    <header>
                        <div class="pill mb-4 inline-flex">Masjid Progress</div>
                        <h1 class="text-3xl md:text-5xl font-semibold text-emerald-950 mb-2 leading-tight">
                            {masjid.Name}
                        </h1>
                        <p class="text-sm md:text-base text-slate-600">{masjid.Location}</p>
                    </header>

                    <div class="relative pt-2">
                        <div class="absolute -inset-10 bg-emerald-500/12 blur-3xl rounded-full pointer-events-none"></div>
                        <div class="relative">
                            <p class="text-xs uppercase tracking-[0.22em] text-emerald-700/90 mb-1">
                                Total Istighfars
                            </p>
                            <div class="text-6xl md:text-7xl font-semibold text-emerald-900 drop-shadow-sm">
                                {masjid.Count.toLocaleString()}
                            </div>
                            <p class="mt-2 text-xs md:text-sm text-slate-600">
                                Goal: <span class="font-medium text-emerald-800">{masjid.Goal.toLocaleString()}</span>
                                <span class="ml-2 text-[0.75rem] text-slate-500">({percent}% complete)</span>
                            </p>
                        </div>
                    </div>
                </section>

                <section class="space-y-6">
                    <div>
                        <div class="flex justify-between text-xs text-slate-600 mb-2">
                            <span>Progress towards goal</span>
                            <span class="font-medium text-emerald-700">
                                {masjid.Count.toLocaleString()} / {masjid.Goal.toLocaleString()}
                            </span>
                        </div>
                        <div class="progress-track h-3">
                            <div class="progress-fill" style={`transform: scaleX(${percent / 100})`}></div>
                        </div>
                        <div class="mt-2 text-[0.75rem] text-slate-500 flex justify-between">
                            <span>Live istighfar counter</span>
                            <span>{percent}% complete</span>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div>
                            <label for="activityCount" class="block text-xs font-medium text-slate-600 mb-1.5">
                                Add istighfar amount
                            </label>
                            <input
                                type="number"
                                id="activityCount"
                                min="1"
                                bind:value={activityCount}
                                class="input-soft text-base"
                            />
                        </div>

                        <button type="button" on:click={addActivity} class="btn-primary w-full mt-1 text-base">
                            Add to counter
                        </button>
                    </div>
                </section>
            </div>
        {:else}
            <p class="text-center text-slate-600">Loading masjid data...</p>
        {/if}
    </div>
</main>