import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const SiteDataContext = createContext(null);

export const SiteDataProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem("rif-admin-token") || "");

  const refreshSiteData = async () => {
    try {
      setStatus("loading");
      const data = await api.getSiteData();
      setSiteData(data);
      setError("");
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  };

  useEffect(() => {
    refreshSiteData();
  }, []);

  useEffect(() => {
    if (authToken) {
      window.localStorage.setItem("rif-admin-token", authToken);
      return;
    }

    window.localStorage.removeItem("rif-admin-token");
  }, [authToken]);

  const value = useMemo(
    () => ({
      siteData,
      setSiteData,
      status,
      error,
      refreshSiteData,
      authToken,
      setAuthToken
    }),
    [siteData, status, error, authToken]
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
};

export const useSiteData = () => {
  const context = useContext(SiteDataContext);

  if (!context) {
    throw new Error("useSiteData must be used within SiteDataProvider.");
  }

  return context;
};

