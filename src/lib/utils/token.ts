export const getUserFromToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload;
};