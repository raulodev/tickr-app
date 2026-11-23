import { authControllerRefresh } from "@/generated/api";

import { getCookies, setAuthCookies } from "@/lib/cookies";
import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { signOut } from "next-auth/react";

interface FailedRequestQueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

export const axiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

let isRefreshing = false;
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom: FailedRequestQueueItem) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken, tenantId } = getCookies();

        const session = await authControllerRefresh({
          refreshToken: refreshToken as string,
          tenantId: tenantId as string,
        });

        setAuthCookies(session.access_token, session.refresh_token);

        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${session.access_token}`;

        processQueue(null, session.access_token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        void signOut({ callbackUrl: "/login" });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> =>
  axiosInstance({
    ...config,
    ...options,
    // Se combinan para no perder el Content-Type de la petición generada
    // cuando solo se añaden cabeceras extra (p. ej. Accept-Language).
    headers: { ...config.headers, ...options?.headers },
  }).then(({ data }) => data);

export type ErrorType<E> = AxiosError<E>;
