import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('请选择要上传的文件');
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
        setResults(data.result || []);
        setFilteredResults(data.result || []);
      } else {
        // Handle both error response formats
        const errorMessage = data.error || data.message || '文件处理失败';
        setError(errorMessage);
      }
    } catch (err) {
      setError('网络错误，请检查后端服务是否运行');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredResults(results);
    } else {
      // Case-insensitive search that supports Unicode characters
      const filtered = results.filter(item => 
        item.key.toLowerCase().includes(term.toLowerCase()) ||
        item.value.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredResults(filtered);
    }
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

  const copyToClipboard = async () => {
    if (results.length === 0) return;

    const content = results.map(d => `${d.key} ${d.value}`).join("\n");
    try {
      await navigator.clipboard.writeText(content);
      alert('结果已复制到剪贴板！');
    } catch (err) {
      console.error('无法复制到剪贴板:', err);
    }
  };

  const clearResults = () => {
    setResults([]);
    setFilteredResults([]);
    setSearchTerm('');
    setFile(null);
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with GitHub link */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            文档缩写提取工具
          </h1>
          <a
            href="https://github.com/Ye-Yu-Mo/AbbrevScan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>

        {/* Abbreviation Rules Hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">提取规则说明</h3>
          <p className="text-blue-700 text-sm">
            系统会自动提取文档中括号内的内容，识别格式为：(全称, 缩写)。例如：
            <code className="bg-blue-100 px-1 mx-1 rounded">(bisphenol A, BPA)</code> 
            会被提取为：
            <code className="bg-blue-100 px-1 mx-1 rounded">BPA bisphenol A</code>
          </p>
          <p className="text-blue-700 text-sm mt-2">
            支持中英文及其他Unicode字符，自动过滤纯数字和无效内容。
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择文档文件 (.doc 或 .docx)
              </label>
              <input
                type="file"
                accept=".doc,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </>
              ) : '上传并提取缩写'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                提取结果 ({filteredResults.length} 条)
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={downloadTxt}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm"
                >
                  TXT
                </button>
                <button
                  onClick={downloadJSON}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                >
                  JSON
                </button>
                <button
                  onClick={copyToClipboard}
                  className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 text-sm"
                >
                  复制
                </button>
                <button
                  onClick={clearResults}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 text-sm"
                >
                  清除
                </button>
              </div>
            </div>

            {/* Search Input with loading indicator */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="搜索缩写或全称..."
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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      缩写 (Key)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      全称 (Value)
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
            <p>上传 .doc 或 .docx 文件以提取缩写内容</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
