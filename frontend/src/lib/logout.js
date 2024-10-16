export const logout = async (user) => {
  if (user) {
    localStorage.removeItem('user')
  }
  const response = await fetch('/user/logout', {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  window.dispatchEvent(new Event('authStateChanged'));
  window.location.reload()
};
