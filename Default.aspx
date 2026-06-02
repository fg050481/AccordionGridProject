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

<%-- Hidden field: code-behind writes JSON here.  Always in the rendered HTML,
     no timing dependency on RegisterStartupScript injection order. --%>
<asp:HiddenField ID="HiddenGridData" runat="server" Value="[]" />
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
                key: 'Active', label: 'Active', width: '70px', align: 'center',
                format: function (v) {
                    return v
                        ? '<span class="ag-badge ag-badge-success">Yes</span>'
                        : '<span class="ag-badge ag-badge-danger">No</span>';
                }
            }
        ];

        /* ── Edit fields shown in the expanded accordion panel ─────── */
        var editFields = [
            { key: 'Description', label: 'Description', type: 'text', required: true, placeholder: 'Enter description' },
            {
                key: 'State', label: 'State', type: 'select',
                options: 'AL,AK,AZ,AR,CA,CO,CT,DE,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY'
                    .split(',').map(function (s) { return { label: s, value: s }; })
            },
            { key: 'Active', label: 'Active', type: 'checkbox' },
            { key: 'MailCenterId', label: 'Mail Center ID', type: 'number', placeholder: '0' },

            {
                key: 'ServiceType', label: 'Service Type', type: 'select',
                options: ['Full', 'Partial', 'Limited'].map(function (s) { return { label: s, value: s }; })
            },
            {
                key: 'FormType', label: 'Form Type', type: 'select',
                options: ['POA', '2848', '8821'].map(function (s) { return { label: s, value: s }; })
            },
            {
                key: 'FormUse', label: 'Form Use', type: 'select',
                options: ['Filing', 'Representation', 'Both'].map(function (s) { return { label: s, value: s }; })
            },
            {
                key: 'PoaType', label: 'POA Type', type: 'select',
                options: ['Tax', 'Financial', 'Medical'].map(function (s) { return { label: s, value: s }; })
            },

            {
                key: 'SignatureType', label: 'Signature Type', type: 'select',
                options: ['Digital', 'Electronic', 'Wet'].map(function (s) { return { label: s, value: s }; })
            },
            {
                key: 'ReturnType', label: 'Return Type', type: 'select',
                options: ['Mail', 'Fax', 'E-File', 'Portal'].map(function (s) { return { label: s, value: s }; })
            },
            {
                key: 'OnlineRequirement', label: 'Online Requirement', type: 'select',
                options: ['None', 'Required', 'Optional'].map(function (s) { return { label: s, value: s }; })
            },

            { key: 'FileName', label: 'File Name', type: 'text', readOnly: true },
            { key: 'DocumentReference', label: 'Document Reference', type: 'text', readOnly: true },
            { key: 'Notes', label: 'Notes', type: 'textarea', fullWidth: true, placeholder: 'Optional notes…' }
        ];

        /* ── Sections (green header groupings in the edit panel) ───── */
        var editSections = [
            { title: 'Template Info', fields: ['Description', 'State', 'Active', 'MailCenterId'] },
            { title: 'Classification', fields: ['ServiceType', 'FormType', 'FormUse', 'PoaType'] },
            { title: 'Processing Rules', fields: ['SignatureType', 'ReturnType', 'OnlineRequirement'] },
            // isDocumentSection:true tells the grid to inject the PDF upload widget here
            { title: 'Document', fields: ['FileName', 'DocumentReference'], isDocumentSection: true },
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
                if (e.isNew) {
                    log('ok', 'INSERT simulated — record: ' + JSON.stringify(e.record));
                    /* In production: POST to WebMethod InsertForm */
                } else {
                    log('ok', 'UPDATE simulated — id=' + e.record.Id
                        + '  description="' + e.record.Description + '"');
                    /* In production: POST to WebMethod UpdateForm */
                }
            },

            onDelete: function (e) {
                log('warn', 'DELETE simulated — id=' + e.record.Id);
                /* In production: POST to WebMethod DeleteForm */
            },

            onActionClick: function (e) {
                switch (e.action) {

                    case 'edit':
                        // Opens the row in EDIT mode (all fields are inputs).
                        // Clicking the ▶ arrow opens in READ-ONLY view instead.
                        grid.expandRowForEdit(e.id);
                        break;

                    case 'extract':
                        /* Simulate: update status badge without a real server call */
                        grid.updateRecord(e.id, { ExtractionStatus: 'In Progress' });
                        log('info', 'EXTRACT queued — id=' + e.record.Id);
                        break;

                    case 'map':
                        /* Simulate: mark as partially mapped */
                        grid.updateRecord(e.id, { MappingStatus: 'Partial' });
                        log('info', 'MAP clicked — id=' + e.record.Id);
                        break;

                    case 'generate':
                        log('ok', 'GENERATE clicked — id=' + e.record.Id);
                        /* In production: window.location.href = '/POA/Generate.aspx?id=' + e.record.Id */
                        alert('Generate clicked for: ' + e.record.Description);
                        break;

                    case 'delete':
                        if (confirm('Delete "' + e.record.Description + '"?')) {
                            grid.removeRecord(e.id);
                            log('warn', 'DELETE — id=' + e.record.Id);
                        }
                        break;
                }
            },

            onSearch: function (e) { log('info', 'Search: "' + e.value + '"'); },
            onFilterChange: function (e) { log('info', 'Filter: "' + (e.value || 'All') + '"'); },
            onSort: function (e) { log('info', 'Sort: ' + e.key + ' ' + e.dir); },
            onPageChange: function (e) { log('info', 'Page: ' + e.page); }
        });

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
