<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({ title: "Survey" });

const route = useRoute();
const toast = useToast();

const { data, error } = await useFetch("/api/poster");

if (error.value) {
  toast.add({
    title: "Failed to load posters",
    color: "error",
    icon: "material-symbols:error",
  });
}

const posters = computed(() => data.value?.posters ?? []);
const total = computed(() => posters.value.length);

const index = computed(() => {
  const i = Number(route.query.index ?? 0);
  return isNaN(i) ? 0 : Math.max(0, Math.min(i, total.value - 1));
});

const poster = computed(() => posters.value[index.value]);
const completed = ref(data.value?.evaluationCount ?? 0);
const progress = computed(() =>
  total.value > 0 ? Math.round((completed.value / total.value) * 100) : 0,
);

const submitting = ref(false);

const choose = async (choice: "poster" | "non-poster" | "unsure") => {
  if (!poster.value || submitting.value) return;
  submitting.value = true;
  try {
    await $fetch("/api/evaluation", {
      method: "POST",
      body: {
        posterId: poster.value.id,
        userChoice: choice,
      },
    });
    completed.value += 1;

    toast.add({
      title: "Answer saved",
      color: "success",
      icon: "material-symbols:check-circle",
    });
  } catch {
    toast.add({
      title: "Failed to save answer",
      color: "error",
      icon: "material-symbols:error",
    });
    submitting.value = false;
    return;
  }
  submitting.value = false;

  const nextIndex = index.value + 1;
  if (nextIndex >= total.value) {
    await navigateTo("/complete");
  } else {
    await navigateTo({ query: { index: nextIndex } });
  }
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-8">
    <!-- Progress -->
    <div class="flex items-center gap-4">
      <span class="text-muted shrink-0 text-sm">
        {{ completed }} of {{ total }} evaluated
      </span>
      <UProgress v-model="progress" />
      <span class="text-muted shrink-0 text-sm">{{ progress }}%</span>
    </div>

    <!-- Poster image -->
    <div
      v-if="poster"
      class="bg-elevated flex items-center justify-center overflow-hidden rounded-xl border"
    >
      <img
        :src="poster.url"
        alt="Poster"
        class="max-h-[75vh] w-full object-contain"
      />
    </div>
    <div
      v-else
      class="bg-elevated flex h-64 items-center justify-center rounded-xl border"
    >
      <p class="text-muted text-sm">No poster available</p>
    </div>

    <!-- Question -->
    <div class="flex flex-col gap-4">
      <p class="text-lg font-semibold">Is this a scientific poster?</p>

      <div class="flex gap-3">
        <UButton
          size="xl"
          :loading="submitting"
          variant="outline"
          color="success"
          icon="material-symbols:check-circle"
          class="flex-1 justify-center"
          @click="choose('poster')"
        >
          Yes
        </UButton>
        <UButton
          size="xl"
          :loading="submitting"
          variant="outline"
          color="error"
          icon="material-symbols:cancel"
          class="flex-1 justify-center"
          @click="choose('non-poster')"
        >
          No
        </UButton>
        <UButton
          size="xl"
          :loading="submitting"
          variant="outline"
          color="neutral"
          icon="material-symbols:help"
          class="flex-1 justify-center"
          @click="choose('unsure')"
        >
          Unsure
        </UButton>
      </div>
    </div>
  </div>
</template>
