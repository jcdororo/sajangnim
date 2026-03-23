'use client'

import { useState } from 'react'
import {
  useMenuCategories,
  useAllMenuItems,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from '@/hooks/use-menu'
import { MenuCategory, MenuItem } from '@/types/menu'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, UtensilsCrossed } from 'lucide-react'

// ─── 카테고리 모달 ───────────────────────────────────────────────
function CategoryModal({
  initial,
  onClose,
  onSave,
  isPending,
}: {
  initial?: MenuCategory
  onClose: () => void
  onSave: (name: string) => void
  isPending: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            {initial ? '카테고리 수정' : '카테고리 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          placeholder="카테고리 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button
          onClick={() => onSave(name.trim())}
          disabled={!name.trim() || isPending}
          className="mt-3 w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
        >
          저장
        </button>
      </div>
    </div>
  )
}

// ─── 메뉴 아이템 모달 ───────────────────────────────────────────────
function MenuItemModal({
  initial,
  categoryId,
  categories,
  onClose,
  onSave,
  isPending,
}: {
  initial?: MenuItem
  categoryId: string
  categories: MenuCategory[]
  onClose: () => void
  onSave: (item: Omit<MenuItem, 'id'>) => void
  isPending: boolean
}) {
  const [form, setForm] = useState<Omit<MenuItem, 'id'>>({
    category_id: initial?.category_id ?? categoryId,
    name: initial?.name ?? '',
    price: initial?.price ?? 0,
    description: initial?.description ?? null,
    image_url: initial?.image_url ?? null,
    is_available: initial?.is_available ?? true,
    sort_order: initial?.sort_order ?? 999,
  })

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            {initial ? '메뉴 수정' : '메뉴 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">카테고리</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">메뉴 이름</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="메뉴 이름"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">가격 (원)</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="0"
              value={form.price}
              onChange={(e) => set('price', Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">설명 (선택)</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="메뉴 설명"
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value || null)}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-700">판매 중</span>
            <button onClick={() => set('is_available', !form.is_available)}>
              {form.is_available ? (
                <ToggleRight className="w-8 h-8 text-blue-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || form.price <= 0 || isPending}
          className="mt-4 w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
        >
          저장
        </button>
      </div>
    </div>
  )
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────
export function MenuManagementClient() {
  const { data: categories = [], isLoading: catLoading } = useMenuCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const activeCategoryId = selectedCategoryId ?? categories[0]?.id

  const { data: items = [], isLoading: itemLoading } = useAllMenuItems(activeCategoryId)

  const createCategory = useCreateMenuCategory()
  const updateCategory = useUpdateMenuCategory()
  const deleteCategory = useDeleteMenuCategory()
  const createItem = useCreateMenuItem()
  const updateItem = useUpdateMenuItem()
  const deleteItem = useDeleteMenuItem()

  type CatModal = { mode: 'add' } | { mode: 'edit'; category: MenuCategory }
  type ItemModal = { mode: 'add' } | { mode: 'edit'; item: MenuItem }

  const [catModal, setCatModal] = useState<CatModal | null>(null)
  const [itemModal, setItemModal] = useState<ItemModal | null>(null)

  function handleSaveCategory(name: string) {
    if (!catModal) return
    if (catModal.mode === 'add') {
      createCategory.mutate(name, { onSuccess: () => setCatModal(null) })
    } else {
      updateCategory.mutate({ id: catModal.category.id, name }, { onSuccess: () => setCatModal(null) })
    }
  }

  function handleSaveItem(form: Omit<MenuItem, 'id'>) {
    if (!itemModal) return
    if (itemModal.mode === 'add') {
      createItem.mutate(form, { onSuccess: () => setItemModal(null) })
    } else {
      updateItem.mutate({ id: itemModal.item.id, ...form }, { onSuccess: () => setItemModal(null) })
    }
  }

  function handleDeleteCategory(cat: MenuCategory) {
    if (!confirm(`"${cat.name}" 카테고리를 삭제하면 하위 메뉴도 모두 삭제됩니다. 계속할까요?`)) return
    deleteCategory.mutate(cat.id)
    if (activeCategoryId === cat.id) setSelectedCategoryId(null)
  }

  function handleDeleteItem(item: MenuItem) {
    if (!confirm(`"${item.name}"을 삭제할까요?`)) return
    deleteItem.mutate(item.id)
  }

  function handleToggleAvailability(item: MenuItem) {
    updateItem.mutate({ id: item.id, is_available: !item.is_available })
  }

  const catPending = createCategory.isPending || updateCategory.isPending
  const itemPending = createItem.isPending || updateItem.isPending

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">메뉴 관리</h1>
      </div>

      {/* 카테고리 탭 */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {catLoading ? (
            <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-lg my-3" />
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors group',
                  activeCategoryId === cat.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                )}
              >
                {cat.name}
                <span
                  onClick={(e) => { e.stopPropagation(); setCatModal({ mode: 'edit', category: cat }) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-3 h-3" />
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                >
                  <X className="w-3 h-3" />
                </span>
              </button>
            ))
          )}
          <button
            onClick={() => setCatModal({ mode: 'add' })}
            className="shrink-0 flex items-center gap-1 px-3 py-3 text-sm text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 메뉴 아이템 목록 */}
      <div className="flex-1">
        {itemLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !activeCategoryId ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <UtensilsCrossed className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-300">카테고리를 먼저 추가하세요</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <li key={item.id} className="bg-white px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm font-medium', !item.is_available && 'text-gray-300 line-through')}>
                      {item.name}
                    </p>
                    {!item.is_available && (
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">품절</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{item.price.toLocaleString()}원</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    title={item.is_available ? '품절 처리' : '판매 재개'}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {item.is_available ? (
                      <ToggleRight className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                  <button
                    onClick={() => setItemModal({ mode: 'edit', item })}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-400"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}

            {/* 추가 버튼 */}
            {activeCategoryId && (
              <li>
                <button
                  onClick={() => setItemModal({ mode: 'add' })}
                  className="w-full flex items-center gap-2 px-5 py-4 text-sm text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  메뉴 추가
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* 모달 */}
      {catModal && (
        <CategoryModal
          initial={catModal.mode === 'edit' ? catModal.category : undefined}
          onClose={() => setCatModal(null)}
          onSave={handleSaveCategory}
          isPending={catPending}
        />
      )}
      {itemModal && activeCategoryId && (
        <MenuItemModal
          initial={itemModal.mode === 'edit' ? itemModal.item : undefined}
          categoryId={activeCategoryId}
          categories={categories}
          onClose={() => setItemModal(null)}
          onSave={handleSaveItem}
          isPending={itemPending}
        />
      )}
    </div>
  )
}
