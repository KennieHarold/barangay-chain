"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  AdminPanelSettings,
  Engineering,
  Person,
  PersonOutline,
  ElectricBoltOutlined,
} from "@mui/icons-material";

import { shortenAddress } from "@/utils/format";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/models";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { role } = useUserRole(address);
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    if (!isConnected) {
      connect({ connector: injected() });
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isConnected) {
      setAnchorEl(event.currentTarget);
    } else {
      handleConnect();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    disconnect();
    handleClose();
  };

  const getRoleIcon = (role: UserRole) => {
    const iconProps = { sx: { mr: 1, fontSize: 20 } };

    switch (role) {
      case UserRole.Admin:
        return <ElectricBoltOutlined {...iconProps} />;
      case UserRole.Official:
        return <AdminPanelSettings {...iconProps} />;
      case UserRole.Contractor:
        return <Engineering {...iconProps} />;
      case UserRole.Citizen:
        return <Person {...iconProps} />;
      case UserRole.Guest:
      default:
        return <PersonOutline {...iconProps} />;
    }
  };

  return mounted ? (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent" variant="outlined">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
            fontWeight="bold"
          >
            Barangay Chain
          </Typography>
          <Button
            color="inherit"
            onClick={handleClick}
            sx={{
              borderRadius: "20px",
              paddingLeft: "1em",
              paddingRight: "1em",
              display: "flex",
              alignItems: "center",
            }}
          >
            {isConnected ? (
              <>
                {getRoleIcon(role)}
                <Typography
                  component="div"
                  variant="button"
                  style={{ textTransform: "lowercase" }}
                >
                  {shortenAddress(address || "0x")}
                </Typography>
              </>
            ) : (
              <Typography
                component="div"
                variant="button"
                style={{ textTransform: "capitalize" }}
              >
                Connect Wallet
              </Typography>
            )}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleLogout}>
              <Typography
                component="div"
                variant="button"
                style={{ textTransform: "capitalize" }}
              >
                Disconnect
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  ) : (
    <></>
  );
}
