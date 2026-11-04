import { defineConfig } from "orval";

export default defineConfig({
  petstore: {
    input: "http://127.0.0.1:3000/api-json",
    output: {
      mode: "tags-split",
      target: "./src/generated/api/client.ts",
      schemas: "./src/generated/api/model",
      client: "react-query",
    },
  },
});
