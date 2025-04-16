export class AuthenticatedUser {
  static getUserDetails() {
    // const authData = localStorage.getItem("authData");
    // return authData ? JSON.parse(authData) : null;

      // Check if window is defined (client-side)
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem("authData");
        return authData ? JSON.parse(authData) : null;
      }
      return null;
  }

  static getToken() {
    const authData = this.getUserDetails();
    return authData ? authData.token : null;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}