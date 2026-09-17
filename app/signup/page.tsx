import Link from "next/link";
import { AuthCard, AuthInput, AuthSubmitButton } from "@/components/auth-card";
import { signup } from "./actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <AuthCard
      title="İşletmeni ekle"
      subtitle="Birkaç saniyede kendi randevu sayfanı oluştur."
      error={searchParams.error}
      footer={
        <>
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Giriş yap
          </Link>
        </>
      }
    >
      <form action={signup} className="space-y-4">
        <AuthInput
          label="İşletme adı"
          type="text"
          name="businessName"
          required
          placeholder="Örn. Berber Ahmet"
        />
        <AuthInput label="E-posta" type="email" name="email" required autoComplete="email" />
        <AuthInput
          label="Şifre"
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <AuthSubmitButton>Hesap oluştur</AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
