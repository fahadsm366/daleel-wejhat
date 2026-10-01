"use client";

import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

import { CountryCard, type CountryCardData } from "@/components/CountryCard";
import { EntryType, Region } from "@/generated/prisma/enums";
import { filterCountries } from "@/lib/country-search";
import styles from "./CountryExplorer.module.css";

export type ExplorerCountry = CountryCardData & { region: Region };

const ENTRY_TYPES = Object.values(EntryType);
const REGIONS = Object.values(Region);

/** البحث بالاسم ومرشحا نوع الدخول والمنطقة. القائمة كاملة تصل من الخادم وتُصفّى في المتصفح. */
export function CountryExplorer({ countries }: { countries: ExplorerCountry[] }) {
  const t = useTranslations("search");
  const tEntry = useTranslations("entryType");
  const tRegion = useTranslations("region");
  const id = useId();

  const [query, setQuery] = useState("");
  const [entryType, setEntryType] = useState<EntryType | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const results = useMemo(
    () => filterCountries(countries, { query, entryType, region }),
    [countries, query, entryType, region],
  );
  const hasFilters = query.trim() !== "" || entryType !== null || region !== null;

  function reset() {
    setQuery("");
    setEntryType(null);
    setRegion(null);
  }

  return (
    <div className={styles.explorer}>
      <form role="search" className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={`${styles.field} ${styles.queryField}`}>
          <label htmlFor={`${id}-q`} className={styles.label}>
            {t("queryLabel")}
          </label>
          <input
            id={`${id}-q`}
            type="search"
            className={styles.control}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("queryPlaceholder")}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`${id}-entry`} className={styles.label}>
            {t("entryTypeLabel")}
          </label>
          <select
            id={`${id}-entry`}
            className={styles.control}
            value={entryType ?? ""}
            onChange={(e) => setEntryType((e.target.value || null) as EntryType | null)}
          >
            <option value="">{t("allEntryTypes")}</option>
            {ENTRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {tEntry(type)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor={`${id}-region`} className={styles.label}>
            {t("regionLabel")}
          </label>
          <select
            id={`${id}-region`}
            className={styles.control}
            value={region ?? ""}
            onChange={(e) => setRegion((e.target.value || null) as Region | null)}
          >
            <option value="">{t("allRegions")}</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {tRegion(r)}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className={styles.summary}>
        <p className={styles.count} role="status">
          {t("count", { count: results.length })}
        </p>
        {hasFilters && (
          <button type="button" className={styles.reset} onClick={reset}>
            {t("reset")}
          </button>
        )}
      </div>
      {query.trim() === "" && <p className={styles.note}>{t("advisoryHidden")}</p>}

      {results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{t("empty")}</p>
      )}
    </div>
  );
}
