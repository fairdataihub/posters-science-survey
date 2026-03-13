<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({ title: "Survey Complete" });

const userId = useCookie("userId");
const { clear } = useUserSession();

const logout = async () => {
  userId.value = null;
  clear();
  await navigateTo("/login");
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-4 py-20 text-center">
    <div class="flex flex-col items-center gap-3">
      <UIcon name="material-symbols:check-circle" class="text-success size-16" />
      <h1 class="text-3xl font-bold">Thank you!</h1>
      <p class="text-muted text-lg">You've reviewed all the posters. Your responses have been saved.</p>
    </div>

    <div class="bg-elevated w-full rounded-xl border p-4">
      <p class="text-muted text-sm">Your user ID</p>
      <p class="font-mono text-sm break-all">{{ userId }}</p>
    </div>

    <div class="flex flex-col gap-3 w-full">
      <UButton to="/survey?index=0" variant="outline" block>
        Review again from the start
      </UButton>
      <UButton color="neutral" variant="ghost" block @click="logout">
        Logout
      </UButton>
    </div>
  </div>
</template>
