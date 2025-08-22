export class TokenHelper {

  static hasAiFeature(): boolean {
    return true;
  //   try {
  //     const userData = localStorage.getItem('USER_DATA') || sessionStorage.getItem('USER_DATA');
  //     if (!userData) return false;
  //
  //     const data = JSON.parse(userData);
  //     if (!data.token) return false;
  //
  //     const payload = JSON.parse(atob(data.token.split('.')[1]));
  //
  //     return payload.hasAiFeature === true;
  //   } catch {
  //     return false;
  //   }
  }
}
