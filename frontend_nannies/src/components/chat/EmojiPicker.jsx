/**
 * EmojiPicker - Selector de emojis para el chat
 * Usa emoji-picker-react para compatibilidad con React 19
 */

import React, { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { IconButton, Popover, Tooltip } from '@mui/material';
import { SmilePlus } from 'lucide-react';

const EmojiPickerComponent = ({ onEmojiSelect, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleEmojiClick = (emojiObject) => {
    onEmojiSelect(emojiObject.emoji);
    // No cerramos inmediatamente para permitir seleccionar múltiples emojis
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <>
      <Tooltip title="Agregar emoji">
        <span>
          <IconButton 
            onClick={handleClick} 
            size="small"
            disabled={disabled}
            sx={{
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s'
            }}
          >
            <SmilePlus size={20} color={disabled ? '#ccc' : '#667eea'} />
          </IconButton>
        </span>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <EmojiPicker 
          onEmojiClick={handleEmojiClick}
          width={320}
          height={400}
          searchPlaceHolder="Buscar emoji..."
          previewConfig={{
            showPreview: false
          }}
        />
      </Popover>
    </>
  );
};

export default EmojiPickerComponent;
