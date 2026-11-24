"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { site } from "@/lib/site";
import { useDict, useLocale } from "@/components/Providers";
import { MagneticButton } from "@/components/motion/MagneticButton";

type Variant = "general" | "short" | "hair";

type Props = {
  variant: Variant;
  /** Specialty names for the select (general and short variants). */
  specialties?: string[];
  /** Name of the hair specialty; choosing it points to the hair assessment form. */
  hairSpecialty?: string;
  doctors?: string[];
  defaultSpecialty?: string;
  /** Replaces the standard success line, e.g. the hair thank-you copy. */
  success?: ReactNode;
};

type Errors = { name?: string; phone?: string; consent?: string };

/**
 * Consultation request that drafts a WhatsApp (or email) message. Nothing is
 * stored or sent by the site, and it never asks for medical details or photos.
 */
export function ConsultationForm({ variant, specialties = [], hairSpecialty, doctors = [], defaultSpecialty = "", success }: Props) {
  const dict = useDict();
  const f = dict.form;
  const { locale } = useLocale();
  const check = useRef<SVGPathElement>(null);
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [selects, setSelects] = useState<Record<string, string>>({ specialty: defaultSpecialty });

  const target = site.whatsapp ? "whatsapp" : site.email ? "email" : null;
  const hairChosen = variant !== "hair" && hairSpecialty && selects.specialty === hairSpecialty;

  const setSelect = (name: string, value: string) => setSelects((s) => ({ ...s, [name]: value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const value = (k: string) => String(data.get(k) ?? "").trim();
    const next: Errors = {};
    if (value("name").length < 2) next.name = f.errors.name;
    if (!/^[+\d][\d\s()-]{6,}$/.test(value("phone"))) next.phone = f.errors.phone;
    if (variant !== "short" && !data.get("consent")) next.consent = f.errors.consent;
    setErrors(next);
    const first = (["name", "phone", "consent"] as const).find((k) => next[k]);
    if (first) {
      requestAnimationFrame(() => formEl.querySelector<HTMLInputElement>(`#cf-${first}`)?.focus());
      return;
    }

    const fieldsForVariant: Array<[string, string]> =
      variant === "hair"
        ? [
            [f.ageRange, "age"],
            [f.concern, "concern"],
            [f.bestTime, "bestTime"],
          ]
        : variant === "short"
          ? [
              [f.specialty, "specialty"],
              [f.message, "message"],
            ]
          : [
              [f.specialty, "specialty"],
              [f.doctor, "doctor"],
              [f.time, "time"],
            ];
    const lines = [
      variant === "hair" ? f.messageTitleHair : f.messageTitle,
      `${f.name}: ${value("name")}`,
      `${f.phone}: ${value("phone")}`,
      ...fieldsForVariant.map(([label, key]) => (value(key) ? `${label}: ${value(key)}` : "")),
    ].filter(Boolean);
    const body = encodeURIComponent(lines.join("\n"));
    const url =
      target === "whatsapp"
        ? `https://wa.me/${site.whatsapp}?text=${body}`
        : `mailto:${site.email}?subject=${encodeURIComponent(lines[0])}&body=${body}`;

    // Open the draft inside the click so popup blockers allow it.
    window.open(url, "_blank", "noopener");
    setStatus("sent");
    if (check.current && !prefersReducedMotion()) {
      gsap.fromTo(check.current, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, ease: "primeInOut", delay: 0.2 });
    }
  };

  if (!target) {
    return (
      <div className="card-prime">
        <p className="text-body-lg text-theme">{f.unavailable}</p>
        <p className="text-body mt-3 text-theme-muted">{site.address[locale]}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-4">
        <Field id="name" label={f.name} error={errors.name} autoComplete="name" />
        <Field id="phone" label={f.phone} error={errors.phone} type="tel" autoComplete="tel" inputMode="tel" />

        {variant === "hair" ? (
          <>
            <Select name="age" label={f.ageRange} options={f.ageOptions} value={selects.age ?? ""} onChange={setSelect} />
            <Select name="concern" label={f.concern} options={f.concernOptions} value={selects.concern ?? ""} onChange={setSelect} />
            <Field id="bestTime" label={f.bestTime} />
          </>
        ) : (
          <Select name="specialty" label={f.specialty} options={specialties} value={selects.specialty ?? ""} onChange={setSelect} />
        )}

        {hairChosen && (
          <p className="text-body rounded-card-sm border border-[var(--accent)] px-4 py-3 text-theme-muted">
            <Link href={`/${locale}/hair-transplant/book`} className="link-line text-theme">
              {dict.hairNav.cta}
            </Link>
          </p>
        )}

        {variant === "general" && (
          <>
            {doctors.length > 0 && (
              <Select
                name="doctor"
                label={f.doctor}
                options={[f.anyDoctor, ...doctors]}
                value={selects.doctor ?? ""}
                onChange={setSelect}
              />
            )}
            <Field id="time" label={f.time} />
          </>
        )}

        {variant === "short" && (
          <div className="field">
            <textarea id="cf-message" name="message" rows={3} placeholder=" " />
            <label htmlFor="cf-message">{f.message}</label>
            <span className="field-line" />
            <span className="field-line-draw" aria-hidden />
          </div>
        )}

        <p className="text-sm text-theme-muted">{f.noMedicalNote}</p>

        {variant !== "short" && (
          <div>
            <label className="flex cursor-pointer items-start gap-3 py-1 text-body text-theme-muted">
              <input
                id="cf-consent"
                name="consent"
                type="checkbox"
                className="mt-[0.3em] h-5 w-5 shrink-0 cursor-pointer accent-[var(--accent)]"
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "cf-consent-error" : undefined}
              />
              <span>
                {f.consent}{" "}
                {/* The privacy page is a draft (unverified) and is hidden with the rest at launch. */}
                {site.showUnverified ? (
                  <Link href={`/${locale}/privacy`} className="link-line text-theme">
                    {f.privacyLink}
                  </Link>
                ) : (
                  <span className="text-theme">{f.privacyLink}</span>
                )}
              </span>
            </label>
            {errors.consent && (
              <p id="cf-consent-error" className="field-error">
                {errors.consent}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-stack-lg flex flex-wrap items-center gap-6">
        <div aria-live="polite">
          {status === "sent" && (
            <div className="flex animate-[stage-in_.6s_var(--ease-prime)] items-start gap-4 text-theme">
              <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden>
                <circle cx="24" cy="24" r="23" className="stroke-[var(--accent)]" strokeWidth="1" fill="none" />
                <path ref={check} d="M14 24.5 21 31.5 34 17" className="stroke-[var(--accent)]" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-body-lg max-w-[36ch]">
                {success ?? (target === "whatsapp" ? f.successWhatsapp : f.successEmail)}
              </div>
            </div>
          )}
        </div>
        {status !== "sent" && (
          <MagneticButton type="submit" solid>
            {variant === "hair" ? f.submitHair : f.submit}
          </MagneticButton>
        )}
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "tel" | "text" | "email";
};

function Field({ id, label, error, type = "text", autoComplete, inputMode }: FieldProps) {
  const fid = `cf-${id}`;
  return (
    <div>
      <div className={`field ${error ? "has-error" : ""}`}>
        <input
          id={fid}
          name={id}
          type={type}
          placeholder=" "
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fid}-error` : undefined}
        />
        <label htmlFor={fid}>{label}</label>
        <span className="field-line" />
        <span className="field-line-draw" aria-hidden />
      </div>
      {error && (
        <p id={`${fid}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

type SelectProps = {
  name: string;
  label: string;
  options: string[];
  value: string;
  onChange: (name: string, value: string) => void;
};

function Select({ name, label, options, value, onChange }: SelectProps) {
  const fid = `cf-${name}`;
  return (
    <div className="field">
      <select id={fid} name={name} className={value ? "has-value" : ""} value={value} onChange={(e) => onChange(name, e.target.value)}>
        <option value="" />
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label htmlFor={fid}>{label}</label>
      <span className="field-line" />
      <span className="field-line-draw" aria-hidden />
      <span className="pointer-events-none absolute bottom-5 end-1 h-2 w-2 rotate-45 border-b border-e border-current opacity-60" aria-hidden />
    </div>
  );
}
