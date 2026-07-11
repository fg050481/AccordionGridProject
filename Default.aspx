<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="AccordionGridProject.Default" %>

<!DOCTYPE html>
<html lang="en">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>POA Grid – Test Harness</title>

    <%-- AccordionGrid: single file, zero external dependencies --%>
    <script src="Scripts/AccordionGrid.js"></script>

    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #eef0ee;
            margin: 0;
            padding: 24px;
            font-size: 13px;
        }
        .page-wrap { max-width: 1200px; margin: 0 auto; }

        /* ── "section" chrome that mimics C3 ── */
        .c3-section {
            background: #fff;
            border: 1px solid #d0d4d0;
            border-radius: 6px;
            margin-bottom: 24px;
            overflow: hidden;
        }
        .c3-section-header {
            background: #f4f5f4;
            border-bottom: 1px solid #d0d4d0;
            padding: 9px 16px;
            font-size: 13px;
            font-weight: 600;
            color: #2e7d2e;
        }
        .c3-section-body { padding: 16px; }

        /* ── Debug panel ── */
        #debugPanel {
            background: #1a1a1a;
            color: #7ec87e;
            font-family: Consolas, monospace;
            font-size: 12px;
            padding: 12px 14px;
            border-radius: 4px;
            max-height: 180px;
            overflow-y: auto;
            margin-top: 16px;
            white-space: pre-wrap;
        }
        #debugPanel .info  { color: #87ceeb; }
        #debugPanel .warn  { color: #f0c040; }
        #debugPanel .err   { color: #f08080; }
        #debugPanel .ok    { color: #7ec87e; }

        .debug-toggle {
            font-size: 12px;
            color: #666;
            cursor: pointer;
            margin-top: 8px;
            display: inline-block;
            user-select: none;
        }
        .debug-toggle:hover { color: #2e7d2e; }
    </style>
</head>
<body>
<form id="form1" runat="server">

<%-- Hidden fields: code-behind writes JSON here. Always in the rendered HTML,
     no timing dependency on RegisterStartupScript injection order.
     Same belt-and-suspenders pattern used for both grid data and lookups. --%>
<asp:HiddenField ID="HiddenGridData"  runat="server" ClientIDMode="Static" Value="[]" />
<asp:HiddenField ID="HiddenLookups"   runat="server" ClientIDMode="Static" Value="{}" />
<div class="page-wrap">

    <%-- ── Page header ── --%>
    <div style="margin-bottom:18px;">
        <h1 style="font-size:18px;font-weight:600;color:#1a1e1a;margin:0 0 4px;">
            POA Form Management
        </h1>
        <p style="color:#6a736a;margin:0;font-size:12px;">
            Test harness — hardcoded service data, no database required.
        </p>
    </div>

    <%-- ── Grid section ── --%>
    <div class="c3-section">
        <div class="c3-section-header">+ Add / Edit POA Template</div>
        <div class="c3-section-body">
            <%-- AccordionGrid mounts here --%>
            <div id="poaGrid"></div>
        </div>
    </div>

    <%-- ── Debug panel (collapsible) ── --%>
    <span class="debug-toggle" onclick="toggleDebug()">▼ Event log</span>
    <div id="debugPanel"></div>

</div>
</form>

<%-- ═════════════════════════════════════════════════════════════════
     GRID INITIALISATION
     window.poaTemplatesData is injected by the code-behind via
     ClientScript.RegisterStartupScript (runs just before </form>).
═════════════════════════════════════════════════════════════════ --%>
<script type="text/javascript">
    (function () {
        'use strict';

        /* ── Columns shown in the collapsed row ─────────────────────── */
        var columns = [
            { key: 'Description', label: 'Description', sortable: true },
            { key: 'State', label: 'State', width: '70px', sortable: true, align: 'center' },
            {
                key: 'ExtractionStatus', label: 'Extraction', width: '130px', sortable: true,
                badge: { map: { 'Completed': 'success', 'In Progress': 'info', 'Not Started': 'default', 'Error': 'danger' }, defaultClass: 'default' }
            },
            {
                key: 'MappingStatus', label: 'Mapping', width: '120px', sortable: true,
                badge: { map: { 'Mapped': 'success', 'Partial': 'info', 'Not Mapped': 'default' }, defaultClass: 'default' }
            },
            {
                key: 'LastUpdated', label: 'Last Updated', width: '150px', sortable: true,
                align: 'center',
                format: function (v) {
                    if (!v) return '<span style="color:#9aa09a;font-size:12px;">—</span>';
                    return '<span style="font-size:12px;">' + v + '</span>';
                }
            },
            {
                // Display name of the last editor. Stamped server-side on
                // Insert/Update — the grid._apply() re-fetch in onSave brings
                // the fresh value back automatically. Display-only column:
                // no editField key contract, no DTO field.
                key: 'UpdatedBy', label: 'Updated By', width: '130px', sortable: true,
                format: function (v) {
                    if (!v) return '<span style="color:#9aa09a;font-size:12px;">—</span>';
                    return '<span style="font-size:12px;">' + v + '</span>';
                }
            },
            {
                key: 'Active', label: 'Active', width: '70px', align: 'center',
                format: function (v) {
                    return v
                        ? '<span class="ag-badge ag-badge-success">Yes</span>'
                        : '<span class="ag-badge ag-badge-danger">No</span>';
                }
            }
        ];

        /* ── Lookup tables ────────────────────────────────────────────
           PRIMARY:   HiddenLookups hidden field — always in the rendered
                      HTML, no timing dependency on script injection order.
           SECONDARY: window.poaLookups — set by RegisterStartupScript,
                      used as fallback if the hidden field is empty.
        ──────────────────────────────────────────────────────────── */
        var LOOKUPS = null;

        // Primary: hidden field
        var hiddenLookups = document.getElementById('HiddenLookups');
        if (hiddenLookups && hiddenLookups.value && hiddenLookups.value !== '{}') {
            try {
                LOOKUPS = JSON.parse(hiddenLookups.value);
                log('ok', 'Lookups source: HiddenLookups field.');
            } catch (ex) {
                log('err', 'HiddenLookups parse error: ' + ex.message);
            }
        }

        // Secondary: window variable from RegisterStartupScript
        if (!LOOKUPS && window.poaLookups) {
            LOOKUPS = window.poaLookups;
            log('info', 'Lookups source: window.poaLookups.');
        }

        if (!LOOKUPS) {
            log('err', 'Lookups not found. Check LoadLookups() in code-behind — ' +
                'verify HiddenLookups.Value is assigned and RegisterStartupScript is executing.');
        }

        /* ── Edit fields shown in the expanded accordion panel ─────── */
        var editFields = [
            { key: 'Description', label: 'Description', type: 'text', required: true, placeholder: 'Enter description' },
            { key: 'State', label: 'State', type: 'select', options: LOOKUPS.states },
            { key: 'MailCenterId', label: 'Mail Center', type: 'select', options: LOOKUPS.mailCenters },
            { key: 'Active', label: 'Active', type: 'checkbox' },

            // Key names use the Id suffix so e.record stores the FK id directly
            // under the same name as the DTO field — no translation needed in onSave.
            { key: 'ServiceTypeId', label: 'Service Type', type: 'select', options: LOOKUPS.serviceTypes },
            { key: 'PoaFormTypeId', label: 'Form Type', type: 'select', options: LOOKUPS.poaFormTypes },
            { key: 'FormUseId', label: 'Form Use', type: 'select', options: LOOKUPS.formUses },
            { key: 'PoaTypeId', label: 'POA Type', type: 'select', options: LOOKUPS.poaTypes },

            { key: 'SignatureTypeId', label: 'Signature Type', type: 'select', options: LOOKUPS.signatureTypes },
            { key: 'ReturnTypeId', label: 'Return Type', type: 'select', options: LOOKUPS.returnTypes },
            { key: 'OnlineRequirementId', label: 'Online Requirement', type: 'select', options: LOOKUPS.onlineRequirements },

            { key: 'FileName', label: 'File Name', type: 'text', readOnly: true },
            { key: 'DocumentReference', label: 'Document Reference', type: 'text', readOnly: true },
            // Audit field — server-stamped, never user-editable (readOnly, not
            // disabled: disabled inputs are skipped by _collectFormValues).
            { key: 'UpdatedBy', label: 'Updated By', type: 'text', readOnly: true },
            { key: 'Notes', label: 'Notes', type: 'textarea', fullWidth: true, placeholder: 'Optional notes…' }
        ];

        /* ── Sections (green header groupings in the edit panel) ───── */
        var editSections = [
            { title: 'Template Info', fields: ['Description', 'State', 'MailCenterId', 'Active'] },
            { title: 'Classification', fields: ['ServiceTypeId', 'PoaFormTypeId', 'FormUseId', 'PoaTypeId'] },
            { title: 'Processing Rules', fields: ['SignatureTypeId', 'ReturnTypeId', 'OnlineRequirementId'] },
            { title: 'Document', fields: ['FileName', 'DocumentReference', 'UpdatedBy'], isDocumentSection: true },
            { title: 'Notes', fields: ['Notes'] }
        ];

        /* ── Action buttons in the Actions column ───────────────────── */
        var actionButtons = [
            { key: 'edit', label: 'Edit' },
            { key: 'extract', label: 'Extract' },
            { key: 'map', label: 'Map' },
            {
                key: 'generate', label: 'Generate', cssClass: 'ag-btn-primary',
                visible: function (r) { return r.MappingStatus === 'Mapped'; }
            },
            {
                key: 'download', label: 'Download',
                visible: function (r) {
                    return !!(r.DocumentReference && r.DocumentReference.length > 0);
                }
            },
            { key: 'delete', label: 'Delete', cssClass: 'ag-btn-danger' }
        ];

        /* ── Filter dropdown (by State) ─────────────────────────────── */
        var filterOptions = [
            { label: 'All States', value: '' },
            { label: 'TX', value: 'TX' },
            { label: 'CA', value: 'CA' },
            { label: 'OH', value: 'OH' },
            { label: 'NY', value: 'NY' },
            { label: 'FL', value: 'FL' }
        ];

        /* ── Create the grid ─────────────────────────────────────────── */
        var grid = AccordionGrid.create('poaGrid', {
            title: 'POA Templates',
            addButtonLabel: '+ Add New Template',
            showAddButton: true,
            singleExpand: true,
            expandMode: 'edit',
            pageSize: 10,
            pageSizeOptions: [10, 25, 50],
            searchPlaceholder: 'Search templates…',
            filterField: 'State',
            filterOptions: filterOptions,
            emptyMessage: 'No templates found.',
            columns: columns,
            editFields: editFields,
            editSections: editSections,
            actionButtons: actionButtons,
            showInsert: true,
            showUpdate: true,
            showDelete: true,
            showCancel: true,

            /* ── Column layout ───────────────────────────────────────
               resizableColumns: drag the right edge of any column
               header to resize (Excel-style); double-click the handle
               to reset that column. Defaults stay aligned regardless
               of text length or button count per row.
               actionsColumnWidth: FIXED width sized to the fullest
               button row (Edit+Extract+Map+Generate+Download+Delete).
               Adjust if buttons are added/removed.
            ────────────────────────────────────────────────────────*/
            resizableColumns: true,
            actionsColumnWidth: '430px',

            /* ── SERVER-SIDE PAGINATION via dataLoader ───────────────
               The grid calls this every time the user pages, searches,
               sorts, or changes the filter.  params contains:
                 { page, pageSize, search, filter, sortKey, sortDir }
               done(array) hands the page slice back to the grid.
               The grid uses _serverTotalCount (set below on first load)
               for the pager — it never tries to count client-side.
            ────────────────────────────────────────────────────────*/
            dataLoader: function (params, done) {
                log('info', 'dataLoader → page=' + params.page +
                    ' size=' + params.pageSize +
                    (params.search ? ' search="' + params.search + '"' : '') +
                    (params.filter ? ' filter="' + params.filter + '"' : '') +
                    (params.sortKey ? ' sort=' + params.sortKey + ' ' + params.sortDir : ''));

                fetch('Default.aspx/GetPage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        page: params.page,
                        pageSize: params.pageSize,
                        search: params.search || '',
                        filter: params.filter || '',
                        sortKey: params.sortKey || '',
                        sortDir: params.sortDir || 'asc'
                    }),
                    credentials: 'same-origin'
                })
                    .then(function (r) {
                        if (!r.ok) throw new Error('HTTP ' + r.status);
                        return r.json();
                    })
                    .then(function (resp) {
                        // WebMethod wraps in { d: "json-string" }
                        var payload = typeof resp.d === 'string'
                            ? JSON.parse(resp.d) : resp;

                        // Update the pager total any time the server reports a new count
                        // (search/filter may reduce it)
                        grid._serverTotalCount = payload.totalCount;
                        grid._filtered = { length: payload.totalCount }; // tells pager the real total
                        log('ok', 'dataLoader ← ' + payload.items.length +
                            ' items, total=' + payload.totalCount);
                        done(payload.items);
                    })
                    .catch(function (err) {
                        log('err', 'dataLoader failed: ' + err.message);
                        done([]);
                    });
            },

            /* ── PDF / blob upload ──────────────────────────────────
               Called by the grid when user clicks "Upload to Storage".
               Receives: file (File object), onProgress(pct), done(err, guid)
               In production: POST to UploadDocument WebMethod.
            ────────────────────────────────────────────────────────*/
            uploadDocumentField: 'DocumentReference',   // GUID stored here
            uploadMaxSizeMb: 20,                   // 15 | 20 | 30 — default 20
            uploadAllowedExtensions: ['.pdf'],          // e.g. ['.pdf','.docx','.tiff']
            onUploadDocument: function (file, onProgress, done) {
                log('info', 'Upload started: ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)');

                // POST to the Generic Handler (.ashx) — NOT a [WebMethod].
                // [WebMethod] requires Content-Type: application/json and cannot
                // receive multipart/form-data; the .ashx handles all request types.
                var form = new FormData();
                form.append('file', file, file.name);   // key "file" must match
                // Request.Files["file"] in the handler

                // XHR instead of fetch() — only XHR exposes upload progress events.
                var xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        onProgress(Math.round((e.loaded / e.total) * 100));
                    }
                });

                xhr.addEventListener('load', function () {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (xhr.status === 200 && resp.guid) {
                            log('ok', 'Upload complete. Reference: ' + resp.guid);
                            done(null, resp.guid);
                        } else {
                            // Handler returned { "error": "..." }
                            var msg = (resp && resp.error) ? resp.error : 'Upload failed (HTTP ' + xhr.status + ').';
                            log('err', msg);
                            done(msg);
                        }
                    } catch (ex) {
                        // Response was not JSON — likely an unhandled server error page
                        var raw = xhr.responseText ? xhr.responseText.substring(0, 120) : '(empty)';
                        log('err', 'Non-JSON response: ' + raw);
                        done('Unexpected response from server. Check the browser Network tab for details.');
                    }
                });

                xhr.addEventListener('error', function () {
                    var msg = 'Network error during upload.';
                    log('err', msg);
                    done(msg);
                });

                xhr.open('POST', 'UploadDocument.ashx');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.send(form);
            },

            /* ── Callbacks ─────────────────────────────────────────── */
            onLoad: function (e) {
                log('ok', 'Grid loaded — ' + e.data.length + ' records.');
            },

            onSave: function (e) {
                // Build a clean payload containing only the fields PoaFormDto
                // expects.  e.record also contains internal grid keys (_agId,
                // ExtractionStatus, etc.) that would cause a 500 if sent raw.
                // Active comes from a checkbox so coerce to bool explicitly.
                var dto = {
                    Id: e.record.Id || 0,
                    Description: e.record.Description || '',
                    State: e.record.State || '',   // code (TX, CA…) → StateId on server
                    Active: e.record.Active === true || e.record.Active === 'true' || e.record.Active === 'on',
                    MailCenterId: parseInt(e.record.MailCenterId, 10) || null,

                    // Select fields: key name matches DTO field name directly.
                    // e.record.ServiceTypeId already holds the FK int — no translation.
                    ServiceTypeId: parseInt(e.record.ServiceTypeId, 10) || null,
                    PoaFormTypeId: parseInt(e.record.PoaFormTypeId, 10) || null,
                    FormUseId: parseInt(e.record.FormUseId, 10) || null,
                    PoaTypeId: parseInt(e.record.PoaTypeId, 10) || null,
                    SignatureTypeId: parseInt(e.record.SignatureTypeId, 10) || null,
                    ReturnTypeId: parseInt(e.record.ReturnTypeId, 10) || null,
                    OnlineRequirementId: parseInt(e.record.OnlineRequirementId, 10) || null,

                    DocumentReference: e.record.DocumentReference || '',
                    FileName: e.record.FileName || '',
                    FileExtension: e.record.FileExtension || '',
                    Notes: e.record.Notes || ''
                };

                if (e.isNew) {
                    // ── INSERT ────────────────────────────────────────────────
                    // ASP.NET WebMethod with a DTO parameter requires the body
                    // wrapped as { "form": { ... } } matching the param name.
                    // After the server confirms, re-fetch the current page from
                    // the server (grid._apply keeps page/search/filter/sort) so
                    // the row shows the true Id, LastUpdated and UpdatedBy.
                    callPageMethod('InsertForm', { form: dto }, function (resp) {
                        log('ok', 'INSERT confirmed — newId=' + resp.Id
                            + '  updated=' + resp.LastUpdated
                            + '  by=' + resp.UpdatedBy);
                        grid._apply();
                    });
                } else {
                    // ── UPDATE ────────────────────────────────────────────────
                    callPageMethod('UpdateForm', { form: dto }, function (resp) {
                        log('ok', 'UPDATE confirmed — id=' + e.record.Id
                            + '  updated=' + resp.LastUpdated
                            + '  by=' + resp.UpdatedBy);
                        grid._apply();
                    });
                }
            },

            onDelete: function (e) {
                // Fired by the form Cancel/Delete button inside the expanded panel.
                // The action-button Delete path is handled in onActionClick below.
                log('warn', 'onDelete fired — id=' + e.record.Id);
            },

            onActionClick: function (e) {
                switch (e.action) {

                    // ── EDIT ──────────────────────────────────────────────────
                    case 'edit':
                        // Expands the row in full edit mode (all fields editable).
                        // The ▶ arrow expands in read-only view mode instead.
                        grid.expandRowForEdit(e.id);
                        break;

                    // ── EXTRACT ───────────────────────────────────────────────
                    // 1. POST to TriggerExtraction  → sets status "In Progress",
                    //    enqueues Hangfire job, returns JobId.
                    // 2. Badge flips to "In Progress" immediately.
                    // 3. Poll GetExtractionStatus every 5 s until Completed/Error.
                    // 4. Badge flips to final status and polling stops.
                    case 'extract':
                        callPageMethod('TriggerExtraction', { Id: e.record.Id },
                            function (resp) {
                                grid.updateRecord(e.id, { ExtractionStatus: resp.Status });
                                log('info', 'Extraction queued — id=' + e.record.Id
                                    + '  jobId=' + resp.JobId);
                                startExtractionPolling(e.id, e.record.Id, resp.JobId);
                            });
                        break;

                    // ── MAP ───────────────────────────────────────────────────
                    // Calls TriggerMapping which can return a RedirectUrl for the
                    // mapping page OR update the status inline.
                    // In production: uncomment window.location.href redirect.
                    case 'map':
                        callPageMethod('TriggerMapping', { Id: e.record.Id },
                            function (resp) {
                                grid.updateRecord(e.id, { MappingStatus: resp.Status });
                                log('info', 'Mapping triggered — id=' + e.record.Id
                                    + '  status=' + resp.Status);
                                // In production, navigate to mapping page:
                                // if (resp.RedirectUrl) window.location.href = resp.RedirectUrl;
                            });
                        break;

                    // ── GENERATE ─────────────────────────────────────────────
                    // Calls GenerateDocument which triggers the merge pipeline.
                    // In production: navigate to the generated document URL.
                    case 'generate':
                        callPageMethod('GenerateDocument', { Id: e.record.Id },
                            function (resp) {
                                log('ok', 'Generate confirmed — id=' + e.record.Id);
                                // In production, navigate to the output:
                                // if (resp.RedirectUrl) window.location.href = resp.RedirectUrl;
                                alert('Document generated for: ' + e.record.Description);
                            });
                        break;

                    // ── DOWNLOAD ─────────────────────────────────────────────
                    // Fetches the blob from DownloadDocument.ashx (mirrors
                    // GetXMFaxReceipt: blobName → stream → file attachment).
                    case 'download':
                        if (e.record.DocumentReference) {
                            var url = 'DownloadDocument.ashx' +
                                '?blobName=' + encodeURIComponent(e.record.DocumentReference) +
                                '&fileName=' + encodeURIComponent(e.record.FileName || e.record.DocumentReference) +
                                '&fileExt=' + encodeURIComponent(e.record.FileExtension || '.pdf');
                            log('info', 'Download → ' + url);
                            // Hidden iframe: triggers browser save dialog without
                            // navigating away from the page.
                            var dlFrame = document.getElementById('ag-dl-frame');
                            if (!dlFrame) {
                                dlFrame = document.createElement('iframe');
                                dlFrame.id = 'ag-dl-frame';
                                dlFrame.style.display = 'none';
                                document.body.appendChild(dlFrame);
                            }
                            dlFrame.src = url;
                        }
                        break;

                    // ── DELETE ────────────────────────────────────────────────
                    // Confirms with the user, calls DeleteForm WebMethod, then
                    // removes the row from the grid only after server confirms.
                    case 'delete':
                        if (confirm('Delete "' + e.record.Description + '"?')) {
                            callPageMethod('DeleteForm', { Id: e.record.Id },
                                function (resp) {
                                    if (resp && resp.Success) {
                                        grid.removeRecord(e.id);
                                        log('warn', 'DELETE confirmed — id=' + e.record.Id
                                            + ' "' + e.record.Description + '"');
                                    } else {
                                        log('err', 'DELETE failed — id=' + e.record.Id);
                                    }
                                });
                        }
                        break;
                }
            },

            onSearch: function (e) { log('info', 'Search: "' + e.value + '"'); },
            onFilterChange: function (e) { log('info', 'Filter: "' + (e.value || 'All') + '"'); },
            onSort: function (e) { log('info', 'Sort: ' + e.key + ' ' + e.dir); },
            onPageChange: function (e) { log('info', 'Page: ' + e.page); }
        });

        /* ── Extraction polling ───────────────────────────────────────
           After TriggerExtraction succeeds, poll GetExtractionStatus
           every 5 seconds until the job reaches Completed or Error.
           The badge updates in real time with each status response.
        ──────────────────────────────────────────────────────────── */
        function startExtractionPolling(agId, formId, jobId) {
            var MAX_POLLS = 24;   // 24 × 5s = 2 minutes max before giving up
            var polls = 0;

            var timer = setInterval(function () {
                polls++;
                callPageMethod('GetExtractionStatus', { Id: formId },
                    function (resp) {
                        log('info', 'Poll #' + polls + ' — id=' + formId
                            + '  status=' + resp.Status
                            + (jobId ? '  job=' + jobId : ''));

                        grid.updateRecord(agId, { ExtractionStatus: resp.Status });

                        if (resp.Status === 'Completed' || resp.Status === 'Error') {
                            clearInterval(timer);
                            log(resp.Status === 'Completed' ? 'ok' : 'err',
                                'Extraction ' + resp.Status + ' — id=' + formId);
                        } else if (polls >= MAX_POLLS) {
                            clearInterval(timer);
                            log('warn', 'Extraction polling timed out — id=' + formId);
                        }
                    });
            }, 5000);   // poll every 5 seconds
        }

        /* ── Generic WebMethod caller ─────────────────────────────────
           POSTs JSON to Default.aspx/<method>, unwraps ASP.NET's
           { d: "json-string" } wrapper, parses the inner JSON, and
           calls onSuccess(parsedResult).
        ──────────────────────────────────────────────────────────── */
        function callPageMethod(method, payload, onSuccess) {
            fetch(window.location.pathname + '/' + method, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload),
                credentials: 'same-origin'
            })
                .then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(function (resp) {
                    // WebMethods return { "d": "json-string" } — parse the inner value
                    var inner = (resp && resp.d !== undefined) ? resp.d : resp;
                    if (typeof inner === 'string') {
                        try { inner = JSON.parse(inner); } catch (e) { /* scalar value */ }
                    }
                    if (onSuccess) onSuccess(inner);
                })
                .catch(function (err) {
                    log('err', method + ' failed: ' + err.message);
                });
        }

        /* ── Load initial data ────────────────────────────────────────
           poaInitialData is { items:[...], totalCount:N, pageSize:N, page:1 }
           set by RegisterStartupScript / HiddenField on Page_Load.
           This is the FIRST page only — every subsequent page goes
           through dataLoader → GetPage WebMethod.
        ──────────────────────────────────────────────────────────── */
        var initial = null;

        // Primary: hidden field (always rendered, no timing dependency)
        var hiddenEl = document.getElementById('HiddenGridData');
        if (hiddenEl && hiddenEl.value && hiddenEl.value !== '[]' && hiddenEl.value !== '') {
            try { initial = JSON.parse(hiddenEl.value); }
            catch (ex) { log('err', 'HiddenField parse error: ' + ex.message); }
        }
        // Secondary: window variable from RegisterStartupScript
        if (!initial && window.poaInitialData) {
            initial = window.poaInitialData;
        }

        if (initial && initial.items && initial.items.length) {
            // Tell the grid the TRUE total so the pager shows correct page count
            // even though we only handed it the first page slice.
            grid._serverTotalCount = initial.totalCount;

            log('ok', 'Initial load — ' + initial.items.length +
                ' items on page 1 of ' +
                Math.ceil(initial.totalCount / initial.pageSize) +
                ' (total: ' + initial.totalCount + ').');

            grid.loadData(initial.items);

            // Patch the pager total after loadData (loadData resets _filtered)
            grid._filtered = { length: initial.totalCount };
            grid._renderPager && grid._renderPager();
        } else {
            log('err', 'No initial data — check LoadFirstPage() in code-behind.');
        }

        /* ── Debug log helpers ───────────────────────────────────── */
        function log(level, msg) {
            var panel = document.getElementById('debugPanel');
            var line = document.createElement('div');
            var ts = new Date().toLocaleTimeString();
            line.className = level;
            line.textContent = '[' + ts + '] ' + msg;
            panel.appendChild(line);
            panel.scrollTop = panel.scrollHeight;
            console[level === 'err' ? 'error' : level === 'warn' ? 'warn' : 'log'](msg);
        }

    }());

    function toggleDebug() {
        var p = document.getElementById('debugPanel');
        p.style.display = p.style.display === 'none' ? 'block' : 'none';
    }
</script>

</body>
</html>
