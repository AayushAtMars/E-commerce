import { Category, ICategory } from '../models/Category';
import { createError } from '../middlewares/error.middleware';

export async function listCategories(includeHidden: boolean = false) {
  const query = includeHidden ? {} : { isActive: true };
  return Category.find(query).sort({ displayOrder: 1, name: 1 });
}

export async function createCategory(data: Partial<ICategory>) {
  if (data.slug) {
    const existing = await Category.findOne({ slug: data.slug });
    if (existing) throw createError('Category slug already exists', 400, 'DUPLICATE_SLUG');
  }
  const category = new Category(data);
  await category.save();
  return category;
}

export async function updateCategory(id: string, data: Partial<ICategory>) {
  if (data.slug) {
    const existing = await Category.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) throw createError('Category slug already exists', 400, 'DUPLICATE_SLUG');
  }
  const category = await Category.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!category) throw createError('Category not found', 404, 'NOT_FOUND');
  return category;
}

export async function toggleCategoryVisibility(id: string) {
  const category = await Category.findById(id);
  if (!category) throw createError('Category not found', 404, 'NOT_FOUND');
  category.isActive = !category.isActive;
  await category.save();
  return category;
}
