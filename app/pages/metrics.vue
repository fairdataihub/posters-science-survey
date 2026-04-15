<script setup lang="ts">
useSeoMeta({ title: "Metrics" });

const { data, error, refresh } = await useFetch("/api/metrics");

const pct = (n: number, total: number) =>
  total > 0 ? Math.round((n / total) * 100) : 0;
</script>

<template>
  <div class="mx-auto flex w-full max-w-screen-md flex-col gap-8 px-4 py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Project Metrics</h1>
      <UButton
        variant="ghost"
        icon="material-symbols:refresh"
        color="neutral"
        @click="() => refresh()"
      >
        Refresh
      </UButton>
    </div>

    <div v-if="error" class="text-error text-sm">Failed to load metrics.</div>

    <template v-else-if="data">
      <!-- Poster Coverage -->
      <section class="flex flex-col gap-6">
        <div>
          <h2 class="text-lg font-semibold">Poster Coverage</h2>
          <p class="text-muted text-sm">
            Out of {{ data.totalPosters }} total posters
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-sm">
              <span>At least 3 evaluations</span>
              <span class="text-muted">
                {{ data.posters.withAtLeast3 }} /
                {{ data.totalPosters }}
                ({{ pct(data.posters.withAtLeast3, data.totalPosters) }}%)
              </span>
            </div>
            <UProgress
              :model-value="pct(data.posters.withAtLeast3, data.totalPosters)"
              color="success"
            />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-sm">
              <span>At least 2 evaluations</span>
              <span class="text-muted">
                {{ data.posters.withAtLeast2 }} /
                {{ data.totalPosters }}
                ({{ pct(data.posters.withAtLeast2, data.totalPosters) }}%)
              </span>
            </div>
            <UProgress
              :model-value="pct(data.posters.withAtLeast2, data.totalPosters)"
              color="primary"
            />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-sm">
              <span>At least 1 evaluation</span>
              <span class="text-muted">
                {{ data.posters.withAtLeast1 }} /
                {{ data.totalPosters }}
                ({{ pct(data.posters.withAtLeast1, data.totalPosters) }}%)
              </span>
            </div>
            <UProgress
              :model-value="pct(data.posters.withAtLeast1, data.totalPosters)"
              color="warning"
            />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-sm">
              <span>No evaluations yet</span>
              <span class="text-muted">
                {{ data.posters.withZero }} /
                {{ data.totalPosters }}
                ({{ pct(data.posters.withZero, data.totalPosters) }}%)
              </span>
            </div>
            <UProgress
              :model-value="pct(data.posters.withZero, data.totalPosters)"
              color="error"
            />
          </div>
        </div>
      </section>

      <USeparator />

      <!-- Participant Progress -->
      <section class="flex flex-col gap-6">
        <div>
          <h2 class="text-lg font-semibold">Participant Progress</h2>
          <p class="text-muted text-sm">
            {{ data.users.total }} total participants
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-sm">
              <span>
                Completed {{ data.users.completionThreshold }}+ evaluations
              </span>
              <span class="text-muted">
                {{ data.users.withThreshold }} /
                {{ data.users.total }}
                ({{ pct(data.users.withThreshold, data.users.total) }}%)
              </span>
            </div>
            <UProgress
              :model-value="pct(data.users.withThreshold, data.users.total)"
              color="primary"
            />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-sm">
              <span>Completed all {{ data.totalPosters }} posters</span>
              <span class="text-muted">
                {{ data.users.completed }} /
                {{ data.users.total }}
                ({{ pct(data.users.completed, data.users.total) }}%)
              </span>
            </div>
            <UProgress
              :model-value="pct(data.users.completed, data.users.total)"
              color="success"
            />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
