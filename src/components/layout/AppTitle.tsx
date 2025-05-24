import { Avatar, Box, Typography } from "@mui/material";

interface AppTitleProps {
    title: string;
    icon?: JSX.Element;
    src?: string;
    alt?: string
}
function AppTitle({ title, icon, src, alt }: AppTitleProps) {
    return (
        <Box>
            <Typography
                variant="h5"
                component="h1"
                sx={
                    icon
                        ? { cursor: "default", mb: 0 }
                        : { cursor: "default", mb: src ? 2 : 5 }
                }
            >
                {title}
            </Typography>
            {src && (
                <img src={src} alt={alt} style={{
                        display: "flex",
                        justifyContent: "center",
                        margin: "0 auto",
                        marginBottom: 5,
                    }}></img>
            )}
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
