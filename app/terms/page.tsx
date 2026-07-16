import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of EduBridge — accounts, enrollments, payments, instructor obligations and more.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      intro={`These terms govern your access to and use of ${SITE.name}. By using the platform, you agree to them.`}
    >
      <h2>1. Acceptance of these terms</h2>
      <p>
        Welcome to {SITE.name} (&quot;{SITE.name}&quot;, &quot;we&quot;, &quot;us&quot;), operated by {SITE.legalName}. By creating an account,
        enrolling in a course, or otherwise using our website and apps (the &quot;Platform&quot;), you agree to be bound by these
        Terms of Service and our{" "}
        <a href="/privacy">Privacy Policy</a>. If you do not agree, please do not use the Platform.
      </p>

      <h2>2. Eligibility and accounts</h2>
      <p>
        You must be at least 16 years old (or have the consent of a parent or guardian) to use {SITE.name}. You are
        responsible for the information you provide, for keeping your login credentials secure, and for all activity that
        happens under your account. Notify us immediately if you suspect unauthorized use.
      </p>

      <h2>3. Enrollments and course access</h2>
      <ul>
        <li>When you enroll in a course, we grant you a personal, non-exclusive, non-transferable licence to access it for your own learning.</li>
        <li>Free courses can be accessed at no charge. Paid courses require a completed payment before access is granted.</li>
        <li>Course access is generally provided for the lifetime of the course on the Platform, but availability may change if an instructor removes content or an account is terminated.</li>
        <li>You may not share, resell, record, or redistribute course content, or use it to build a competing service.</li>
      </ul>

      <h2>4. Payments</h2>
      <p>
        Prices are shown in {SITE.currency} and are paid via {SITE.paymentMethods}. By purchasing a course you authorize us
        and our payment partners to charge the applicable amount. We do not store your mobile-money PIN or full payment
        credentials — payments are processed by our payment provider. Taxes, where applicable, are your responsibility unless
        stated otherwise. Refunds are handled under our{" "}
        <a href="/refunds">Refund Policy</a>.
      </p>

      <h2>5. Instructors and vetting</h2>
      <p>
        Anyone wishing to teach must apply and be <strong>vetted and approved</strong> before publishing content. If approved,
        instructors are responsible for the accuracy, quality, legality, and originality of their content, and grant {SITE.name}
        a licence to host, market, and deliver that content to learners. Instructors must own or have the rights to everything
        they upload. Payouts to instructors are made in {SITE.currency} via mobile money, subject to our applicable revenue-share
        and payout terms.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Break the law or infringe anyone&apos;s rights, including intellectual-property rights;</li>
        <li>Upload malware, attempt to disrupt the Platform, or gain unauthorized access to systems or accounts;</li>
        <li>Scrape, copy, or redistribute content without permission;</li>
        <li>Harass other users or instructors, or post abusive, misleading, or unlawful content.</li>
      </ul>

      <h2>7. Intellectual property</h2>
      <p>
        The Platform, including its design, branding, and software, is owned by {SITE.legalName} and protected by law. Course
        content is owned by the respective instructors or their licensors. Nothing in these terms transfers ownership to you.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The Platform and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee any
        particular educational, career, or financial outcome from taking a course. To the fullest extent permitted by law, we
        disclaim all warranties, express or implied.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {SITE.name} and {SITE.legalName} will not be liable for any indirect,
        incidental, or consequential damages, or for any loss of data, revenue, or profits arising from your use of the
        Platform. Where liability cannot be excluded, it is limited to the amount you paid for the course giving rise to the
        claim.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may stop using the Platform at any time. We may suspend or terminate your account if you breach these terms or use
        the Platform in a way that harms other users, instructors, or {SITE.name}. Certain provisions (such as intellectual
        property, disclaimers, and limitation of liability) survive termination.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. If we make material changes, we will update the &quot;Last updated&quot; date
        above and, where appropriate, notify you. Continued use of the Platform after changes means you accept the updated
        terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        For any questions about these terms, contact us at{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </LegalShell>
  );
}
