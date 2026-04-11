export async function getProjects(token, type = "membership") {
  const response = await fetch(`http://localhost:8000/api/projects?type=${type}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error("Erro ao buscar projetos")
  }

  return response.json()
}