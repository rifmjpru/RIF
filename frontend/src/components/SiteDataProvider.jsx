import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { createSiteFallbackData } from "../data/siteFallbackData.js";

const SiteDataContext = createContext(null);
const siteDataCacheKey = "rif-site-data-cache";

const readCachedSiteData = () => {
  try {
    const storedValue = window.localStorage.getItem(siteDataCacheKey);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
  } catch (error) {
    return null;
  }
};

export const SiteDataProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(() => readCachedSiteData() || createSiteFallbackData());
  const [status, setStatus] = useState("ready");
  const [error, setError] = useState("");
  const [contentSource, setContentSource] = useState(() => (readCachedSiteData() ? "cache" : "fallback"));
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem("rif-admin-token") || "");

  const refreshSiteData = async () => {
    try {
      const data = await api.getSiteData();
      setSiteData(data);
      setContentSource("live");
      setError("");
      setStatus("ready");
    } catch (requestError) {
      const cachedData = readCachedSiteData();

      if (cachedData) {
        setSiteData(cachedData);
        setContentSource("cache");
      } else {
        setSiteData(createSiteFallbackData());
        setContentSource("fallback");
      }

      setError(requestError.message);
      setStatus("ready");
    }
  };

  useEffect(() => {
    refreshSiteData();
  }, []);

  useEffect(() => {
    if (contentSource !== "live" || !siteData) {
      return;
    }

    try {
      window.localStorage.setItem(siteDataCacheKey, JSON.stringify(siteData));
    } catch (error) {
      // Ignore storage errors and continue using in-memory data.
    }
  }, [contentSource, siteData]);

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
      contentSource,
      refreshSiteData,
      authToken,
      setAuthToken
    }),
    [siteData, status, error, contentSource, authToken]
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
