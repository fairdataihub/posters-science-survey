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
const evaluations = computed(() => data.value?.evaluations ?? {});
const total = computed(() => posters.value.length);

const index = computed(() => {
  const i = Number(route.query.index ?? 0);
  return isNaN(i) ? 0 : Math.max(0, Math.min(i, total.value - 1));
});

const poster = computed(() => posters.value[index.value]);
const progress = computed(() =>
  total.value > 0 ? Math.round(((index.value + 1) / total.value) * 100) : 0,
);

// Per-poster answer state (pre-filled from existing evaluations)
const selectedAnswer = ref<boolean | null>(null);
const confidence = ref(3);
const submitting = ref(false);

watch(
  [poster, evaluations],
  () => {
    if (!poster.value) return;
    const existing = evaluations.value[poster.value.id];
    if (existing) {
      selectedAnswer.value = existing.isPoster;
      confidence.value = existing.confidence;
    } else {
      selectedAnswer.value = null;
      confidence.value = 3;
    }
  },
  { immediate: true },
);

const canSubmit = computed(() => selectedAnswer.value !== null);

const submitAndNavigate = async (nextIndex: number) => {
  if (!poster.value || selectedAnswer.value === null) return;
  submitting.value = true;
  try {
    await $fetch("/api/evaluation", {
      method: "POST",
      body: {
        posterId: poster.value.id,
        isPoster: selectedAnswer.value,
        confidence: confidence.value,
      },
    });
    // Update local evaluations cache so back-navigation shows correct values
    if (data.value) {
      data.value.evaluations[poster.value.id] = {
        isPoster: selectedAnswer.value,
        confidence: confidence.value,
      } as never;
    }
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

  if (nextIndex >= total.value) {
    await navigateTo("/complete");
  } else {
    await navigateTo({ query: { index: nextIndex } });
  }
};

const goNext = () => submitAndNavigate(index.value + 1);
const goPrev = async () => {
  await navigateTo({ query: { index: index.value - 1 } });
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-8">
    <!-- Progress -->
    <div class="flex items-center gap-4">
      <span class="text-muted shrink-0 text-sm">
        Poster {{ index + 1 }} of {{ total }}
      </span>
      <UProgress :value="progress" class="flex-1" />
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
          :variant="selectedAnswer === true ? 'solid' : 'outline'"
          color="success"
          icon="material-symbols:check-circle"
          class="flex-1 justify-center"
          @click="selectedAnswer = true"
        >
          Yes
        </UButton>
        <UButton
          size="xl"
          :variant="selectedAnswer === false ? 'solid' : 'outline'"
          color="error"
          icon="material-symbols:cancel"
          class="flex-1 justify-center"
          @click="selectedAnswer = false"
        >
          No
        </UButton>
      </div>

      <!-- Confidence slider -->
      <Transition name="fade">
        <div v-if="selectedAnswer !== null" class="flex flex-col gap-2 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Confidence</span>
            <span class="text-muted text-sm">{{ confidence }} / 5</span>
          </div>
          <input
            v-model.number="confidence"
            type="range"
            min="1"
            max="5"
            step="1"
            class="accent-primary h-2 w-full cursor-pointer rounded-full"
          />
          <div class="text-muted flex justify-between text-xs">
            <span>Not confident</span>
            <span>Very confident</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between pt-2">
      <UButton
        variant="ghost"
        icon="material-symbols:arrow-back"
        :disabled="index === 0"
        @click="goPrev"
      >
        Previous
      </UButton>

      <UButton
        :loading="submitting"
        :disabled="!canSubmit"
        trailing-icon="material-symbols:arrow-forward"
        @click="goNext"
      >
        {{ index === total - 1 ? "Finish" : "Next" }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
