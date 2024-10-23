
export const logout = async (user, queryClient) => {

  if (user) {
    localStorage.removeItem('user')
  }
  const response = await fetch('/user/logout', {
    method: 'GET',
    credentials: 'include'
  });
  queryClient.clear()
  document.cookie = "jwt=; Max-Age=0; path=/;";
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  window.dispatchEvent(new Event('authStateChanged'));
  window.location.reload();
};