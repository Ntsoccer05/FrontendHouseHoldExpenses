import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingProps = {
    loadingTxt: string;
    loadingColor:
        | "inherit"
        | "primary"
        | "secondary"
        | "error"
        | "info"
        | "success"
        | "warning";
};

const Loading = (props: LoadingProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "#f5f5f5", // 任意の背景色
            }}
        >
            <CircularProgress color={props.loadingColor} />
            <Typography variant="h6" sx={{ mt: 2 }}>
                {props.loadingTxt}
            </Typography>
        </Box>
    );
};

export default Loading;
