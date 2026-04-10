export async function login(email, password) {
  const response = await fetch("http://127.0.0.1:8000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  let data = {}

  try {
    data = await response.json()
  } catch { }

  if (!response.ok) {
    throw new Error(data.message || "Erro no login")
  }

  if (!data.token) {
    throw new Error("Token não recebido")
  }

  const dataUser = await response.json();

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(dataUser.user));

  return {
    token: data.token,
    user: data.user ?? null
  }
}