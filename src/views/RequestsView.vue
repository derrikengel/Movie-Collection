<template>
    <div :class="s.page">

        <div v-if="requestsStore.loading && !requestsStore.fetched" :class="s.empty">
            <p>Loading…</p>
        </div>

        <div v-else-if="requestFilters.filteredRequests.length" :class="s.list">
            <RequestCard v-for="request in requestFilters.filteredRequests" :key="request.id" :request="request" />
        </div>

        <div v-else :class="s.empty">
            <p>
                {{requestFilters.filterUserId ?
                    `${auth.allProfiles.find(p => p.id === requestFilters.filterUserId).display_name} has no requests
                currently.` :
                    'There aren\'t any requests!'
                }}
            </p>
        </div>

        <div :class="s.addWrap">
            <button :class="s.addBtn" @click="modalOpen = true">
                <span v-html="plusIcon" :class="s.addIcon" />
                Request a Movie
            </button>
        </div>

        <AddRequest :open="modalOpen" @close="modalOpen = false" />

    </div>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue'
    import { useRoute } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useRequestsStore } from '@/stores/requests'
    import { useRequestFiltersStore } from '@/stores/requestFilters'
    import { usePageTitle } from '@/composables/usePageTitle'
    import { slugifyName } from '@/lib/movies'
    import RequestCard from '@/components/requests/RequestCard.vue'
    import AddRequest from '@/components/requests/AddRequest.vue'
    import plusIcon from '@/assets/icons/plus-simple.svg?raw'

    usePageTitle('Requests | Movie Collection')

    const route = useRoute()
    const auth = useAuthStore()
    const requestsStore = useRequestsStore()
    const requestFilters = useRequestFiltersStore()

    const modalOpen = ref(false)

    // Sync ?user= query param → filter on mount and when profiles load
    onMounted(() => {
        const userName = route.query.user
        if (userName) {
            const profile = auth.allProfiles.find(p => slugifyName(p.display_name) === userName)
            if (profile) requestFilters.setFilterUser(profile.id)
        } else {
            requestFilters.setFilterUser(null)
        }
    })

    watch(() => auth.allProfiles, (profiles) => {
        if (requestFilters.filterUserId || !route.query.user) return
        const userName = route.query.user
        const profile = profiles.find(p => slugifyName(p.display_name) === userName)
        if (profile) requestFilters.setFilterUser(profile.id)
    })
</script>

<style module="s">
    .page {
        container-type: inline-size;
    }

    .list {
        display: grid;
        gap: var(--size-6);

        @container (min-width: 30rem) {
            grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
        }
    }

    .empty {
        color: var(--blue-400);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        padding: var(--size-12) 0;
        text-align: center;
    }

    .addWrap {
        background: linear-gradient(transparent, var(--blue-950));
        bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
        margin-inline: calc(-1 * var(--content-padding));
        margin-top: var(--size-8);
        padding: var(--size-2) var(--content-padding);
        position: sticky;

        @media (min-width: 64rem) {
            bottom: 0;
            margin-inline: 0;
            padding: var(--size-6) 0;
        }
    }

    .addBtn {
        align-items: center;
        background: var(--green-300);
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-lg);
        color: var(--green-800);
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        margin-inline: auto;
        max-width: 30rem;
        padding: var(--size-5) var(--size-6);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                background: var(--green-400);
                color: var(--green-900);
            }
        }
    }

    .addIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-base);
        justify-content: center;
    }
</style>
