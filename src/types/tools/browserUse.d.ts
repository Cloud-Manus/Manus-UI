// BrowserUseTool types
type BrowserAction = 
  | 'go_to_url' 
  | 'click_element' 
  | 'input_text' 
  | 'scroll_down' 
  | 'scroll_up' 
  | 'scroll_to_text' 
  | 'send_keys' 
  | 'get_dropdown_options' 
  | 'select_dropdown_option' 
  | 'go_back' 
  | 'web_search' 
  | 'wait' 
  | 'extract_content' 
  | 'switch_tab' 
  | 'open_tab' 
  | 'close_tab';

// Base interface for all browser actions
interface BrowserUseBaseParams {
  action: BrowserAction;
}

// Navigation actions
interface GoToUrlParams extends BrowserUseBaseParams {
  action: 'go_to_url';
  url: string;
}

interface GoBackParams extends BrowserUseBaseParams {
  action: 'go_back';
}

interface RefreshParams extends BrowserUseBaseParams {
  action: 'refresh';
}

interface WebSearchParams extends BrowserUseBaseParams {
  action: 'web_search';
  query: string;
}

// Element interaction actions
interface ClickElementParams extends BrowserUseBaseParams {
  action: 'click_element';
  index: number;
}

interface InputTextParams extends BrowserUseBaseParams {
  action: 'input_text';
  index: number;
  text: string;
}

interface ScrollParams extends BrowserUseBaseParams {
  action: 'scroll_down' | 'scroll_up';
  scroll_amount?: number;
}

interface ScrollToTextParams extends BrowserUseBaseParams {
  action: 'scroll_to_text';
  text: string;
}

interface SendKeysParams extends BrowserUseBaseParams {
  action: 'send_keys';
  keys: string;
}

interface GetDropdownOptionsParams extends BrowserUseBaseParams {
  action: 'get_dropdown_options';
  index: number;
}

interface SelectDropdownOptionParams extends BrowserUseBaseParams {
  action: 'select_dropdown_option';
  index: number;
  text: string;
}

// Content extraction actions
interface ExtractContentParams extends BrowserUseBaseParams {
  action: 'extract_content';
  goal: string;
}

// Tab management actions
interface SwitchTabParams extends BrowserUseBaseParams {
  action: 'switch_tab';
  tab_id: number;
}

interface OpenTabParams extends BrowserUseBaseParams {
  action: 'open_tab';
  url: string;
}

interface CloseTabParams extends BrowserUseBaseParams {
  action: 'close_tab';
}

// Utility actions
interface WaitParams extends BrowserUseBaseParams {
  action: 'wait';
  seconds?: number;
}

// Union type for all browser action parameters
type BrowserUseParams =
  | GoToUrlParams
  | GoBackParams
  | RefreshParams
  | WebSearchParams
  | ClickElementParams
  | InputTextParams
  | ScrollParams
  | ScrollToTextParams
  | SendKeysParams
  | GetDropdownOptionsParams
  | SelectDropdownOptionParams
  | ExtractContentParams
  | SwitchTabParams
  | OpenTabParams
  | CloseTabParams
  | WaitParams;


type BrowserUseResponse = {
  result: ToolResponse;
}

export type BrowserUseDetails = BrowserUseParams & BrowserUseResponse;