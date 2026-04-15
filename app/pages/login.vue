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
const userId = useCookie("userId", {
  refresh: true,
  maxAge: 60 * 60 * 24 * 30,
});

// Prefill from query param, then cookie, then session
const { session } = useUserSession();
const token = ref(
  (route.query.token as string) ||
    userId.value ||
    (session.value?.user as { id?: string } | undefined)?.id ||
    "",
);

async function copyReviewerId(id: string) {
  await navigator.clipboard
    .writeText(id)
    .then(() => {
      toast.add({
        title: "Reviewer ID copied",
        color: "success",
        description: "Your Reviewer ID has been copied to the clipboard.",
        icon: "material-symbols:content-copy-outline",
      });
    })
    .catch(() => {
      toast.add({
        title: "Copy failed",
        color: "error",
        description:
          "Unable to copy your Reviewer ID. Please copy it manually.",
        icon: "material-symbols:error",
      });
    });
}

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
        description: `Welcome back! Your Reviewer ID: ${id}`,
        icon: "material-symbols:check-circle-outline",
      });

      window.location.href = "/survey";
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
          Enter your saved Reviewer ID to restore your session.
        </p>
      </div>

      <UAlert
        v-if="route.query.token"
        class="mt-6"
        color="info"
        icon="i-lucide-save"
        title="Save your Reviewer ID"
        description="Make sure to copy and save this ID somewhere safe (e.g. a note or email to yourself). You will need it to return and continue the survey from another device or browser."
      />

      <div class="mt-6 space-y-4">
        <UFormField label="Reviewer ID" name="token">
          <div class="flex items-center gap-2">
            <UInput
              v-model="token"
              class="flex-1"
              placeholder="Paste your Reviewer ID here"
            />
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-copy"
              aria-label="Copy Reviewer ID"
              :disabled="!token"
              @click="copyReviewerId(token)"
            />
          </div>
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
