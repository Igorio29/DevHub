import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GitlabCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userParam = params.get("user");

        const user = userParam ? JSON.parse(userParam) : null;

        if (token && user) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    }, []);

    return <p>Logando...</p>;
}