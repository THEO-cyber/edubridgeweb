import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EduBridge collects, uses, and protects your personal information, including payment data and cookies.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro={`Your privacy matters. This policy explains what ${SITE.name} collects, why, and the choices you have.`}
    >
      <h2>1. Who we are</h2>
      <p>
        {SITE.name} is operated by {SITE.legalName}. This policy applies to our website and mobile apps. If you have any
        questions, contact us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li><strong>Account information</strong> — your name, email, username, and password (stored encrypted).</li>
        <li><strong>Learning activity</strong> — courses you enroll in, lessons you complete, and progress.</li>
        <li><strong>Payment information</strong> — the mobile-money number and transaction details needed to process a payment. We do <strong>not</strong> store your mobile-money PIN or full credentials; payments are handled by our payment provider.</li>
        <li><strong>Instructor application data</strong> — if you apply to teach, the details you submit (motivation, expertise, links).</li>
        <li><strong>Technical data</strong> — device, browser, and basic usage information to keep the Platform secure and working.</li>
      </ul>

      <h2>3. How we use your information</h2>
      <ul>
        <li>To provide and personalize your learning experience;</li>
        <li>To process enrollments, payments, and instructor payouts;</li>
        <li>To vet and review instructor applications;</li>
        <li>To send important service messages (for example, enrollment confirmations and account notices);</li>
        <li>To keep the Platform safe, prevent fraud, and comply with the law.</li>
      </ul>

      <h2>4. Payments and mobile money</h2>
      <p>
        Payments are made in {SITE.currency} via {SITE.paymentMethods} and processed by our third-party payment provider. We
        receive confirmation of whether a payment succeeded or failed, along with a transaction reference — not your secret
        credentials. Your use of a payment method is also subject to that provider&apos;s own terms and privacy policy.
      </p>

      <h2>5. Cookies and local storage</h2>
      <p>
        We use cookies and browser local storage to keep you signed in and to remember your preferences. Essential storage is
        required for the Platform to function (for example, your login session). You can clear this data in your browser
        settings, but doing so will sign you out.
      </p>

      <h2>6. How we share information</h2>
      <p>We do not sell your personal information. We share it only:</p>
      <ul>
        <li>With service providers who help us operate (hosting, payments, email), under appropriate safeguards;</li>
        <li>With instructors, in limited form, so they can see aggregate enrollment and progress for their courses;</li>
        <li>Where required by law, or to protect the rights and safety of our users and the Platform.</li>
      </ul>

      <h2>7. Data security</h2>
      <p>
        We use industry-standard measures — including encryption in transit, hashed passwords, and access controls — to
        protect your data. No system is perfectly secure, but we work continuously to safeguard your information and will
        notify you of a significant breach where required.
      </p>

      <h2>8. Data retention</h2>
      <p>
        We keep your information for as long as your account is active or as needed to provide the Platform, comply with legal
        obligations, resolve disputes, and enforce our agreements. You can request deletion of your account at any time.
      </p>

      <h2>9. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, export, or delete your personal information,
        and to object to certain processing. To exercise any of these rights, email us at{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we will respond within a reasonable time.
      </p>

      <h2>10. Children</h2>
      <p>
        {SITE.name} is not intended for children under 16. If you believe a child has provided us personal information without
        appropriate consent, contact us and we will remove it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will revise the &quot;Last updated&quot; date above and, for material
        changes, take reasonable steps to notify you.
      </p>

      <h2>12. Contact</h2>
      <p>
        For privacy questions or requests, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </LegalShell>
  );
}
