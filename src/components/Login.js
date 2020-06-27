import React from "react";
import {
	Typography,
	Container,
	makeStyles,
	Backdrop,
	CircularProgress,
} from "@material-ui/core";
import GoogleLogin from "react-google-login";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(10, 2),
		textAlign: "center",
	},
	title: {
		fontSize: 40,
		fontWeight: 600,
	},
	backdrop: {
		zIndex: theme.zIndex.appBar + 2,
	},
}));
function Login() {
	const router = useHistory();
	const [token, setToken, , setUser] = React.useContext(AuthContext);
	if (token) {
		router.push("/app");
	}
	const classes = useStyles();
	const [loading, setLoading] = React.useState(false);
	const responseGoogle = (res) => {
		if (res.error) {
			return console.log(res);
		}
		setLoading(true);
		try {
			const saveLogin = async () => {
				await fetch(`${process.env.REACT_APP_USERS_API}`, {
					method: "POST",
					mode: "no-cors",
					headers: {
						"Content-Type": "application/json",
					},
					redirect: "follow",
					body: JSON.stringify(res.profileObj),
				});
				setUser(res.profileObj);
				setToken(res.profileObj.googleId);
				// return router.push('/app')
			};

			const login = async () => {
				const checkUser = await fetch(`${process.env.REACT_APP_USERS_API}`);
				const allUsers = await checkUser.json();
				const users = allUsers.users;

				const userExists = users.filter(
					(u) => u.googleId === res.profileObj.googleId
				);
				if (userExists.length < 1) {
					console.log("User not yet registered");
					return saveLogin();
				}
				setUser(userExists[0]);
				setToken(userExists[0].googleId);
				// router.push('/app')
			};
			login();
		} catch (error) {
			console.error(error);
		}
	};
	return (
		<div>
			<Backdrop open={loading} className={classes.backdrop}>
				<CircularProgress color='inherit' />
			</Backdrop>
			<Container maxWidth='sm' className={classes.root}>
				<Typography className={classes.title}>Leavify</Typography>
				<GoogleLogin
					clientId={process.env.REACT_APP_CLIENT_ID}
					buttonText='Sign in with Google'
					onSuccess={responseGoogle}
					onFailure={responseGoogle}
					cookiePolicy={"single_host_origin"}
				/>
			</Container>
		</div>
	);
}

export default Login;
