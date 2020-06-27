import React, { useEffect, useState, createContext } from "react";
export const AuthContext = createContext();

export const AuthContextProvider = (props) => {
    const checkToken = () => localStorage.getItem("token") || "";
    const currentUser = () => JSON.parse(localStorage.getItem("currentUser")) || ""
    const [token, setToken] = useState(checkToken);
    const [user, setUser] = useState(currentUser)
    useEffect(() => {
        localStorage.setItem("currentUser", JSON.stringify(user))
        localStorage.setItem("token", token);
    }, [token, user]);
    return (
        <AuthContext.Provider value={[token, setToken, user, setUser]}>
            {props.children}
        </AuthContext.Provider>
    );
};
