export const instant = false;

import { LoginForm } from "@/features/auth/login-forms";

export default function Login() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <LoginForm />
    </main>
  );
}
