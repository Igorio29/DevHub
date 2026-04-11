export async function getProjects(token, type = "membership") {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects?type=${type}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error("Erro ao buscar projetos")
  }

  return response.json()
}