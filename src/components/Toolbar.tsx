import React from 'react'

interface ToolbarProps {
  onShuffle: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({ onShuffle }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            上传图片
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            批量编辑
          </button>
          <button 
            onClick={onShuffle}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            随机打乱
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            导入JSON
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            导出JSON
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toolbar

