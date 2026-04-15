<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Logout",
});

const toast = useToast();
const loading = ref(false);

async function logout() {
  loading.value = true;

  await $fetch("/api/auth/logout", { method: "POST" })
    .then(() => {
      toast.add({
        title: "Logged out",
        color: "success",
        description: "Your session has been cleared.",
        icon: "material-symbols:check-circle-outline",
      });

      navigateTo("/login");
    })
    .catch((error) => {
      toast.add({
        title: "Error logging out",
        color: "error",
        description: error.data?.statusMessage ?? "Unknown error",
        icon: "material-symbols:error",
      });
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <UCard class="w-full max-w-lg bg-white/75 backdrop-blur dark:bg-white/5">
    <div class="w-full px-4 py-5 sm:p-6">
      <div class="flex flex-col items-center justify-center">
        <h2 class="my-1 text-2xl font-bold">Log out</h2>
        <p class="text-center text-sm text-gray-500">
          This will clear your session.
        </p>
      </div>

      <UAlert
        class="mt-6"
        color="warning"
        icon="i-lucide-save"
        variant="subtle"
        title="Save your Reviewer ID"
        description="Before logging out, save your Reviewer ID somewhere safe so you can continue later (especially on another device or browser)."
      />

      <UButton
        class="mt-6 flex w-full justify-center"
        color="error"
        :loading="loading"
        @click="logout"
      >
        Log out
      </UButton>
    </div>

    <template #footer>
      <p class="text-center text-sm">
        Your Reviewer ID cookie remains on this browser. If you want to
        completely remove your Reviewer ID, clear this site's cookies.
      </p>
    </template>
  </UCard>
</template>
