import { signOut } from "@/context/auth";
import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { setCookie, parseCookies } from "nookies";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
let failedRequestQueue: {
  resolve: (token: string) => void;
  reject: (err: AxiosError<unknown, any>) => void;
}[] = [];

interface AxiosErrorResponse {
  code?: string;
}

export function setupAPIClient(
  ctx: GetServerSidePropsContext | undefined = undefined
) {
  let cookies = parseCookies(ctx);
  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["@nextauth.token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<AxiosErrorResponse>) => {
      if (error.response?.status === 401) {
        if (error.response.data?.code === "token.expired") {
          // refresh token]
          cookies = parseCookies(ctx);

          const { "@nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                setCookie(ctx, "@nextauth.token", response.data.token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });

                setCookie(
                  ctx,
                  "@nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: "/",
                  }
                );

                api.defaults.headers[
                  "Authorization"
                ] = `Bearer ${response.data.token}`;

                failedRequestQueue.forEach((request) =>
                  request.resolve(response.data.token)
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.reject(err));
                failedRequestQueue = [];

                if (typeof window !== "undefined") signOut();
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              resolve: (token: string) => {
                if (!originalConfig?.headers) return;

                originalConfig!.headers["Authorization"] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              reject: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          // logout
          if (typeof window !== "undefined") signOut();
          else return Promise.reject(new AuthTokenError());
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}
