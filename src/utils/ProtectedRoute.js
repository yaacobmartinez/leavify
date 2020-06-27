import React from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
export const ProtectedRoute = ({ component: Component, ...rest }) => {
    const [token] = React.useContext(AuthContext);
    return (
        <Route
            {...rest}
            render={(props) => {
                if (token) {
                    return <Component {...props} />;
                } else {
                    return (
                        <Redirect
                            to={{
                                pathname: "/",
                                state: {
                                    from: props.location,
                                },
                            }}
                        />
                    );
                }
            }}
        />
    );
};
