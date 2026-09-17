import Link from "next/link";
import { AuthCard, AuthInput, AuthSubmitButton } from "@/components/auth-card";
import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <AuthCard
      title="Giriş yap"
      subtitle="İşletme panelinize erişin."
      error={searchParams.error}
      footer={
        <>
          Hesabın yok mu?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            İşletmeni ekle
          </Link>
        </>
      }
    >
      <form action={login} className="space-y-4">
        <AuthInput label="E-posta" type="email" name="email" required autoComplete="email" />
        <AuthInput
          label="Şifre"
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
        <AuthSubmitButton>Giriş yap</AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
