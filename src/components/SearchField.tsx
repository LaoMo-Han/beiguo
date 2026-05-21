"use client";

import { useState } from "react";

type SearchFieldProps = {
  defaultQuery?: string;
  locale?: "zh" | "en";
};

export function SearchField({ defaultQuery = "", locale = "zh" }: SearchFieldProps) {
  const [isSearching, setIsSearching] = useState(false);
  const copy = locale === "en"
    ? {
        searchLabel: "Site search",
        inputLabel: "Search Beiguo",
        placeholder: "exoring.fun/en",
        loading: "Searching"
      }
    : {
        searchLabel: "站内搜索",
        inputLabel: "输入搜索内容",
        placeholder: "exoring.fun",
        loading: "搜索中"
      };

  return (
    <form
      id="site-search"
      className={isSearching ? "address-bar is-loading" : "address-bar"}
      action="/search"
      role="search"
      aria-label={copy.searchLabel}
      onSubmit={() => setIsSearching(true)}
    >
      <span className="address-dot" />
      <input
        name="q"
        type="search"
        aria-label={copy.inputLabel}
        placeholder={copy.placeholder}
        defaultValue={defaultQuery}
      />
      {isSearching ? <span className="search-loading-copy">{copy.loading}</span> : null}
    </form>
  );
}
