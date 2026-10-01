"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useId, useMemo, useState } from "react";

import { CountryCard, type CountryCardData } from "@/components/CountryCard";
import { EntryType, Region } from "@/generated/prisma/enums";
import {
  type CountryFilters,
  EMPTY_FILTERS,
  filterCountries,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/country-search";
import styles from "./CountryExplorer.module.css";

export type ExplorerCountry = CountryCardData & { region: Region; featuredOrder: number | null };

const ENTRY_TYPES = Object.values(EntryType);
const REGIONS = Object.values(Region);

type ExplorerProps = { countries: ExplorerCountry[] };

/**
 * البحث بالاسم ومرشحا نوع الدخول والمنطقة. القائمة كاملة تصل من الخادم وتُصفّى في المتصفح.
 * البحث والمرشحات محفوظة في رابط الصفحة (?q=&type=&region=)، فيمكن مشاركتها والرجوع إليها.
 *
 * الصفحة مولّدة ثابتة والرابط لا يُعرف وقت التوليد، فيُرسم الجزء الذي يقرأ الرابط داخل Suspense،
 * وبديله القائمة نفسها بلا مرشحات حتى تبقى كل الدول في HTML المولَّد لمحركات البحث.
 */
export function CountryExplorer({ countries }: ExplorerProps) {
  return (
    <Suspense fallback={<Explorer countries={countries} initialFilters={EMPTY_FILTERS} />}>
      <ExplorerFromUrl countries={countries} />
    </Suspense>
  );
}

function ExplorerFromUrl({ countries }: ExplorerProps) {
  const searchParams = useSearchParams();
  // الرابط يحدد الحالة الأولى فقط؛ بعدها الحالة في المكون وتُكتب في الرابط عند كل تغيير.
  const [initialFilters] = useState(() => filtersFromSearchParams(searchParams));

  return <Explorer countries={countries} initialFilters={initialFilters} onChange={writeFiltersToUrl} />;
}

/** replaceState لا يضيف خطوة في سجل المتصفح مع كل حرف يُكتب، ويتكامل مع موجّه Next.js. */
function writeFiltersToUrl(filters: CountryFilters) {
  const params = filtersToSearchParams(filters, new URLSearchParams(window.location.search));
  const search = params.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
}

function Explorer({
  countries,
  initialFilters,
  onChange,
}: ExplorerProps & {
  initialFilters: CountryFilters;
  onChange?: (filters: CountryFilters) => void;
}) {
  const t = useTranslations("search");
  const tEntry = useTranslations("entryType");
  const tRegion = useTranslations("region");
  const id = useId();

  const [filters, setFilters] = useState(initialFilters);
  const { query, entryType, region } = filters;

  const results = useMemo(
    () => filterCountries(countries, { query, entryType, region }),
    [countries, query, entryType, region],
  );
  const hasFilters = query.trim() !== "" || entryType !== null || region !== null;

  function update(changes: Partial<CountryFilters>) {
    const next = { ...filters, ...changes };
    setFilters(next);
    onChange?.(next);
  }

  function reset() {
    update(EMPTY_FILTERS);
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
            onChange={(e) => update({ query: e.target.value })}
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
            onChange={(e) => update({ entryType: (e.target.value || null) as EntryType | null })}
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
            onChange={(e) => update({ region: (e.target.value || null) as Region | null })}
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
