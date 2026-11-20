export const categoryKeys = {
  all: ["marketplace", "public", "categories"],
  list: () => [...categoryKeys.all, "list"],
  detail: (slug) => [...categoryKeys.all, "detail", slug],
};

export default categoryKeys;
