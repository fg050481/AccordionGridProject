# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASP.NET WebForms POC demonstrating a reusable **AccordionGrid** component for managing POA (Power of Attorney) form templates. The implementation is a stub/reference ready for wiring into a production service layer.

## Build & Run

Open `AccordionGridProject.sln` in Visual Studio 2017+. Run with IIS Express (F5 or Ctrl+F5).

- Default URL: `https://localhost:44323/`
- Target framework: .NET 4.8
- No NuGet restore needed beyond what VS does automatically (Newtonsoft.Json 13.0.4)

There are no CLI build/test commands — this project uses Visual Studio tooling only.

## Architecture

### Data Flow

```
AccordionGrid.js (component)
    ↓
Default.aspx (grid init, callbacks, WebMethod calls)
    ↓
Default.aspx.cs (WebMethods, data formatting)
    ↓
FakePoaFormsService  ←── replace with real IPoaFormsService
    ↓
(Entity Framework / real DB — not wired yet)
```

### Key Files

| File | Role |
|------|------|
| `Scripts/AccordionGrid.js` | Self-contained grid component (~2300 lines, zero external dependencies, CSS embedded) |
| `Default.aspx` | Grid initialization, field definitions, lookup wiring, client-side callbacks |
| `Default.aspx.cs` | WebMethods for CRUD, pagination, extraction/mapping stubs; `FakePoaFormsService` seed data |
| `UploadDocument.ashx.cs` | Multipart file upload handler; returns `{ guid }` |
| `DownloadDocument.ashx.cs` | File download handler; streams blob as attachment |
| `Readme/LookupImplementation.txt` | Step-by-step production wiring guide |

### First-Page vs. Subsequent Pages

- **First page**: data injected into a `HiddenField` during `Page_Load` (avoids timing issues).
- **Subsequent pages / search / sort / filter**: `dataLoader` callback calls the `GetPage` WebMethod.

### Lookup System

All dropdown lookups are injected as `window.poaLookups` via `RegisterStartupScript`. Each entry is `[{ label, value }, ...]` where `value` is the FK id (except State, which uses the two-letter abbreviation resolved server-side).

### Document Handling

- **Upload**: XHR `FormData` → `UploadDocument.ashx` → returns `guid`. The Save button stays locked until a valid guid is confirmed (insert flow).
- **Download**: hidden iframe GET to `DownloadDocument.ashx?blobName=...&fileName=...&fileExt=...`.

### Extraction Polling

`TriggerExtraction` enqueues a Hangfire job (stub). `startExtractionPolling` polls `GetExtractionStatus` every 5 seconds, up to 24 polls, updating the badge in real time.

## Production Wiring Checklist

When integrating into a real environment (see `Readme/LookupImplementation.txt` for details):

1. Replace `FakePoaFormsService` with real `IPoaFormsService` in `LoadFirstPage()` and `GetPage()`.
2. Wire `InsertForm` / `UpdateForm` to EF context with proper entity mapping.
3. Replace state abbreviation lookup with `_context.state_codes.Where(...)`.
4. Implement blob storage calls in `UploadDocument.ashx.cs` and `DownloadDocument.ashx.cs`.
5. Delete `FakePoaFormsService`, stub `PoaFormModel`, and stub `LookupItem` classes.

## AccordionGrid.js Component Notes

The component is intentionally self-contained (no jQuery, no Bootstrap). When modifying it:

- CSS is embedded at the top of the JS file — do not extract to a separate stylesheet.
- All grid configuration (columns, edit fields, action buttons) lives in `Default.aspx`, not in the component itself.
- The component exposes callbacks (`onSave`, `onDelete`, `onAction`, `dataLoader`) — wire behavior through those, not by patching the component internals.
