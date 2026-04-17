export default defineAppConfig({
  ui: {
    button: {
      defaultVariants: {
        size: "lg",
      },
      slots: {
        base: "cursor-pointer rounded-lg",
      },
    },
    colors: {
      neutral: "zinc",
      primary: "pink",
    },
    input: {
      slots: {
        root: "w-full",
      },
    },
  },
});
