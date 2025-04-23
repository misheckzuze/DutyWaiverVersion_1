export class AuthenticatedUser {
  static getUserDetails() {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem("authData");
      console.log("[AuthenticatedUser] Raw localStorage authData:", authData);
      
      try {
        const parsedData = authData ? JSON.parse(authData) : null;
        console.log("[AuthenticatedUser] Parsed user details:", parsedData);
        return parsedData;
      } catch (error) {
        console.error("[AuthenticatedUser] Error parsing authData:", error);
        return null;
      }
    }

    console.warn("[AuthenticatedUser] window is undefined – likely running on server side");
    return null;
  }

  static getToken() {
    const authData = this.getUserDetails();
    const token = authData ? authData.token : null;
    console.log("[AuthenticatedUser] Extracted token:", token);
    return token;
  }

  static isAuthenticated() {
    const isAuth = !!this.getToken();
    console.log("[AuthenticatedUser] Is authenticated:", isAuth);
    return isAuth;
  }
}
