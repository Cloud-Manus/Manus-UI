type DeployWebsiteParams = {
  folder_path: string;
  site_name?: string;
  entry_url?: string;
}

type DeployWebsiteResponse = {
  result: ToolResponse & {
    url: string;
  };
}

type DeployWebsiteDetails = DeployWebsiteParams & DeployWebsiteResponse;