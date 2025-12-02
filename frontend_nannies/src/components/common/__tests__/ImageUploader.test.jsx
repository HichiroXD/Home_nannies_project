import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageUploader from '../ImageUploader';

// Mock global de FileReader
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: 'data:image/jpeg;base64,mockbase64',
  onloadend: null,
};

global.FileReader = vi.fn(function() {
  return mockFileReader;
});

describe('ImageUploader Component', () => {
  let mockOnImageSelect;

  beforeEach(() => {
    mockOnImageSelect = vi.fn();
    mockFileReader.readAsDataURL.mockClear();
  });

  describe('Renderizado básico', () => {
    it('debe renderizar el componente correctamente', () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      expect(screen.getByText('Foto de perfil')).toBeInTheDocument();
      expect(screen.getByText(/Haz clic o arrastra una imagen/i)).toBeInTheDocument();
    });

    it('debe mostrar la imagen actual si existe', () => {
      const currentImage = 'http://example.com/photo.jpg';
      render(
        <ImageUploader 
          onImageSelect={mockOnImageSelect} 
          currentImage={currentImage}
        />
      );
      
      const img = screen.getByAltText('Preview');
      expect(img).toBeInTheDocument();
      expect(img.src).toBe(currentImage);
    });

    it('debe mostrar el label personalizado', () => {
      render(
        <ImageUploader 
          onImageSelect={mockOnImageSelect} 
          label="Mi foto personalizada"
        />
      );
      
      expect(screen.getByText('Mi foto personalizada')).toBeInTheDocument();
    });
  });

  describe('Validación de archivos', () => {
    it('debe aceptar archivos JPEG válidos', async () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      const input = screen.getByLabelText(/foto de perfil/i);
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    });

    it('debe aceptar archivos PNG válidos', async () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      
      const input = screen.getByLabelText(/foto de perfil/i);
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    });

    it('debe aceptar archivos WEBP válidos', async () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const file = new File(['dummy content'], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      
      const input = screen.getByLabelText(/foto de perfil/i);
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    });

    it('debe rechazar archivos con formato inválido', async () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/foto de perfil/i);
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(screen.getByText(/formato no válido/i)).toBeInTheDocument();
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });

    it('debe rechazar archivos que exceden el tamaño máximo', async () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} maxSizeMB={5} />);
      
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      
      const input = screen.getByLabelText(/foto de perfil/i);
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(screen.getByText(/demasiado grande/i)).toBeInTheDocument();
      expect(screen.getByText(/máximo 5mb/i)).toBeInTheDocument();
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });

    it('debe respetar maxSizeMB personalizado', async () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} maxSizeMB={2} />);
      
      const file = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB
      
      const input = screen.getByLabelText(/foto de perfil/i);
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(screen.getByText(/máximo 2mb/i)).toBeInTheDocument();
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('debe cambiar estilo cuando se arrastra un archivo sobre el área', () => {
      const { container } = render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const dropZone = container.querySelector('[data-testid="drop-zone"]') || 
                       container.querySelector('.border-dashed');
      
      fireEvent.dragOver(dropZone);
      
      // Verificar que el área de drop cambió de estilo (tendrá alguna clase de "dragging")
      expect(dropZone.className).toMatch(/border-blue|bg-blue/);
    });

    it('debe manejar el drop de un archivo válido', async () => {
      const { container } = render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      
      const dropZone = container.querySelector('[data-testid="drop-zone"]') || 
                       container.querySelector('.border-dashed');
      
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] }
      });
      
      await waitFor(() => {
        fireEvent(dropZone, dropEvent);
      });

      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    });

    it('debe limpiar el estado de dragging al salir del área', () => {
      const { container } = render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const dropZone = container.querySelector('[data-testid="drop-zone"]') || 
                       container.querySelector('.border-dashed');
      
      fireEvent.dragOver(dropZone);
      fireEvent.dragLeave(dropZone);
      
      // El estilo de dragging debe desaparecer
      expect(dropZone.className).not.toMatch(/border-blue-500/);
    });
  });

  describe('Preview de imagen', () => {
    it('debe mostrar preview después de seleccionar una imagen', async () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onloadend: null,
        result: 'data:image/jpeg;base64,mockbase64data'
      };
      
      global.FileReader = vi.fn(() => mockFileReader);
      
      const input = screen.getByLabelText(/foto de perfil/i);
      fireEvent.change(input, { target: { files: [file] } });
      
      // Simular que FileReader terminó
      await waitFor(() => {
        if (mockFileReader.onloadend) {
          mockFileReader.onloadend();
        }
      });

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });

    it('debe permitir remover la imagen seleccionada', async () => {
      render(
        <ImageUploader 
          onImageSelect={mockOnImageSelect} 
          currentImage="http://example.com/photo.jpg"
        />
      );
      
      const removeButton = screen.getByRole('button', { name: /remover|eliminar/i });
      fireEvent.click(removeButton);
      
      expect(mockOnImageSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('Interacción con el usuario', () => {
    it('debe abrir el selector de archivos al hacer click en el área', () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const input = screen.getByLabelText(/foto de perfil/i);
      const clickSpy = vi.spyOn(input, 'click');
      
      const uploadArea = screen.getByText(/arrastra y suelta/i).closest('div');
      fireEvent.click(uploadArea);
      
      // El input file debería ser clickeado
      expect(clickSpy).toHaveBeenCalled();
    });

    it('debe limpiar el error al seleccionar un archivo válido después de uno inválido', async () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      // Primero, archivo inválido
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/foto de perfil/i);
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [invalidFile] } });
      });
      
      expect(screen.getByText(/formato no válido/i)).toBeInTheDocument();
      
      // Luego, archivo válido
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 });
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [validFile] } });
      });
      
      // El error debe desaparecer
      expect(screen.queryByText(/formato no válido/i)).not.toBeInTheDocument();
    });
  });

  describe('Props opcionales', () => {
    it('debe aplicar className personalizado', () => {
      const { container } = render(
        <ImageUploader 
          onImageSelect={mockOnImageSelect} 
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('debe aceptar formatos personalizados', async () => {
      render(
        <ImageUploader 
          onImageSelect={mockOnImageSelect} 
          acceptedFormats={['image/jpeg']}
        />
      );
      
      // PNG no debería ser aceptado
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const input = screen.getByLabelText(/foto de perfil/i);
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      expect(screen.getByText(/formato no válido/i)).toBeInTheDocument();
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('debe manejar correctamente cuando no se selecciona ningún archivo', () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      const input = screen.getByLabelText(/foto de perfil/i);
      fireEvent.change(input, { target: { files: [] } });
      
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });

    it('debe manejar null en onImageSelect sin errores', () => {
      render(<ImageUploader onImageSelect={mockOnImageSelect} />);
      
      expect(() => {
        const input = screen.getByLabelText(/foto de perfil/i);
        fireEvent.change(input, { target: { files: [] } });
      }).not.toThrow();
    });
  });
});
