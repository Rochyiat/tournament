/**
 * SeedingDialog.jsx
 *
 * Modal that appears when the organizer clicks "Generate Bracket".
 * Lets them choose between Random Seeding and Custom Seeding.
 *
 * Props:
 *  onSelectRandom()  — called when user confirms Random seeding
 *  onSelectCustom()  — called when user wants to proceed to Custom seeding modal
 *  onCancel()        — called to close dialog without action
 */
import { useState } from 'react'
import { Shuffle, Target, X, Zap } from 'lucide-react'
import './SeedingDialog.css'

export default function SeedingDialog({ onSelectRandom, onSelectCustom, onCancel }) {
  const [selected, setSelected] = useState('RANDOM')

  function handleConfirm() {
    if (selected === 'RANDOM') onSelectRandom()
    else onSelectCustom()
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-box sd-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sd-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <Zap size={16} strokeWidth={2} style={{ color: 'var(--primary)' }} />
          <h2 id="sd-title">Generate Bracket</h2>
          <button className="modal-close-btn" onClick={onCancel} aria-label="Close">
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="sd-subtitle">Choose how participants will be seeded into the bracket.</p>

          {/* Random option */}
          <label
            className={`sd-option ${selected === 'RANDOM' ? 'sd-option--active' : ''}`}
            onClick={() => setSelected('RANDOM')}
          >
            <div className="sd-option-radio">
              <div className={`sd-radio-dot ${selected === 'RANDOM' ? 'sd-radio-dot--on' : ''}`} />
            </div>
            <div className="sd-option-icon sd-option-icon--random">
              <Shuffle size={22} strokeWidth={1.5} />
            </div>
            <div className="sd-option-text">
              <span className="sd-option-title">🎲 Random Seeding</span>
              <span className="sd-option-desc">
                Participants are placed into the bracket automatically using a
                random shuffle. Fair and instant.
              </span>
            </div>
          </label>

          {/* Custom option */}
          <label
            className={`sd-option ${selected === 'CUSTOM' ? 'sd-option--active sd-option--custom' : ''}`}
            onClick={() => setSelected('CUSTOM')}
          >
            <div className="sd-option-radio">
              <div className={`sd-radio-dot ${selected === 'CUSTOM' ? 'sd-radio-dot--on sd-radio-dot--custom' : ''}`} />
            </div>
            <div className="sd-option-icon sd-option-icon--custom">
              <Target size={22} strokeWidth={1.5} />
            </div>
            <div className="sd-option-text">
              <span className="sd-option-title">🎯 Custom Seeding</span>
              <span className="sd-option-desc">
                Manually drag &amp; drop participants into bracket slots. You
                control the exact matchups for Round 1.
              </span>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            <Zap size={14} strokeWidth={2} />
            {selected === 'RANDOM' ? 'Generate Now' : 'Set Up Seeding →'}
          </button>
        </div>
      </div>
    </div>
  )
}
