type SearchFieldProps = {
  defaultQuery?: string;
};

export function SearchField({ defaultQuery = "" }: SearchFieldProps) {
  return (
    <form id="site-search" className="address-bar" action="/search" role="search" aria-label="站内搜索">
      <span className="address-dot" />
      <input
        name="q"
        type="search"
        aria-label="输入搜索内容"
        placeholder="exoring.fun"
        defaultValue={defaultQuery}
      />
    </form>
  );
}
