import { Workflow } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Backend response structure for a pipeline
 */
interface PipelineResponse {
  id: string;
  user_id: string;
  name: string;
  description: string;
  config_yaml: string;
  created_at: string;
  updated_at: string;
}

class PipelineService {
  /**
   * Create a new pipeline
   * @param userToken - Auth token (placeholder for now)
   * @param userID - User ID
   * @param pipeline - Pipeline object
   */
  async createPipeline(
    userToken: string,
    userID: string,
    pipeline: Workflow
  ): Promise<PipelineResponse> {
    const response = await fetch(`${API_BASE_URL}/api/pipelines`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userID,
        name: pipeline.name,
        description: pipeline.description || '',
        config_yaml: pipeline,  // Send the full Pipeline object as JSON
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create pipeline');
    }

    return response.json();
  }

  /**
   * Get a pipeline by ID
   * @param userToken - Auth token (placeholder for now)
   * @param pipelineID - Pipeline ID
   */
  async getPipeline(
    userToken: string,
    pipelineID: string
  ): Promise<PipelineResponse> {
    const response = await fetch(`${API_BASE_URL}/api/pipelines/${pipelineID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pipeline');
    }

    return response.json();
  }

  /**
   * List all pipelines for a user
   * @param userToken - Auth token (placeholder for now)
   * @param userID - User ID
   */
  async listPipelines(
    userToken: string,
    userID: string
  ): Promise<PipelineResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/pipelines/user/${userID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pipelines');
    }

    return response.json();
  }

  /**
   * Update an existing pipeline
   * @param userToken - Auth token (placeholder for now)
   * @param pipelineID - Pipeline ID
   * @param pipeline - Updated pipeline object
   */
  async updatePipeline(
    userToken: string,
    pipelineID: string,
    pipeline: Workflow
  ): Promise<PipelineResponse> {
    const response = await fetch(`${API_BASE_URL}/api/pipelines/${pipelineID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: pipeline.name,
        description: pipeline.description || '',
        config_yaml: pipeline,  // Send the full Pipeline object as JSON
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update pipeline');
    }

    return response.json();
  }

  /**
   * Delete a pipeline by ID
   * @param userToken - Auth token (placeholder for now)
   * @param pipelineID - Pipeline ID
   */
  async deletePipeline(
    userToken: string,
    pipelineID: string
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/pipelines/${pipelineID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete pipeline');
    }
  }
}

export default new PipelineService();
