const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface StartLinkResponse {
  url: string;
}

class GitHubLinkService {
  async startLink(userToken: string): Promise<StartLinkResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/github/link`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to start GitHub link');
    }

    return response.json() as Promise<StartLinkResponse>;
  }
}

export const githubLinkService = new GitHubLinkService();
export type { StartLinkResponse };
