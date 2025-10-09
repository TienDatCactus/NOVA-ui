import { useCallback, useEffect, useState } from "react";

function useAuth() {
  function login() {}
  function logout() {}
  function changePassword() {}
  function verifyOTP() {}

  return {
    login,
    logout,
    changePassword,
    verifyOTP,
  };
}

export default useAuth;
