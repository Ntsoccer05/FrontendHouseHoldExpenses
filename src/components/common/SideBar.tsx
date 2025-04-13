import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from "@mui/material";
import React, { CSSProperties, useEffect, useState } from "react";

import HomeIcon from "@mui/icons-material/Home";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import { NavLink } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ModalComponent from "./ModalComponent";
import CategoryIcon from "@mui/icons-material/Category";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthContext } from "../../context/AuthContext";

interface SidebarProps {
    drawerWidth: number;
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
}

interface menuItem {
    text: string;
    path: string;
    icon: React.ComponentType;
}

const Sidebar = ({
    drawerWidth,
    mobileOpen,
    handleDrawerToggle,
}: SidebarProps) => {
    const { logout, isAuthenticated, fetchLoginUserLoading } = useAuthContext()

    const MenuItems: menuItem[] = [
        { text: "トップ", path: "/", icon: HomeIcon },
        { text: "レポート", path: "/report", icon: EqualizerIcon },
        { text: "カテゴリ編集", path: "/category", icon: CategoryIcon },
    ];

    const LogoutItems = [{ text: "ログアウト", icon: LockOutlinedIcon }];

    const NotLoginMenuItems: menuItem[] = [
        { text: "ログイン", path: "/login", icon: MeetingRoomIcon },
        { text: "サインイン", path: "/register", icon: LockOpenIcon },
    ];

    const [menuItems, setMenuItems] = useState<menuItem[]>([
        { text: "", path: "", icon: HomeIcon },
    ]);

    const objToArray = (obj: menuItem[]) => {
        return Object.values(obj);
    };
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMainMessage, setModalMainMessage] = useState<string>("");
    const [modalMessage, setModalMessage] = useState<string>("");
    const [modalOption, setModalOption] = useState<number>(0);

    useEffect(() => {
        if(!fetchLoginUserLoading) {
            if (isAuthenticated) {
                setMenuItems((beforeData) => {
                    const menusList = MenuItems;
                    return objToArray(menusList);
                });
            } else {
                setMenuItems((beforeData) => {
                    const menusList = NotLoginMenuItems;
                    return objToArray(menusList);
                });
            }
        }else{
            setMenuItems([]);
        }
    }, [isAuthenticated, fetchLoginUserLoading]);

    const baseLinkStyle: CSSProperties = {
        textDecoration: "none",
        color: "inherit",
        display: "block",
    };

    const activeLinkStyle: CSSProperties = {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
    };

    const clickLogout = () => {
        setShowModal(true);
        setModalMainMessage("ログアウト");
        setModalMessage("ログアウトしますか？");
        setModalOption(1);
    };

    const handleLogout = async () => {
        try{
            await logout();
            setModalMainMessage("ログアウト完了");
            setModalMessage("ログアウトしました");
            setModalOption(0);
        }catch(error) {
            handleCloseModal();
        }
    };

    const handleCloseModal: () => void = () => {
        setShowModal(false);
    };

    const drawer = (
        <div>
            {mobileOpen && (
                <IconButton
                    onClick={handleDrawerToggle}
                    sx={{ float: "right", paddingTop: "20px" }} // ✖ボタンを右端に配置
                >
                    <CloseIcon />
                </IconButton>
            )}
            <Toolbar />
            <Divider />
            <List>
                {menuItems.map((item, index) => (
                    <NavLink
                        key={item.text}
                        to={item.path}
                        style={({ isActive }) => {
                            return {
                                ...baseLinkStyle,
                                ...(isActive ? activeLinkStyle : {}),
                            };
                        }}
                    >
                        <ListItem key={index} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <item.icon />
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    </NavLink>
                ))}
                {isAuthenticated &&
                    LogoutItems.map((item, index) => (
                        <NavLink
                            key={item.text}
                            onClick={clickLogout}
                            to=""
                            style={({ isActive }) => {
                                return {
                                    ...baseLinkStyle,
                                };
                            }}
                        >
                            <ListItem key={index} disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <item.icon />
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        </NavLink>
                    ))}
            </List>
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            aria-label="mailbox folders"
        >
            {/* モバイル用 */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                onClick={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* PC用 */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
            <ModalComponent
                showModal={showModal}
                mainMessage={modalMainMessage}
                contentMessage={modalMessage}
                modalOption={modalOption}
                handleCloseModal={handleCloseModal}
                handleFunc={handleLogout}
            />
        </Box>
    );
};

export default Sidebar;
