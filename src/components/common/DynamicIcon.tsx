import { memo } from "react";
import AlarmIcon from "@mui/icons-material/Alarm";
import AddHomeIcon from "@mui/icons-material/AddHome";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import TrainIcon from "@mui/icons-material/Train";
import WorkIcon from "@mui/icons-material/Work";
import SavingsIcon from "@mui/icons-material/Savings";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import FlightIcon from "@mui/icons-material/Flight";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CommuteIcon from "@mui/icons-material/Commute";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SchoolIcon from "@mui/icons-material/School";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const Icons = {
    AlarmIcon,
    AddHomeIcon,
    Diversity3Icon,
    SportsTennisIcon,
    TrainIcon,
    WorkIcon,
    SavingsIcon,
    AddBusinessIcon,
    FastfoodIcon,
    FlightIcon,
    RestaurantIcon,
    CommuteIcon,
    LocalHospitalIcon,
    SchoolIcon,
    LocalGroceryStoreIcon,
    MonetizationOnIcon,
    AccountBalanceIcon,
    AccountBalanceWalletIcon,
    AttachMoneyIcon,
    TrendingUpIcon,
};

const DynamicIcon = memo(
    ({
        iconName,
        fontSize,
        ...props
    }: {
        iconName: string;
        fontSize?: "small" | "medium" | "large" | "inherit" | "default";
    }) => {
        try {
            if (iconName) {
                FastfoodIcon;
                const IconComponent = Icons[`${iconName}Icon`] || null;

                if (!IconComponent) {
                    return null;
                }

                return <IconComponent {...props} />;
            } else {
                return;
            }
        } catch (err) {
            console.log("An error occurred");
        }
    }
);

export default DynamicIcon;
