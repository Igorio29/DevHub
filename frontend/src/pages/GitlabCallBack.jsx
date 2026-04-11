import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GitlabCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)

        const token = params.get("token")
        const user = params.get("user")

        if (token && user) {
            const parsedUser = JSON.parse(user)

            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(parsedUser))

            navigate("/dashboard")
        } else {
            navigate("/login")
        }
    }, []);

    return <p>Logando...</p>;
}