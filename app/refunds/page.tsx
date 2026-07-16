import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "EduBridge's refund policy — eligibility, how to request a refund, and how refunds are processed to mobile money.",
};

export default function RefundsPage() {
  return (
    <LegalShell
      title="Refund Policy"
      intro={`We want you to learn with confidence. This policy explains when and how you can get a refund on ${SITE.name}.`}
    >
      <h2>1. Our 7-day guarantee</h2>
      <p>
        For most paid courses, you can request a full refund within <strong>7 days</strong> of purchase if the course
        didn&apos;t meet your expectations. This gives you time to start the course and decide whether it&apos;s right for you.
      </p>

      <h2>2. Eligibility</h2>
      <p>A refund is available when all of the following are true:</p>
      <ul>
        <li>You request it within 7 days of your payment;</li>
        <li>You have completed less than a substantial portion of the course (as a guide, under ~30% of the lessons);</li>
        <li>You have not already received a refund for the same course;</li>
        <li>The request is not part of a pattern of abuse (for example, repeatedly buying, consuming, and refunding courses).</li>
      </ul>

      <h2>3. What is not refundable</h2>
      <ul>
        <li><strong>Free courses</strong> — there is nothing to refund.</li>
        <li>Courses purchased more than 7 days ago;</li>
        <li>Courses that have been substantially completed or where a certificate has been issued;</li>
        <li>Purchases flagged for fraud or abuse.</li>
      </ul>

      <h2>4. How to request a refund</h2>
      <p>
        Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> from the address on your account with:
      </p>
      <ul>
        <li>The course name;</li>
        <li>The date of purchase and your payment (mobile-money) reference;</li>
        <li>A brief reason for the request (this helps us improve).</li>
      </ul>
      <p>You can also reach us through our <a href="/contact">contact page</a>.</p>

      <h2>5. How refunds are processed</h2>
      <p>
        Approved refunds are returned in {SITE.currency} to the {SITE.paymentMethods} account used for the purchase.
        Once approved, refunds are typically processed within <strong>5–10 business days</strong>, though the exact timing
        depends on your mobile-money provider. When a refund is issued, your access to the course is removed.
      </p>

      <h2>6. Chargebacks and disputes</h2>
      <p>
        If you believe you were charged in error, please contact us first — we can usually resolve issues quickly. We reserve
        the right to decline refunds that don&apos;t meet this policy or that show signs of abuse.
      </p>

      <h2>7. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &quot;Last updated&quot; date above reflects the current version, which
        applies to purchases made after that date.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about a refund? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we&apos;ll be happy to help.
      </p>
    </LegalShell>
  );
}
