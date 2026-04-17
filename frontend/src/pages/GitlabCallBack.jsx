import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GitlabCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const searchParams = new URLSearchParams(window.location.search);

        const token = hashParams.get("token") || searchParams.get("token");
        const user = hashParams.get("user") || searchParams.get("user");

        if (token && user) {
            const parsedUser = JSON.parse(user);

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(parsedUser));
            window.history.replaceState({}, document.title, window.location.pathname);

            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return <p>Logando...</p>;
}
