<script lang="ts">
    import "../../../app.css";
    import { MainDB, Collection } from "$lib/ids";
    import type { Masjid , Activity } from "$lib/db";
    import { tablesDB , Query , client } from "$lib/appwrite";
    import ConfirmDialog from "$lib/ConfirmDialog.svelte";
    import { ID } from "appwrite";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { on } from "svelte/events";
    
    export let data: { slug: string };
    console.log(data.slug);

    let masjids: Masjid[] = [];
    let activities: Activity[] = [];

    let activityCount = 0;
    let lastActivityAmount: number | null = null;
    let lastActivityAt: string | null = null;

    onMount(async () => {
        const response = await tablesDB.listRows({
            databaseId: MainDB,
            tableId: Collection.Masjid,
            queries: [Query.equal("$id", data.slug)]
        });
        masjids = response.rows as unknown as Masjid[];

        // Fetch recent activity list for this masjid
        const activityResponse = await tablesDB.listRows({
            databaseId: MainDB,
            tableId: Collection.Activity,
            queries: [
                Query.equal("masjid", data.slug),
                Query.orderDesc("$createdAt"),
                Query.limit(50)
            ]
        });

        activities = activityResponse.rows as unknown as Activity[];

        if (activities.length > 0) {
            lastActivityAmount = activities[0].Count;
            lastActivityAt = activities[0].$createdAt ?? null;
        }
    });

    const unsubscribe = browser ? client.subscribe(`databases.${MainDB}.collections.${Collection.Activity}.documents`, (response:any) => {
        const isCreateEvent = response.events.some(
            (event:any) =>
                event.startsWith(`databases.${MainDB}.collections.${Collection.Activity}.documents.`) &&
                event.endsWith(".create")
        );

        if (!isCreateEvent) return;

        const relatedMasjid = response.payload.masjid as Masjid | undefined;

        if (relatedMasjid && relatedMasjid.$id === data.slug) {
            const increment = Number(response.payload.Count) || 0;

            // Live-update the displayed masjid total Count using the
            // increment amount from the activity row, so we don't rely
            // on potentially stale expanded masjid data from the payload.
            if (masjids.length > 0) {
                masjids = [
                    {
                        ...masjids[0],
                        Count: masjids[0].Count + increment,
                    },
                ];
            }

            // Update last activity timeline from realtime payload
            const createdAt: string | undefined = response.payload.$createdAt;

            const newActivity: Activity = {
                $id: response.payload.$id,
                Count: increment,
                masjid: relatedMasjid.$id,
                $createdAt: createdAt,
            };

            activities = [newActivity, ...activities].slice(0, 50);
            lastActivityAmount = newActivity.Count;
            lastActivityAt = newActivity.$createdAt ?? lastActivityAt;
        }
    }) : null;

    onMount(() => {
        return () => {
            unsubscribe!();
        }
    });

    let showConfirm = false;
    let pendingAmount: number | null = null;

    function requestAddActivity() {
        const value = Number(activityCount);
        if (!value || value <= 0) {
            if (browser) {
                alert("Please enter a positive number of istighfars.");
            }
            return;
        }

        pendingAmount = value;
        showConfirm = true;
    }

    async function addActivityConfirmed() {
        const value = pendingAmount;
        if (!value || value <= 0) {
            showConfirm = false;
            return;
        }

        await tablesDB.createRow({
            databaseId: MainDB,
            tableId: Collection.Activity,
            rowId: ID.unique(),
            data: {
                masjid: data.slug,
                Count: value
            }
        }).then(async(response) => {
            await tablesDB.incrementRowColumn({
                databaseId: MainDB,
                tableId: Collection.Masjid,
                rowId: data.slug,
                column: "Count",
                value
            });
        });

        showConfirm = false;
        activityCount = 0;
        pendingAmount = null;
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
                        <div class="progress-track">
                            <div class="progress-fill" style={`transform: scaleX(${percent / 100})`}></div>
                        </div>
                        <div class="mt-2 text-[0.75rem] text-slate-500 flex justify-between items-baseline">
                            <span>Live istighfar counter</span>
                            <span>{percent}% complete</span>
                        </div>

                        {#if lastActivityAt && lastActivityAmount !== null}
                            <div class="mt-1.5 text-[0.72rem] text-slate-500 flex justify-between">
                                <span>Last activity</span>
                                <span>
                                    +{lastActivityAmount.toLocaleString()} at
                                    {new Date(lastActivityAt).toLocaleTimeString()}
                                </span>
                            </div>
                        {/if}
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

                        <button type="button" on:click={requestAddActivity} class="btn-primary w-full mt-1 text-base">
                            Add to counter
                        </button>
                    </div>
                </section>
            </div>
            {#if activities.length > 0}
                <section class="mt-8 relative z-[1]">
                    <h2 class="text-xs uppercase tracking-[0.22em] text-emerald-800/90 mb-2">
                        Recent activity
                    </h2>
                    <div class="max-h-48 overflow-y-auto rounded-xl border border-emerald-100/80 bg-white/80 backdrop-blur-sm shadow-inner">
                        <ul class="divide-y divide-emerald-50/90 text-[0.78rem]">
                            {#each activities as activity}
                                <li class="px-4 py-2.5 flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[0.7rem] font-semibold">
                                            +
                                        </span>
                                        <span class="font-medium text-emerald-900">
                                            {activity.Count.toLocaleString()} istighfar
                                        </span>
                                    </div>
                                    <span class="text-[0.7rem] text-slate-500">
                                        {#if activity.$createdAt}
                                            {new Date(activity.$createdAt).toLocaleTimeString()}
                                        {:else}
                                            
                                        {/if}
                                    </span>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </section>
            {/if}
        {:else}
            <p class="text-center text-slate-600">Loading masjid data...</p>
        {/if}
    </div>
</main>