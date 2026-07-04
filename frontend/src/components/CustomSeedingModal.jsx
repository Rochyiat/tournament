/**
 * CustomSeedingModal.jsx
 *
 * Full-screen modal for custom bracket seeding.
 *
 * Layout:
 *   LEFT  — Available participants (draggable source list)
 *   RIGHT — Bracket Slot grid (numbered 1..N, drop targets)
 *
 * Drag rules:
 *   • Dragging from left panel → drops into an empty slot
 *   • Dragging from a slot → returns to left panel OR swaps with another slot
 *   • Each slot holds exactly 1 participant
 *   • Generate is disabled until every slot is filled
 *
 * Props:
 *   participants  — array of { id, name } (all registered participants)
 *   onGenerate(orderedIds)  — called with slot-order array of participant IDs
 *   onCancel()
 */
import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { X, Users, Target, Zap, RotateCcw, GripVertical, Search } from 'lucide-react'
import './CustomSeedingModal.css'

// ── Draggable participant chip (used in both panels) ──────────────────────────

function DragChip({ id, name, origin, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { name, origin },
    disabled,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: disabled ? 'default' : 'grab',
  }

  const initial = (name || '?')[0].toUpperCase()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`csm-chip ${isDragging ? 'csm-chip--dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <GripVertical size={13} strokeWidth={2} className="csm-chip-grip" />
      <div className="csm-chip-avatar">{initial}</div>
      <span className="csm-chip-name">{name}</span>
    </div>
  )
}

// Overlay clone — rendered by DragOverlay while dragging
function DragChipOverlay({ name }) {
  const initial = (name || '?')[0].toUpperCase()
  return (
    <div className="csm-chip csm-chip--overlay">
      <GripVertical size={13} strokeWidth={2} className="csm-chip-grip" />
      <div className="csm-chip-avatar">{initial}</div>
      <span className="csm-chip-name">{name}</span>
    </div>
  )
}

// ── Droppable bracket slot ────────────────────────────────────────────────────

function BracketSlot({ slotIndex, participant, onEject }) {
  const slotId = `slot-${slotIndex}`
  const { isOver, setNodeRef } = useDroppable({ id: slotId, data: { slotIndex } })

  const isEmpty = participant == null

  return (
    <div
      ref={setNodeRef}
      className={[
        'csm-slot',
        isEmpty ? 'csm-slot--empty' : 'csm-slot--filled',
        isOver ? 'csm-slot--over' : '',
      ].join(' ')}
    >
      <span className="csm-slot-num">#{slotIndex + 1}</span>

      {isEmpty ? (
        <div className="csm-slot-placeholder">
          {isOver ? 'Drop here' : 'Empty Slot'}
        </div>
      ) : (
        <div className="csm-slot-content">
          <DragChip
            id={`slot-drag-${participant.id}`}
            name={participant.name}
            origin={{ type: 'slot', slotIndex }}
          />
          <button
            className="csm-slot-eject"
            onClick={() => onEject(slotIndex)}
            aria-label={`Remove ${participant.name} from slot ${slotIndex + 1}`}
            title="Remove from slot"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Droppable "pool" drop zone (left panel) ───────────────────────────────────

function PoolDropZone({ children }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'pool', data: { type: 'pool' } })
  return (
    <div
      ref={setNodeRef}
      className={`csm-pool-list ${isOver ? 'csm-pool-list--over' : ''}`}
    >
      {children}
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function CustomSeedingModal({ participants, onGenerate, onCancel }) {
  // Slots array: index = slot position, value = participant object or null
  const [slots, setSlots] = useState(() => Array(participants.length).fill(null))

  // Active drag info
  const [activeDrag, setActiveDrag] = useState(null)  // { id, name, origin }

  // Search in pool
  const [poolQuery, setPoolQuery] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  // Participants not yet assigned to any slot
  const poolParticipants = useMemo(() => {
    const slottedIds = new Set(slots.filter(Boolean).map((p) => p.id))
    return participants.filter((p) => !slottedIds.has(p.id))
  }, [participants, slots])

  const filteredPool = useMemo(() => {
    const q = poolQuery.trim().toLowerCase()
    return q ? poolParticipants.filter((p) => p.name.toLowerCase().includes(q)) : poolParticipants
  }, [poolParticipants, poolQuery])

  const allFilled = slots.every(Boolean)
  const filledCount = slots.filter(Boolean).length

  // ── Drag start ──────────────────────────────────────────────────────────
  function handleDragStart(event) {
    const { active } = event
    const { name, origin } = active.data.current
    setActiveDrag({ id: active.id, name, origin })
  }

  // ── Drag end ─────────────────────────────────────────────────────────────
  function handleDragEnd(event) {
    const { active, over } = event
    setActiveDrag(null)

    if (!over) return

    const origin = active.data.current?.origin
    const destination = over.data.current

    // Nothing meaningful
    if (!origin || !destination) return

    // Destination is the pool
    if (destination.type === 'pool' || over.id === 'pool') {
      if (origin.type === 'slot') {
        // Eject slot participant back to pool
        setSlots((prev) => {
          const next = [...prev]
          next[origin.slotIndex] = null
          return next
        })
      }
      return
    }

    // Destination is a slot
    const destSlotIndex = destination.slotIndex ?? parseInt(over.id.replace('slot-', ''), 10)

    if (origin.type === 'pool') {
      // Dragging from pool → slot
      // Find the participant by their draggable id (same as their pool id)
      const participantId = Number(active.id)
      const participant = participants.find((p) => p.id === participantId)
      if (!participant) return

      setSlots((prev) => {
        const next = [...prev]
        const displaced = next[destSlotIndex]

        // Place participant in target slot
        next[destSlotIndex] = participant

        // If slot was occupied, the displaced participant simply returns to pool
        // (pool auto-refreshes from useMemo — no explicit state needed)
        // But if the displaced participant was in another slot, clear that slot too — N/A here
        return next
      })
    } else if (origin.type === 'slot') {
      // Dragging from slot → another slot (swap)
      const srcSlotIndex = origin.slotIndex
      if (srcSlotIndex === destSlotIndex) return

      setSlots((prev) => {
        const next = [...prev]
        // Swap
        const tmp = next[destSlotIndex]
        next[destSlotIndex] = next[srcSlotIndex]
        next[srcSlotIndex] = tmp
        return next
      })
    }
  }

  // ── Eject (remove button on slot) ────────────────────────────────────────
  function handleEject(slotIndex) {
    setSlots((prev) => {
      const next = [...prev]
      next[slotIndex] = null
      return next
    })
  }

  // ── Reset all ─────────────────────────────────────────────────────────────
  function handleReset() {
    setSlots(Array(participants.length).fill(null))
    setPoolQuery('')
  }

  // ── Auto-fill with random order ───────────────────────────────────────────
  function handleAutoFill() {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    setSlots(shuffled)
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  function handleGenerate() {
    if (!allFilled) return
    onGenerate(slots.map((p) => p.id))
  }

  return (
    <div className="csm-overlay">
      <div className="csm-modal" role="dialog" aria-modal="true" aria-labelledby="csm-title">

        {/* ── Header ── */}
        <div className="csm-header">
          <div className="csm-header-left">
            <Target size={18} strokeWidth={1.5} className="csm-header-icon" />
            <div>
              <h2 id="csm-title">Custom Seeding</h2>
              <p className="csm-header-sub">
                Drag participants into bracket slots to set the Round 1 matchups
              </p>
            </div>
          </div>
          <div className="csm-header-actions">
            <button className="btn btn-ghost btn-sm" onClick={handleAutoFill} title="Fill randomly">
              <RotateCcw size={13} strokeWidth={2} />
              Auto-fill
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleReset} title="Clear all slots">
              <X size={13} strokeWidth={2} />
              Clear
            </button>
            <button className="modal-close-btn" onClick={onCancel} aria-label="Close">
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="csm-progress-bar-wrap">
          <div
            className="csm-progress-bar-fill"
            style={{ width: `${(filledCount / participants.length) * 100}%` }}
          />
          <span className="csm-progress-label">
            {filledCount} / {participants.length} slots filled
            {allFilled && <span className="csm-progress-done"> ✓ Ready to generate!</span>}
          </span>
        </div>

        {/* ── Main body ── */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="csm-body">

            {/* LEFT — Available participants pool */}
            <div className="csm-panel csm-panel--pool">
              <div className="csm-panel-header">
                <div className="csm-panel-title">
                  <Users size={14} strokeWidth={2} />
                  Available
                  <span className="csm-panel-count">{poolParticipants.length}</span>
                </div>
              </div>

              {/* Search */}
              <div className="csm-pool-search-wrap">
                <Search size={13} strokeWidth={2} className="csm-pool-search-icon" />
                <input
                  type="text"
                  className="csm-pool-search-input"
                  placeholder="Search participant…"
                  value={poolQuery}
                  onChange={(e) => setPoolQuery(e.target.value)}
                />
                {poolQuery && (
                  <button className="csm-pool-search-clear" onClick={() => setPoolQuery('')} aria-label="Clear">
                    <X size={11} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* Droppable pool zone */}
              <PoolDropZone>
                {filteredPool.length === 0 ? (
                  <div className="csm-pool-empty">
                    {poolParticipants.length === 0
                      ? <><Target size={22} strokeWidth={1} /><p>All participants are slotted!</p></>
                      : <><Search size={22} strokeWidth={1} /><p>No participants match.</p></>
                    }
                  </div>
                ) : (
                  filteredPool.map((p) => (
                    <DragChip
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      origin={{ type: 'pool' }}
                    />
                  ))
                )}
              </PoolDropZone>
            </div>

            {/* RIGHT — Bracket slots */}
            <div className="csm-panel csm-panel--slots">
              <div className="csm-panel-header">
                <div className="csm-panel-title">
                  <Target size={14} strokeWidth={2} />
                  Bracket Slots
                  <span className="csm-panel-count csm-panel-count--slots">
                    {filledCount} / {participants.length}
                  </span>
                </div>
                <span className="csm-slots-hint">Seed #1 faces #2 · #3 faces #4 · etc.</span>
              </div>

              <div className="csm-slots-grid">
                {slots.map((participant, idx) => (
                  <BracketSlot
                    key={idx}
                    slotIndex={idx}
                    participant={participant}
                    onEject={handleEject}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Drag overlay — floating chip while dragging */}
          <DragOverlay dropAnimation={{ duration: 120, easing: 'ease' }}>
            {activeDrag ? <DragChipOverlay name={activeDrag.name} /> : null}
          </DragOverlay>
        </DndContext>

        {/* ── Footer ── */}
        <div className="csm-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!allFilled}
            title={allFilled ? 'Generate bracket with this seeding' : 'Fill all slots first'}
          >
            <Zap size={14} strokeWidth={2} />
            {allFilled ? 'Generate Bracket' : `Fill ${participants.length - filledCount} more slot${participants.length - filledCount !== 1 ? 's' : ''}…`}
          </button>
        </div>
      </div>
    </div>
  )
}
