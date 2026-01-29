<script lang="ts">
    import "../../../app.css";
    import { MainDB, Collection } from "$lib/ids";
    import type { Masjid , Activity } from "$lib/db";
    import { tablesDB , Query } from "$lib/appwrite";
    import { onMount } from "svelte";
    
    export let data: { slug: string };
    console.log(data.slug);

    let masjids: Masjid[] = [];
    let activities: Activity[] = [];

    onMount(async () => {
        const response = await tablesDB.listRows({
        databaseId: MainDB,
        tableId: Collection.Masjid,
        queries: [Query.equal("$id", data.slug)]
        });
        masjids = response.rows as unknown as Masjid[];
    });
</script>