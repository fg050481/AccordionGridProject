/**
 * AccordionGrid.js
 * Enterprise-grade Accordion + Data Grid component for ASP.NET WebForms (.NET 4.8)
 * Zero external dependencies · Self-contained CSS · ARIA accessible
 * Version 1.0.1
 */
(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AccordionGrid = factory();
    }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';

    /* =========================================================
       SECTION 1 — EMBEDDED CSS
    ========================================================= */
    var CSS = `
/* ── AccordionGrid Reset & Variables ── */
.ag-wrapper *, .ag-wrapper *::before, .ag-wrapper *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
.ag-wrapper {
    --ag-green-dark:   #236122;
    --ag-green-mid:    #2e7d2e;
    --ag-green-light:  #3a9e3a;
    --ag-green-header: linear-gradient(180deg,#2e7d2e 0%,#236122 100%);
    --ag-white:        #ffffff;
    --ag-bg:           #f4f5f6;
    --ag-surface:      #ffffff;
    --ag-border:       #d4d8db;
    --ag-row-hover:    #f0f7f0;
    --ag-row-expanded: #eaf3ea;
    --ag-text-dark:    #1a1e1a;
    --ag-text-mid:     #4a5048;
    --ag-text-light:   #7a837a;
    --ag-accent:       #1a5c1a;
    --ag-btn-border:   #b0b8b0;
    --ag-btn-bg:       #f8f9f8;
    --ag-btn-hover:    #e8ede8;
    --ag-shadow-sm:    0 1px 3px rgba(0,0,0,.10);
    --ag-shadow-md:    0 4px 12px rgba(0,0,0,.12);
    --ag-radius:       4px;
    --ag-radius-lg:    6px;
    --ag-font:         'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    --ag-font-mono:    'Consolas', 'Courier New', monospace;
    font-family: var(--ag-font);
    color: var(--ag-text-dark);
    font-size: 13px;
    background: transparent;
    position: relative;
}

/* ── Toolbar: Title bar ── */
.ag-title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 14px;
    background: var(--ag-surface);
    border: 1px solid var(--ag-border);
    border-bottom: none;
    border-radius: var(--ag-radius-lg) var(--ag-radius-lg) 0 0;
}
.ag-title-bar h2 {
    font-size: 15px;
    font-weight: 700;
    color: var(--ag-text-dark);
    letter-spacing: .01em;
}
.ag-title-bar h2 span.ag-count {
    font-weight: 400;
    color: var(--ag-text-mid);
    font-size: 13px;
    margin-left: 4px;
}
.ag-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    background: var(--ag-green-mid);
    color: #fff;
    border: none;
    border-radius: var(--ag-radius);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s;
    font-family: var(--ag-font);
    letter-spacing: .02em;
}
.ag-add-btn:hover { background: var(--ag-green-dark); }
.ag-add-btn svg { flex-shrink: 0; }

/* ── Refresh button (sits left of Add button in title bar) ── */
.ag-refresh-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    background: var(--ag-surface);
    color: var(--ag-green-mid);
    border: 1px solid var(--ag-border);
    border-radius: var(--ag-radius);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--ag-font);
    letter-spacing: .02em;
    transition: background .15s, border-color .15s;
}
.ag-refresh-btn:hover  { background: var(--ag-row-hover); border-color: var(--ag-green-mid); }
.ag-refresh-btn:disabled { opacity: .6; cursor: default; }

/* ── Search / Filter Bar ── */
.ag-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--ag-surface);
    border: 1px solid var(--ag-border);
    border-bottom: none;
}
.ag-search-wrap {
    flex: 1;
    position: relative;
}
.ag-search-wrap svg {
    position: absolute;
    left: 9px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ag-text-light);
    pointer-events: none;
}
.ag-search {
    width: 100%;
    padding: 7px 10px 7px 30px;
    border: 1px solid var(--ag-border);
    border-radius: var(--ag-radius);
    font-size: 13px;
    font-family: var(--ag-font);
    color: var(--ag-text-dark);
    background: #fff;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
}
.ag-search:focus {
    border-color: var(--ag-green-mid);
    box-shadow: 0 0 0 2px rgba(46,125,46,.18);
}
.ag-filter-select {
    min-width: 160px;
    padding: 7px 28px 7px 10px;
    border: 1px solid var(--ag-border);
    border-radius: var(--ag-radius);
    font-size: 13px;
    font-family: var(--ag-font);
    color: var(--ag-text-dark);
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a5048'/%3E%3C/svg%3E") no-repeat right 10px center;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    cursor: pointer;
    transition: border-color .15s;
}
.ag-filter-select:focus { border-color: var(--ag-green-mid); }

/* ── Column Header Row ── */
.ag-header {
    display: flex;
    align-items: stretch;
    background: var(--ag-green-header);
    color: #fff;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    border: 1px solid var(--ag-green-dark);
    border-bottom: none;
    user-select: none;
}
.ag-header-expander {
    width: 36px;
    flex-shrink: 0;
}
.ag-header-cell {
    padding: 10px 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    transition: background .12s;
}
.ag-header-cell:hover { background: rgba(255,255,255,.08); }
.ag-header-cell.ag-col-actions { cursor: default; }
.ag-header-cell.ag-col-actions:hover { background: transparent; }
.ag-sort-icon {
    display: inline-flex;
    flex-direction: column;
    gap: 1px;
    opacity: .5;
    margin-left: 2px;
}
.ag-sort-icon svg { display: block; }
.ag-header-cell[data-sort="asc"] .ag-sort-icon,
.ag-header-cell[data-sort="desc"] .ag-sort-icon { opacity: 1; }

/* ── Grid Body ── */
.ag-body {
    border: 1px solid var(--ag-border);
    background: var(--ag-surface);
}

/* ── Row ── */
.ag-row-wrap {
    border-bottom: 1px solid var(--ag-border);
    transition: background .12s;
}
.ag-row-wrap:last-child { border-bottom: none; }
.ag-row {
    display: flex;
    align-items: center;
    cursor: default;
    min-height: 44px;
    transition: background .12s;
}
.ag-row:hover { background: var(--ag-row-hover); }
.ag-row-wrap.ag-expanded > .ag-row { background: var(--ag-row-expanded); }

/* ── Expand toggle ── */
.ag-expander {
    width: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    cursor: pointer;
    color: var(--ag-text-mid);
    transition: color .12s;
    background: none;
    border: none;
    font-family: var(--ag-font);
}
.ag-expander:hover { color: var(--ag-green-mid); }
.ag-expander-icon {
    display: inline-block;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 8px solid currentColor;
    transition: transform .18s cubic-bezier(.4,0,.2,1);
}
.ag-row-wrap.ag-expanded .ag-expander-icon {
    transform: rotate(90deg);
}

/* ── Data cells ── */
.ag-cell {
    padding: 10px 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    color: var(--ag-text-dark);
    display: flex;
    align-items: center;
}
.ag-cell.ag-col-actions {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: nowrap;
    overflow: visible;
}

/* ── Action Buttons ── */
.ag-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 5px 10px;
    background: var(--ag-btn-bg);
    border: 1px solid var(--ag-btn-border);
    border-radius: var(--ag-radius);
    font-size: 12px;
    font-weight: 500;
    font-family: var(--ag-font);
    color: var(--ag-text-dark);
    cursor: pointer;
    white-space: nowrap;
    transition: background .12s, border-color .12s, box-shadow .12s;
}
.ag-action-btn:hover {
    background: var(--ag-btn-hover);
    border-color: #8a938a;
    box-shadow: var(--ag-shadow-sm);
}
.ag-action-btn:active { transform: translateY(1px); }
.ag-action-btn.ag-btn-primary {
    background: var(--ag-green-mid);
    border-color: var(--ag-green-dark);
    color: #fff;
}
.ag-action-btn.ag-btn-primary:hover { background: var(--ag-green-dark); }
.ag-action-btn.ag-btn-danger {
    color: #c0392b;
    border-color: #e0a0a0;
}
.ag-action-btn.ag-btn-danger:hover { background: #fdf0f0; border-color: #c0392b; }

/* ── Status badges ── */
.ag-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .02em;
    white-space: nowrap;
}
.ag-badge-default  { background: #eee; color: #555; }
.ag-badge-success  { background: #e6f4e6; color: #256025; }
.ag-badge-warning  { background: #fff8e1; color: #7c5e00; }
.ag-badge-danger   { background: #fdecea; color: #a02020; }
.ag-badge-info     { background: #e3f0fb; color: #1a5a9a; }

/* ── Expanded Detail Panel ── */
.ag-detail-panel {
    display: none;
    background: #f8fbf8;
    border-top: 2px solid var(--ag-green-mid);
    padding: 20px 24px 16px 52px;
    animation: ag-slide-down .18s ease;
}
.ag-row-wrap.ag-expanded .ag-detail-panel { display: block; }
@keyframes ag-slide-down {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Detail panel sections ── */
.ag-section {
    margin-bottom: 18px;
}
.ag-section-header {
    display: flex;
    align-items: center;
    background: var(--ag-green-header);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 14px;
    border-radius: var(--ag-radius) var(--ag-radius) 0 0;
    margin-bottom: 0;
    letter-spacing: .03em;
}
.ag-section-body {
    padding: 16px;
    background: #fff;
    border: 1px solid var(--ag-border);
    border-top: none;
    border-radius: 0 0 var(--ag-radius) var(--ag-radius);
}

/* ── Field Grid ── */
.ag-field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px 20px;
}
.ag-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.ag-field.ag-field-full { grid-column: 1 / -1; }
.ag-field-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--ag-text-dark);
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 3px;
    display: block;
}
.ag-field-required::after {
    content: ' *';
    color: #c0392b;
}
.ag-field input[type=text],
.ag-field input[type=number],
.ag-field input[type=date],
.ag-field input[type=email],
.ag-field textarea,
.ag-field select {
    padding: 7px 10px;
    border: 1px solid var(--ag-border);
    border-radius: var(--ag-radius);
    font-size: 13px;
    font-family: var(--ag-font);
    color: var(--ag-text-dark);
    background: #fff;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    width: 100%;
}
.ag-field input:focus,
.ag-field textarea:focus,
.ag-field select:focus {
    border-color: var(--ag-green-mid);
    box-shadow: 0 0 0 2px rgba(46,125,46,.15);
}
.ag-field textarea { resize: vertical; min-height: 68px; }
.ag-field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a5048'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    -webkit-appearance: none;
    appearance: none;
    padding-right: 28px;
}
.ag-field-check {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding-top: 20px;
}
.ag-field-check input[type=checkbox] {
    width: 16px;
    height: 16px;
    accent-color: var(--ag-green-mid);
    cursor: pointer;
    flex-shrink: 0;
}
.ag-field-check .ag-field-label {
    text-transform: none;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0;
    color: var(--ag-text-dark);
}
/* File input */
.ag-file-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
}
.ag-file-btn {
    padding: 6px 12px;
    background: var(--ag-btn-bg);
    border: 1px solid var(--ag-btn-border);
    border-radius: var(--ag-radius);
    font-size: 12px;
    font-family: var(--ag-font);
    cursor: pointer;
    white-space: nowrap;
    color: var(--ag-text-dark);
}
.ag-file-btn:hover { background: var(--ag-btn-hover); }
.ag-file-name {
    font-size: 12px;
    color: var(--ag-text-light);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ── Form Action Bar ── */
.ag-form-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--ag-border);
}
.ag-form-save-btn {
    padding: 7px 18px;
    background: var(--ag-green-mid);
    color: #fff;
    border: 1px solid var(--ag-green-dark);
    border-radius: var(--ag-radius);
    font-size: 13px;
    font-weight: 600;
    font-family: var(--ag-font);
    cursor: pointer;
    transition: background .14s;
}
.ag-form-save-btn:hover { background: var(--ag-green-dark); }
.ag-form-cancel-btn {
    padding: 7px 16px;
    background: var(--ag-btn-bg);
    color: var(--ag-text-dark);
    border: 1px solid var(--ag-btn-border);
    border-radius: var(--ag-radius);
    font-size: 13px;
    font-family: var(--ag-font);
    cursor: pointer;
    transition: background .14s;
}
.ag-form-cancel-btn:hover { background: var(--ag-btn-hover); }
.ag-form-delete-btn {
    padding: 7px 16px;
    background: #fff;
    color: #c0392b;
    border: 1px solid #e0a0a0;
    border-radius: var(--ag-radius);
    font-size: 13px;
    font-family: var(--ag-font);
    cursor: pointer;
    margin-left: auto;
    transition: background .14s;
}
.ag-form-delete-btn:hover { background: #fdf0f0; border-color: #c0392b; }

/* ── Quick-view detail (collapsed read-only expand) ── */
.ag-quickview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 32px;
    padding: 12px 0 4px;
}
.ag-qv-item {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
}
.ag-qv-label {
    font-weight: 700;
    color: var(--ag-text-dark);
}
.ag-qv-value {
    color: var(--ag-text-mid);
}

/* ── Empty state ── */
.ag-empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--ag-text-light);
    font-size: 14px;
}
.ag-empty svg { margin-bottom: 8px; opacity: .4; }

/* ── Loading overlay ── */
.ag-loading {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,.75);
    z-index: 10;
    align-items: center;
    justify-content: center;
    border-radius: var(--ag-radius);
}
.ag-loading.ag-visible { display: flex; }
.ag-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--ag-border);
    border-top-color: var(--ag-green-mid);
    border-radius: 50%;
    animation: ag-spin .7s linear infinite;
}
@keyframes ag-spin { to { transform: rotate(360deg); } }
@keyframes ag-shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-5px); }
    40%      { transform: translateX(5px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
}

/* ── Pagination ── */
.ag-pagination {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    background: var(--ag-surface);
    border: 1px solid var(--ag-border);
    border-top: none;
    border-radius: 0 0 var(--ag-radius-lg) var(--ag-radius-lg);
    font-size: 13px;
    color: var(--ag-text-mid);
}
.ag-page-btn {
    padding: 4px 10px;
    background: var(--ag-btn-bg);
    border: 1px solid var(--ag-btn-border);
    border-radius: var(--ag-radius);
    font-size: 13px;
    font-family: var(--ag-font);
    cursor: pointer;
    transition: background .12s;
    color: var(--ag-text-dark);
}
.ag-page-btn:hover:not(:disabled) { background: var(--ag-btn-hover); }
.ag-page-btn:disabled { opacity: .4; cursor: default; }
.ag-page-btn.ag-page-active {
    background: var(--ag-green-mid);
    border-color: var(--ag-green-dark);
    color: #fff;
}
.ag-page-info { flex: 1; text-align: center; }
.ag-page-size-select {
    padding: 4px 24px 4px 8px;
    border: 1px solid var(--ag-btn-border);
    border-radius: var(--ag-radius);
    font-size: 12px;
    font-family: var(--ag-font);
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%234a5048'/%3E%3C/svg%3E") no-repeat right 6px center;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    cursor: pointer;
    color: var(--ag-text-dark);
}

/* ── "Add New" inline panel (above grid) ── */
.ag-add-panel {
    display: none;
    background: #f8fbf8;
    border: 1px solid var(--ag-green-mid);
    border-radius: var(--ag-radius);
    padding: 20px 24px 16px;
    margin-bottom: 8px;
    animation: ag-slide-down .18s ease;
}
.ag-add-panel.ag-visible { display: block; }
.ag-add-panel-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--ag-text-dark);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* ── PDF upload widget ── */
.ag-pdf-upload-container {
    padding: 12px 14px;
    background: #f8fbf8;
    border: 1px dashed var(--ag-border);
    border-radius: var(--ag-radius);
    margin-top: 4px;
}
.ag-pdf-choose-btn:hover {
    background: var(--ag-btn-hover) !important;
    border-color: #8a938a !important;
}

/* ── Responsive ── */
@media (max-width: 768px) {
    .ag-field-grid { grid-template-columns: 1fr; }
    .ag-header-cell:not(.ag-col-expand):not(.ag-col-actions):not([data-col="description"]) {
        display: none;
    }
    .ag-cell:not(.ag-col-expand):not(.ag-col-actions):not([data-col="description"]) {
        display: none;
    }
    .ag-toolbar { flex-wrap: wrap; }
    .ag-filter-select { min-width: 100%; }
}
@media (max-width: 480px) {
    .ag-detail-panel { padding-left: 12px; padding-right: 12px; }
    .ag-pagination { flex-wrap: wrap; justify-content: center; }
}
`;

    /* =========================================================
       SECTION 2 — UTILITY HELPERS
    ========================================================= */
    function injectCSS() {
        if (document.getElementById('ag-styles')) return;
        var s = document.createElement('style');
        s.id = 'ag-styles';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    function escapeHtml(v) {
        if (v == null) return '';
        return String(v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

    function debounce(fn, ms) {
        var t;
        return function () {
            clearTimeout(t);
            var a = arguments, ctx = this;
            t = setTimeout(function () { fn.apply(ctx, a); }, ms);
        };
    }

    function getNestedValue(obj, path) {
        return path.split('.').reduce(function (o, k) {
            return o && o[k] !== undefined ? o[k] : null;
        }, obj);
    }

    /* =========================================================
       SECTION 3 — DEFAULT CONFIGURATION
    ========================================================= */
    var DEFAULTS = {
        title: 'Records',
        showAddButton: true,
        addButtonLabel: '+ Add New',
        showRefreshButton: true,         // show a Refresh button in the title bar
        onRefresh: null,                 // callback fired when Refresh is clicked
        singleExpand: false,          // true = only one row open at a time
        expandMode: 'edit',           // 'edit' | 'quickview'
        pageSize: 10,
        pageSizeOptions: [5, 10, 15, 25, 50],
        searchPlaceholder: 'Search...',
        filterOptions: [],            // [{label:'All', value:''},...] — auto-built if empty
        filterField: null,            // field key to filter on
        emptyMessage: 'No records found.',
        columns: [],                  // see Column schema below
        editFields: [],               // see EditField schema below
        editSections: [],             // [{title:'Section', fields:[...fieldKeys]}]
        actionButtons: [],            // see ActionButton schema below
        showInsert: true,
        showUpdate: true,
        showDelete: false,
        showCancel: true,
        // Callbacks
        onLoad: null,
        onRowExpand: null,
        onRowCollapse: null,
        onSave: null,
        onDelete: null,
        onActionClick: null,
        onAddNew: null,
        onPageChange: null,
        onSearch: null,
        onSort: null,
        onFilterChange: null,
        // PDF / blob upload (called before insert when a file is attached)
        // signature: function(file, progressCallback, done)
        //   progressCallback(pct)  — 0-100, optional
        //   done(err, guidReference) — null err on success
        onUploadDocument: null,
        uploadDocumentField: 'DocumentReference', // key to store the returned GUID in
        uploadMaxSizeMb: 20,                  // max file size in MB (default 20)
        uploadAllowedExtensions: ['.pdf'],        // array of lowercase dot-extensions
        // For server-side: supply this to override client fetch
        dataLoader: null,    // function(params, callback) — async data source
    };

    /*
      Column schema:
      {
        key: 'description',         // data field key (supports dot notation)
        label: 'Description',
        width: '25%',               // CSS width string or null for auto
        visible: true,
        sortable: true,
        align: 'left',              // 'left' | 'center' | 'right'
        format: null,               // function(value, record) => string/HTML
        badge: null,                // {map: {val: 'success',...}, defaultClass:'default'}
        type: 'text',               // 'text' | 'badge' | 'html' | 'date' | 'number'
        hideOnMobile: false,
      }

      EditField schema:
      {
        key: 'description',
        label: 'Description',
        type: 'text',       // text|textarea|select|checkbox|date|number|email|file|custom
        options: [],        // for select: [{label,value}]
        required: false,
        fullWidth: false,
        placeholder: '',
        readOnly: false,
        render: null,       // function(field, record) => HTML string (type:'custom')
        onChange: null,     // function(key, value, record)
      }

      ActionButton schema:
      {
        key: 'edit',
        label: 'Edit',
        cssClass: '',       // extra class
        icon: null,         // svg string
        visible: function(record) { return true; }  // or true/false
      }
    */

    /* =========================================================
       SECTION 4 — ACCORDIONGRID CLASS
    ========================================================= */
    function AccordionGrid(containerId, options) {
        this._containerId = containerId;
        this._config = this._mergeConfig(options || {});
        this._allData = [];
        this._filtered = [];
        this._page = 1;
        this._pageSize = this._config.pageSize;
        this._sortKey = null;
        this._sortDir = 'asc';
        this._searchVal = '';
        this._filterVal = '';
        this._expanded = {};   // rowId -> bool
        this._addPanelOpen = false;
        this._editBuffer = {};  // rowId -> draft record
        this._editMode = {};  // rowId -> bool (false=view-only, true=editing)
        this._uploadState = {};  // 'new' or rowId -> {file, guid, uploading, progress, error}
        this._newBuffer = {};
        this._uid = 'ag_' + Math.random().toString(36).slice(2, 9);
        this._container = null;
        this._idCounter = 0;
        injectCSS();
        this._render();
    }

    AccordionGrid.prototype = {
        constructor: AccordionGrid,

        /* ---- Config merge ---- */
        _mergeConfig: function (opts) {
            var cfg = deepClone(DEFAULTS);
            for (var k in opts) {
                if (!Object.prototype.hasOwnProperty.call(opts, k)) continue;
                if (typeof opts[k] === 'function') {
                    cfg[k] = opts[k];
                } else if (Array.isArray(opts[k])) {
                    cfg[k] = opts[k];
                } else if (typeof opts[k] === 'object' && opts[k] !== null && !Array.isArray(opts[k])) {
                    cfg[k] = Object.assign({}, cfg[k] || {}, opts[k]);
                } else {
                    cfg[k] = opts[k];
                }
            }
            // Restore functions that were wiped by deepClone
            var fns = ['onLoad', 'onRowExpand', 'onRowCollapse', 'onSave', 'onDelete',
                'onActionClick', 'onAddNew', 'onPageChange', 'onSearch',
                'onSort', 'onFilterChange', 'onRefresh', 'dataLoader'];
            fns.forEach(function (fn) {
                if (typeof opts[fn] === 'function') cfg[fn] = opts[fn];
            });
            // Restore per-column/field functions
            if (Array.isArray(opts.columns)) {
                opts.columns.forEach(function (col, i) {
                    if (typeof col.format === 'function') cfg.columns[i].format = col.format;
                });
            }
            if (Array.isArray(opts.editFields)) {
                opts.editFields.forEach(function (f, i) {
                    if (typeof f.render === 'function') cfg.editFields[i].render = f.render;
                    if (typeof f.onChange === 'function') cfg.editFields[i].onChange = f.onChange;
                });
            }
            if (Array.isArray(opts.actionButtons)) {
                opts.actionButtons.forEach(function (btn, i) {
                    if (typeof btn.visible === 'function') cfg.actionButtons[i].visible = btn.visible;
                });
            }
            return cfg;
        },

        /* ---- Public API ---- */
        loadData: function (data) {
            var self = this;
            if (!Array.isArray(data)) { console.warn('AccordionGrid.loadData: expects array'); return; }
            // Assign internal IDs
            data.forEach(function (r) {
                if (r._agId == null) r._agId = ++self._idCounter;
            });
            this._allData = data;
            this._page = 1;
            this._expanded = {};
            this._apply();
            this._fire('onLoad', { data: data });
        },

        refresh: function () {
            this._page = 1;
            this._apply();
        },

        // Clears all search, filter, sort state back to defaults,
        // resets the toolbar DOM controls, collapses all open rows,
        // goes back to page 1, then fires a fresh load.
        // Call this for a full "reset to initial state" refresh.
        resetState: function () {
            // ── Internal state ─────────────────────────────────────────────
            this._page = 1;
            this._searchVal = '';
            this._filterVal = '';
            this._sortKey = null;
            this._sortDir = 'asc';
            this._expanded = {};
            this._editMode = {};

            // ── DOM: search input ──────────────────────────────────────────
            var searchEl = document.getElementById(this._uid + '_search');
            if (searchEl) searchEl.value = '';

            // ── DOM: filter dropdown ───────────────────────────────────────
            var filterEl = document.getElementById(this._uid + '_filter');
            if (filterEl) filterEl.value = '';

            // ── DOM: column sort indicators ────────────────────────────────
            var header = document.getElementById(this._uid + '_header');
            if (header) {
                header.querySelectorAll('[data-sort]').forEach(function (el) {
                    el.removeAttribute('data-sort');
                });
            }

            // ── Reload ─────────────────────────────────────────────────────
            this._apply();
        },

        addRecord: function (record) {
            record._agId = ++this._idCounter;
            this._allData.push(record);
            this._apply();
        },

        updateRecord: function (id, patch) {
            var rec = this._findById(id);
            if (!rec) return;
            Object.assign(rec, patch);
            // In server-side mode _apply() would re-fetch from the server,
            // losing the in-memory patch.  Re-render the body directly instead
            // so the badge/value updates instantly from the patched local record.
            if (typeof this._config.dataLoader === 'function') {
                this._renderBody();
            } else {
                this._apply();
            }
        },

        removeRecord: function (id) {
            this._allData = this._allData.filter(function (r) { return r._agId !== id; });
            delete this._expanded[id];
            delete this._editMode[id];
            // Same as updateRecord: skip dataLoader in server-side mode.
            if (typeof this._config.dataLoader === 'function') {
                this._serverTotalCount = Math.max(0, (this._serverTotalCount || 1) - 1);
                this._renderTitle();
                this._renderBody();
                this._renderPager();
            } else {
                this._apply();
            }
        },

        getRecord: function (id) {
            return this._findById(id);
        },

        expandRow: function (id) { this._setExpanded(id, true, false); },
        expandRowForEdit: function (id) { this._setExpanded(id, true, true); },
        collapseRow: function (id) { this._setExpanded(id, false); },
        collapseAll: function () {
            this._expanded = {};
            this._renderBody();
        },

        setPage: function (p) {
            this._page = p;
            this._apply();   // triggers dataLoader in server-side mode
        },

        setPageSize: function (n) {
            this._pageSize = n;
            this._page = 1;
            this._apply();   // triggers dataLoader in server-side mode
        },

        setFilter: function (val) {
            this._filterVal = val;
            this._page = 1;
            this._apply();
        },

        setSearch: function (val) {
            this._searchVal = val;
            this._page = 1;
            this._apply();
        },

        /* ---- Internal helpers ---- */
        _findById: function (id) {
            return this._allData.find(function (r) { return r._agId === id; }) || null;
        },

        _buildParams: function () {
            return {
                page: this._page,
                pageSize: this._pageSize,
                search: this._searchVal,
                filter: this._filterVal,
                sortKey: this._sortKey,
                sortDir: this._sortDir,
            };
        },

        _apply: function () {
            var cfg = this._config;

            // ── Server-side mode ───────────────────────────────────────────
            // When dataLoader is configured, the server owns filter/search/sort/
            // paging.  _apply just triggers a fresh dataLoader call and renders
            // whatever the server returns.  Client-side filter/sort are skipped.
            if (typeof cfg.dataLoader === 'function') {
                var self = this;
                this._showLoading(true);
                cfg.dataLoader(this._buildParams(), function (data) {
                    self._showLoading(false);
                    // Assign internal IDs to incoming records
                    data.forEach(function (r) {
                        if (r._agId == null) r._agId = ++self._idCounter;
                    });
                    self._allData = data;
                    self._filtered = data; // local slice — pager uses _serverTotalCount
                    self._renderTitle();
                    self._renderBody();
                    self._renderPager();
                });
                return;
            }

            // ── Client-side mode ───────────────────────────────────────────
            var data = this._allData.slice();

            // Search
            if (this._searchVal) {
                var sv = this._searchVal.toLowerCase();
                data = data.filter(function (r) {
                    return cfg.columns.some(function (col) {
                        var v = getNestedValue(r, col.key);
                        return v != null && String(v).toLowerCase().indexOf(sv) !== -1;
                    });
                });
            }

            // Filter
            if (this._filterVal && cfg.filterField) {
                var fv = this._filterVal;
                data = data.filter(function (r) {
                    return String(getNestedValue(r, cfg.filterField)) === fv;
                });
            }

            // Sort
            if (this._sortKey) {
                var sk = this._sortKey, sd = this._sortDir;
                data.sort(function (a, b) {
                    var av = getNestedValue(a, sk) || '';
                    var bv = getNestedValue(b, sk) || '';
                    av = String(av).toLowerCase();
                    bv = String(bv).toLowerCase();
                    if (av < bv) return sd === 'asc' ? -1 : 1;
                    if (av > bv) return sd === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            this._filtered = data;
            this._renderTitle();
            this._renderBody();
            this._renderPager();
        },

        _pageData: function () {
            // Server-side mode: server already sliced the data — return as-is.
            if (typeof this._config.dataLoader === 'function') {
                return this._allData;
            }
            // Client-side mode: slice locally.
            var start = (this._page - 1) * this._pageSize;
            return this._filtered.slice(start, start + this._pageSize);
        },

        _totalPages: function () {
            // Server-side mode: use the total count the server reported.
            if (typeof this._config.dataLoader === 'function' &&
                typeof this._serverTotalCount === 'number') {
                return Math.max(1, Math.ceil(this._serverTotalCount / this._pageSize));
            }
            // Client-side mode: derive from local filtered length.
            return Math.max(1, Math.ceil(this._filtered.length / this._pageSize));
        },

        _setExpanded: function (id, open, editMode) {
            var cfg = this._config;
            if (open && cfg.singleExpand) {
                this._expanded = {};
                this._editMode = {};
            }
            this._expanded[id] = open;
            // Arrow click always opens read-only; Edit button passes editMode=true
            this._editMode[id] = open ? (editMode === true) : false;
            if (open && !this._editBuffer[id]) {
                var rec = this._findById(id);
                if (rec) this._editBuffer[id] = deepClone(rec);
            }
            if (!open) delete this._uploadState[id];
            this._renderBody();
            this._fire(open ? 'onRowExpand' : 'onRowCollapse', { id: id, record: this._findById(id) });
        },

        // Switch an already-expanded row from view-only into edit mode in-place
        _setEditMode: function (id) {
            this._editMode[id] = true;
            var wrap = document.querySelector('[data-agid="' + id + '"].ag-row-wrap');
            var dp = wrap && wrap.querySelector('.ag-detail-panel');
            if (!dp) return;
            var rec = this._findById(id);
            if (!this._editBuffer[id]) this._editBuffer[id] = deepClone(rec);
            dp.innerHTML = this._buildDetailPanel(rec);
            this._bindFormEvents(dp, id);
            // Smooth focus on first editable field
            var first = dp.querySelector('input:not([readonly]):not([style*="pointer-events:none"]), select:not([style*="pointer-events:none"]), textarea:not([readonly])');
            if (first) first.focus();
        },

        _fire: function (event, data) {
            if (typeof this._config[event] === 'function') {
                this._config[event](data);
            }
        },

        _showLoading: function (v) {
            var el = document.getElementById(this._uid + '_loading');
            if (el) el.classList.toggle('ag-visible', v);
        },

        /* ---- Rendering ---- */
        _render: function () {
            var container = document.getElementById(this._containerId);
            if (!container) { console.error('AccordionGrid: container #' + this._containerId + ' not found'); return; }
            this._container = container;
            container.innerHTML = '';
            container.className = (container.className + ' ag-wrapper').trim();

            // Loading overlay
            var loading = document.createElement('div');
            loading.id = this._uid + '_loading';
            loading.className = 'ag-loading';
            loading.innerHTML = '<div class="ag-spinner"></div>';
            container.appendChild(loading);

            // Add panel
            var addPanel = document.createElement('div');
            addPanel.id = this._uid + '_addpanel';
            addPanel.className = 'ag-add-panel';
            container.appendChild(addPanel);

            // Title bar
            var titleBar = document.createElement('div');
            titleBar.id = this._uid + '_titlebar';
            titleBar.className = 'ag-title-bar';
            container.appendChild(titleBar);

            // Title bar — layout: [h2 title/count LEFT] [Refresh button RIGHT] [Add button RIGHT]
            // The h2 is inserted first so it sits on the left naturally (flex row, h2 has flex:1).
            // Refresh and Add are appended after so they cluster on the right.

            // Refresh button (optional) — right of title, left of Add button.
            if (this._config.showRefreshButton) {
                var self1 = this;
                var refBtn = document.createElement('button');
                refBtn.id = this._uid + '_refresh';
                refBtn.className = 'ag-refresh-btn';
                refBtn.setAttribute('type', 'button');
                refBtn.setAttribute('aria-label', 'Refresh');
                refBtn.innerHTML = this._svgRefresh() + 'Refresh';
                refBtn.addEventListener('click', function () {
                    var ico = refBtn.querySelector('.ag-refresh-icon');
                    if (ico) ico.style.animation = 'ag-spin .7s linear infinite';
                    refBtn.disabled = true;
                    self1.resetState();
                    self1._fire('onRefresh', {});
                    setTimeout(function () {
                        refBtn.disabled = false;
                        if (ico) ico.style.animation = '';
                    }, 800);
                });
                titleBar.appendChild(refBtn);
            }

            // Add button — rightmost element in the title bar.
            if (this._config.showAddButton) {
                var self0 = this;
                var addBtn = document.createElement('button');
                addBtn.id = this._uid + '_addnew';
                addBtn.className = 'ag-add-btn';
                addBtn.setAttribute('aria-label', 'Add new record');
                addBtn.setAttribute('type', 'button');
                addBtn.innerHTML = this._svgPlus() + escapeHtml(this._config.addButtonLabel);
                addBtn.addEventListener('click', function () { self0._toggleAddPanel(); });
                titleBar.appendChild(addBtn);
            }

            // Toolbar
            var toolbar = document.createElement('div');
            toolbar.className = 'ag-toolbar';
            toolbar.innerHTML = this._buildToolbar();
            container.appendChild(toolbar);

            // Header row
            var header = document.createElement('div');
            header.id = this._uid + '_header';
            header.className = 'ag-header';
            header.setAttribute('role', 'row');
            container.appendChild(header);

            // Body
            var body = document.createElement('div');
            body.id = this._uid + '_body';
            body.className = 'ag-body';
            body.setAttribute('role', 'rowgroup');
            container.appendChild(body);

            // Pagination
            var pager = document.createElement('div');
            pager.id = this._uid + '_pager';
            pager.className = 'ag-pagination';
            container.appendChild(pager);

            this._renderTitle();
            this._renderHeader();
            this._renderBody();
            this._renderPager();
            this._bindToolbar();
        },

        _renderTitle: function () {
            var el = document.getElementById(this._uid + '_titlebar');
            if (!el) return;
            // Server-side mode: show the true total from the server.
            // Client-side mode: show the filtered local count.
            var count = (typeof this._config.dataLoader === 'function' &&
                typeof this._serverTotalCount === 'number')
                ? this._serverTotalCount
                : (this._filtered.length || this._allData.length);
            var label = this._config.title;

            // Only touch the <h2> label — the Add button is a stable sibling
            // created once in _render() so its listener is never lost.
            var h2 = el.querySelector('h2.ag-title-h2');
            if (!h2) {
                h2 = document.createElement('h2');
                h2.className = 'ag-title-h2';
                h2.style.flex = '1';   // takes all available left-side space
                // Always insert before the first button (Refresh or Add)
                var firstBtn = el.querySelector('.ag-refresh-btn, .ag-add-btn');
                el.insertBefore(h2, firstBtn || null);
            }
            h2.innerHTML = escapeHtml(label) +
                ' <span class="ag-count">(' + count + ' Records)</span>';
        },

        _buildToolbar: function () {
            var cfg = this._config;
            var filterOpts = '';
            if (cfg.filterOptions && cfg.filterOptions.length) {
                filterOpts = cfg.filterOptions.map(function (o) {
                    return '<option value="' + escapeHtml(o.value) + '">' + escapeHtml(o.label) + '</option>';
                }).join('');
            } else {
                filterOpts = '<option value="">All</option>';
            }
            return '<div class="ag-search-wrap">' +
                this._svgSearch() +
                '<input type="text" class="ag-search" id="' + this._uid + '_search" ' +
                'placeholder="' + escapeHtml(cfg.searchPlaceholder) + '" ' +
                'aria-label="Search records" autocomplete="off" />' +
                '</div>' +
                '<select class="ag-filter-select" id="' + this._uid + '_filter" aria-label="Filter records">' +
                filterOpts + '</select>';
        },

        _bindToolbar: function () {
            var self = this;
            var search = document.getElementById(this._uid + '_search');
            var filter = document.getElementById(this._uid + '_filter');
            if (search) {
                search.addEventListener('input', debounce(function () {
                    self._searchVal = search.value;
                    self._page = 1;
                    self._apply();
                    self._fire('onSearch', { value: search.value });
                }, 250));
                search.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape') { search.value = ''; self._searchVal = ''; self._page = 1; self._apply(); }
                });
            }
            if (filter) {
                filter.addEventListener('change', function () {
                    self._filterVal = filter.value;
                    self._page = 1;
                    self._apply();
                    self._fire('onFilterChange', { value: filter.value });
                });
            }
        },

        _renderHeader: function () {
            var el = document.getElementById(this._uid + '_header');
            if (!el) return;
            var self = this;
            var html = '<div class="ag-header-expander" role="columnheader" aria-label="Expand"></div>';
            this._config.columns.forEach(function (col) {
                if (col.visible === false) return;
                var sortIcon = col.sortable !== false ? self._svgSort(col.key) : '';
                var w = col.width ? 'style="width:' + col.width + ';flex:none;"' : 'style="flex:1;"';
                var align = col.align === 'center' ? 'justify-content:center;' : col.align === 'right' ? 'justify-content:flex-end;' : '';
                html += '<div class="ag-header-cell" role="columnheader" ' +
                    (col.sortable !== false ? 'data-sortkey="' + escapeHtml(col.key) + '"' : '') +
                    ' data-col="' + escapeHtml(col.key) + '" ' + w +
                    ' style="' + (col.width ? 'width:' + col.width + ';flex:none;' : 'flex:1;') + align + '">' +
                    escapeHtml(col.label) + sortIcon + '</div>';
            });
            html += '<div class="ag-header-cell ag-col-actions" role="columnheader" style="flex:2;justify-content:flex-end;">Actions</div>';
            el.innerHTML = html;

            // Sort click
            el.querySelectorAll('[data-sortkey]').forEach(function (cell) {
                cell.addEventListener('click', function () {
                    var k = cell.getAttribute('data-sortkey');
                    if (self._sortKey === k) {
                        self._sortDir = self._sortDir === 'asc' ? 'desc' : 'asc';
                    } else {
                        self._sortKey = k;
                        self._sortDir = 'asc';
                    }
                    self._apply();
                    self._fire('onSort', { key: k, dir: self._sortDir });
                    // Update sort icons
                    el.querySelectorAll('[data-sortkey]').forEach(function (c) {
                        c.removeAttribute('data-sort');
                        if (c.getAttribute('data-sortkey') === self._sortKey) {
                            c.setAttribute('data-sort', self._sortDir);
                        }
                    });
                });
            });
        },

        _renderBody: function () {
            var el = document.getElementById(this._uid + '_body');
            if (!el) return;
            var rows = this._pageData();
            if (!rows.length) {
                el.innerHTML = '<div class="ag-empty">' + this._svgEmpty() +
                    '<div>' + escapeHtml(this._config.emptyMessage) + '</div></div>';
                return;
            }
            var self = this;
            var frag = document.createDocumentFragment();
            rows.forEach(function (record) {
                var wrap = document.createElement('div');
                wrap.className = 'ag-row-wrap' + (self._expanded[record._agId] ? ' ag-expanded' : '');
                wrap.setAttribute('data-agid', record._agId);
                wrap.setAttribute('role', 'rowgroup');

                // Main row
                wrap.appendChild(self._buildRow(record));

                // Detail panel
                var detail = document.createElement('div');
                detail.className = 'ag-detail-panel';
                detail.setAttribute('role', 'region');
                detail.setAttribute('aria-label', 'Detail for record ' + record._agId);
                if (self._expanded[record._agId]) {
                    detail.innerHTML = self._buildDetailPanel(record);
                }
                wrap.appendChild(detail);

                frag.appendChild(wrap);
            });
            el.innerHTML = '';
            el.appendChild(frag);
            this._bindBodyEvents(el);
        },

        _buildRow: function (record) {
            var self = this;
            var cfg = this._config;
            var row = document.createElement('div');
            row.className = 'ag-row';
            row.setAttribute('role', 'row');

            // Expander toggle
            var exp = document.createElement('button');
            exp.className = 'ag-expander';
            exp.setAttribute('aria-expanded', this._expanded[record._agId] ? 'true' : 'false');
            exp.setAttribute('aria-label', 'Toggle row details');
            exp.setAttribute('data-agid', record._agId);
            exp.innerHTML = '<span class="ag-expander-icon"></span>';
            row.appendChild(exp);

            // Data cells
            cfg.columns.forEach(function (col) {
                if (col.visible === false) return;
                var cell = document.createElement('div');
                cell.className = 'ag-cell';
                cell.setAttribute('data-col', col.key);
                cell.setAttribute('role', 'cell');
                var w = col.width ? 'width:' + col.width + ';flex:none;' : 'flex:1;';
                var align = col.align === 'center' ? 'justify-content:center;' : col.align === 'right' ? 'justify-content:flex-end;' : '';
                cell.setAttribute('style', w + align);

                var raw = getNestedValue(record, col.key);
                var display = '';

                if (typeof col.format === 'function') {
                    display = col.format(raw, record);
                } else if (col.badge) {
                    var badgeCls = (col.badge.map && col.badge.map[raw]) ? col.badge.map[raw] : (col.badge.defaultClass || 'default');
                    display = '<span class="ag-badge ag-badge-' + escapeHtml(badgeCls) + '">' + escapeHtml(raw) + '</span>';
                } else if (col.type === 'date' && raw) {
                    display = escapeHtml(new Date(raw).toLocaleDateString());
                } else if (col.type === 'html') {
                    display = raw || '';
                } else {
                    display = escapeHtml(raw);
                }
                cell.innerHTML = display;
                row.appendChild(cell);
            });

            // Actions cell
            var actCell = document.createElement('div');
            actCell.className = 'ag-cell ag-col-actions';
            actCell.setAttribute('role', 'cell');
            actCell.style.flex = '2';
            actCell.style.justifyContent = 'flex-end';

            cfg.actionButtons.forEach(function (btn) {
                var show = typeof btn.visible === 'function' ? btn.visible(record) : (btn.visible !== false);
                if (!show) return;
                var b = document.createElement('button');
                b.className = 'ag-action-btn' + (btn.cssClass ? ' ' + btn.cssClass : '');
                b.setAttribute('data-action', btn.key);
                b.setAttribute('data-agid', record._agId);
                b.setAttribute('type', 'button');
                b.innerHTML = (btn.icon || '') + escapeHtml(btn.label);
                actCell.appendChild(b);
            });
            row.appendChild(actCell);
            return row;
        },

        _buildDetailPanel: function (record) {
            var cfg = this._config;
            var buf = this._editBuffer[record._agId] || deepClone(record);
            var viewOnly = !this._editMode[record._agId]; // true = read-only view

            if (cfg.expandMode === 'quickview') {
                return this._buildQuickView(record);
            }

            var self = this;
            var html = '';
            var usedFields = {};

            // ── Helper: render one field either as a read-only display or input ──
            function renderField(field, forceReadOnly) {
                if (viewOnly || forceReadOnly) {
                    return buildViewFieldHtml(field, buf);
                }
                return buildFieldHtml(field, buf, record._agId);
            }

            if (cfg.editSections && cfg.editSections.length) {
                cfg.editSections.forEach(function (section) {
                    html += '<div class="ag-section">';
                    html += '<div class="ag-section-header">' + escapeHtml(section.title) + '</div>';
                    html += '<div class="ag-section-body"><div class="ag-field-grid">';
                    section.fields.forEach(function (fkey) {
                        var field = cfg.editFields.find(function (f) { return f.key === fkey; });
                        if (field) {
                            usedFields[fkey] = true;
                            html += renderField(field);
                        }
                    });
                    html += '</div></div></div>';
                });
                var rem = cfg.editFields.filter(function (f) { return !usedFields[f.key]; });
                if (rem.length) {
                    html += '<div class="ag-section"><div class="ag-section-body"><div class="ag-field-grid">';
                    rem.forEach(function (field) { html += renderField(field); });
                    html += '</div></div></div>';
                }
            } else if (cfg.editFields.length) {
                html += '<div class="ag-section-body"><div class="ag-field-grid">';
                cfg.editFields.forEach(function (field) { html += renderField(field); });
                html += '</div></div>';
            }

            // ── Action bar ──────────────────────────────────────────────────────
            html += '<div class="ag-form-actions">';
            if (viewOnly) {
                // View-only: just a Close button (Edit is in the Actions column)
                html += '<button class="ag-form-cancel-btn" type="button" ' +
                    'data-formaction="cancel" data-agid="' + record._agId + '">Close</button>';
            } else {
                // Edit mode: Save / Cancel / Delete
                if (cfg.showUpdate) {
                    html += '<button class="ag-form-save-btn" type="button" ' +
                        'data-formaction="save" data-agid="' + record._agId + '">Save</button>';
                }
                if (cfg.showCancel) {
                    html += '<button class="ag-form-cancel-btn" type="button" ' +
                        'data-formaction="cancel" data-agid="' + record._agId + '">Cancel</button>';
                }
                if (cfg.showDelete) {
                    html += '<button class="ag-form-delete-btn" type="button" ' +
                        'data-formaction="delete" data-agid="' + record._agId + '">Delete</button>';
                }
            }
            html += '</div>';
            return html;
        },

        _buildQuickView: function (record) {
            var cfg = this._config;
            var html = '<div class="ag-quickview">';
            cfg.editFields.forEach(function (f) {
                var v = getNestedValue(record, f.key);
                if (v != null && v !== '') {
                    html += '<div class="ag-qv-item"><span class="ag-qv-label">' + escapeHtml(f.label) + ':</span>' +
                        '<span class="ag-qv-value">' + escapeHtml(v) + '</span></div>';
                }
            });
            html += '</div>';
            if (cfg.showUpdate) {
                html += '<div class="ag-form-actions">' +
                    '<button class="ag-form-save-btn" type="button" data-formaction="edit-switch" data-agid="' + record._agId + '">Edit</button>' +
                    '<button class="ag-form-cancel-btn" type="button" data-formaction="cancel" data-agid="' + record._agId + '">Close</button>' +
                    '</div>';
            }
            return html;
        },

        _buildAddPanel: function () {
            var cfg = this._config;
            var buf = this._newBuffer;
            var upst = this._uploadState['new'] || {};
            var html = '<div class="ag-add-panel-title">' + this._svgPlus() +
                'Add New ' + escapeHtml(cfg.title.replace(/s$/, '')) + '</div>';

            if (cfg.editSections && cfg.editSections.length) {
                cfg.editSections.forEach(function (section) {
                    html += '<div class="ag-section">';
                    html += '<div class="ag-section-header">' + escapeHtml(section.title) + '</div>';
                    html += '<div class="ag-section-body"><div class="ag-field-grid">';
                    section.fields.forEach(function (fkey) {
                        var field = cfg.editFields.find(function (f) { return f.key === fkey; });
                        if (field) html += buildFieldHtml(field, buf, 'new');
                    });

                    // Inject PDF upload widget after the Document section fields
                    if (section.title === 'Document' || section.isDocumentSection) {
                        html += buildPdfUploadWidget('new', upst, cfg);
                    }
                    html += '</div></div></div>';
                });
            } else if (cfg.editFields.length) {
                html += '<div class="ag-section-body"><div class="ag-field-grid">';
                cfg.editFields.forEach(function (field) { html += buildFieldHtml(field, buf, 'new'); });
                html += '</div></div>';
                if (typeof cfg.onUploadDocument === 'function') {
                    html += '<div class="ag-section-body">' + buildPdfUploadWidget('new', upst, cfg) + '</div>';
                }
            }

            html += '<div class="ag-form-actions">';
            if (cfg.showInsert) {
                var hasFn = typeof cfg.onUploadDocument === 'function';
                var hasGuid = hasFn && upst && upst.guid && upst.guid.length > 0;
                var isBlocked = hasFn && !hasGuid;
                var btnLabel = upst.uploading ? 'Uploading…' : 'Save New Template';
                var blockedStyle = isBlocked
                    ? 'opacity:.45;cursor:not-allowed;'
                    : '';
                var tooltip = isBlocked
                    ? ' title="Upload a document first to enable saving"'
                    : '';
                html += '<button class="ag-form-save-btn" type="button" ' +
                    'data-formaction="insert" data-agid="new"' +
                    tooltip +
                    ' style="' + blockedStyle + '">' +
                    btnLabel + '</button>';
            }
            html += '<button class="ag-form-cancel-btn" type="button" data-formaction="cancel-add" data-agid="new">Cancel</button>';
            html += '</div>';
            return html;
        },

        _toggleAddPanel: function () {
            var panel = document.getElementById(this._uid + '_addpanel');
            if (!panel) {
                console.error('AccordionGrid: add panel element not found (id=' + this._uid + '_addpanel)');
                return;
            }
            this._addPanelOpen = !this._addPanelOpen;
            if (this._addPanelOpen) {
                this._newBuffer = {};
                var content = this._buildAddPanel();
                panel.innerHTML = content;
                panel.classList.add('ag-visible');
                this._bindFormEvents(panel, 'new');
                // Focus the first editable input
                var firstInput = panel.querySelector('input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled])');
                if (firstInput) firstInput.focus();
                this._fire('onAddNew', {});
            } else {
                panel.classList.remove('ag-visible');
                panel.innerHTML = '';
            }
        },

        _bindBodyEvents: function (bodyEl) {
            var self = this;
            // Expander clicks
            bodyEl.querySelectorAll('.ag-expander').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var id = parseInt(btn.getAttribute('data-agid'), 10);
                    self._setExpanded(id, !self._expanded[id]);
                });
                btn.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        btn.click();
                    }
                });
            });

            // Action button clicks
            bodyEl.querySelectorAll('.ag-action-btn').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var action = btn.getAttribute('data-action');
                    var id = parseInt(btn.getAttribute('data-agid'), 10);
                    var record = self._findById(id);
                    self._fire('onActionClick', { action: action, id: id, record: record, button: btn });
                });
            });

            // Bind form events in expanded rows
            bodyEl.querySelectorAll('.ag-row-wrap.ag-expanded .ag-detail-panel').forEach(function (panel) {
                var wrap = panel.closest('.ag-row-wrap');
                if (!wrap) return;
                var id = parseInt(wrap.getAttribute('data-agid'), 10);
                self._bindFormEvents(panel, id);
            });
        },

        _bindFormEvents: function (panel, id) {
            var self = this;

            // ── PDF upload file picker ─────────────────────────────────────────
            var filePicker = panel.querySelector('.ag-pdf-file-input');
            if (filePicker) {
                filePicker.addEventListener('change', function () {
                    var file = filePicker.files[0];
                    if (!file) return;
                    var stKey = (id === 'new') ? 'new' : id;
                    var cfg = self._config;

                    // ── Resolve allowed extensions from config ─────────────────
                    // Always lowercase, always starts with a dot.
                    var allowed = Array.isArray(cfg.uploadAllowedExtensions) && cfg.uploadAllowedExtensions.length
                        ? cfg.uploadAllowedExtensions.map(function (e) {
                            return (e.charAt(0) === '.' ? e : '.' + e).toLowerCase();
                        })
                        : ['.pdf'];

                    // ── Validate extension (real-time, before any upload) ──────
                    var fileExt = file.name.toLowerCase().lastIndexOf('.') !== -1
                        ? file.name.toLowerCase().slice(file.name.toLowerCase().lastIndexOf('.'))
                        : '';
                    var extOk = allowed.indexOf(fileExt) !== -1;

                    // Also check MIME type as a second signal (browsers set this).
                    // We maintain a map of known extensions → MIME types.
                    // If the MIME is present AND mismatched we reject; if absent
                    // (some OSes omit it) we rely on the extension check alone.
                    var mimeMap = {
                        '.pdf': ['application/pdf'],
                        '.doc': ['application/msword'],
                        '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                        '.xls': ['application/vnd.ms-excel'],
                        '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                        '.png': ['image/png'],
                        '.jpg': ['image/jpeg'],
                        '.jpeg': ['image/jpeg'],
                        '.gif': ['image/gif'],
                        '.txt': ['text/plain'],
                        '.csv': ['text/csv', 'text/plain'],
                        '.zip': ['application/zip', 'application/x-zip-compressed'],
                    };
                    var expectedMimes = mimeMap[fileExt];
                    var mimeOk = true;
                    if (file.type && expectedMimes) {
                        mimeOk = expectedMimes.indexOf(file.type) !== -1;
                    }

                    if (!extOk || !mimeOk) {
                        var extList = allowed.join(', ');
                        self._uploadState[stKey] = {
                            file: null,
                            error: 'Invalid file type. Allowed: ' + extList + '.'
                        };
                        self._refreshUploadWidget(panel, stKey);
                        filePicker.value = '';
                        return;
                    }

                    // ── Validate size ──────────────────────────────────────────
                    var maxMb = (typeof cfg.uploadMaxSizeMb === 'number' && cfg.uploadMaxSizeMb > 0)
                        ? cfg.uploadMaxSizeMb : 20;
                    var maxBytes = maxMb * 1024 * 1024;
                    if (file.size > maxBytes) {
                        self._uploadState[stKey] = {
                            file: null,
                            error: 'File is too large. Maximum allowed size is ' + maxMb + ' MB.'
                        };
                        self._refreshUploadWidget(panel, stKey);
                        filePicker.value = '';
                        return;
                    }

                    // ── All good ───────────────────────────────────────────────
                    self._uploadState[stKey] = {
                        file: file, guid: null, uploading: false, progress: 0, error: null
                    };
                    self._refreshUploadWidget(panel, stKey);
                });
            }

            // ── Upload button ──────────────────────────────────────────────────
            var uploadBtn = panel.querySelector('.ag-pdf-upload-btn');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', function () {
                    var stKey = (id === 'new') ? 'new' : id;
                    var upst = self._uploadState[stKey];
                    if (!upst || !upst.file) return;
                    if (upst.uploading) return;
                    self._doUpload(panel, stKey, upst.file, null);
                });
            }

            // ── Standard input tracking ────────────────────────────────────────
            panel.querySelectorAll('input, textarea, select').forEach(function (inp) {
                if (inp.classList.contains('ag-pdf-file-input')) return; // handled above
                if (inp.type === 'file') {
                    inp.addEventListener('change', function () {
                        var lbl = panel.querySelector('.ag-file-name[data-for="' + inp.getAttribute('data-fieldkey') + '"]');
                        if (lbl) lbl.textContent = inp.files[0] ? inp.files[0].name : 'No file chosen';
                    });
                    return;
                }
                inp.addEventListener('change', function () {
                    var key = inp.getAttribute('data-fieldkey');
                    var val = inp.type === 'checkbox' ? inp.checked : inp.value;
                    var buf = id === 'new' ? self._newBuffer : (self._editBuffer[id] = self._editBuffer[id] || {});
                    if (key) buf[key] = val;
                    var field = self._config.editFields.find(function (f) { return f.key === key; });
                    if (field && typeof field.onChange === 'function') {
                        field.onChange(key, val, self._findById(id));
                    }
                });
            });

            // ── Form action buttons ────────────────────────────────────────────
            panel.querySelectorAll('[data-formaction]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var action = btn.getAttribute('data-formaction');
                    var agid = btn.getAttribute('data-agid');
                    var numId = parseInt(agid, 10);

                    // ── Cancel / Close ─────────────────────────────────────────
                    if (action === 'cancel' || action === 'cancel-add') {
                        if (action === 'cancel-add') {
                            self._addPanelOpen = false;
                            delete self._uploadState['new'];
                            var ap = document.getElementById(self._uid + '_addpanel');
                            if (ap) { ap.classList.remove('ag-visible'); ap.innerHTML = ''; }
                        } else {
                            // If we were in edit mode, revert buffer; either way collapse
                            delete self._editBuffer[numId];
                            delete self._editMode[numId];
                            self._setExpanded(numId, false);
                        }
                        return;
                    }

                    // ── Edit-switch (view → edit) ──────────────────────────────
                    if (action === 'edit-switch') {
                        self._setEditMode(numId);
                        return;
                    }

                    // ── Save (update existing) ─────────────────────────────────
                    if (action === 'save') {
                        var buf = self._editBuffer[numId];
                        if (!buf) return;
                        self._collectFormValues(panel, buf);
                        var rec2 = self._findById(numId);
                        if (rec2) Object.assign(rec2, buf);
                        delete self._editMode[numId];
                        delete self._uploadState[numId];
                        self._apply();
                        self._setExpanded(numId, false);
                        self._fire('onSave', { id: numId, record: rec2, isNew: false });
                        return;
                    }

                    // ── Insert (add new) — async: upload PDF first if needed ───
                    if (action === 'insert') {
                        self._collectFormValues(panel, self._newBuffer);
                        var cfg = self._config;
                        var upst = self._uploadState['new'];
                        var hasFn = typeof cfg.onUploadDocument === 'function';

                        // ── HARD GATE: upload is required and no guid yet ───────
                        // Three blocked states:
                        //   a) No file selected at all
                        //   b) File selected but Upload button not yet clicked
                        //   c) Upload was attempted but failed (no guid)
                        if (hasFn) {
                            var hasGuid = upst && upst.guid && upst.guid.length > 0;
                            if (!hasGuid) {
                                var reason = !upst || !upst.file
                                    ? 'A document must be uploaded before saving. Please choose a file and click "Upload to Storage".'
                                    : upst.uploading
                                        ? 'Upload is still in progress. Please wait until it completes.'
                                        : 'The document has not been uploaded yet. Please click "Upload to Storage" first.';

                                // Surface the error inside the upload widget
                                if (!self._uploadState['new']) self._uploadState['new'] = {};
                                self._uploadState['new'].error = reason;
                                self._refreshUploadWidget(panel, 'new');

                                // Also shake the save button to draw attention
                                var sb = panel.querySelector('[data-formaction="insert"]');
                                if (sb) {
                                    sb.style.animation = 'none';
                                    // Force reflow then apply shake
                                    void sb.offsetWidth;
                                    sb.style.animation = 'ag-shake .4s ease';
                                }
                                return;
                            }
                        }

                        // Upload already done or not required — proceed
                        self._finaliseInsert(panel);
                        return;
                    }

                    // ── Delete ─────────────────────────────────────────────────
                    if (action === 'delete') {
                        if (confirm('Are you sure you want to delete this record?')) {
                            var rec3 = self._findById(numId);
                            self.removeRecord(numId);
                            self._fire('onDelete', { id: numId, record: rec3 });
                        }
                        return;
                    }
                });
            });
        },

        // Finish an insert after any upload is complete
        _finaliseInsert: function (panel) {
            var self = this;
            var newRec = Object.assign({}, this._newBuffer);
            this.addRecord(newRec);
            this._addPanelOpen = false;
            delete this._uploadState['new'];
            var ap = document.getElementById(this._uid + '_addpanel');
            if (ap) { ap.classList.remove('ag-visible'); ap.innerHTML = ''; }
            this._newBuffer = {};
            this._fire('onSave', { record: newRec, isNew: true });
        },

        // Perform the blob upload and update the widget UI as it progresses
        _doUpload: function (panel, stKey, file, onDone) {
            var self = this;
            var cfg = this._config;
            var upst = this._uploadState[stKey] || {};
            upst.uploading = true;
            upst.progress = 0;
            upst.error = null;
            this._uploadState[stKey] = upst;
            this._refreshUploadWidget(panel, stKey);

            // Disable the Save button during upload
            var saveBtn = panel.querySelector('[data-formaction="insert"]');
            if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Uploading…'; }

            cfg.onUploadDocument(
                file,
                // progress callback
                function (pct) {
                    upst.progress = pct;
                    self._refreshUploadWidget(panel, stKey);
                },
                // done callback
                function (err, guid) {
                    upst.uploading = false;
                    if (err) {
                        upst.error = err;
                        upst.guid = null;
                    } else {
                        upst.guid = guid;
                        upst.error = null;
                        // Store GUID into the buffer immediately
                        self._newBuffer[cfg.uploadDocumentField] = guid;
                    }
                    self._refreshUploadWidget(panel, stKey);
                    if (saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Save New Template';
                    }
                    if (!err && typeof onDone === 'function') onDone(guid);
                }
            );
        },

        // Re-paint only the upload widget area without rebuilding the whole panel
        _refreshUploadWidget: function (panel, stKey) {
            var upst = this._uploadState[stKey] || {};
            var widget = panel.querySelector('.ag-pdf-upload-widget');
            if (!widget) return;
            widget.innerHTML = buildPdfUploadWidgetInner(upst, this._config);
            // Re-bind the new Upload button if present
            var self = this;
            var newBtn = widget.querySelector('.ag-pdf-upload-btn');
            if (newBtn) {
                newBtn.addEventListener('click', function () {
                    var us = self._uploadState[stKey];
                    if (us && us.file && !us.uploading) {
                        self._doUpload(panel, stKey, us.file, null);
                    }
                });
            }

            // ── Sync Save button locked/unlocked state ─────────────────────
            // Called after every upload state transition so the button always
            // reflects whether a valid guid is in hand.
            var saveBtn = panel.querySelector('[data-formaction="insert"]');
            if (!saveBtn) return;
            var hasFn = typeof this._config.onUploadDocument === 'function';
            var hasGuid = hasFn && upst.guid && upst.guid.length > 0;
            if (hasFn) {
                if (hasGuid) {
                    // ✓ Upload complete — unlock
                    saveBtn.style.opacity = '1';
                    saveBtn.style.cursor = 'pointer';
                    saveBtn.removeAttribute('title');
                    saveBtn.textContent = 'Save New Template';
                } else {
                    // ✗ No guid yet — keep locked
                    saveBtn.style.opacity = '0.45';
                    saveBtn.style.cursor = 'not-allowed';
                    saveBtn.title = 'Upload a document first to enable saving';
                    if (!upst.uploading) saveBtn.textContent = 'Save New Template';
                }
            }
        },

        _collectFormValues: function (panel, target) {
            panel.querySelectorAll('input[data-fieldkey], textarea[data-fieldkey], select[data-fieldkey]').forEach(function (inp) {
                if (inp.type === 'file') return;
                var key = inp.getAttribute('data-fieldkey');
                if (!key) return;
                target[key] = inp.type === 'checkbox' ? inp.checked : inp.value;
            });
        },

        _renderPager: function () {
            var el = document.getElementById(this._uid + '_pager');
            if (!el) return;
            var self = this;
            var isServerMode = typeof this._config.dataLoader === 'function' &&
                typeof this._serverTotalCount === 'number';
            var total = isServerMode ? this._serverTotalCount : this._filtered.length;
            var tp = this._totalPages();
            var p = this._page;
            var start = ((p - 1) * this._pageSize) + 1;
            var end = Math.min(p * this._pageSize, total);

            var pageSizeOpts = this._config.pageSizeOptions.map(function (n) {
                return '<option value="' + n + '"' + (n === self._pageSize ? ' selected' : '') + '>' + n + ' / page</option>';
            }).join('');

            // Build page number buttons (show max 7)
            var pageButtons = '';
            var range = buildPageRange(p, tp);
            range.forEach(function (r) {
                if (r === '...') {
                    pageButtons += '<span style="padding:4px 4px;color:#aaa;">…</span>';
                } else {
                    pageButtons += '<button class="ag-page-btn' + (r === p ? ' ag-page-active' : '') +
                        '" data-page="' + r + '" type="button">' + r + '</button>';
                }
            });

            el.innerHTML =
                '<button class="ag-page-btn" id="' + this._uid + '_prev" type="button" ' +
                (p <= 1 ? 'disabled' : '') + ' aria-label="Previous page">&#8249;</button>' +
                pageButtons +
                '<button class="ag-page-btn" id="' + this._uid + '_next" type="button" ' +
                (p >= tp ? 'disabled' : '') + ' aria-label="Next page">&#8250;</button>' +
                '<span class="ag-page-info">' + (total ? start + '–' + end + ' of ' + total : '0') + '</span>' +
                '<select class="ag-page-size-select" id="' + this._uid + '_pagesize" aria-label="Records per page">' +
                pageSizeOpts + '</select>';

            el.querySelectorAll('[data-page]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var pg = parseInt(btn.getAttribute('data-page'), 10);
                    self.setPage(pg);
                    self._fire('onPageChange', { page: pg });
                });
            });
            var prev = document.getElementById(this._uid + '_prev');
            var next = document.getElementById(this._uid + '_next');
            if (prev) prev.addEventListener('click', function () {
                if (self._page > 1) { self.setPage(self._page - 1); self._fire('onPageChange', { page: self._page }); }
            });
            if (next) next.addEventListener('click', function () {
                if (self._page < tp) { self.setPage(self._page + 1); self._fire('onPageChange', { page: self._page }); }
            });
            var ps = document.getElementById(this._uid + '_pagesize');
            if (ps) ps.addEventListener('change', function () {
                self.setPageSize(parseInt(ps.value, 10));
            });
        },

        /* ---- SVG icons ---- */
        _svgSearch: function () {
            return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
        },
        _svgSort: function () {
            return '<span class="ag-sort-icon">' +
                '<svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill="currentColor"/></svg>' +
                '<svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 5L0 0h8z" fill="currentColor"/></svg>' +
                '</span>';
        },
        _svgPlus: function () {
            return '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">' +
                '<line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>';
        },
        _svgRefresh: function () {
            return '<svg class="ag-refresh-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" ' +
                'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
                'style="display:inline-block;vertical-align:middle;">' +
                '<polyline points="23 4 23 10 17 10"/>' +
                '<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';
        },
        _svgEmpty: function () {
            return '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display:block;margin:0 auto 8px;">' +
                '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="16" x2="12" y2="16"/></svg>';
        },
    };

    /* =========================================================
       SECTION 5 — FIELD HTML BUILDER (module-level function)
    ========================================================= */
    function buildFieldHtml(field, buf, rowId) {
        var val = buf && buf[field.key] != null ? buf[field.key] : (field.defaultValue != null ? field.defaultValue : '');
        var cls = 'ag-field' + (field.fullWidth ? ' ag-field-full' : '');
        var labelCls = 'ag-field-label' + (field.required ? ' ag-field-required' : '');
        var dkey = 'data-fieldkey="' + escapeHtml(field.key) + '"';
        // Use only 'readonly' (not 'disabled') so _collectFormValues can still
        // read the value. A disabled input is excluded from form queries entirely.
        var ro = field.readOnly ? ' readonly style="background:#f4f5f4;color:#7a837a;cursor:default;"' : '';
        var ph = field.placeholder ? ' placeholder="' + escapeHtml(field.placeholder) + '"' : '';
        var id = 'agf_' + rowId + '_' + field.key;
        var html = '<div class="' + cls + '">';
        html += '<label class="' + labelCls + '" for="' + id + '">' + escapeHtml(field.label) + '</label>';

        if (field.type === 'textarea') {
            html += '<textarea id="' + id + '" ' + dkey + ph + ro + '>' + escapeHtml(val) + '</textarea>';
        } else if (field.type === 'select') {
            var roSel = field.readOnly
                ? ' style="background:#f4f5f4;color:#7a837a;pointer-events:none;"'
                : '';
            html += '<select id="' + id + '" ' + dkey + roSel + '>';
            (field.options || []).forEach(function (o) {
                var sv = o.value != null ? o.value : o;
                var sl = o.label != null ? o.label : o;
                html += '<option value="' + escapeHtml(sv) + '"' + (String(sv) === String(val) ? ' selected' : '') + '>' + escapeHtml(sl) + '</option>';
            });
            html += '</select>';
        } else if (field.type === 'checkbox') {
            var roChk = field.readOnly ? ' style="pointer-events:none;opacity:.6;"' : '';
            html = '<div class="' + cls + ' ag-field-check">';
            html += '<input type="checkbox" id="' + id + '" ' + dkey + (val ? ' checked' : '') + roChk + ' />';
            html += '<label class="ag-field-label" for="' + id + '">' + escapeHtml(field.label) + '</label>';
            html += '</div>';
            return html;
        } else if (field.type === 'date') {
            html += '<input type="date" id="' + id + '" ' + dkey + ' value="' + escapeHtml(val) + '"' + ro + ph + ' />';
        } else if (field.type === 'number') {
            html += '<input type="number" id="' + id + '" ' + dkey + ' value="' + escapeHtml(val) + '"' + ro + ph + ' />';
        } else if (field.type === 'email') {
            html += '<input type="email" id="' + id + '" ' + dkey + ' value="' + escapeHtml(val) + '"' + ro + ph + ' />';
        } else if (field.type === 'file') {
            html += '<div class="ag-file-wrap">' +
                '<label class="ag-file-btn" for="' + id + '">Choose File</label>' +
                '<input type="file" id="' + id + '" ' + dkey + ' style="display:none" />' +
                '<span class="ag-file-name" data-for="' + escapeHtml(field.key) + '">' + (val || 'No file chosen') + '</span>' +
                '</div>';
        } else if (field.type === 'custom' && typeof field.render === 'function') {
            html += field.render(field, buf);
        } else {
            // text / default
            html += '<input type="text" id="' + id + '" ' + dkey + ' value="' + escapeHtml(val) + '"' + ro + ph + ' />';
        }
        html += '</div>';
        return html;
    }

    /* =========================================================
       SECTION 5b — VIEW-ONLY FIELD RENDERER
       Renders a field as a labelled read-only display span,
       used when a row is expanded via the arrow (not Edit button).
    ========================================================= */
    function buildViewFieldHtml(field, buf) {
        var val = buf && buf[field.key] != null ? buf[field.key] : '';
        var cls = 'ag-field' + (field.fullWidth ? ' ag-field-full' : '');

        // Checkboxes shown as Yes/No
        if (field.type === 'checkbox') {
            return '<div class="' + cls + ' ag-field-check" style="padding-top:18px;">' +
                '<span style="width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;' +
                'border:1px solid #b0b8b0;border-radius:2px;background:#f8f9f8;flex-shrink:0;font-size:12px;">' +
                (val ? '&#10003;' : '') + '</span>' +
                '<span style="font-size:13.5px;font-weight:500;color:#1a1e1a;margin-left:6px;">' +
                escapeHtml(field.label) + '</span></div>';
        }

        // For selects, show the label not the raw value where possible
        var display = '';
        if (field.type === 'select' && Array.isArray(field.options)) {
            var match = field.options.find(function (o) {
                return String(o.value != null ? o.value : o) === String(val);
            });
            display = match ? escapeHtml(match.label != null ? match.label : match) : escapeHtml(val);
        } else {
            display = escapeHtml(val);
        }

        var empty = display === '';
        return '<div class="' + cls + '">' +
            '<label class="ag-field-label">' + escapeHtml(field.label) + '</label>' +
            '<div style="font-size:13px;font-weight:400;color:' +
            (empty ? '#b0b8b0' : '#3a403a') + ';min-height:26px;line-height:1.4;">' +
            (empty ? '—' : display) + '</div>' +
            '</div>';
    }

    /* =========================================================
       SECTION 5c — PDF UPLOAD WIDGET BUILDER
       Renders the full upload widget container (outer wrapper +
       inner state). The inner part is refreshed in-place by
       _refreshUploadWidget without rebuilding the whole panel.
    ========================================================= */
    function buildPdfUploadWidget(rowId, upst, cfg) {
        // Only render if onUploadDocument is wired up
        if (typeof cfg.onUploadDocument !== 'function') return '';

        // Build the accept attribute from config
        var allowed = Array.isArray(cfg.uploadAllowedExtensions) && cfg.uploadAllowedExtensions.length
            ? cfg.uploadAllowedExtensions.map(function (e) {
                return (e.charAt(0) === '.' ? e : '.' + e).toLowerCase();
            })
            : ['.pdf'];
        var maxMb = (typeof cfg.uploadMaxSizeMb === 'number' && cfg.uploadMaxSizeMb > 0)
            ? cfg.uploadMaxSizeMb : 20;

        // accept= value: comma-separated extensions
        var acceptAttr = allowed.join(',');
        // Human-readable label: "Choose PDF" / "Choose PDF, DOCX" / "Choose File"
        var extLabels = allowed.map(function (e) { return e.replace('.', '').toUpperCase(); });
        var chooseLbl = 'Choose ' + (extLabels.length <= 3 ? extLabels.join(', ') : 'File');

        return '<div class="ag-field ag-field-full" style="grid-column:1/-1;">' +
            '<label class="ag-field-label">Document</label>' +
            '<div class="ag-pdf-upload-container">' +
            '<input type="file" accept="' + escapeHtml(acceptAttr) + '" ' +
            'class="ag-pdf-file-input" id="ag-pdf-input-' + rowId + '" ' +
            'style="display:none;" />' +
            '<label for="ag-pdf-input-' + rowId + '" class="ag-pdf-choose-btn" ' +
            'style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;' +
            'background:#f8f9f8;border:1px solid #b0b8b0;border-radius:4px;font-size:12px;' +
            'font-family:inherit;cursor:pointer;white-space:nowrap;color:#1a1e1a;">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>' +
            '<polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            escapeHtml(chooseLbl) + '</label>' +
            '<div class="ag-pdf-upload-widget" style="margin-top:8px;">' +
            buildPdfUploadWidgetInner(upst, cfg, allowed, maxMb) +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function buildPdfUploadWidgetInner(upst, cfg, allowed, maxMb) {
        // Resolve defaults when called from _refreshUploadWidget (no allowed/maxMb passed)
        if (!allowed) {
            allowed = Array.isArray(cfg.uploadAllowedExtensions) && cfg.uploadAllowedExtensions.length
                ? cfg.uploadAllowedExtensions.map(function (e) {
                    return (e.charAt(0) === '.' ? e : '.' + e).toLowerCase();
                })
                : ['.pdf'];
        }
        if (!maxMb) {
            maxMb = (typeof cfg.uploadMaxSizeMb === 'number' && cfg.uploadMaxSizeMb > 0)
                ? cfg.uploadMaxSizeMb : 20;
        }
        var extLabels = allowed.map(function (e) { return e.replace('.', '').toUpperCase(); });
        var hintText = extLabels.join(', ') + ' only — max ' + maxMb + ' MB.';

        // No file selected yet
        if (!upst || !upst.file) {
            var msg = (upst && upst.error)
                ? '<span style="color:#c0392b;font-size:12px;">&#9888; ' + escapeHtml(upst.error) + '</span>'
                : '<span style="color:#9aa09a;font-size:12px;">' + escapeHtml(hintText) + '</span>';
            return msg;
        }
        var html = '';
        // File name pill
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
        html += '<span style="background:#e6f4e6;color:#256025;padding:3px 10px;border-radius:10px;' +
            'font-size:12px;font-weight:500;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" ' +
            'title="' + escapeHtml(upst.file.name) + '">&#128196; ' + escapeHtml(upst.file.name) + '</span>';

        if (upst.uploading) {
            // Progress bar
            html += '</div>';
            html += '<div style="margin-top:8px;">';
            html += '<div style="background:#e0e4e0;border-radius:4px;height:6px;overflow:hidden;">' +
                '<div style="background:#2e7d2e;height:6px;border-radius:4px;transition:width .3s;width:' +
                Math.round(upst.progress || 0) + '%"></div></div>';
            html += '<span style="font-size:11px;color:#7a837a;margin-top:3px;display:block;">' +
                'Uploading… ' + Math.round(upst.progress || 0) + '%</span>';
            html += '</div>';
        } else if (upst.guid) {
            // Success — show GUID reference
            html += '<span style="background:#e6f4e6;border:1px solid #b0d8b0;border-radius:4px;' +
                'padding:3px 8px;font-size:11px;color:#256025;font-family:Consolas,monospace;">' +
                '&#10003; ' + escapeHtml(upst.guid) + '</span>';
            html += '</div>';
        } else {
            // Ready to upload — show Upload button
            html += '<button type="button" class="ag-pdf-upload-btn" ' +
                'style="padding:5px 12px;background:#2e7d2e;color:#fff;border:1px solid #236122;' +
                'border-radius:4px;font-size:12px;font-family:inherit;cursor:pointer;white-space:nowrap;">' +
                'Upload to Storage</button>';
            html += '</div>';
        }

        if (upst.error) {
            html += '<div style="color:#c0392b;font-size:12px;margin-top:6px;">&#9888; ' +
                escapeHtml(upst.error) + '</div>';
        }
        return html;
    }
    function buildPageRange(current, total) {
        if (total <= 7) {
            var r = [];
            for (var i = 1; i <= total; i++) r.push(i);
            return r;
        }
        var pages = [1];
        if (current > 3) pages.push('...');
        for (var p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    }

    /* =========================================================
       SECTION 7 — STATIC FACTORY
    ========================================================= */
    AccordionGrid.create = function (containerId, options) {
        return new AccordionGrid(containerId, options);
    };

    return AccordionGrid;
}));
//# sourceMappingURL=none
