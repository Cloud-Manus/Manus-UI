type R2UploadParams = {
  file_path?: string;
  content?: string;
  file_name?: string;
  directory?: string;
}

type R2UploadResponse = {
  result: ToolResponse & {
    project_url: string;
    url: string;
  };
}

type R2UploadDetails = R2UploadParams & R2UploadResponse;