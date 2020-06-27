import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@material-ui/core'
import { MoreVert } from '@material-ui/icons'
function CustomAppBar() {
    const [menu, setMenu] = React.useState(null)
    const handleOpen = (e) => {
        setMenu(e.currentTarget)
    }
    const handleClose = () => {
        setMenu(null)
    }
    const handleLogout = () => {
        localStorage.clear()
        window.location.replace('/')
    }
    return (
        <>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Typography variant="h6" style={{ flex: 1 }}>Leavify</Typography>
                    <IconButton onClick={handleOpen}>
                        <MoreVert style={{ color: "#fff" }} />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Menu anchorEl={menu} keepMounted open={Boolean(menu)} onClose={handleClose}>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    )
}

export default CustomAppBar
