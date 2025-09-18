const STORAGE = {
  TOKEN: "trvlr-token",
};

export const getStorage = (name: (typeof STORAGE)[keyof typeof STORAGE]) => {
  const data =
    typeof window !== "undefined" && name !== undefined
      ? localStorage.getItem(name)
      : "";
  try {
    return data && JSON.parse(data);
  } catch (err) {
    return data;
  }
};

export const setStorage = (
  name: (typeof STORAGE)[keyof typeof STORAGE],
  value: any
) => {
  const stringify = typeof value !== "string" ? JSON.stringify(value) : value;
  return localStorage.setItem(name, stringify);
};

export const deleteStorage = (name: (typeof STORAGE)[keyof typeof STORAGE]) =>
  localStorage.removeItem(name);

export const clearStorage = () => localStorage.clear();

export default STORAGE;
