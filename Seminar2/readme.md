# Piano Keyboard

A visual piano keyboard built with HTML and CSS featuring 61 keys (5 octaves) with proper layout and positioning.

## Structure

- **Keyboard container** — Dark frame with padding
- **Keypad** — Flexbox layout for key arrangement  
- **White keys** — 240px × 40px with white background
- **Black keys** — 140px × 24px, positioned with negative margins

## Exercises

1. Center the keyboard on the viewport using `vw`, `vh`, and flexbox
2. Add border radius to keyboard, keypad, and keys for rounded corners
3. Make the keypad fill 100% width of the keyboard container
4. Add hover effects: light gray (#f0f0f0) for white keys, dark gray (#333) for black keys
5. Add 0.1s smooth transitions to all hover states
6. Add note labels (C, D, E, F, G, A, B) to white keys and (C#, Eb, F#, G#, Bb) to black keys
7. Add realistic shadows:
   - Inset shadow for white keys
   - Drop shadow for black keys
   - Pressed-in effect on hover