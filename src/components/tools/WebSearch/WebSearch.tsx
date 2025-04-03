import styles from "./WebSearch.module.scss";

interface WebSearchProps {
  toolDetails: WebSearchParams & WebSearchResponse;
}

export default function WebSearch({ toolDetails }: WebSearchProps) {
  // 格式化搜索结果，将每个结果显示为卡片
  const renderSearchResults = () => {
    // 如果没有结果，显示提示信息
    if (!toolDetails.result || toolDetails.result.length === 0) {
      return <div className={styles.noResults}>No search results found</div>;
    }

    // 显示搜索结果
    return toolDetails.result.map((item, index) => (
      <div key={index} className={styles.resultItem}>
        <div className={styles.resultContent}>
          {item}
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.webSearchWrapper}>
      <div className={styles.queryHeader}>
        <div className={styles.title}>Web Search</div>
        <div className={styles.queryInfo}>
          Showing {toolDetails.result?.length || 0} results
          {toolDetails.num_results ? ` (max: ${toolDetails.num_results})` : ''}
        </div>
      </div>
      <div className={styles.queryBox}>
        <div className={styles.queryLabel}>Query:</div>
        <div className={styles.query}>{toolDetails.query}</div>
      </div>
      <div className={styles.resultsHeader}>
        <div className={styles.title}>Search Results</div>
      </div>
      <div className={styles.resultsContainer}>
        {renderSearchResults()}
      </div>
    </div>
  );
} 