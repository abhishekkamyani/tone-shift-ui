import axios from 'axios';
export type AiTone = 'Professional' | 'Casual' | 'Creative' | 'Concise' | 'Empathetic';
export type AiFormat = 'Email' | 'WhatsApp' | 'LinkedIn Post' | 'Jira Ticket' | 'Slack Message' | 'Tweet';

// Define the shape of the expected response
export interface ShiftToneResponse {
    success: boolean;
    originalText: string;
    targetTone: string;
    shiftedText: string;
}

// Define the shape of the request payload
export interface ShiftTonePayload {
    originalText: string;
    targetTone: AiTone;
    format: AiFormat;
}

export interface TranscribePayload {
    audioBase64: string;
    mimeType: string;
}

export interface TranscribeResponse {
    success: boolean;
    text: string;
}

// Set up an Axios instance (makes it easy to add Auth headers later)
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create a variable to hold the token-fetching function
let getAuthToken: (() => Promise<string | undefined>) | null = null;

// Export a function so your React app can give Axios the Auth0 getter
export const setTokenGetter = (getter: () => Promise<string | undefined>) => {
    getAuthToken = getter;
};

// Add an interceptor to automatically attach the token before EVERY request
apiClient.interceptors.request.use(
    async (config) => {
        if (getAuthToken) {
            try {
                // Fetch the token (Auth0 handles caching and refreshing automatically!)
                const token = await getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error fetching Auth0 token for API request:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// The dedicated API function
export const shiftTextTone = async (payload: ShiftTonePayload): Promise<ShiftToneResponse> => {
    const response = await apiClient.post<ShiftToneResponse>('/ai/shift-tone', payload);
    return response.data;
};

// Add this below your existing shiftTextTone function
export const transcribeVoiceNote = async (payload: TranscribePayload): Promise<TranscribeResponse> => {
    console.log("payload", payload)
    const response = await apiClient.post<TranscribeResponse>('/ai/transcribe', payload);
    return response.data;
};