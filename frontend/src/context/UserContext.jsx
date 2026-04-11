import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import api from "../services/api"

const UserContext = createContext()

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    async function fetchUser() {
        const token = localStorage.getItem("token")

        if (!token) {
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const res = await api.get("/user")
            setUser(res.data)
        } catch (err) {
            if (err.response?.status === 401) {
                setUser(null)
            } else {
                console.error(err)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser, fetchUser, loading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    return useContext(UserContext)
}