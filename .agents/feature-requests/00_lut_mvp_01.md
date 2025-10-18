## Date:

2025-10-18 12:18AM

## Title:

Lut mvp 1

## What

This feature is the initial MVP of lookup - an interactive app where user can see how a LUT is generates

## User Stories

- [] When the user goes to `/` user can see their past geneterated LUTS.
- [] When clicked on a single lut it should send them to `/luts/:lut-id` showing the entire process [please see below]
- [] User can also start a new LUT flow pipeline,
- [] In the home page
- [] A user can upload two photos, a before and after photo
- [] When the user hits submit, it sends the photos to backend calling mutation called `generate-lut.mutation.ts`
- [] Inside the mutation it should take the before and after photo and based on that should called `generate-lut` pure function. The generated lut should then return to the user
- [] It should also capture every single call that happened inside generate-lut.. And so that user can interacitvely click though each step.. essentally the app should generate a DAG graph of the entire process
- [] In the UI, try to use UI library like React Flow to display the entire process. It should include information such as: input, output and latency. Each process should be named. For UI please refer to this link: https://ai-sdk.dev/elements/examples/workflow
- [] Persist this [please see ./routes/demo/api.tq-todos.ts for inspration]

### Error Handling & User Feedback:

- [] When a user uploads an invalid file format, they see a clear error message explaining supported formats
- [] When image upload fails due to network issues, the user can retry the upload
- [] During LUT generation, the user sees a progress indicator with estimated completion time
- [] When LUT generation fails, the user receives a specific error message with suggested fixes
- [] When the server is processing too many requests, users see a queue position or retry later message

### Data Management:

- [] When LUTs are generated, they are automatically saved with timestamps and unique IDs
- [] Users can see how many LUTs they have stored and total storage used
- [] Old LUTs (older than 30 days) are automatically cleaned up to manage storage
- [] Users can manually delete LUTs they no longer need
- [] LUT data persists across browser sessions and page refreshes

### LUT Management:

- [] Users can search their LUTs by creation date or keywords
- [] Users can add custom names/descriptions to their generated LUTs
- [] Users can download generated LUT files in standard formats (.cube, .3dl)
- [] Users can delete individual LUTs from their history
- [] Users can duplicate existing LUTs with slight modifications

### Technical Specs:

- [] Users can upload JPEG, PNG, and WebP image formats
- [] Image files larger than 10MB show an error before upload
- [] LUT generation completes within 30 seconds for standard image sizes
- [] The app works on modern browsers (Chrome, Firefox, Safari, Edge)
- [] The workflow visualization loads smoothly with up to 50 processing steps

### UX Enhancements:

- [] First-time users see a brief tutorial explaining the LUT generation process
- [] Users can toggle between before/after images with a slider comparison
- [] The app is fully functional on mobile devices with touch-friendly controls
- [] All interactive elements are keyboard accessible
- [] High contrast mode is available for accessibility

### Process Visualization:

- [] Each processing step shows input/output data types and sizes
- [] Users can click on any step to see detailed performance metrics
- [] Processing steps are color-coded by type (analysis, transformation, validation)
- [] Users can zoom and pan the workflow diagram for complex processes
- [] Critical steps in the process are highlighted for user attention

### Security & Privacy:

- [] Uploaded images are automatically deleted after 7 days
- [] Users receive clear notifications about data retention policies
- [] No personal data is stored without explicit user consent
- [] All file transfers use secure HTTPS connections
- [] Users can request immediate deletion of all their data

### Edge Cases:

- [] Very large images (>5MP) are automatically resized before processing
- [] When similar before/after images are uploaded, users get a warning about potential poor results
- [] Concurrent LUT generations are queued with estimated wait times
- [] Network interruptions during processing allow users to resume or restart
- [] Unsupported file types are filtered out before upload attempt
