import { useCallback, useEffect, useState } from "react";

const getErrorMessage = (error) => (
  error?.response?.data?.message
  || error?.message
  || "Something went wrong"
);

const useAsync = (asyncFn, deps = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, setData, loading, error, execute };
};

export { getErrorMessage, useAsync };
