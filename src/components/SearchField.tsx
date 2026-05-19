"use client";

import { useState } from "react";

type SearchFieldProps = {
  defaultQuery?: string;
};

export function SearchField({ defaultQuery = "" }: SearchFieldProps) {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <form
      id="site-search"
      className={isSearching ? "address-bar is-loading" : "address-bar"}
      action="/search"
      role="search"
      aria-label="站内搜索"
      onSubmit={() => setIsSearching(true)}
    >
      <span className="address-dot" />
      <input
        name="q"
        type="search"
        aria-label="输入搜索内容"
        placeholder="exoring.fun"
        defaultValue={defaultQuery}
      />
      {isSearching ? <span className="search-loading-copy">搜索中</span> : null}
    </form>
  );
}
