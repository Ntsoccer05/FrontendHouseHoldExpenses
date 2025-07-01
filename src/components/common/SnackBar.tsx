import React from "react";
import { Box, Snackbar, SnackbarContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { SnackBarState } from "../../types";

interface SnackBarProps {
  snackBarState: SnackBarState;
  setSnackBarState: React.Dispatch<React.SetStateAction<SnackBarState>>;
}

const SnackBar: React.FC<SnackBarProps> = ({
  snackBarState,
  setSnackBarState,
}) => {
  const {
    open,
    vertical,
    horizontal,
    title,
    bodyText,
    backgroundColor,
    autoHideDuration,
  } = snackBarState;

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackBarState((prev) => ({ ...prev, open: false }));
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      anchorOrigin={{ vertical, horizontal }}
      open={open}
      autoHideDuration={autoHideDuration ?? 3000}
      onClose={handleClose}
      key={`${vertical}-${horizontal}`}
    >
      <SnackbarContent
        sx={{
          backgroundColor: backgroundColor || "#1976d2",
          color: "#fff",
          minWidth: "320px",
          maxWidth: "500px",
          wordBreak: "break-word"
        }}
        message={
          <Box>
            {title && (
              <Box component="div" sx={{ fontWeight: "bold", mb: 0.5 }}>
                {title}
              </Box>
            )}
            {bodyText && (
              <Box component="div" sx={{ fontSize: "0.875rem" }}>
                {bodyText}
              </Box>
            )}
          </Box>
        }
        action={action}
      />
    </Snackbar>
  );
};

export default SnackBar;