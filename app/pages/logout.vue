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
          This will clear your session. <br />
          Your User ID cookie will remain so you can log back in.
        </p>
      </div>

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
        If you want to completely remove your User ID, please clear your browser
        cookies for this site.
      </p>
    </template>
  </UCard>
</template>
