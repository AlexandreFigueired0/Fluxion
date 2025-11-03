interface DetectResponse {
    primary_lang: string;
    package_manager: string;
    build_command: string;
    test_command: string;
    dependencies: string[];
    has_tests: boolean;
    docker_files: string[];
    existing_ci: string[];
    languages: string[];
    structure: string;
}

interface Repository {
    name: string;
    owner: string;
    full_name: string;
    description: string;
    html_url: string;
    private: boolean;
}

interface RepositoriesResponse {
    repositories: Repository[];
    count: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ProjectContextDetectorService {
    /**
     * Detect project context from a GitHub repository
     * @param userToken - Auth token from session
     * @param owner - GitHub repository owner
     * @param repo - GitHub repository name
     * @param token - Optional GitHub token for private repos
     * @returns ProjectContext with detected information
     */
    async detectProject(
        userToken: string,
        owner: string,
        repo: string,
        token?: string
    ): Promise<DetectResponse> {
        const response = await fetch(`${API_BASE_URL}/api/commands/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                owner,
                repo,
                token,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `Failed to detect project: ${response.statusText}`);
        }

        return response.json() as Promise<DetectResponse>;
    }

    /**
     * Fetch list of user's repositories
     * Requires user to be authenticated with GitHub
     * @param userToken - Auth token from session
     * @returns List of user's accessible repositories
     */
    async getUserRepositories(userToken: string): Promise<Repository[]> {
        const response = await fetch(`${API_BASE_URL}/api/commands/repos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            if (response.status === 400) {
                // User not connected to GitHub
                return [];
            }
            throw new Error(error.error || `Failed to fetch repositories: ${response.statusText}`);
        }

        const data = await response.json() as RepositoriesResponse;
        return data.repositories;
    }

    /**
     * Parse owner/repo from a GitHub URL
     * Supports formats like:
     * - https://github.com/owner/repo
     * - github.com/owner/repo
     * - owner/repo
     * @param url - GitHub URL or owner/repo string
     * @returns { owner, repo } or null if invalid
     */
    parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
        if (!url) return null;

        // Remove trailing slashes and .git
        url = url.trim().replace(/\/$/, '').replace(/\.git$/, '');

        // Extract owner/repo from various formats
        let match = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            return { owner: match[1], repo: match[2] };
        }

        // Try simple owner/repo format
        match = url.match(/^([^\/]+)\/([^\/]+)$/);
        if (match) {
            return { owner: match[1], repo: match[2] };
        }

        return null;
    }

    /**
     * Validate repository URL format
     * @param url - GitHub URL or owner/repo string
     * @returns true if valid, false otherwise
     */
    isValidRepositoryUrl(url: string): boolean {
        return this.parseRepositoryUrl(url) !== null;
    }
}

export const projectContextDetectorService = new ProjectContextDetectorService();
export type { DetectResponse, Repository, RepositoriesResponse };
