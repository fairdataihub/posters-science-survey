<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";

useSeoMeta({
  title: "Poster Review Home",
});

const links = ref([
  {
    label: "Start Reviewing",
    to: "/login",
    icon: "i-lucide-clipboard-check",
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
    title: "Submit and continue",
    description:
      "Clicking Yes, No, or Unsure saves your response and moves to the next image automatically. After the final image, you will land on the completion page.",
    icon: "i-lucide-arrow-right-circle",
  },
]);
</script>

<template>
  <div>
    <UPageHero
      title="Scientific Poster Classification Survey"
      headline="Reviewer Guide"
      :links="links"
    >
      <template #description>
        <p class="text-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          Thank you for taking the time to participate in this survey - we truly
          appreciate your contribution! <br />
          This survey is being conducted as part of the development of
          Posters.science, a platform aimed at improving the discoverability and
          reuse of scientific posters. This work is carried out in collaboration
          with COMET, which focuses on enhancing metadata practices across
          research outputs. <br />
          The purpose of this survey is to conduct human review of images to
          determine whether they are scientific posters or not. Each decision is
          used to support downstream analysis and model evaluation. <br />
          Please note that this survey is completely anonymous. We do not
          collect any personally identifiable information. Each respondent is
          simply assigned a random unique ID, which allows us to compute
          aggregate statistics when reporting results in future publications.
          <br />
          If you have any questions, feedback, or would like to learn more about
          this work, please feel free to reach out at
          <NuxtLink
            to="mailto:bpatel@calmi2.org"
            class="text-primary-500 font-medium"
            >bpatel@calmi2.org</NuxtLink
          >.
        </p>
      </template>
    </UPageHero>

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
