<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const userId = useCookie("userId", {
  refresh: true,
  maxAge: 60 * 60 * 24 * 30,
});

const copyToClipboard = async () => {
  if (userId.value) {
    await navigator.clipboard.writeText(userId.value);
    useToast().add({
      title: "Copied to clipboard",
      color: "success",
      description: `Your Reviewer ID: ${userId.value}`,
      icon: "material-symbols:check-circle-outline",
    });
  }
};

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Reviewer ID: " + (userId.value ?? "None"),
    icon: "i-heroicons-clipboard-document-20-solid",
    click: () => copyToClipboard(),
  },
  {
    label: "Logout",
    icon: "mdi:login",
    to: "/logout",
    show: !!userId.value,
  },
]);

const footerItems: NavigationMenuItem[] = [
  {
    label: "Made by FAIR Data Innovations Hub",
    to: "https://fairdataihub.org",
    target: "_blank",
  },
];
</script>

<template>
  <div>
    <UHeader>
      <template #title>
        <NuxtLink to="/" class="flex text-2xl font-bold">
          Poster Survey
        </NuxtLink>
      </template>

      <template #right>
        <UTooltip text="Click to copy" mode="hover">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-clipboard-document-20-solid"
            :label="userId ? `Reviewer ID: ${userId}` : 'No Reviewer ID'"
            @click="copyToClipboard"
            class="invisible text-[1px] md:visible md:text-base"
          />
        </UTooltip>

        <AuthState v-slot="{ loggedIn }">
          <UButton
            v-if="loggedIn"
            color="neutral"
            variant="outline"
            to="/logout"
            class="hidden sm:block"
          >
            Logout
          </UButton>

          <div v-else class="flex items-center justify-center gap-3">
            <UButton to="/login" color="neutral" class="w-max">
              <template #trailing>
                <Icon name="i-heroicons-arrow-right-20-solid" size="20" />
              </template>
              Start Reviewing
            </UButton>
          </div>
        </AuthState>
      </template>

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>

      <UNavigationMenu :items="footerItems" variant="link" />

      <template #right>
        <UColorModeButton />
      </template>
    </UFooter>
  </div>
</template>
