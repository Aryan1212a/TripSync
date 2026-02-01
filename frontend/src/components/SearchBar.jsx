
import React from "react";
import { Paper, InputBase, IconButton, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { motion } from "framer-motion";

export default function SearchBar({onSearch}){
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
      <Paper sx={{ display:"flex", gap:1, p:1.5, borderRadius:3, width:{xs:"95%", md:"800px"}, mx:"auto", boxShadow:3 }}>
        <IconButton><LocationOnIcon/></IconButton>
        <InputBase placeholder="Where are you going?" sx={{flex:1}} />
        <IconButton><CalendarTodayIcon/></IconButton>
        <IconButton color="primary" onClick={onSearch}><SearchIcon/></IconButton>
      </Paper>
    </motion.div>
  );
}
