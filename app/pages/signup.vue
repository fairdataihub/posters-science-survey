<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Signup",
});

const { loggedIn } = useUserSession();
const userId = useCookie("userId", { refresh: true, maxAge: 60 * 60 * 24 * 30 });

const toast = useToast();
const loading = ref(false);

if (loggedIn.value || userId.value) {
  toast.add({
    title: "Session Exists",
    color: "warning",
    description:
      "You have already been assigned a User ID. Please use the existing ID to log in and continue your session.",
    icon: "material-symbols:warning",
  });
  await navigateTo("/login?message=session_exists");
}

async function generate() {
  loading.value = true;

  await $fetch("/api/auth/signup", { method: "POST" })
    .then(({ id }) => {
      userId.value = id;
      navigateTo(`/login?token=${id}`);
    })
    .catch((error) => {
      toast.add({
        title: "Error generating ID",
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
        <h2 class="my-1 text-2xl font-bold">Generate a User ID</h2>
        <p class="text-center text-sm text-balance text-gray-500">
          Your ID will be saved on your device. Memorize it to continue tracking
          your contributions across sessions and devices.
        </p>
      </div>

      <UButton
        class="mt-6 flex w-full justify-center"
        :loading="loading"
        @click="generate"
      >
        Generate User ID
      </UButton>
    </div>

    <template #footer>
      <p class="text-center text-sm">
        Click the button to generate a unique User ID that will be used to
        identify your submissions. This ID is anonymous and will not be linked
        to any personal information, ensuring your privacy while allowing us to
        track your contributions effectively.
      </p>
    </template>
  </UCard>
</template>
