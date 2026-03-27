const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "").replace(/\/api$/, "") + "/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const request = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
};

export const api = {
  getSiteData: () => request("/site"),
  loginAdmin: (body) =>
    request("/auth/login", {
      method: "POST",
      body
    }),
  updateSection: (section, value, token) =>
    request(`/admin/content/${section}`, {
      method: "PUT",
      body: { value },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  uploadImageAsset: (file, token) => {
    const formData = new FormData();
    formData.append("image", file);

    return request("/admin/uploads/image", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  uploadDocumentAsset: (file, token) => {
    const formData = new FormData();
    formData.append("document", file);

    return request("/admin/uploads/document", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch((error) => {
      if (/404/.test(error.message || "") || /not found/i.test(error.message || "")) {
        throw new Error("Document upload endpoint not found (404). Restart backend so /api/admin/uploads/document is active.");
      }
      throw error;
    });
  },
  getSubmissions: (token) =>
    request("/admin/submissions", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  deleteSubmission: (type, id, token) =>
    request(`/admin/submissions/${type}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  submitForm: (type, body) =>
    request(`/forms/${type}`, {
      method: "POST",
      body
    })
};
