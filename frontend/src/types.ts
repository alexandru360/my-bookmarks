export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description?: string;
  tags?: string;
  favicon?: string;
  categoryId?: number;
  category?: Category;
  createdAt: string;
}

export interface BookmarkFormData {
  url: string;
  title: string;
  description?: string;
  tags?: string;
  categoryId?: number;
}
