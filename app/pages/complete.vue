<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({ title: "Survey Complete" });

const route = useRoute();
const userId = useCookie("userId");
const { clear } = useUserSession();

const limitReached = computed(() => route.query.limitReached === "true");

const logout = async () => {
  userId.value = null;
  clear();
  await navigateTo("/login");
};
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-4 py-20 text-center"
  >
    <div class="flex flex-col items-center gap-3">
      <UIcon
        name="material-symbols:check-circle"
        class="text-success size-16"
      />
      <h1 class="text-3xl font-bold">Thank you!</h1>
      <p v-if="limitReached" class="text-muted text-lg">
        You've reached the required amount of evaluations for your session. Your
        responses have been saved. If you have more time and would like to
        review additional items, please click the button below to continue.
      </p>
      <p v-else class="text-muted text-lg">
        You've reviewed all the available posters. Your responses have been
        saved. Thank you for your contribution!
      </p>
    </div>

    <div class="bg-elevated w-full rounded-xl border p-4">
      <p class="text-muted text-sm">Your Reviewer ID</p>
      <p class="font-mono text-sm break-all">{{ userId }}</p>
    </div>

    <div class="flex w-full flex-col gap-3">
      <UButton v-if="limitReached" to="/survey?endless=true" variant="solid" block>
        Keep scoring
      </UButton>

      <UButton color="neutral" variant="ghost" block @click="logout">
        Logout
      </UButton>
    </div>
  </div>
</template>
