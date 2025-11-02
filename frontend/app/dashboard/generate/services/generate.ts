interface GenerateResponse {
    pipeline_config: string;
    pipeline_json: object;
    pipeline_description: string;
    assumptions: string[];
    requirements: string[];
    next_steps: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class GenerateService {
    /**
     * Send a generate request to the backend
     * @param userToken - Auth token
     * @param prompt - User prompt for generation
     * @param projectContext - Context of the project
     */
    async generateWorkflow(
        userToken: string,
        prompt: string,
        projectContext?: object
    ): Promise<GenerateResponse> {
        const response = await fetch(`${API_BASE_URL}/api/commands/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                prompt,
                project_context: projectContext || {},
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate workflow');
        }

        return response.json() as Promise<GenerateResponse>;
    }
}

export const generateService = new GenerateService();
export type { GenerateResponse };
