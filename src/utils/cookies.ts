export const getUserCookie = (): string | null => {
  // replace 'fern_user_cookie' with the actual cookie name once implemented
  const cookieName = 'fern_user_cookie';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return value;
    }
  }
  return null;
};


