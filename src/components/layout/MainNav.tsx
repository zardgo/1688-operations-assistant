import { pageLabels, pageMeta, pages, type Page } from "../../pages/pageConfig";
import type { WorkspaceMode } from "../../lib/storage";

type MainNavProps = {
  mode: WorkspaceMode;
  page: Page;
  onChangePage: (page: Page) => void;
};

const employeePages: Page[] = ["command", "data", "review"];
const managerPages = pages;

export function MainNav({ mode, page, onChangePage }: MainNavProps) {
  const visiblePages = mode === "employee" ? employeePages : managerPages;

  return (
    <nav className="mode-tabs v2-tabs" aria-label="主导航">
      {visiblePages.map((key) => (
        <button
          aria-label={formatPageLabel(mode, key)}
          className={page === key ? "active" : ""}
          key={key}
          type="button"
          onClick={() => onChangePage(key)}
        >
          <span>{pageMeta[key].step}</span>
          <div className="nav-item-copy">
            <strong>{formatPageLabel(mode, key)}</strong>
            <small>{pageMeta[key].detail}</small>
          </div>
        </button>
      ))}
    </nav>
  );
}

function formatPageLabel(mode: WorkspaceMode, page: Page): string {
  if (mode === "employee" && page === "review") return "我的执行记录";
  return pageLabels[page];
}
