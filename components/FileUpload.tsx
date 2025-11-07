
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const ACCEPTED_FILES = '.txt, .pdf, .docx';

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && ['txt', 'pdf', 'docx'].includes(extension)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Invalid file type. Please upload a .txt, .pdf, or .docx file.');
        setSelectedFile(null);
      }
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, []);

  const handleSubmit = () => {
    if (selectedFile && !isLoading) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg w-full">
      <h2 className="text-xl font-semibold text-center text-slate-800 dark:text-slate-200 mb-4">
        Generate From a File
      </h2>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEnter} // Use the same handler for dragOver
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-200 ${
          isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600'
        }`}
      >
        <UploadIcon />
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Drag & drop a file here, or click to select a file
        </p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={ACCEPTED_FILES}
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className="mt-4 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-slate-700 rounded-md cursor-pointer hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors"
        >
          Browse File
        </label>
        {selectedFile && <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">Selected: {selectedFile.name}</p>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading || !selectedFile}
        className="mt-4 w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:scale-100"
      >
        Upload & Generate
      </button>
    </div>
  );
};
