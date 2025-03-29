// WebSearch tool types
export type WebSearchParams = {
  query: string; // The search query to submit to the search engine
  num_results?: number; // The number of search results to return (default: 10)
}

export type WebSearchResponse = {
  result: string[];
}
