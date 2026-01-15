/**
 * FileUpload - Componente para subir archivos e imágenes en el chat
 * Versión simple sin dependencias externas
 */

import React, { useRef } from 'react';
import { IconButton, Box, Typography, Stack, Tooltip } from '@mui/material';
import { Paperclip, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';

export const FileUpload = ({ 
  onFileSelect, 
  selectedFile, 
  onClear, 
  compact = false 
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10 MB.');
        return;
      }

      // Validar tipo
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt'];
      const extension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedExtensions.includes(extension)) {
        alert('Tipo de archivo no permitido.');
        return;
      }

      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handleFileChange(event);
    }
  };

  // Modo compacto - solo botón
  if (compact) {
    return (
      <>
        <input
          ref={fileInputRef}
          type='file'
          hidden
          accept='.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt'
          onChange={handleFileChange}
        />
        <Tooltip title='Adjuntar archivo'>
          <IconButton
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            size='small'
            sx={{
              color: '#667eea',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s',
              width: 40,
              height: 40
            }}
          >
            <Paperclip size={20} />
          </IconButton>
        </Tooltip>
      </>
    );
  }

  // Modo completo - preview del archivo
  if (!selectedFile) return null;

  const isImage = selectedFile.type?.startsWith('image/');
  const fileUrl = isImage ? URL.createObjectURL(selectedFile) : null;

  return (
    <Box
      sx={{
        position: 'relative',
        p: 2,
        borderRadius: 2,
        bgcolor: '#F7FAFC',
        border: '1px dashed #CBD5E0'
      }}
    >
      <Stack direction='row' spacing={2} alignItems='center'>
        {isImage && fileUrl ? (
          <Box
            component='img'
            src={fileUrl}
            alt='Preview'
            sx={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid #E2E8F0'
            }}
          />
        ) : (
          <Box
            sx={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: 1,
              border: '1px solid #E2E8F0'
            }}
          >
            <FileIcon size={32} color='#667eea' />
          </Box>
        )}
        
        <Stack flex={1} spacing={0.5}>
          <Typography variant='body2' fontWeight={500}>
            {selectedFile.name}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {(selectedFile.size / 1024).toFixed(2)} KB
          </Typography>
        </Stack>

        <IconButton
          onClick={onClear}
          size='small'
          sx={{
            color: '#E53E3E',
            '&:hover': {
              bgcolor: 'rgba(229, 62, 62, 0.1)'
            }
          }}
        >
          <X size={20} />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default FileUpload;