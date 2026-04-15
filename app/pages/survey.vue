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

const selectedAnswer = ref<boolean | null>(null);
const confidence = ref(3);
const submitting = ref(false);

const canSubmit = computed(() => selectedAnswer.value !== null);

const goNext = async () => {
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
    completed.value += 1;
    selectedAnswer.value = null;
    confidence.value = 3;
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

    <!-- Next button -->
    <div class="flex justify-end pt-2">
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
