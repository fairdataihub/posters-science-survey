<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Logout",
});

const toast = useToast();
const loading = ref(false);
const confirmed = ref(false);
const userId = useCookie("userId", {
  refresh: true,
  maxAge: 60 * 60 * 24 * 30,
});

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

async function logout() {
  loading.value = true;

  await $fetch("/api/auth/logout", { method: "POST" })
    .then(() => {
      userId.value = null;
      toast.add({
        title: "Logged out",
        color: "success",
        description: "Your session has been cleared.",
        icon: "material-symbols:check-circle-outline",
      });

      window.location.href = "/login";
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
      >
        <template #description>
          <p>
            Before logging out, save your Reviewer ID somewhere safe so you can
            continue later (especially on another device or browser).
          </p>
          <div
            v-if="userId"
            class="mt-3 flex items-center justify-between gap-2 rounded-md bg-white/60 p-2 dark:bg-black/20"
          >
            <span class="font-mono text-xs break-all sm:text-sm">{{
              userId
            }}</span>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-copy"
              aria-label="Copy Reviewer ID"
              @click="copyReviewerId(userId)"
            />
          </div>
        </template>
      </UAlert>

      <UCheckbox
        v-model="confirmed"
        class="mt-6"
        label="I have saved my Reviewer ID and I am ready to log out"
      />

      <UButton
        class="mt-6 flex w-full justify-center"
        color="error"
        :loading="loading"
        :disabled="!confirmed"
        @click="logout"
      >
        Log out
      </UButton>
    </div>

    <template #footer>
      <p class="text-center text-sm">
        Logging out will also remove your Reviewer ID cookie from this browser.
      </p>
    </template>
  </UCard>
</template>
