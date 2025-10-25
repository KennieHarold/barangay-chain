"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  ElectricBoltOutlined,
  GavelOutlined,
  BadgeOutlined,
  PersonOutlined,
  BuildOutlined,
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
        return <GavelOutlined {...iconProps} />;
      case UserRole.Contractor:
        return <BuildOutlined {...iconProps} />;
      case UserRole.Citizen:
        return <BadgeOutlined {...iconProps} />;
      case UserRole.Guest:
      default:
        return <PersonOutlined {...iconProps} />;
    }
  };

  const getNavItems = () => {
    const items = [];
    items.push({
      label: "Registered Contractors",
      href: "/contractors",
    });

    if (role === UserRole.Official) {
      items.push(
        {
          label: "Create Project",
          href: "/projects/create",
        },
        {
          label: "Manage Contractor",
          href: "/contractors/manage",
        },
        {
          label: "Issue Citizen ID",
          href: "/citizens/issue",
        }
      );
    }

    return items;
  };

  return mounted ? (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        color="transparent"
        variant="outlined"
        sx={{ borderRadius: 0 }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" fontWeight="bold">
            <Link href={"/"}>BarangayChain</Link>
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", ml: 4, gap: 1 }}>
            {isConnected &&
              getNavItems().map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color="inherit"
                  sx={{ textTransform: "none" }}
                >
                  {item.label}
                </Button>
              ))}
          </Box>

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
