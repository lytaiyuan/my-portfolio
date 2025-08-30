import React, { useState, useEffect } from 'react'
import PhotoList from './components/PhotoList'
import Toolbar from './components/Toolbar'
import { PhotoItem } from './types'

function App() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)

  // 加载示例数据
  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      const samplePhotos: PhotoItem[] = [
        {
          id: '1',
          title: '示例照片1',
          url: '/sample1.jpg',
          tags: ['风景', '自然'],
          description: '这是一张示例照片',
          createdAt: new Date().toISOString(),
          order: 1
        },
        {
          id: '2',
          title: '示例照片2',
          url: '/sample2.jpg',
          tags: ['建筑', '城市'],
          description: '另一张示例照片',
          createdAt: new Date().toISOString(),
          order: 2
        }
      ]
      setPhotos(samplePhotos)
      setLoading(false)
    }, 1000)
  }, [])

  const handleShuffle = () => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5)
    setPhotos(shuffled.map((photo, index) => ({ ...photo, order: index + 1 })))
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos]
    const [movedPhoto] = newPhotos.splice(fromIndex, 1)
    newPhotos.splice(toIndex, 0, movedPhoto)
    setPhotos(newPhotos.map((photo, index) => ({ ...photo, order: index + 1 })))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          照片JSON管理工具
        </h1>
        
        <Toolbar onShuffle={handleShuffle} />
        
        <PhotoList 
          photos={photos} 
          onReorder={handleReorder}
          onPhotosChange={setPhotos}
        />
      </div>
    </div>
  )
}

export default App

