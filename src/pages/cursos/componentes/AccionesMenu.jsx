import { useState } from "react";
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText 
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

// ✅ Nuevo componente
function AccionesMenu({ fila, onEliminar, onEditar, onVer }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton 
        title="Acciones"
        onClick={handleMenuOpen}
        color="primary"
        size="small"
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onVer('participantes', fila); handleMenuClose(); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Ver Participantes" />
        </MenuItem>

        <MenuItem onClick={() => { onVer('trabajos', fila); handleMenuClose(); }}>
          <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Ver Trabajos" />
        </MenuItem>

        <MenuItem onClick={() => { onVer('detalles', fila); handleMenuClose(); }}>
          <ListItemIcon><MenuIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Ver Detalles" />
        </MenuItem>

        <MenuItem onClick={() => { onVer('materiales', fila); handleMenuClose(); }}>
          <ListItemIcon><FolderOpenIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Ver Materiales" />
        </MenuItem>

        <MenuItem onClick={() => {
          window.open(`/imprimirguiasemana?codigo=${fila.codigo}&semana=${fila.semana}`, "_blank");
          handleMenuClose();
        }}>
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Imprimir" />
        </MenuItem>

        <MenuItem onClick={() => { onEditar(fila); handleMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Modificar Guía" />
        </MenuItem>

        <MenuItem onClick={() => { onEliminar(fila); handleMenuClose(); }}>
          <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Eliminar" />
        </MenuItem>
      </Menu>
    </>
    
  );
}

export default AccionesMenu;
