import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
