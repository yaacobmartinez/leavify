import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, createMuiTheme } from "@material-ui/core";
import Login from './components/Login'
import Home from './components/App'
import { AuthContextProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './utils/ProtectedRoute';
const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Poppins",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
});


function App() {
  return (
    <div>
      <Router>
        <ThemeProvider theme={theme}>
          <AuthContextProvider>
            <Switch>
              <Route exact path="/" component={Login} />
              <ProtectedRoute exact path="/app" component={Home} />
            </Switch>
          </AuthContextProvider>
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;
