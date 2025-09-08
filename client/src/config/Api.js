import axios from "axios";

const BASE_URL = "http://localhost:5000/user";

export const Api = async ({ method, url, data = {}, header }) => {
  try {
    const token = localStorage.getItem("token") || "";
    const headers = {
      "Content-Type": header === "image" ? "multipart/form-data" : "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("API Error--", error);
    throw error;
  }
};
