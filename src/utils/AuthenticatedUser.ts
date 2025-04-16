export class AuthenticatedUser {
  static getUserDetails() {
    const authData = localStorage.getItem("authData");
    return authData ? JSON.parse(authData) : null;
  }

  static getToken() {
    const authData = this.getUserDetails();
    return authData ? authData.token : null;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}