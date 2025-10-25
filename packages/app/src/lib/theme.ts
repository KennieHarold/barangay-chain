import { createTheme } from "@mui/material/styles";

const neoBrutColors = {
  primary: "#000000",
  secondary: "#FFC107",
  accent: "#6BCB77",
  error: "#FF6B6B",
  warning: "#FF8C42",
  info: "#4D96FF",
  success: "#6BCB77",
  background: "#FFF8F3",
  surface: "#FFFFFF",
  surfaceBlue: "#E8F4FD",
  surfaceGreen: "#E8F8F0",
  surfaceYellow: "#FFF9E6",
  surfaceOrange: "#FFE8D9",
  surfacePink: "#FFE8EE",
  border: "#000000",
};

export const neoBrutTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: neoBrutColors.primary,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: neoBrutColors.secondary,
      contrastText: "#000000",
    },
    error: {
      main: neoBrutColors.error,
      contrastText: "#FFFFFF",
    },
    warning: {
      main: neoBrutColors.warning,
      contrastText: "#FFFFFF",
    },
    info: {
      main: neoBrutColors.info,
      contrastText: "#000000",
    },
    success: {
      main: neoBrutColors.success,
      contrastText: "#000000",
    },
    background: {
      default: neoBrutColors.background,
      paper: neoBrutColors.surface,
    },
    divider: neoBrutColors.border,
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: "3rem",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.5rem",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 700,
      fontSize: "2rem",
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 700,
      fontSize: "1.75rem",
    },
    h5: {
      fontWeight: 700,
      fontSize: "1.5rem",
    },
    h6: {
      fontWeight: 700,
      fontSize: "1.25rem",
    },
    button: {
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "4px 4px 0px #000000",
    "6px 6px 0px #000000",
    "8px 8px 0px #000000",
    "10px 10px 0px #000000",
    "12px 12px 0px #000000",
    "14px 14px 0px #000000",
    "16px 16px 0px #000000",
    "18px 18px 0px #000000",
    "20px 20px 0px #000000",
    "22px 22px 0px #000000",
    "24px 24px 0px #000000",
    "26px 26px 0px #000000",
    "28px 28px 0px #000000",
    "30px 30px 0px #000000",
    "32px 32px 0px #000000",
    "34px 34px 0px #000000",
    "36px 36px 0px #000000",
    "38px 38px 0px #000000",
    "40px 40px 0px #000000",
    "42px 42px 0px #000000",
    "44px 44px 0px #000000",
    "46px 46px 0px #000000",
    "48px 48px 0px #000000",
    "50px 50px 0px #000000",
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: `3px solid ${neoBrutColors.border}`,
          borderRadius: 16,
          boxShadow: "6px 6px 0px #000000",
          transition: "transform 0.1s ease, box-shadow 0.1s ease",
          "&:hover": {
            transform: "translate(-2px, -2px)",
            boxShadow: "8px 8px 0px #000000",
          },
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `3px solid ${neoBrutColors.border}`,
          borderRadius: 16,
          boxShadow: "6px 6px 0px #000000",
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: `3px solid ${neoBrutColors.border}`,
          borderRadius: 12,
          boxShadow: "4px 4px 0px #000000",
          transition: "transform 0.1s ease, box-shadow 0.1s ease",
          "&:hover": {
            transform: "translate(-2px, -2px)",
            boxShadow: "6px 6px 0px #000000",
          },
          "&:active": {
            transform: "translate(2px, 2px)",
            boxShadow: "2px 2px 0px #000000",
          },
        },
        contained: {
          backgroundColor: neoBrutColors.secondary,
          color: "#000000",
          "&:hover": {
            backgroundColor: neoBrutColors.secondary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: `2px solid ${neoBrutColors.border}`,
          fontWeight: 700,
          borderRadius: 8,
        },
        colorDefault: {
          backgroundColor: neoBrutColors.secondary,
          color: "#000000",
        },
        colorPrimary: {
          backgroundColor: neoBrutColors.info,
          color: "#FFFFFF",
        },
        colorSuccess: {
          backgroundColor: neoBrutColors.success,
          color: "#FFFFFF",
        },
        colorWarning: {
          backgroundColor: neoBrutColors.warning,
          color: "#FFFFFF",
        },
        colorError: {
          backgroundColor: neoBrutColors.error,
          color: "#FFFFFF",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
            "& fieldset": {
              border: `3px solid ${neoBrutColors.border}`,
              borderRadius: 12,
            },
            "&:hover fieldset": {
              border: `3px solid ${neoBrutColors.border}`,
            },
            "&.Mui-focused fieldset": {
              border: `3px solid ${neoBrutColors.border}`,
              boxShadow: "4px 4px 0px #000000",
            },
          },
          "& .MuiInputLabel-root": {
            fontWeight: 600,
            color: "#000000",
            "&.Mui-focused": {
              fontWeight: 700,
              color: "#000000",
            },
          },
        },
      },
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: 12,
          },
        },
        notchedOutline: {
          borderRadius: 12,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          "&.Mui-focused": {
            fontWeight: 700,
          },
        },
        outlined: {
          "&.MuiInputLabel-shrink": {
            transform: "translate(14px, -9px) scale(0.75)",
            backgroundColor: "#FFFFFF",
            padding: "0 8px",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `3px solid ${neoBrutColors.border}`,
          boxShadow: "12px 12px 0px #000000",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          border: `2px solid ${neoBrutColors.border}`,
          borderRadius: 8,
          height: 12,
        },
      },
    },
  },
});
