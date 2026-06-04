using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace AccordionGridProject
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoadFirstPage();
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // PAGE LOAD — only push the FIRST page + totalCount to the browser.
        //
        // The grid's dataLoader callback handles every subsequent page/search/
        // sort/filter request via the GetPage WebMethod below, so the initial
        // payload stays small regardless of how many total records exist.
        // ─────────────────────────────────────────────────────────────────────
        private void LoadFirstPage()
        {
            const int firstPageSize = 10;

            int totalCount;
            var data = FakePoaFormsService.GetAllForms(
                itemsPerPage: firstPageSize,
                pageNumber: 1,
                totalCount: out totalCount
            );

            var result = FlattenRecords(data);

            var payload = new
            {
                items = result,
                totalCount = totalCount,
                pageSize = firstPageSize,
                page = 1
            };

            var json = JsonConvert.SerializeObject(payload, new JsonSerializerSettings
            {
                StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                NullValueHandling = NullValueHandling.Include
            });

            // Hidden field — reliable across Master Pages and ScriptManager
            HiddenGridData.Value = json;

            ClientScript.RegisterStartupScript(
                GetType(), "poaInitialData",
                "window.poaInitialData = " + json + ";",
                addScriptTags: true);
        }

        // ─────────────────────────────────────────────────────────────────────
        // GetPage WebMethod — called by the AccordionGrid dataLoader on every
        // page change, search, sort, or filter action.
        //
        // Receives a JSON body: { page, pageSize, search, filter, sortKey, sortDir }
        // Returns:              { items: [...], totalCount: N }
        //
        // Your real page will replace FakePoaFormsService with your injected
        // IPoaFormsService and build a real PoaFormFilter from the params.
        // ─────────────────────────────────────────────────────────────────────
        [WebMethod]
        public static string GetPage(int page, int pageSize,
                                     string search, string filter,
                                     string sortKey, string sortDir)
        {
            // Guard sensible values
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;
            if (pageSize > 100) pageSize = 100;   // cap — protect the server

            int totalCount;
            var data = FakePoaFormsService.GetAllForms(
                itemsPerPage: pageSize,
                pageNumber: page,
                totalCount: out totalCount,
                search: search,
                filterState: filter,
                sortKey: sortKey,
                sortDir: sortDir
            );

            var result = FlattenRecords(data);

            // WebMethod wraps the return in { "d": "..." } — the JS unwraps it.
            return JsonConvert.SerializeObject(new
            {
                items = result,
                totalCount = totalCount
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // Shared flattener — maps the model to the JS property name contract.
        // Property names MUST match the key: values in Default.aspx JS.
        // ─────────────────────────────────────────────────────────────────────
        private static IEnumerable<object> FlattenRecords(IEnumerable<PoaFormModel> data)
        {
            return data.Select(x => (object)new
            {
                x.Id,
                x.Description,
                x.State,
                x.Active,
                x.MailCenterId,
                x.ServiceType,
                x.FormType,
                x.FormUse,
                x.PoaType,
                x.SignatureType,
                x.OnlineRequirement,
                x.ReturnType,
                x.ExtractionStatus,
                x.MappingStatus,
                x.DocumentReference,
                x.FileName,
                x.FileExtension,
                x.Notes,
                LastUpdated = x.LastUpdated.HasValue
                    ? x.LastUpdated.Value.ToString("MM/dd/yyyy hh:mm tt")
                    : ""
            }).ToList();
        }

        // ─────────────────────────────────────────────────────────────────────
        // FAKE SERVICE — simulates what your real IPoaFormsService does.
        // Supports server-side search, filter, sort, and pagination so the
        // dataLoader pathway can be tested end-to-end without a real DB.
        // Delete this class when you wire up the real service.
        // ─────────────────────────────────────────────────────────────────────
        private static class FakePoaFormsService
        {
            public static List<PoaFormModel> GetAllForms(
                int itemsPerPage,
                int pageNumber,
                out int totalCount,
                string search = null,
                string filterState = null,
                string sortKey = null,
                string sortDir = null)
            {
                var all = GetSeedData().AsEnumerable();

                // ── Search (matches Description or State) ──────────────────
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.ToLowerInvariant();
                    all = all.Where(r =>
                        (r.Description ?? "").ToLowerInvariant().Contains(s) ||
                        (r.State ?? "").ToLowerInvariant().Contains(s) ||
                        (r.ServiceType ?? "").ToLowerInvariant().Contains(s));
                }

                // ── Filter by State ────────────────────────────────────────
                if (!string.IsNullOrWhiteSpace(filterState))
                    all = all.Where(r => r.State == filterState);

                // ── Sort ───────────────────────────────────────────────────
                if (!string.IsNullOrWhiteSpace(sortKey))
                {
                    bool desc = string.Equals(sortDir, "desc",
                                              StringComparison.OrdinalIgnoreCase);
                    if (sortKey == "Description")
                        all = desc ? all.OrderByDescending(r => r.Description) : all.OrderBy(r => r.Description);
                    else if (sortKey == "State")
                        all = desc ? all.OrderByDescending(r => r.State) : all.OrderBy(r => r.State);
                    else if (sortKey == "ExtractionStatus")
                        all = desc ? all.OrderByDescending(r => r.ExtractionStatus) : all.OrderBy(r => r.ExtractionStatus);
                    else if (sortKey == "MappingStatus")
                        all = desc ? all.OrderByDescending(r => r.MappingStatus) : all.OrderBy(r => r.MappingStatus);
                    else
                        all = all.OrderBy(r => r.Id);
                }

                // ── Count AFTER filter/search, BEFORE paging ──────────────
                // This mirrors exactly what your real repository does with
                // query.Count() before .Skip().Take().
                var list = all.ToList();
                totalCount = list.Count;

                return list
                    .Skip((pageNumber - 1) * itemsPerPage)
                    .Take(itemsPerPage)
                    .ToList();
            }

            private static List<PoaFormModel> GetSeedData()
            {
                return new List<PoaFormModel>
                {
                    new PoaFormModel
                    {
                        Id = 1, Description = "Texas Individual POA",
                        State = "TX", Active = true,  MailCenterId = 10,
                        ServiceType = "Full",    FormType = "POA",  FormUse = "Filing",
                        PoaType     = "Tax",     SignatureType = "Digital",
                        OnlineRequirement = "None",   ReturnType = "Mail",
                        ExtractionStatus  = "Completed",  MappingStatus = "Mapped",
                        DocumentReference = "REF-TX-001", FileName = "tx_poa.pdf",
                        FileExtension = ".pdf", Notes = "",
                        LastUpdated = new DateTime(2025, 5, 10, 9, 30, 0)
                    },
                    new PoaFormModel
                    {
                        Id = 2, Description = "California Corp POA",
                        State = "CA", Active = true,  MailCenterId = 12,
                        ServiceType = "Full",    FormType = "2848", FormUse = "Representation",
                        PoaType     = "Tax",     SignatureType = "Electronic",
                        OnlineRequirement = "Required", ReturnType = "E-File",
                        ExtractionStatus  = "Completed",  MappingStatus = "Partial",
                        DocumentReference = "REF-CA-002", FileName = "ca_corp_poa.pdf",
                        FileExtension = ".pdf", Notes = "Needs review",
                        LastUpdated = new DateTime(2025, 4, 22, 14, 15, 0)
                    },
                    new PoaFormModel
                    {
                        Id = 3, Description = "Ohio Tax Authority POA",
                        State = "OH", Active = true,  MailCenterId = 8,
                        ServiceType = "Partial", FormType = "POA", FormUse = "Both",
                        PoaType     = "Financial", SignatureType = "Wet",
                        OnlineRequirement = "Optional", ReturnType = "Fax",
                        ExtractionStatus  = "In Progress", MappingStatus = "Not Mapped",
                        DocumentReference = "REF-OH-003", FileName = "oh_poa.pdf",
                        FileExtension = ".pdf", Notes = "",
                        LastUpdated = new DateTime(2025, 5, 1, 11, 0, 0)
                    },
                    new PoaFormModel
                    {
                        Id = 4, Description = "Texas Business POA",
                        State = "TX", Active = false, MailCenterId = 10,
                        ServiceType = "Limited", FormType = "8821", FormUse = "Filing",
                        PoaType     = "Tax",     SignatureType = "Digital",
                        OnlineRequirement = "None", ReturnType = "Portal",
                        ExtractionStatus  = "Not Started", MappingStatus = "Not Mapped",
                        DocumentReference = "",           FileName = "",
                        FileExtension = "", Notes = "Pending upload",
                        LastUpdated = null
                    },
                    new PoaFormModel
                    {
                        Id = 5, Description = "California Estate POA",
                        State = "CA", Active = true,  MailCenterId = 12,
                        ServiceType = "Full",    FormType = "POA", FormUse = "Filing",
                        PoaType     = "Medical", SignatureType = "Wet",
                        OnlineRequirement = "None", ReturnType = "Mail",
                        ExtractionStatus  = "Error", MappingStatus = "Not Mapped",
                        DocumentReference = "REF-CA-005", FileName = "ca_estate_poa.pdf",
                        FileExtension = ".pdf", Notes = "Re-extraction required",
                        LastUpdated = new DateTime(2025, 3, 18, 8, 45, 0)
                    },
                    new PoaFormModel
                    {
                        Id = 6, Description = "New York IRS POA",
                        State = "NY", Active = true,  MailCenterId = 5,
                        ServiceType = "Full",    FormType = "2848", FormUse = "Representation",
                        PoaType     = "Tax",     SignatureType = "Electronic",
                        OnlineRequirement = "Required", ReturnType = "E-File",
                        ExtractionStatus  = "Completed", MappingStatus = "Mapped",
                        DocumentReference = "REF-NY-006", FileName = "ny_irs_poa.pdf",
                        FileExtension = ".pdf", Notes = "",
                        LastUpdated = new DateTime(2025, 5, 9, 16, 20, 0)
                    },
                    new PoaFormModel
                    {
                        Id = 7, Description = "Florida Medicaid POA",
                        State = "FL", Active = true,  MailCenterId = 3,
                        ServiceType = "Full",    FormType = "POA", FormUse = "Both",
                        PoaType     = "Medical", SignatureType = "Digital",
                        OnlineRequirement = "Optional", ReturnType = "Mail",
                        ExtractionStatus  = "Not Started", MappingStatus = "Not Mapped",
                        DocumentReference = "",           FileName = "",
                        FileExtension = "", Notes = "",
                        LastUpdated = null
                    },
                    new PoaFormModel
                    {
                        Id = 8, Description = "Ohio Revenue POA",
                        State = "OH", Active = true,  MailCenterId = 8,
                        ServiceType = "Partial", FormType = "POA", FormUse = "Filing",
                        PoaType     = "Tax",     SignatureType = "Wet",
                        OnlineRequirement = "None", ReturnType = "Fax",
                        ExtractionStatus  = "Completed", MappingStatus = "Partial",
                        DocumentReference = "REF-OH-008", FileName = "oh_rev_poa.pdf",
                        FileExtension = ".pdf", Notes = "",
                        LastUpdated = new DateTime(2025, 4, 30, 10, 0, 0)
                    },
                    new PoaFormModel
                    {
                        Id = 9, Description = "Georgia State Tax POA",
                        State = "GA", Active = false, MailCenterId = 7,
                        ServiceType = "Full",    FormType = "8821", FormUse = "Filing",
                        PoaType     = "Tax",     SignatureType = "Electronic",
                        OnlineRequirement = "None", ReturnType = "Portal",
                        ExtractionStatus  = "Not Started", MappingStatus = "Not Mapped",
                        DocumentReference = "",           FileName = "",
                        FileExtension = "", Notes = "Waiting for approval",
                        LastUpdated = null
                    },
                    new PoaFormModel
                    {
                        Id = 10, Description = "Michigan Business POA",
                        State = "MI", Active = true,  MailCenterId = 6,
                        ServiceType = "Limited", FormType = "POA", FormUse = "Representation",
                        PoaType     = "Financial", SignatureType = "Digital",
                        OnlineRequirement = "Optional", ReturnType = "Mail",
                        ExtractionStatus  = "In Progress", MappingStatus = "Not Mapped",
                        DocumentReference = "REF-MI-010", FileName = "mi_biz_poa.pdf",
                        FileExtension = ".pdf", Notes = "",
                        LastUpdated = new DateTime(2025, 5, 5, 13, 10, 0)
                    },
                    new PoaFormModel
                    {
                        Id = 11, Description = "Washington State POA",
                        State = "WA", Active = true,  MailCenterId = 9,
                        ServiceType = "Full",    FormType = "POA", FormUse = "Filing",
                        PoaType     = "Tax",     SignatureType = "Electronic",
                        OnlineRequirement = "Required", ReturnType = "E-File",
                        ExtractionStatus  = "Not Started", MappingStatus = "Not Mapped",
                        DocumentReference = "",           FileName = "",
                        FileExtension = "", Notes = "",
                        LastUpdated = null
                    },
                    new PoaFormModel
                    {
                        Id = 12, Description = "Illinois Corp Tax POA",
                        State = "IL", Active = true,  MailCenterId = 11,
                        ServiceType = "Full",    FormType = "2848", FormUse = "Both",
                        PoaType     = "Tax",     SignatureType = "Digital",
                        OnlineRequirement = "None", ReturnType = "Mail",
                        ExtractionStatus  = "Completed", MappingStatus = "Mapped",
                        DocumentReference = "REF-IL-012", FileName = "il_corp_poa.pdf",
                        FileExtension = ".pdf", Notes = "",
                        LastUpdated = new DateTime(2025, 5, 8, 7, 55, 0)
                    }
                };
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // MODEL — matches your real PoaFormModel shape closely enough to test.
        //         When you connect the real service, delete this and reference
        //         the actual model from your service layer.
        // ─────────────────────────────────────────────────────────────────────
        public class PoaFormModel
        {
            public int Id { get; set; }
            public string Description { get; set; }
            public string State { get; set; }
            public bool Active { get; set; }
            public int? MailCenterId { get; set; }
            public string ServiceType { get; set; }
            public string FormType { get; set; }
            public string FormUse { get; set; }
            public string PoaType { get; set; }
            public string SignatureType { get; set; }
            public string OnlineRequirement { get; set; }
            public string ReturnType { get; set; }
            public string ExtractionStatus { get; set; }
            public string MappingStatus { get; set; }
            public string DocumentReference { get; set; }
            public string FileName { get; set; }
            public string FileExtension { get; set; }
            public string Notes { get; set; }
            public DateTime? LastUpdated { get; set; }
        }
    }
}
