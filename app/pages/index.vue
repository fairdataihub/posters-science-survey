<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";

useSeoMeta({
  title: "Poster Review Home",
});

const links = ref([
  {
    label: "Start Reviewing",
    to: "/signup",
    icon: "i-lucide-clipboard-check",
  },
  {
    label: "Return to Session",
    to: "/login",
    variant: "subtle" as const,
    trailingIcon: "i-lucide-log-in",
  },
]);

const stepperItems = ref<StepperItem[]>([
  {
    title: "Generate a Reviewer ID",
    description:
      "Choose Start Reviewing to create an anonymous ID. Keep this ID to continue later on any device.",
    icon: "i-lucide-id-card",
  },
  {
    title: "Review each image",
    description:
      "On the survey page, inspect the image and answer whether it is a scientific poster.",
    icon: "i-lucide-image",
  },
  {
    title: "Add confidence score",
    description:
      "Use the confidence slider to capture certainty for each decision.",
    icon: "i-lucide-sliders-horizontal",
  },
  {
    title: "Submit and continue",
    description:
      "Click Next to save your response. After the final image, you will land on the completion page.",
    icon: "i-lucide-arrow-right-circle",
  },
]);
</script>

<template>
  <div>
    <UPageHero
      title="Scientific Poster Classification Survey"
      description="This site is for human review of images to determine whether they are scientific posters. Each decision includes a confidence score to support downstream analysis and model evaluation."
      headline="Reviewer Guide"
      :links="links"
    />

    <UContainer class="my-10">
      <UPageCTA
        title="Before You Begin"
        description="You can start fresh with a new Reviewer ID or resume with an existing one. The survey asks the same core question for each image: Is this a scientific poster?"
      />
    </UContainer>

    <UContainer class="my-10">
      <UPageCard
        title="Review Workflow"
        description="Follow these steps to complete your review session."
        icon="i-lucide-list-checks"
      >
        <UStepper orientation="vertical" :items="stepperItems" class="w-full" />
      </UPageCard>
    </UContainer>
  </div>
</template>
