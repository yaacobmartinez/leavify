import React from "react";
import {
	Typography,
	Container,
	makeStyles,
	Button,
	Paper,
	CircularProgress,
	IconButton,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Checkbox,
	FormControlLabel,
	FormHelperText,
	Snackbar,
	Card,
	CardContent,
} from "@material-ui/core";
import CustomAppBar from "./CustomAppBar";
import { AuthContext } from "../contexts/AuthContext";
import { Loyalty, Cancel, FileCopy, Save } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
	root: { padding: theme.spacing(2, 0) },
	greeting: {
		padding: theme.spacing(0, 2),
		fontSize: 30,
		fontWeight: 600,
	},
	myRequests: {
		padding: theme.spacing(0, 2),
		fontSize: 20,
		fontWeight: 500,
	},
	credits: {
		margin: theme.spacing(1, 0),
		background: "aliceblue",
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "flex-start",
		borderRadius: 10,
	},
	creditsBtn: {
		margin: theme.spacing(2, 1),
		borderRadius: 20,
		padding: theme.spacing(0.5, 3),
		textTransform: "none",
	},
	progress: {
		width: 30,
		height: 30,
		borderRadius: 50,
		padding: 5,
		background: "#ececec",
		matgin: theme.spacing(3),
	},
	totalCredits: { color: "red", fontSize: 30 },
	totalUsed: { color: "#000", fontSize: 15 },
	requests_collection: { padding: theme.spacing(2) },
	card: { background: "aliceblue" },
}));
function App() {
	const leaveTypes = [
		"Sick Leave (SL)",
		"Vacation Leave (VL)",
		"Maternity Leave (ML)",
		"Paternity Leave (PL)",
		"Bereavement Leave",
		"Solo Parent Leave",
		"Emergency Leave",
		"Birthday Leave",
	];
	const classes = useStyles();
	const [, , user] = React.useContext(AuthContext);
	const [showCredits, setShowCredits] = React.useState(false);
	const [showLeaves, setShowLeaves] = React.useState(false);
	const [myCredits, setMyCredits] = React.useState({});
	const [allRequests, setAllRequests] = React.useState([]);
	React.useEffect(() => {
		const getRequests = async () => {
			const res = await fetch(`${process.env.REACT_APP_GET_REQUEST_API}`);
			const collection = await res.json();
			if (collection.requests.length > 0) {
				let requests = collection.requests.filter(
					(r) => r.googleId === user.googleId
				);
				const all = requests.reverse();
				setAllRequests(all);
			}
		};
		getRequests();
	}, [user.googleId]);
	const toggleCredits = () => {
		setShowCredits(!showCredits);
		if (Object.keys(myCredits).length === 0) {
			getMyCredits();
		}
	};
	const toggleLeaves = () => {
		toggleCredits();
		setShowLeaves(!showLeaves);
	};
	const date = new Date();
	const hour = date.getHours();
	const monthDiff = (dateFrom, dateTo) => {
		return (
			dateTo.getFullYear() * 12 +
			dateTo.getMonth() -
			(dateFrom.getFullYear() * 12 + dateFrom.getMonth())
		);
	};
	const createCreditData = async () => {
		const start = new Date(new Date().getFullYear(), 0, 1);
		const creditsThisYear = (monthDiff(start, date) + 1) * 2;
		const data = {
			googleId: user.googleId,
			totalCredits: creditsThisYear,
			totalUsed: 0,
		};
		await fetch(`${process.env.REACT_APP_CREDITS_API}`, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		setMyCredits(data);
	};
	const getMyCredits = async () => {
		const res = await fetch(`${process.env.REACT_APP_CREDITS_API}`);
		const all = await res.json();
		const credits = all.credits.filter((c) => c.googleId === user.googleId);
		if (credits.length > 0) {
			return setMyCredits(credits[0]);
		}
		createCreditData();
	};

	// leaveForm
	const initialLeave = {
		leaveType: "",
		duration: 0,
		from: "",
		to: "",
		halfDay: false,
		reason: "",
	};
	const [leave, setLeave] = React.useState(initialLeave);
	const [errors, setErrors] = React.useState(initialLeave);
	const handleChange = (e) => {
		setErrors({ ...errors, [e.target.name]: "" });
		setLeave({ ...leave, [e.target.name]: e.target.value });
	};
	const handleCheck = (e) => {
		setLeave({ ...leave, halfDay: e.target.checked });
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		const errs = validate();
		if (Object.keys(errs).length !== 0) {
			return setErrors(errs);
		}
		const from = new Date(leave.from);
		const to = new Date(leave.to);
		let duration;
		duration = computeDaysDiff(from, to);
		if (leave.halfDay && duration === 1) {
			duration = 0.5;
		}
		const remaining = myCredits.totalCredits - duration;
		if (remaining < 0) {
			return setAlert({
				open: true,
				success: false,
				message:
					"You don't have enough leave credits. Please change the dates of your leave.",
			});
		}
		console.log(
			`Duration: ${duration}, totalCredits: ${remaining}, totalUsed: ${
				myCredits.totalUsed + duration
			}`
		);
		// update logic here
		const makeRequest = async () => {
			await fetch(`${process.env.REACT_APP_REQUESTS_API}`, {
				method: "POST",
				mode: "no-cors",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					googleId: user.googleId,
					name: user.name,
					leaveType: leave.leaveType,
					from: leave.from,
					to: leave.to,
					duration,
					halfDay: leave.halfDay,
					reason: leave.reason,
					status: "For Approval",
				}),
			});
			setAlert({
				open: true,
				success: true,
				message:
					"Your Leave Request has been filed and is waiting for an approval.",
			});
			setLeave(initialLeave);
			setShowLeaves(false);
		};
		makeRequest();
	};

	const validate = () => {
		let errs = {};
		if (!leave.leaveType) {
			errs.leaveType = "Leave Type is required.";
		}
		if (!leave.from) {
			errs.from = "Start Date is required.";
		}
		if (!leave.to) {
			errs.to = "End Date is required.";
		}
		if (!leave.reason) {
			errs.reason = "Reason is required.";
		}
		return errs;
	};
	const computeDaysDiff = (date1, date2) => {
		let total;
		const ONE_DAY = 1000 * 60 * 60 * 24;
		const differenceMs = Math.abs(date1 - date2);
		total = Math.round(differenceMs / ONE_DAY);
		let isWeekend = false;

		while (date1 < date2) {
			var day = date1.getDay();
			isWeekend = day === 6 || day === 0;
			if (isWeekend) {
				total = total - 1;
			} // return immediately if weekend found
			date1.setDate(date1.getDate() + 1);
		}
		return total + 1;
	};
	const initialAlert = { open: false, success: true, message: "" };
	const [alert, setAlert] = React.useState(initialAlert);
	const closeAlert = () => {
		setAlert(initialAlert);
	};

	const formatDate = (date) => {
		const options = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parseDate = new Date(date);
		return parseDate.toLocaleDateString("en-US", options);
	};
	return (
		<div>
			<Snackbar
				open={alert.open}
				autoHideDuration={7000}
				onClose={closeAlert}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}>
				<Alert
					onClose={closeAlert}
					severity={alert.success ? "success" : "error"}
					elevation={6}
					variant='filled'>
					{alert.message}
				</Alert>
			</Snackbar>
			<CustomAppBar />
			<Container maxWidth='md' className={classes.root}>
				<Typography className={classes.greeting}>
					<span role='img' aria-label='wave'>
						👋
					</span>
					Good{" "}
					{hour < 12
						? `Morning, ${user.givenName}`
						: hour < 18
						? `Afternoon, ${user.givenName}`
						: `Evening, ${user.givenName}`}
				</Typography>
				<Button
					disabled={showCredits}
					onClick={toggleCredits}
					variant='contained'
					className={classes.creditsBtn}
					startIcon={<Loyalty />}
					color='primary'>
					My Credits
				</Button>
				<Button
					disabled={showLeaves}
					onClick={toggleLeaves}
					variant='contained'
					className={classes.creditsBtn}
					startIcon={<FileCopy />}
					color='secondary'>
					File a Leave
				</Button>
				{showCredits && (
					<>
						{myCredits.googleId ? (
							<div className={classes.credits}>
								<div style={{ flex: 1 }}>
									<Typography variant='h6'>
										You have a total of{" "}
										<span className={classes.totalCredits}>
											{myCredits.totalCredits}{" "}
										</span>
										leave credits remaining.
									</Typography>
									<Typography variant='body2' color='textSecondary'>
										You have already used{" "}
										<span className={classes.totalUsed}>
											{myCredits.totalUsed}.
										</span>
									</Typography>
								</div>
								<IconButton disableRipple onClick={toggleCredits}>
									<Cancel />
								</IconButton>
							</div>
						) : (
							<Paper className={classes.progress}>
								<CircularProgress size={30} />
							</Paper>
						)}
					</>
				)}
				{showLeaves && (
					<>
						<div className={classes.credits}>
							<div style={{ flex: 1 }}>
								<Typography variant='h6'>File a Leave</Typography>
								<Typography variant='body2' color='textSecondary'>
									Fill in all the details to file a leave.
								</Typography>
							</div>
							<IconButton disableRipple onClick={toggleLeaves}>
								<Cancel />
							</IconButton>
						</div>
						<div className={classes.credits}>
							<Grid
								container
								spacing={2}
								component='form'
								onSubmit={handleSubmit}>
								<Grid item xs={12}>
									<FormControl fullWidth variant='outlined'>
										<InputLabel>Leave Type*</InputLabel>
										<Select
											error={Boolean(errors.leaveType)}
											value={leave.leaveType}
											name='leaveType'
											onChange={handleChange}
											label='Leave Type*'>
											<MenuItem value=''>
												<em>None</em>
											</MenuItem>
											{leaveTypes.map((leave) => (
												<MenuItem key={leave} value={leave}>
													{leave}
												</MenuItem>
											))}
										</Select>
										<FormHelperText style={{ color: "red" }}>
											{errors.leaveType ? errors.leaveType : null}
										</FormHelperText>
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										error={Boolean(errors.from)}
										helperText={errors.from ? errors.from : null}
										fullWidth
										name='from'
										label='From*'
										type='date'
										value={leave.from}
										onChange={handleChange}
										variant='outlined'
										InputLabelProps={{
											shrink: true,
										}}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										error={Boolean(errors.to)}
										helperText={errors.to ? errors.to : null}
										fullWidth
										name='to'
										label='To*'
										type='date'
										value={leave.to}
										onChange={handleChange}
										variant='outlined'
										InputLabelProps={{
											shrink: true,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<FormControlLabel
										value='end'
										control={
											<Checkbox
												color='primary'
												onChange={handleCheck}
												checked={leave.halfDay}
											/>
										}
										label='Half Day'
										labelPlacement='end'
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										error={Boolean(errors.reason)}
										helperText={errors.reason ? errors.reason : null}
										fullWidth
										label='Reason*'
										multiline
										rows={4}
										value={leave.reason}
										onChange={handleChange}
										name='reason'
										variant='outlined'
									/>
									<Typography variant='caption' color='textSecondary'>
										Fields with * are required.
									</Typography>
								</Grid>
								<Grid
									item
									xs={12}
									style={{ display: "flex", justifyContent: "space-between" }}>
									<Button
										className={classes.creditsBtn}
										variant='outlined'
										color='primary'
										startIcon={<Cancel />}
										onClick={() => {
											setLeave(initialLeave);
											toggleLeaves();
										}}>
										Cancel
									</Button>
									<Button
										type='submit'
										className={classes.creditsBtn}
										variant='contained'
										color='primary'
										startIcon={<Save />}>
										Submit
									</Button>
								</Grid>
							</Grid>
						</div>
					</>
				)}

				<Typography className={classes.myRequests}>
					My Leave Requests
				</Typography>
				<div className={classes.requests_collection}>
					<Grid container spacing={1}>
						{allRequests ? (
							allRequests.map((_) => (
								<Grid item xs={12} sm={6} key={_.from}>
									<Card className={classes.card}>
										<CardContent>
											<Typography variant='h6'>{_.leaveType}</Typography>
											<Typography variant='body2'>
												From:{" "}
												<span color='textSecondary'>{formatDate(_.from)}</span>
											</Typography>
											<Typography variant='body2'>
												To:{" "}
												<span color='textSecondary'>{formatDate(_.to)}</span>
											</Typography>

											{_.halfDay ? (
												<Typography variant='body2'>--Half Day--</Typography>
											) : null}

											<Typography variant='body2'>
												Reason: <span color='textSecondary'>{_.reason}</span>
											</Typography>
											<Typography variant='body2'>
												Status: <span color='textSecondary'>{_.status}</span>
											</Typography>
										</CardContent>
									</Card>
								</Grid>
							))
						) : (
							<Typography variant='body2' color='textSecondary'>
								You haven't filed a leave request yet!
							</Typography>
						)}
					</Grid>
				</div>
			</Container>
		</div>
	);
}

export default App;
