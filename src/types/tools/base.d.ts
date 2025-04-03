// Response type
interface ToolResponse {
  output: string;
  error?: string;
  base64_image?: string;
  system?: string;
}

type ToolDetails = {
  browser_use?: BrowserUseDetails;
  bash?: BashDetails;
  terminate?: TerminateDetails;
  str_replace_editor?: StrReplaceEditorDetails;
  create_chat_completion?: CreateChatCompletionDetails;
  planning?: PlanningDetails;
  terminal?: TerminalDetails;
  web_search?: WebSearchDetails;
  python_execute?: PythonExecuteDetails;
  r2_upload?: R2UploadDetails;
  deploy_website?: DeployWebsiteDetails;
  verify_website?: VerifyWebsiteDetails;
}