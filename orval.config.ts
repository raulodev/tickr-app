import { defineConfig } from "orval";

export default defineConfig({
  tickr: {
    input: "http://127.0.0.1:3000/api-json",
    output: {
      mode: "tags-split",
      target: "./app/generated/api/client.ts",
      schemas: "./app/generated/api/model",
      client: "react-query",
      httpClient: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./app/lib/api/axios-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
