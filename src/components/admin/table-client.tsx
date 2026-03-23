'use client'

import { useState } from 'react'
import { useTables, useCreateTable, useUpdateTable, useDeleteTable } from '@/hooks/use-tables'
import { Table } from '@/types/table'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Users, LayoutGrid } from 'lucide-react'

// ─── 테이블 모달 ───────────────────────────────────────────────
function TableModal({
  initial,
  onClose,
  onSave,
  isPending,
}: {
  initial?: Table
  onClose: () => void
  onSave: (name: string, capacity: number) => void
  isPending: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [capacity, setCapacity] = useState(initial?.capacity ?? 4)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            {initial ? '테이블 수정' : '테이블 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">테이블 이름</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="예) 1번 테이블, A1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">최대 인원</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCapacity((v) => Math.max(1, v - 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50"
              >
                −
              </button>
              <span className="flex-1 text-center font-semibold text-gray-900">{capacity}명</span>
              <button
                onClick={() => setCapacity((v) => Math.min(20, v + 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => onSave(name.trim(), capacity)}
          disabled={!name.trim() || isPending}
          className="mt-4 w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
        >
          저장
        </button>
      </div>
    </div>
  )
}

// ─── 테이블 카드 ───────────────────────────────────────────────
function TableCard({
  table,
  onEdit,
  onDelete,
  onToggle,
  isPending,
}: {
  table: Table
  onEdit: (table: Table) => void
  onDelete: (table: Table) => void
  onToggle: (table: Table) => void
  isPending: boolean
}) {
  const isOccupied = table.status === 'occupied'

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border p-4 flex flex-col gap-3',
        isOccupied ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
      )}
    >
      {/* 상태 배지 */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full border',
            isOccupied
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-gray-50 text-gray-400 border-gray-200'
          )}
        >
          {isOccupied ? '사용 중' : '비어 있음'}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(table)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(table)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 테이블 이름 */}
      <div className="text-center py-1">
        <p className="text-base font-bold text-gray-900">{table.name}</p>
        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-400">
          <Users className="w-3.5 h-3.5" />
          최대 {table.capacity}명
        </div>
      </div>

      {/* 상태 토글 버튼 */}
      <button
        onClick={() => onToggle(table)}
        disabled={isPending}
        className={cn(
          'w-full py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50',
          isOccupied
            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        )}
      >
        {isOccupied ? '퇴석 처리' : '입석 처리'}
      </button>
    </div>
  )
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────
export function TableManagementClient() {
  const { data: tables = [], isLoading } = useTables()
  const createTable = useCreateTable()
  const updateTable = useUpdateTable()
  const deleteTable = useDeleteTable()

  const [modal, setModal] = useState<{ mode: 'add' } | { mode: 'edit'; table: Table } | null>(null)

  function handleSave(name: string, capacity: number) {
    if (!modal) return
    if (modal.mode === 'add') {
      createTable.mutate({ name, capacity }, { onSuccess: () => setModal(null) })
    } else {
      updateTable.mutate({ id: modal.table.id, name, capacity }, { onSuccess: () => setModal(null) })
    }
  }

  function handleDelete(table: Table) {
    if (!confirm(`"${table.name}"을 삭제할까요?`)) return
    deleteTable.mutate(table.id)
  }

  function handleToggle(table: Table) {
    updateTable.mutate({
      id: table.id,
      status: table.status === 'occupied' ? 'empty' : 'occupied',
    })
  }

  const isPending = createTable.isPending || updateTable.isPending

  const occupied = tables.filter((t) => t.status === 'occupied').length
  const empty = tables.filter((t) => t.status === 'empty').length

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900 mb-3">테이블 관리</h1>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-500">전체</p>
            <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-blue-500">사용 중</p>
            <p className="text-2xl font-bold text-blue-600">{occupied}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-500">빈 테이블</p>
            <p className="text-2xl font-bold text-gray-700">{empty}</p>
          </div>
        </div>
      </div>

      {/* 테이블 그리드 */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <LayoutGrid className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-300">테이블이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={(t) => setModal({ mode: 'edit', table: t })}
                onDelete={handleDelete}
                onToggle={handleToggle}
                isPending={isPending || deleteTable.isPending}
              />
            ))}
          </div>
        )}

        {/* 추가 버튼 */}
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          테이블 추가
        </button>
      </div>

      {modal && (
        <TableModal
          initial={modal.mode === 'edit' ? modal.table : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isPending={isPending}
        />
      )}
    </div>
  )
}
