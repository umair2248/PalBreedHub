"use client";

import { useRouter } from "next/navigation";
import { pals } from "../lib/breeding";
import { useI18n } from "./I18nProvider";
import PalSelect from "./PalSelect";

const options = [...pals].sort((a, b) => a.name.localeCompare(b.name));

/** Header quick search: pick a Pal to open its breeding page. */
export default function PalJump({ id }: { id: string }) {
  const router = useRouter();
  const { t, href } = useI18n();
  return (
    <PalSelect
      id={id}
      label={t.nav.jumpLabel}
      placeholder={t.nav.findPal}
      options={options}
      value={null}
      onChange={(pal) => router.push(href(`/pals/${pal.slug}/`))}
      hideLabel
    />
  );
}
