import api from "../../../../utils/auth.tsx";

// Типы
interface HandleFileSelectParams {
  e: React.ChangeEvent<HTMLInputElement>;
  setSelectedFile: (file: File | null) => void;
  setFilePreview: (preview: string | null) => void;
}

interface HandleCancelFileParams {
  setSelectedFile: (file: File | null) => void;
  filePreview: string | null;
  setFilePreview: (preview: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

interface UploadFileParams {
  file: File;
  setIsUploading: (loading: boolean) => void;
}

// Обработка выбора файла
export const handleFileSelect = ({
  e,
  setSelectedFile,
  setFilePreview
}: HandleFileSelectParams) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('Файл слишком большой. Максимальный размер: 50MB');
    return;
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
  if (!validTypes.includes(file.type)) {
    alert('Неподдерживаемый формат файла');
    return;
  }

  setSelectedFile(file);

  const reader = new FileReader();
  reader.onload = (event) => {
    setFilePreview(event.target?.result as string);
  };
  reader.readAsDataURL(file);
};

// Отмена выбора файла
export const handleCancelFile = ({
  setSelectedFile,
  filePreview,
  setFilePreview,
  fileInputRef
}: HandleCancelFileParams) => {
  setSelectedFile(null);
  if (filePreview) {
    URL.revokeObjectURL(filePreview);
  }
  setFilePreview(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

// Загрузка файла на сервер
export const uploadFile = async ({
  file,
  setIsUploading
}: UploadFileParams): Promise<{ url: string; type: 'image' | 'video' } | null> => {
  try {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post("/media/upload-file", formData);
    return {
      url: response.data.file_url,
      type: response.data.mime_type,
    };
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    alert('Не удалось загрузить файл');
    return null;
  } finally {
    setIsUploading(false);
  }
};