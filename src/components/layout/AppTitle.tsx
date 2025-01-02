import { Avatar, Box, IconButton, Typography } from "@mui/material";
import React from "react";

interface AppTitleProps {
    title: string;
    icon?: JSX.Element;
}
function AppTitle({ title, icon }: AppTitleProps) {
    return (
        <Box>
            <Typography
                variant="h5"
                component="h1"
                sx={
                    icon
                        ? { cursor: "default", mb: 0 }
                        : { cursor: "default", mb: 5 }
                }
            >
                {title}
            </Typography>
            {icon && (
                <Avatar
                    sx={{
                        margin: "8px auto",
                        bgcolor: "secondary.main",
                        mb: 5,
                    }}
                >
                    {icon}
                </Avatar>
            )}
        </Box>
    );
}

export default AppTitle;
