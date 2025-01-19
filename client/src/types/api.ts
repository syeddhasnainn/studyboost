
export interface ISummary {
    title: string;
    content: string;
    timestamp: number; 
}

export interface ITranscript {
    text: string;
    duration: number;
    offset: string;
}

export interface ITranscriptResponse {
    transcript: ITranscript[];
    summary: ISummary[];
}

export interface IFileInfo {
    name: string;
    size: number;
    type: string;
}

export interface IFileUploadResponse {
    objectUrl: string;
    fileInfo: IFileInfo
}

export interface IChat {
    chat_id: string;
    resource_id: string;
    resource_link: string;
    user_id: string;
}

export interface IMessage {
    role: "user" | "assistant";
    content: string;
}

