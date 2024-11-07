export const laravelUrl = process.env.NEXT_PUBLIC_LARAVEL_URL;

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

export const requestHeader = () => {
  const anonymous = {
    headers: {
      Accept: "application/json",
    },
  };
  const loggedIn = {
    headers: {
      Accept: "application/json",
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
  reply: string;
}
