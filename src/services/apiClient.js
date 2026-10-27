/**
 * NOVA Tech API Client
 * Lightweight, reusable HTTP client using browser fetch() API.
 * Supports token injection, base URL resolution, and standardized error handling.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.refreshPromise = null;
  }

  getAuthHeaders(isFormData = false) {
    const token = localStorage.getItem('nova_auth_token');
    return {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async refreshAuthToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = localStorage.getItem('nova_refresh_token');
    if (!refreshToken) {
      this.clearSession();
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ refresh: refreshToken })
        });

        if (!response.ok) {
          throw new Error('Refresh token expired or invalid');
        }

        const data = await response.json();
        if (data.access) {
          localStorage.setItem('nova_auth_token', data.access);
        }
        if (data.refresh) {
          localStorage.setItem('nova_refresh_token', data.refresh);
        }
        return data.access;
      } catch (err) {
        this.clearSession();
        window.dispatchEvent(new CustomEvent('nova:auth-expired'));
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  clearSession() {
    localStorage.removeItem('nova_auth_token');
    localStorage.removeItem('nova_refresh_token');
    localStorage.removeItem('nova_user');
  }

  async request(endpoint, options = {}, isRetry = false) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
      ...this.getAuthHeaders(isFormData),
      ...(options.headers || {})
    };

    if (isFormData) {
      delete headers['Content-Type'];
    }

    const config = {
      ...options,
      headers
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkError) {
      const error = new Error(
        `Unable to connect to the server at ${this.baseUrl}. Please check your internet connection or backend server.`
      );
      error.isNetworkError = true;
      error.originalError = networkError;
      throw error;
    }

    // Handle 401 Unauthorized with token refresh (for protected routes only)
    const isAuthEndpoint = cleanEndpoint.includes('/auth/login/') ||
                           cleanEndpoint.includes('/auth/refresh/') ||
                           cleanEndpoint.includes('/auth/logout/');

    if (response.status === 401 && !isRetry && !isAuthEndpoint) {
      const newAccessToken = await this.refreshAuthToken();
      if (newAccessToken) {
        // Retry the original request with the fresh access token
        return this.request(endpoint, options, true);
      }
    }

    if (!response.ok) {
      let errorData = null;
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;

      try {
        const text = await response.text();
        try {
          errorData = JSON.parse(text);
          if (errorData) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'object') {
              const fieldMessages = Object.entries(errorData)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join('; ');
              if (fieldMessages) errorMessage = fieldMessages;
            }
          }
        } catch {
          if (text) errorMessage = text;
        }
      } catch {
        // Fallback
      }

      if (response.status === 401 && !isAuthEndpoint) {
        errorMessage = 'Your session has expired. Please sign in again.';
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;
      error.url = url;
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined)
    });
  }

  put(endpoint, body, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined)
    });
  }

  patch(endpoint, body, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { ApiClient };
