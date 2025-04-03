type VerifyWebsiteParams = {
  url: string;
  title: string;
  status_code: number;
  success: boolean;
}

type VerifyWebsiteResponse = {
  result: ToolResponse & {
    url: string;
  };
}

type VerifyWebsiteDetails = VerifyWebsiteParams & VerifyWebsiteResponse;