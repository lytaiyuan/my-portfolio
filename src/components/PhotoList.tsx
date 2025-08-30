import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PhotoItem } from '../types'

interface PhotoListProps {
  photos: PhotoItem[]
  onReorder: (fromIndex: number, toIndex: number) => void
  onPhotosChange: (photos: PhotoItem[]) => void
}

// 可拖拽的照片项组件
const SortablePhotoItem: React.FC<{ photo: PhotoItem }> = ({ photo }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
          图片
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{photo.title}</h3>
          <p className="text-sm text-gray-500">{photo.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {photo.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          顺序: {photo.order}
        </div>
      </div>
    </div>
  )
}

const PhotoList: React.FC<PhotoListProps> = ({ photos, onReorder, onPhotosChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex(photo => photo.id === active.id)
      const newIndex = photos.findIndex(photo => photo.id === over.id)
      
      onReorder(oldIndex, newIndex)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">照片列表</h2>
      
      {photos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无照片，请先上传图片
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map(photo => photo.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {photos.map((photo) => (
                <SortablePhotoItem key={photo.id} photo={photo} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export default PhotoList

