using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;

namespace AccordionGridProject
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoadGridData();
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // STEP 1  — Get data from the "service"
        //           Right now this calls a hardcoded stub below.
        //           Later: swap FakePoaFormsService for your real service.
        // ─────────────────────────────────────────────────────────────────────
        private void LoadGridData()
        {
            // ── Call the service (currently fake / hardcoded) ──────────────
            int totalCount;
            var data = FakePoaFormsService.GetAllForms(
                itemsPerPage: 200,
                pageNumber: 1,
                totalCount: out totalCount
            );

            // ── Flatten to a shape that matches the JS column/editField keys ─
            //    Property names here MUST match the key: values in Default.aspx.
            var result = data.Select(x => new
            {
                x.Id,
                x.Description,
                x.State,
                x.Active,
                x.MailCenterId,

                // Classification
                x.ServiceType,
                x.FormType,
                x.FormUse,
                x.PoaType,

                // Processing
                x.SignatureType,
                x.OnlineRequirement,
                x.ReturnType,

                // Workflow status (drives badge colours in the grid)
                x.ExtractionStatus,
                x.MappingStatus,

                // Document (read-only display)
                x.DocumentReference,
                x.FileName,
                x.FileExtension,

                x.Notes
            }).ToList();

            // ── Serialise ─────────────────────────────────────────────────────
            var json = JsonConvert.SerializeObject(result, new JsonSerializerSettings
            {
                StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                NullValueHandling = NullValueHandling.Include
            });

            // ── Push to the browser ───────────────────────────────────────────
            //
            // WHY NOT RegisterStartupScript alone?
            //   RegisterStartupScript injects a <script> block just before </form>.
            //   If a ScriptManager is on the page, or the page uses async postbacks,
            //   the injection point can shift and the variable may not yet exist when
            //   the init <script> at the bottom of the page runs.
            //
            // RELIABLE PATTERN: store the JSON in a hidden field + fall back to
            //   RegisterStartupScript.  The init script reads the hidden field first,
            //   then falls back to window.poaTemplatesData.
            //   This works with Master Pages, ScriptManager, and plain WebForms.
            //
            // Hidden field (always present in rendered HTML, no timing issue):
            HiddenGridData.Value = json;

            // Also set window variable via RegisterStartupScript as secondary path:
            var script = "window.poaTemplatesData = " + json + ";";
            ClientScript.RegisterStartupScript(
                type: GetType(),
                key: "poaTemplatesData",
                script: script,
                addScriptTags: true
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // STEP 2  — Fake service
        //           Simulates what PoaFormsService.GetAllForms() will return.
        //           Delete this class once you wire up the real service.
        // ─────────────────────────────────────────────────────────────────────
        private static class FakePoaFormsService
        {
            public static List<PoaFormModel> GetAllForms(
                int itemsPerPage,
                int pageNumber,
                out int totalCount)
            {
                var all = GetSeedData();
                totalCount = all.Count;
                return all
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
                        FileExtension = ".pdf", Notes = ""
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
                        FileExtension = ".pdf", Notes = "Needs review"
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
                        FileExtension = ".pdf", Notes = ""
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
                        FileExtension = "", Notes = "Pending upload"
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
                        FileExtension = ".pdf", Notes = "Re-extraction required"
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
                        FileExtension = ".pdf", Notes = ""
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
                        FileExtension = "", Notes = ""
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
                        FileExtension = ".pdf", Notes = ""
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
                        FileExtension = "", Notes = "Waiting for approval"
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
                        FileExtension = ".pdf", Notes = ""
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
                        FileExtension = "", Notes = ""
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
                        FileExtension = ".pdf", Notes = ""
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
        }
    }
}
