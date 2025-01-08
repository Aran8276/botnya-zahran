export const laravelUrl = process.env.NEXT_PUBLIC_LARAVEL_URL;
export const expressUrl = process.env.NEXT_PUBLIC_EXPRESS_DOMAIN;

export const laravelAccessToken =
  typeof window !== "undefined"
    ? window.localStorage.getItem("laravel_access_token")
    : null;

export const setLaravelAccessToken = (value: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("laravel_access_token", value);
  }
};

export const deleteLaravelAccessToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("laravel_access_token");
  }
};

export const requestHeader = (multiFormData?: boolean) => {
  const anonymous = {
    headers: {
      Accept: "application/json",
      "Content-Type": multiFormData
        ? "multipart-form-data"
        : "application/json",
    },
  };
  const loggedIn = {
    headers: {
      Accept: "application/json",
      "Content-Type": multiFormData
        ? "multipart-form-data"
        : "application/json",
      Authorization: `Bearer ${
        typeof window !== "undefined"
          ? window.localStorage.getItem("laravel_access_token")
          : ""
      }`,
    },
  };
  if (
    typeof window !== "undefined" &&
    window.localStorage.getItem("laravel_access_token")
  ) {
    return loggedIn;
  }
  return anonymous;
};

export interface FormInputs {
  case: string;
  reply?: string | undefined | null;
  image?: File[] | null;
}
