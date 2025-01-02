export const getCookieValue = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};
export const includeTest = () => {
  const isTestCookieValue = getCookieValue('includeTest');
  return isTestCookieValue === 'true';
};

export const setLocalStorage = (role, userId, isLoggedIn) => {
  localStorage.setItem('Role', role);
  localStorage.setItem('userId', userId);
  localStorage.setItem('isLoggedIn', String(isLoggedIn));
};
