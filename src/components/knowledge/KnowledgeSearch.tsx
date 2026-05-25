import type { OfficialArticleSource, OfficialKnowledgeCard } from "../../lib/knowledge/types";
import { searchKnowledge } from "../../lib/knowledge/selectors";

type KnowledgeSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function KnowledgeSearch({ query, onQueryChange }: KnowledgeSearchProps) {
  const results = searchKnowledge(query);

  return (
    <div className="knowledge-search">
      <label>
        <span>搜索官方知识</span>
        <input
          aria-label="搜索官方知识"
          placeholder="搜索文章、知识卡、指标、目标或战场"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      {query.trim() ? (
        <div className="knowledge-search-results">
          <SearchGroup title="官方文章" items={results.articles} renderItem={(article) => article.title} />
          <SearchGroup title="知识卡片" items={results.cards} renderItem={(card) => card.title} />
        </div>
      ) : null}
    </div>
  );
}

function SearchGroup<T extends OfficialArticleSource | OfficialKnowledgeCard>({
  title,
  items,
  renderItem
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => string;
}) {
  return (
    <section>
      <strong>{title}</strong>
      {items.length > 0 ? (
        <ul>
          {items.slice(0, 6).map((item) => (
            <li key={item.id}>{renderItem(item)}</li>
          ))}
        </ul>
      ) : (
        <p>无匹配结果</p>
      )}
    </section>
  );
}
