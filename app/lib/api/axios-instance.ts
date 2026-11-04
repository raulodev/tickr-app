import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { redirect } from "next/navigation";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      redirect("/login");
    }
    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> =>
  AXIOS_INSTANCE({ ...config, ...options }).then(({ data }) => data);

export type ErrorType<E> = AxiosError<E>;
