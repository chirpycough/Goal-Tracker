## Packages
react-dropzone | Beautiful drag-and-drop file upload interactions
recharts | Data visualization for player performance radar and bar charts
framer-motion | Smooth animations and page transitions
clsx | Utility for constructing className strings
tailwind-merge | Utility for merging tailwind classes safely

## Notes
- Tailwind Config: Need to extend fontFamily with `display: ["var(--font-display)"]` and `sans: ["var(--font-sans)"]`.
- The upload endpoint expects `multipart/form-data` with fields `video` (file) and optionally `playerColor` (text).
- Video processing is asynchronous; the frontend polls the `GET /api/videos/:id` endpoint every 3 seconds while status is `pending` or `processing`.
