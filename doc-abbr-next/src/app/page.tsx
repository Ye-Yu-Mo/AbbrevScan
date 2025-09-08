'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import SnakeGame from '@/components/SnakeGame';

// Translation strings
const translations = {
  'zh-CN': {
    title: '文档缩写提取工具',
    rulesTitle: '提取规则说明',
    rulesText1: '系统会自动提取文档中括号内的内容，识别格式为：(全称, 缩写)。例如：',
    rulesExample1: '(bisphenol A, BPA)',
    rulesText2: '会被提取为：',
    rulesExample2: 'BPA bisphenol A',
    rulesText3: '支持中英文及其他Unicode字符，自动过滤纯数字和无效内容。',
    fileLabel: '选择文档文件 (.doc 或 .docx)',
    uploadButton: '上传并提取缩写',
    processing: '处理中...',
    noFileError: '请选择要上传的文件',
    processingError: '文件处理失败',
    networkError: '网络错误，请检查后端服务是否运行',
    resultsTitle: '提取结果',
    resultsCount: '条',
    downloadTxt: 'TXT',
    downloadJson: 'JSON',
    downloadCsv: 'CSV',
    downloadExcel: 'Excel',
    downloadWord: 'Word',
    copy: '复制',
    clear: '清除',
    searchPlaceholder: '搜索缩写或全称...',
    removeNumbers: '去除包含数字的项',
    removeYears: '去除包含年份(1900-2100)的项',
    keyHeader: '缩写 (Key)',
    valueHeader: '全称 (Value)',
    emptyState: '上传 .doc 或 .docx 文件以提取缩写内容',
    copySuccess: '结果已复制到剪贴板！',
    copyError: '无法复制到剪贴板:',
    language: '语言',
    gameSelectionTitle: '等待时游戏选择:',
    gameOptionNone: '无游戏',
    gameOptionSnake: '贪吃蛇',
    gameOption2048: '2048 (即将推出)',
    snakeGameTitle: '贪吃蛇游戏 - 等待时消遣',
    snakeGameScore: '得分:',
    snakeGameOver: '游戏结束!',
    snakeFinalScore: '最终得分:',
    snakeRestart: '重新开始 (R)',
    snakePaused: '游戏暂停',
    snakeContinue: '按空格键继续',
    snakeInstruction1: '方向键控制蛇的移动',
    snakeInstruction2: '空格键暂停/继续游戏',
    snakeInstruction3: 'R键重新开始游戏',
    snakeInstruction4: '吃到红色食物得分',
    snakeProcessing: '后端处理中... 玩会儿游戏等待吧!',
    snakeInstructionsTitle: '操作说明:'
  },
  'zh-TW': {
    title: '文件縮寫提取工具',
    rulesTitle: '提取規則說明',
    rulesText1: '系統會自動提取文件中括號內的內容，識別格式為：(全稱, 縮寫)。例如：',
    rulesExample1: '(bisphenol A, BPA)',
    rulesText2: '會被提取為：',
    rulesExample2: 'BPA bisphenol A',
    rulesText3: '支持中英文及其他Unicode字符，自動過濾純數字和無效內容。',
    fileLabel: '選擇文件檔案 (.doc 或 .docx)',
    uploadButton: '上傳並提取縮寫',
    processing: '處理中...',
    noFileError: '請選擇要上傳的文件',
    processingError: '文件處理失敗',
    networkError: '網絡錯誤，請檢查後端服務是否運行',
    resultsTitle: '提取結果',
    resultsCount: '條',
    downloadTxt: 'TXT',
    downloadJson: 'JSON',
    downloadCsv: 'CSV',
    downloadExcel: 'Excel',
    downloadWord: 'Word',
    copy: '複製',
    clear: '清除',
    searchPlaceholder: '搜索縮寫或全稱...',
    removeNumbers: '去除包含數字的項',
    removeYears: '去除包含年份(1900-2100)的項',
    keyHeader: '縮寫 (Key)',
    valueHeader: '全稱 (Value)',
    emptyState: '上傳 .doc 或 .docx 文件以提取縮寫內容',
    copySuccess: '結果已複製到剪貼簿！',
    copyError: '無法複製到剪貼簿:',
    language: '語言',
    gameSelectionTitle: '等待時遊戲選擇:',
    gameOptionNone: '無遊戲',
    gameOptionSnake: '貪吃蛇',
    gameOption2048: '2048 (即將推出)',
    snakeGameTitle: '貪吃蛇遊戲 - 等待時消遣',
    snakeGameScore: '得分:',
    snakeGameOver: '遊戲結束!',
    snakeFinalScore: '最終得分:',
    snakeRestart: '重新開始 (R)',
    snakePaused: '遊戲暫停',
    snakeContinue: '按空格鍵繼續',
    snakeInstruction1: '方向鍵控制蛇的移動',
    snakeInstruction2: '空格鍵暫停/繼續遊戲',
    snakeInstruction3: 'R鍵重新開始遊戲',
    snakeInstruction4: '吃到紅色食物得分',
    snakeProcessing: '後端處理中... 玩會兒遊戲等待吧!',
    snakeInstructionsTitle: '操作說明:'
  },
  'en': {
    title: 'Document Abbreviation Extractor',
    rulesTitle: 'Extraction Rules',
    rulesText1: 'The system automatically extracts content within parentheses in the format: (full name, abbreviation). For example:',
    rulesExample1: '(bisphenol A, BPA)',
    rulesText2: 'will be extracted as:',
    rulesExample2: 'BPA bisphenol A',
    rulesText3: 'Supports Chinese, English and other Unicode characters, automatically filters pure numbers and invalid content.',
    fileLabel: 'Select document file (.doc or .docx)',
    uploadButton: 'Upload and Extract Abbreviations',
    processing: 'Processing...',
    noFileError: 'Please select a file to upload',
    processingError: 'File processing failed',
    networkError: 'Network error, please check if the backend service is running',
    resultsTitle: 'Extraction Results',
    resultsCount: 'items',
    downloadTxt: 'TXT',
    downloadJson: 'JSON',
    downloadCsv: 'CSV',
    downloadExcel: 'Excel',
    downloadWord: 'Word',
    copy: 'Copy',
    clear: 'Clear',
    searchPlaceholder: 'Search abbreviation or full name...',
    removeNumbers: 'Remove items containing numbers',
    removeYears: 'Remove items containing years (1900-2100)',
    keyHeader: 'Abbreviation (Key)',
    valueHeader: 'Full Name (Value)',
    emptyState: 'Upload .doc or .docx file to extract abbreviations',
    copySuccess: 'Results copied to clipboard!',
    copyError: 'Failed to copy to clipboard:',
    language: 'Language',
    gameSelectionTitle: 'Game selection while waiting:',
    gameOptionNone: 'No game',
    gameOptionSnake: 'Snake',
    gameOption2048: '2048 (Coming soon)',
    snakeGameTitle: 'Snake Game - Entertainment While Waiting',
    snakeGameScore: 'Score:',
    snakeGameOver: 'Game Over!',
    snakeFinalScore: 'Final Score:',
    snakeRestart: 'Restart (R)',
    snakePaused: 'Game Paused',
    snakeContinue: 'Press Space to Continue',
    snakeInstruction1: 'Arrow keys to control snake movement',
    snakeInstruction2: 'Space key to pause/resume game',
    snakeInstruction3: 'R key to restart game',
    snakeInstruction4: 'Eat red food to score points',
    snakeProcessing: 'Backend processing... Play a game while waiting!',
    snakeInstructionsTitle: 'Instructions:'
  }
};

interface ResultItem {
  key: string;
  value: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [removeYears, setRemoveYears] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('zh-CN');
  const [gameOption, setGameOption] = useState('snake'); // 'none', 'snake', '2048'

  const t = translations[language as keyof typeof translations];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError(t.noFileError);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setSearchTerm('');

    try {
      const response = await fetch('http://47.92.242.94:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const newResults = data.result || [];
        setResults(newResults);
        setFilteredResults(newResults);
      } else {
        const errorMessage = data.error || data.message || t.processingError;
        setError(errorMessage);
      }
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a string contains a year between 1900 and 2100
  const containsYearInRange = (str: string) => {
    if (!str) return false;
    const matches = str.match(/\d{4}/g);
    if (matches) {
      for (const match of matches) {
        const year = parseInt(match, 10);
        if (year >= 1900 && year <= 2100) {
          return true;
        }
      }
    }
    return false;
  };

  const filterResults = (results: ResultItem[], searchTerm: string, removeNumbers: boolean, removeYears: boolean) => {
    let filtered = results;
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => 
        item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (removeNumbers) {
      filtered = filtered.filter(item => 
        !/\d/.test(item.key) && !/\d/.test(item.value)
      );
    }
    
    if (removeYears) {
      filtered = filtered.filter(item => {
        return !containsYearInRange(item.key) && !containsYearInRange(item.value);
      });
    }
    
    return filtered;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = filterResults(results, term, removeNumbers, removeYears);
    setFilteredResults(filtered);
  };

  const handleRemoveNumbersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const shouldRemove = e.target.checked;
    setRemoveNumbers(shouldRemove);
    const filtered = filterResults(results, searchTerm, shouldRemove, removeYears);
    setFilteredResults(filtered);
  };

  const handleRemoveYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const shouldRemove = e.target.checked;
    setRemoveYears(shouldRemove);
    const filtered = filterResults(results, searchTerm, removeNumbers, shouldRemove);
    setFilteredResults(filtered);
  };

  const downloadTxt = () => {
    if (results.length === 0) return;

    const content = results.map(d => `${d.key} ${d.value}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "result.txt";
    a.click();
  };

  const downloadJSON = () => {
    if (results.length === 0) return;

    const content = JSON.stringify(results, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "result.json";
    a.click();
  };

  const downloadCsv = () => {
    if (results.length === 0) return;
  
    const header = ['key', 'value'];
    const rows = results.map(item => [item.key, item.value]);
  
    const csvContent = "data:text/csv;charset=utf-8," 
      + header.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "result.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    if (results.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "result.xlsx");
  };

  const downloadWord = () => {
    if (results.length === 0) return;
  
    const table = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "Key" })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: "Value" })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        ...results.map(item => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.key)] }),
            new TableCell({ children: [new Paragraph(item.value)] }),
          ],
        })),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  
    const doc = new Document({
      sections: [{
        children: [table],
      }],
    });
  
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "result.docx");
    });
  };

  const copyToClipboard = async () => {
    if (results.length === 0) return;

    const content = results.map(d => `${d.key} ${d.value}`).join("\n");
    try {
      await navigator.clipboard.writeText(content);
      alert(t.copySuccess);
    } catch (err) {
      console.error(t.copyError, err);
    }
  };

  const clearResults = () => {
    setResults([]);
    setFilteredResults([]);
    setSearchTerm('');
    setFile(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with language selector and GitHub link */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">
            {t.title}
          </h1>
          <div className="flex items-center space-x-3">
            {/* Language selector */}
            <div className="relative">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="appearance-none bg-white px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium text-gray-700 hover:border-gray-400 cursor-pointer"
              >
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
                <option value="en">English</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <a
              href="https://github.com/Ye-Yu-Mo/AbbrevScan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              title="GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* Abbreviation Rules Hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">{t.rulesTitle}</h3>
          <p className="text-blue-700 text-sm">
            {t.rulesText1}
            <code className="bg-blue-100 px-1 mx-1 rounded">{t.rulesExample1}</code> 
            {t.rulesText2}
            <code className="bg-blue-100 px-1 mx-1 rounded">{t.rulesExample2}</code>
          </p>
          <p className="text-blue-700 text-sm mt-2">
            {t.rulesText3}
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {t.fileLabel}
                </div>
              </label>
              <input
                type="file"
                accept=".doc,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 transition-colors"
              />
              {file && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {file.name}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Game Selection Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{t.gameSelectionTitle}</p>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="gameNone"
                  name="gameOption"
                  value="none"
                  checked={gameOption === 'none'}
                  onChange={(e) => setGameOption(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="gameNone" className="ml-2 block text-sm text-gray-900">
                  {t.gameOptionNone}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="gameSnake"
                  name="gameOption"
                  value="snake"
                  checked={gameOption === 'snake'}
                  onChange={(e) => setGameOption(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="gameSnake" className="ml-2 block text-sm text-gray-900">
                  {t.gameOptionSnake}
                </label>
              </div>
              <div className="flex items-center opacity-50">
                <input
                  type="radio"
                  id="game2048"
                  name="gameOption"
                  value="2048"
                  disabled
                  className="h-4 w-4 text-gray-400 focus:ring-gray-500 border-gray-300"
                />
                <label htmlFor="game2048" className="ml-2 block text-sm text-gray-500">
                  {t.gameOption2048}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 
                disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center 
                transition-colors duration-200 font-medium"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.processing}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {t.uploadButton}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Snake Game - Show while processing if snake option is selected */}
        {loading && gameOption === 'snake' && <SnakeGame t={t} />}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {t.resultsTitle} ({filteredResults.length} {t.resultsCount})
              </h2>
            <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadTxt}
                  className="bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 text-sm flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.downloadTxt}
                </button>
                <button
                  onClick={downloadJSON}
                  className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.downloadJson}
                </button>
                <button
                  onClick={downloadCsv}
                  className="bg-yellow-600 text-white py-2 px-3 rounded-md hover:bg-yellow-700 text-sm flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.downloadCsv}
                </button>
                <button
                  onClick={downloadExcel}
                  className="bg-green-700 text-white py-2 px-3 rounded-md hover:bg-green-800 text-sm flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.downloadExcel}
                </button>
                <button
                  onClick={downloadWord}
                  className="bg-blue-700 text-white py-2 px-3 rounded-md hover:bg-blue-800 text-sm flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.downloadWord}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 text-sm flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t.copy}
                </button>
                <button
                  onClick={clearResults}
                  className="bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 text-sm flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t.clear}
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>

            {/* Filter options */}
            <div className="mb-4 flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="removeNumbers"
                  checked={removeNumbers}
                  onChange={handleRemoveNumbersChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="removeNumbers" className="ml-2 block text-sm text-gray-900">
                  {t.removeNumbers}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="removeYears"
                  checked={removeYears}
                  onChange={handleRemoveYearsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="removeYears" className="ml-2 block text-sm text-gray-900">
                  {t.removeYears}
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.keyHeader}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.valueHeader}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {results.length === 0 && !loading && !error && (
          <div className="text-center text-gray-500 py-8">
            <p>{t.emptyState}</p>
          </div>
        )}
      </div>
    </div>
  );
}