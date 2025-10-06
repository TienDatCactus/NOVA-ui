import { useCallback, useEffect, useState } from "react";

function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const sendRequest = useCallback(() => {
    try {
      setLoading(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {}, []);
  return { sendRequest, sendRequestLoading: loading };
}

function useLogin() {
  const [loading, setLoading] = useState(false);
  const login = useCallback(() => {
    try {
      setLoading(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);
  return { login, loginLoading: loading };
}

export { useForgotPassword, useLogin };
