<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Login",
});

const route = useRoute();
const toast = useToast();
const loading = ref(false);
const userId = useCookie("userId", { refresh: true, maxAge: 60 * 60 * 24 * 30 });

// Prefill from query param, then cookie, then session
const { session } = useUserSession();
const token = ref(
  (route.query.token as string) ||
  userId.value ||
  (session.value?.user as { id?: string } | undefined)?.id ||
  ""
);

async function login() {
  loading.value = true;

  await $fetch("/api/auth/login", {
    method: "POST",
    body: { id: token.value },
  })
    .then(({ id }) => {
      userId.value = id;
      toast.add({
        title: "Logged in",
        color: "success",
        description: `Welcome back! Your ID: ${id}`,
        icon: "material-symbols:check-circle-outline",
      });

      window.location.href = "/app/dashboard";
    })
    .catch((error) => {
      toast.add({
        title: "Error logging in",
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
        <h2 class="my-1 text-2xl font-bold">Welcome back</h2>
        <p class="text-center text-sm text-balance text-gray-500">
          Enter your saved User ID to restore your session.
        </p>
      </div>

      <div class="mt-6 space-y-4">
        <UFormField label="User ID" name="token">
          <UInput v-model="token" placeholder="Paste your User ID here" />
        </UFormField>

        <UButton
          class="flex w-full justify-center"
          :loading="loading"
          :disabled="!token"
          @click="login"
        >
          Login
        </UButton>
      </div>
    </div>

    <template #footer>
      <p class="text-center text-sm">
        Don't have an ID yet?
        <NuxtLink to="/signup" class="text-primary-500 font-medium">
          Generate one
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
