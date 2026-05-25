import { pageLabels, pageMeta, pages, type Page } from "../../pages/pageConfig";

type MainNavProps = {
  page: Page;
  onChangePage: (page: Page) => void;
};

export function MainNav({ page, onChangePage }: MainNavProps) {
  return (
    <nav className="mode-tabs v2-tabs" aria-label="主导航">
      {pages.map((key) => (
        <button
          aria-label={pageLabels[key]}
          className={page === key ? "active" : ""}
          key={key}
          type="button"
          onClick={() => onChangePage(key)}
        >
          <span>{pageMeta[key].step}</span>
          <div className="nav-item-copy">
            <strong>{pageLabels[key]}</strong>
            <small>{pageMeta[key].detail}</small>
          </div>
        </button>
      ))}
    </nav>
  );
}
