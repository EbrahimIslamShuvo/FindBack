export const saveAuthData = (
  token,
  user
) => {

  localStorage.setItem(
    "findback_token",
    token
  );

  localStorage.setItem(
    "findback_user",
    JSON.stringify(user)
  );
};


export const getToken = () => {

  return localStorage.getItem(
    "findback_token"
  );
};


export const getCurrentUser =
  () => {

    const user =
      localStorage.getItem(
        "findback_user"
      );

    return user
      ? JSON.parse(user)
      : null;
  };


export const logout = () => {

  localStorage.removeItem(
    "findback_token"
  );

  localStorage.removeItem(
    "findback_user"
  );
};


export const isLoggedIn =
  () => {

    return Boolean(
      localStorage.getItem(
        "findback_token"
      )
    );
  };