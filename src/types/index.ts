// 照片项目类型
export interface PhotoItem {
  id: string;
  title: string;
  url: string;
  tags: string[];
  description?: string;
  createdAt: string;
  order?: number; // 排序字段
}

// 拖拽项目类型
export interface DragItem {
  id: string;
  index: number;
}

// 右键菜单类型
export interface ContextMenuProps {
  photo: PhotoItem;
  onSetHero: () => void;
  onCopyPath: () => void;
  onRevealInFinder: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

// 应用配置类型
export interface AppConfig {
  heroImage: string;
  lastSavedPath: string;
  autoSave: boolean;
}

