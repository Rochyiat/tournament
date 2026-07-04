/**
 * Bracket.jsx
 *
 * Layout engine: Column-Slot Model
 * ─────────────────────────────────
 * Inspired by @g-loot/react-tournament-brackets and brackets-viewer.js.
 *
 * Core idea:
 *   • Every round is a COLUMN — a fixed-width div, full canvas height.
 *   • Every match occupies a SLOT inside that column.
 *   • Slot height = base slot height × 2^(roundIndex).
 *     This means each round's slots are exactly twice as tall as the previous,
 *     so every card in round N sits precisely centered between its two feeder
 *     cards in round N-1.
 *   • Between every two adjacent columns there is a CONNECTOR COLUMN —
 *     a fixed-width SVG that draws pure orthogonal lines (horizontal + vertical
 *     + horizontal). No diagonals, ever.
 *   • The champion is a plain column at the end.
 *   • The outer wrapper overflows-x: auto so the canvas scrolls, not the cards.
 *
 * Nothing here depends on viewport width or any parent CSS.
 * All coordinates are computed in JavaScript and applied as inline styles.
 */

import './Bracket.css'
import BracketMatch from './BracketMatch'
import BracketChampion from './BracketChampion'

// ─── Layout constants ─────────────────────────────────────────────────────────

const CARD_W        = 240   // px — match card width  (never changes)
const CARD_H        = 88    // px — match card height (never changes)
const BASE_SLOT_H   = 140   // px — slot height for round 1
                            //      (card + breathing room above & below)
const COL_SPACING   = 80    // px — the gap column between each round column
                            //      this is how wide the SVG connectors are
const CANVAS_VPAD   = 16    // px — vertical padding at top and bottom of canvas
const CHAMP_COL_W   = 200   // px — width of the champion column
const CANVAS_RPAD   = 48    // px — extra right padding so the last card + champion
                            //      are never clipped by the scroll container

// ─── Derived helpers ──────────────────────────────────────────────────────────

/**
 * Slot height for a given round (0-based roundIndex).
 * Doubles every round so cards stay centered between their feeders.
 */
function slotHeight(roundIndex) {
  return BASE_SLOT_H * Math.pow(2, roundIndex)
}

/**
 * Top offset of the card inside its slot.
 * Card is vertically centered within the slot.
 */
function cardOffsetInSlot(roundIndex) {
  return (slotHeight(roundIndex) - CARD_H) / 2
}

/**
 * Absolute top of card[matchIndex] in round[roundIndex] within the canvas.
 */
function cardTop(roundIndex, matchIndex) {
  return CANVAS_VPAD + matchIndex * slotHeight(roundIndex) + cardOffsetInSlot(roundIndex)
}

/**
 * Y-center of a card — used for connector math.
 */
function cardYCenter(roundIndex, matchIndex) {
  return cardTop(roundIndex, matchIndex) + CARD_H / 2
}

/**
 * Total canvas height.
 * Driven by round 1 match count × base slot height + padding.
 */
function totalCanvasHeight(round1MatchCount) {
  return round1MatchCount * BASE_SLOT_H + CANVAS_VPAD * 2
}

/**
 * Total canvas width.
 *
 * Formula:
 *   numRounds × CARD_W          — all card columns
 *   numRounds × COL_SPACING     — gap/connector after every round (including after final)
 *   CHAMP_COL_W                 — champion card column
 *   CANVAS_RPAD                 — right breathing room so the last card is never clipped
 *
 * The CANVAS_RPAD ensures the scroll container can always reach past the
 * rightmost element regardless of parent overflow constraints.
 */
function totalCanvasWidth(numRounds) {
  return numRounds * CARD_W + numRounds * COL_SPACING + CHAMP_COL_W + CANVAS_RPAD
}

/**
 * Left offset of a round column (0-based roundIndex).
 */
function colLeft(roundIndex) {
  return roundIndex * (CARD_W + COL_SPACING)
}

/**
 * Left offset of the connector SVG that sits between round[roundIndex]
 * and round[roundIndex + 1].
 */
function connectorLeft(roundIndex) {
  return colLeft(roundIndex) + CARD_W
}

/**
 * Left offset of the champion column.
 */
function champLeft(numRounds) {
  return colLeft(numRounds - 1) + CARD_W + COL_SPACING
}

// ─── SVG Connector between two adjacent rounds ────────────────────────────────

/**
 * ConnectorSVG
 *
 * A single SVG element placed between round[roundIndex] and round[roundIndex+1].
 * For each pair of source matches (top, bottom) → target match it draws:
 *
 *   right edge of top card  ──────────┐
 *                                     │  (vertical bridge)
 *   right edge of bot card  ──────────┘
 *                                     └──────── left edge of target card
 *
 * All lines are orthogonal: horizontal → vertical → horizontal.
 * The vertical bridge is placed at x = COL_SPACING * 0.5 (midpoint of gap).
 */
function ConnectorSVG({ srcRoundIndex, dstRoundIndex, srcMatchCount, dstMatchCount, canvasHeight }) {
  const STROKE  = '#38bdf8'
  const SW      = 1.5
  const OPACITY = 0.6
  const bridgeX = COL_SPACING * 0.5  // x within the COL_SPACING gap where the vertical runs

  const paths = []

  for (let ti = 0; ti < dstMatchCount; ti++) {
    const topSrcIdx = ti * 2
    const botSrcIdx = ti * 2 + 1

    // Y-centers in absolute canvas coords, then offset to be relative to this SVG's position
    // (SVG is absolutely positioned at connectorLeft, so we don't need to subtract anything —
    //  SVG coordinates start from 0 which corresponds to connectorLeft in the canvas)
    const topY    = cardYCenter(srcRoundIndex, topSrcIdx)
    const botY    = cardYCenter(srcRoundIndex, botSrcIdx)
    const targetY = cardYCenter(dstRoundIndex, ti)

    // Horizontal arm: from x=0 (right edge of source card) to x=bridgeX
    // Top source card
    paths.push(
      <line key={`h-top-${ti}`}
        x1={0} y1={topY} x2={bridgeX} y2={topY}
        stroke={STROKE} strokeWidth={SW} strokeLinecap="square" opacity={OPACITY}
      />
    )
    // Bottom source card
    paths.push(
      <line key={`h-bot-${ti}`}
        x1={0} y1={botY} x2={bridgeX} y2={botY}
        stroke={STROKE} strokeWidth={SW} strokeLinecap="square" opacity={OPACITY}
      />
    )
    // Vertical bridge: from topY down to botY at x=bridgeX
    paths.push(
      <line key={`v-${ti}`}
        x1={bridgeX} y1={topY} x2={bridgeX} y2={botY}
        stroke={STROKE} strokeWidth={SW} strokeLinecap="square" opacity={OPACITY}
      />
    )
    // Horizontal arm: from bridgeX to x=COL_SPACING (left edge of target card)
    paths.push(
      <line key={`h-tgt-${ti}`}
        x1={bridgeX} y1={targetY} x2={COL_SPACING} y2={targetY}
        stroke={STROKE} strokeWidth={SW} strokeLinecap="square" opacity={OPACITY}
      />
    )
  }

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: COL_SPACING,
        height: canvasHeight,
        overflow: 'visible',
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    >
      {paths}
    </svg>
  )
}

/**
 * ChampionConnectorSVG
 *
 * A simple horizontal dashed gold line from the right edge of the final
 * match card to the left edge of the champion column.
 * The final match is always match index 0 in the last round.
 */
function ChampionConnectorSVG({ finalRoundIndex, canvasHeight }) {
  const finalCardY = cardYCenter(finalRoundIndex, 0)

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: COL_SPACING,
        height: canvasHeight,
        overflow: 'visible',
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    >
      <line
        x1={0} y1={finalCardY}
        x2={COL_SPACING} y2={finalCardY}
        stroke="#f59e0b"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        strokeLinecap="square"
        opacity={0.75}
      />
    </svg>
  )
}

// ─── Main Bracket component ───────────────────────────────────────────────────

function Bracket({ bracket, onEditScore, roundLabelFn, readOnly = false }) {
  if (!bracket || !bracket.rounds) return null

  const totalRounds = bracket.totalRounds || 0

  const roundNumbers = Object.keys(bracket.rounds)
    .map(Number)
    .sort((a, b) => a - b)

  const rounds = roundNumbers.map((n) => ({
    roundNumber: n,
    label: roundLabelFn(n, totalRounds),
    matches: bracket.rounds[n] || [],
  }))

  if (rounds.length === 0) return null

  const round1Count = rounds[0].matches.length
  const cvHeight    = totalCanvasHeight(round1Count)
  const cvWidth     = totalCanvasWidth(rounds.length)

  const finalMatch   = rounds[rounds.length - 1]?.matches?.[0]
  const championName = finalMatch?.winnerName || ''

  return (
    <div className="brk-outer">

      {/* ── Label row ──────────────────────────────────────────────────── */}
      {/*
        min-width = cvWidth ensures the label row is never narrower than
        the canvas. Without this, label cells at the right can wrap or clip.
      */}
      <div className="brk-label-row" style={{ minWidth: cvWidth }}>
        {rounds.map((round, ri) => (
          <div
            key={round.roundNumber}
            className="brk-col-label"
            style={{ width: CARD_W, marginRight: COL_SPACING }}
          >
            {round.label}
          </div>
        ))}
        <div className="brk-col-label brk-col-label--champ" style={{ width: CHAMP_COL_W + CANVAS_RPAD }}>
          Champion
        </div>
      </div>

      {/* ── Scrollable canvas ──────────────────────────────────────────── */}
      <div
        className="brk-canvas"
        style={{ width: cvWidth, height: cvHeight }}
      >

        {rounds.map((round, ri) => {
          const isLast = ri === rounds.length - 1
          const left   = colLeft(ri)

          return (
            // Fragment holding: card column + connector column
            <div key={round.roundNumber}>

              {/* ── Card column ──────────────────────────────────────────── */}
              <div
                className="brk-round-col"
                style={{
                  left,
                  top: 0,
                  width: CARD_W,
                  height: cvHeight,
                }}
              >
                {round.matches.map((match, mi) => (
                  <div
                    key={match.id ?? `r${round.roundNumber}-m${mi}`}
                    className="brk-match-slot"
                    style={{
                      top: cardTop(ri, mi),
                      width: CARD_W,
                      /* no height — card uses min-height and grows with content */
                    }}
                  >
                    <BracketMatch match={match} onEditScore={onEditScore} readOnly={readOnly} />
                  </div>
                ))}
              </div>

              {/* ── Connector column ────────────────────────────────────────
                  Between-round connector uses the full canvas as height so
                  absolute Y coords inside the SVG match canvas coords.      */}
              {!isLast && (
                <div
                  className="brk-connector-col"
                  style={{
                    left: connectorLeft(ri),
                    top: 0,
                    width: COL_SPACING,
                    height: cvHeight,
                  }}
                >
                  <ConnectorSVG
                    srcRoundIndex={ri}
                    dstRoundIndex={ri + 1}
                    srcMatchCount={round.matches.length}
                    dstMatchCount={rounds[ri + 1].matches.length}
                    canvasHeight={cvHeight}
                  />
                </div>
              )}

              {/* ── Final connector: last round → champion ──────────────── */}
              {isLast && (
                <div
                  className="brk-connector-col"
                  style={{
                    left: connectorLeft(ri),
                    top: 0,
                    width: COL_SPACING,
                    height: cvHeight,
                  }}
                >
                  <ChampionConnectorSVG
                    finalRoundIndex={ri}
                    canvasHeight={cvHeight}
                  />
                </div>
              )}

            </div>
          )
        })}

        {/* ── Champion column ─────────────────────────────────────────── */}
        <BracketChampion
          championName={championName}
          left={champLeft(rounds.length)}
          canvasHeight={cvHeight}
          width={CHAMP_COL_W}
        />

        {/*
          ── Scroll-width enforcer ──────────────────────────────────────
          All children above are position:absolute, which means they do
          NOT contribute to the scroll width of .brk-canvas. Without this
          element, the browser reports scroll width = 0 and the rightmost
          cards are clipped.

          This invisible inline-block element sits at the right edge of the
          canvas and forces the browser to allocate the full scroll width.
        */}
        <div
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: cvWidth,
            height: 1,
            verticalAlign: 'top',
            pointerEvents: 'none',
          }}
        />

      </div>
    </div>
  )
}

export default Bracket
