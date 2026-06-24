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
                LoadFirstPage();
        }

        // ─────────────────────────────────────────────────────────────────────
        // PAGE LOAD — push first page + totalCount to the browser.
        // Every subsequent page/search/sort/filter goes through GetPage().
        // ─────────────────────────────────────────────────────────────────────
        private void LoadFirstPage()
        {
            const int firstPageSize = 10;
            int totalCount;
            var data = FakePoaFormsService.GetAllForms(
                itemsPerPage: firstPageSize,
                pageNumber: 1,
                totalCount: out totalCount);

            var payload = new
            {
                items = FlattenRecords(data),
                totalCount = totalCount,
                pageSize = firstPageSize,
                page = 1
            };

            var json = JsonConvert.SerializeObject(payload, new JsonSerializerSettings
            {
                StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                NullValueHandling = NullValueHandling.Include
            });

            HiddenGridData.Value = json;
            ClientScript.RegisterStartupScript(
                GetType(), "poaInitialData",
                "window.poaInitialData = " + json + ";",
                addScriptTags: true);

            // ── Lookups (combo box options) ───────────────────────────────────
            // Maps each LookupItem { Id, Name } → { value, label } so the grid
            // combo boxes consume them directly.  In real code this calls
            // PoaFormsService.GetServiceTypes(), GetMailCenters(), etc.
            var lookups = new
            {
                serviceTypes = ToOptions(FakePoaFormsService.GetServiceTypes()),
                poaFormTypes = ToOptions(FakePoaFormsService.GetPoaFormTypes()),
                formUses = ToOptions(FakePoaFormsService.GetFormUses()),
                poaTypes = ToOptions(FakePoaFormsService.GetPoaTypes()),
                signatureTypes = ToOptions(FakePoaFormsService.GetSignatureTypes()),
                onlineRequirements = ToOptions(FakePoaFormsService.GetOnlineRequirements()),
                returnTypes = ToOptions(FakePoaFormsService.GetReturnTypes()),
                mailCenters = ToOptions(FakePoaFormsService.GetMailCenters()),
                // GetStates() returns code as Id + state name; we use the code
                // as the value (shown in the grid column + used as filter).
                states = FakePoaFormsService.GetStates()
                                        .Select(s => new { label = s.Id, value = s.Id })
                                        .ToList()
            };

            var lookupsJson = JsonConvert.SerializeObject(lookups, new JsonSerializerSettings
            {
                StringEscapeHandling = StringEscapeHandling.EscapeHtml
            });

            // ── Inject into the page ──────────────────────────────────────────
            // RegisterStartupScript places a <script> block just before </form>.
            // The JS on the page reads window.poaLookups after this runs.
            ClientScript.RegisterStartupScript(
                type: GetType(),
                key: "poaLookups",
                script: "window.poaLookups = " + lookupsJson + ";",
                addScriptTags: true);
        }

        // Maps service LookupItem { Id, Name } → grid option { value, label }
        private static List<object> ToOptions(IEnumerable<LookupItem> items)
        {
            return items.Select(i => (object)new { value = i.Id, label = i.Name }).ToList();
        }

        // ─────────────────────────────────────────────────────────────────────
        // GET PAGE — dataLoader calls this on every page/search/sort/filter.
        // Replace FakePoaFormsService with IPoaFormsService in real code.
        // ─────────────────────────────────────────────────────────────────────
        [WebMethod]
        public static string GetPage(int page, int pageSize,
                                     string search, string filter,
                                     string sortKey, string sortDir)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            int totalCount;
            var data = FakePoaFormsService.GetAllForms(
                itemsPerPage: pageSize,
                pageNumber: page,
                totalCount: out totalCount,
                search: search,
                filterState: filter,
                sortKey: sortKey,
                sortDir: sortDir);

            return JsonConvert.SerializeObject(new
            {
                items = FlattenRecords(data),
                totalCount = totalCount
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // INSERT FORM
        // Called by onSave when e.isNew === true.
        // Returns the new Id and a server-stamped LastUpdated so the grid
        // can update the in-memory record without a full reload.
        //
        // REAL IMPLEMENTATION:
        //   var model = MapDtoToModel(form);
        //   model.LastUpdated = DateTime.UtcNow;
        //   int newId = PoaFormsService.InsertForm(model);
        //   return new { Id = newId,
        //                LastUpdated = model.LastUpdated.Value.ToString("MM/dd/yyyy hh:mm tt") };
        // ─────────────────────────────────────────────────────────────────────
        // INSERT FORM
        // The DTO now carries foreign-key IDs directly from the combo boxes
        // (ServiceTypeId, FormTypeId, …) so no string→id lookup is needed.
        // State arrives as the abbreviation and is resolved to StateId here.
        //
        // REAL IMPLEMENTATION:
        //   var entity = new poa_forms
        //   {
        //       description       = form.Description,
        //       active            = form.Active,
        //       mail_center_id    = form.MailCenterId,
        //       service_type_id   = form.ServiceTypeId,        // ← direct FK
        //       form_type_id      = form.FormTypeId,
        //       form_use_id       = form.FormUseId,
        //       poa_type_id       = form.PoaTypeId,
        //       signature_type_id = form.SignatureTypeId,
        //       return_type_id    = form.ReturnTypeId,
        //       online_requirement_id = form.OnlineRequirementId,
        //       state_id          = _context.state_codes
        //                              .Where(s => s.abbreviation == form.State)
        //                              .Select(s => (int?)s.id).FirstOrDefault(),
        //       document_reference = form.DocumentReference,
        //       file_name          = form.FileName,
        //       file_extension     = form.FileExtension,
        //       last_updated       = DateTime.UtcNow
        //   };
        //   _context.poa_forms.Add(entity);
        //   _context.SaveChanges();
        //   return new { Id = entity.id,
        //                LastUpdated = entity.last_updated.Value.ToString("MM/dd/yyyy hh:mm tt") };
        // ─────────────────────────────────────────────────────────────────────
        [WebMethod]
        public static string InsertForm(PoaFormDto form)
        {
            // ── POC stub ────────────────────────────────────────────────────
            var newId = new Random().Next(100, 9999);
            var lastUpdated = DateTime.Now.ToString("MM/dd/yyyy hh:mm tt");

            System.Diagnostics.Trace.TraceInformation(
                "[InsertForm] Simulated insert — description={0}, serviceTypeId={1}, " +
                "formTypeId={2}, state={3}, newId={4}",
                form.Description, form.ServiceTypeId, form.PoaFormTypeId, form.State, newId);

            return JsonConvert.SerializeObject(new
            {
                Id = newId,
                LastUpdated = lastUpdated
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // UPDATE FORM
        // Called by onSave when e.isNew === false.
        // Returns the server-stamped LastUpdated.
        //
        // REAL IMPLEMENTATION:
        //   var model = MapDtoToModel(form);
        //   model.LastUpdated = DateTime.UtcNow;
        //   PoaFormsService.UpdateForm(model);
        //   return new { LastUpdated = model.LastUpdated.Value.ToString("MM/dd/yyyy hh:mm tt") };
        // ─────────────────────────────────────────────────────────────────────
        [WebMethod]
        public static string UpdateForm(PoaFormDto form)
        {
            // ── POC stub ────────────────────────────────────────────────────
            var lastUpdated = DateTime.Now.ToString("MM/dd/yyyy hh:mm tt");

            System.Diagnostics.Trace.TraceInformation(
                "[UpdateForm] Simulated update — id={0}, description={1}",
                form.Id, form.Description);

            return JsonConvert.SerializeObject(new
            {
                LastUpdated = lastUpdated
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // DELETE FORM
        // Called by the Delete action button after user confirms.
        // Returns success:true so the JS can call grid.removeRecord() only
        // after the server confirms deletion.
        //
        // REAL IMPLEMENTATION:
        //   PoaFormsService.DeleteForm(id);
        //   return new { Success = true };
        // ─────────────────────────────────────────────────────────────────────
        [WebMethod]
        public static string DeleteForm(int Id)
        {
            // ── POC stub ────────────────────────────────────────────────────
            System.Diagnostics.Trace.TraceInformation(
                "[DeleteForm] Simulated delete — id={0}", Id);

            return JsonConvert.SerializeObject(new { Success = true });
        }

        [WebMethod]
        public static string TriggerExtraction(int Id)
        {
            // ── POC stub — simulates immediate job enqueue ──────────────────
            var fakeJobId = "JOB-" + Id + "-" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

            System.Diagnostics.Trace.TraceInformation(
                "[TriggerExtraction] Simulated enqueue — id={0}, jobId={1}",
                Id, fakeJobId);

            return JsonConvert.SerializeObject(new
            {
                JobId = fakeJobId,
                Status = "In Progress"
            });
        }

        [WebMethod]
        public static string GetExtractionStatus(int Id)
        {
            // ── POC stub — returns Completed immediately ────────────────────
            System.Diagnostics.Trace.TraceInformation(
                "[GetExtractionStatus] Simulated status check — id={0}", Id);

            return JsonConvert.SerializeObject(new { Status = "Completed" });
        }

        [WebMethod]
        public static string TriggerMapping(int Id)
        {
            // ── POC stub ────────────────────────────────────────────────────
            System.Diagnostics.Trace.TraceInformation(
                "[TriggerMapping] Simulated — id={0}", Id);

            return JsonConvert.SerializeObject(new
            {
                Status = "Partial",
                RedirectUrl = (string)null
            });
        }

        [WebMethod]
        public static string GenerateDocument(int Id)
        {
            // ── POC stub ────────────────────────────────────────────────────
            System.Diagnostics.Trace.TraceInformation(
                "[GenerateDocument] Simulated — id={0}", Id);

            return JsonConvert.SerializeObject(new
            {
                Success = true,
                RedirectUrl = (string)null
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // FLATTENER — maps model → JS property name contract.
        // Property names MUST match the key: values in Default.aspx JS.
        // ─────────────────────────────────────────────────────────────────────
        private static IEnumerable<object> FlattenRecords(IEnumerable<PoaFormModel> data)
        {
            return data.Select(x => (object)new
            {
                x.Id,
                x.Description,
                x.State,            // abbreviation (column + filter + select value)
                x.Active,
                x.MailCenterId,

                // Select fields emit the FK id as the value so the edit-form
                // dropdowns pre-select the correct option (option.value == id).
                ServiceType = x.ServiceTypeId,
                PoaFormType = x.PoaFormTypeId,
                FormUse = x.FormUseId,
                PoaType = x.PoaTypeId,
                SignatureType = x.SignatureTypeId,
                ReturnType = x.ReturnTypeId,
                OnlineRequirement = x.OnlineRequirementId,

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
        // DTO received from the JS for Insert / Update calls.
        // Property names must match the editField keys in Default.aspx.
        // ─────────────────────────────────────────────────────────────────────
        public class PoaFormDto
        {
            public int Id { get; set; }
            public string Description { get; set; }
            public string State { get; set; }   // abbreviation → StateId on server
            public bool Active { get; set; }
            public int? MailCenterId { get; set; }

            // Foreign-key IDs sent directly from the combo boxes.
            public int? ServiceTypeId { get; set; }
            public int? PoaFormTypeId { get; set; }
            public int? FormUseId { get; set; }
            public int? PoaTypeId { get; set; }
            public int? SignatureTypeId { get; set; }
            public int? ReturnTypeId { get; set; }
            public int? OnlineRequirementId { get; set; }

            public string DocumentReference { get; set; }
            public string FileName { get; set; }
            public string FileExtension { get; set; }
            public string Notes { get; set; }
        }

        // ─────────────────────────────────────────────────────────────────────
        // FAKE SERVICE — delete when wiring the real IPoaFormsService.
        //
        // The lookup methods below mirror the real PoaFormsService signatures
        // exactly, so swapping to the real service is a 1-line change per call:
        //
        //   FakePoaFormsService.GetServiceTypes()  →  PoaFormsService.GetServiceTypes()
        //
        // Real service (from your repository) returns:
        //   GetServiceTypes()       → service_type            (service_type_id / _description)
        //   GetFormUses()           → poa_form_uses           (poa_form_use_id / _description)
        //   GetPoaTypes()           → poa_types               (poa_type_id / _description)
        //   GetSignatureTypes()     → poa_signature_types     (poa_signature_type_id / _description)
        //   GetOnlineRequirements() → poa_online_requirements (poa_online_requirement_id / _description)
        //   GetReturnTypes()        → poa_return_types        (poa_return_type_id / _description)
        //   GetStates()             → state_codes             (code / state)
        //   GetPoaFormTypes()       → poa_form_types          (poa_form_type_id / _description)
        //   GetMailCenters()        → mail_centers            (mail_center_id / _description)
        // ─────────────────────────────────────────────────────────────────────
        private static class FakePoaFormsService
        {
            // ── Lookup methods (combo box sources) ─────────────────────────────
            public static IEnumerable<LookupItem> GetServiceTypes() => new[]
            {
                new LookupItem { Id = 1, Name = "Full" },
                new LookupItem { Id = 2, Name = "Partial" },
                new LookupItem { Id = 3, Name = "Limited" }
            };

            public static IEnumerable<LookupItem> GetPoaFormTypes() => new[]
            {
                new LookupItem { Id = 1, Name = "POA" },
                new LookupItem { Id = 2, Name = "2848" },
                new LookupItem { Id = 3, Name = "8821" }
            };

            public static IEnumerable<LookupItem> GetFormUses() => new[]
            {
                new LookupItem { Id = 1, Name = "Filing" },
                new LookupItem { Id = 2, Name = "Representation" },
                new LookupItem { Id = 3, Name = "Both" }
            };

            public static IEnumerable<LookupItem> GetPoaTypes() => new[]
            {
                new LookupItem { Id = 1, Name = "Tax" },
                new LookupItem { Id = 2, Name = "Financial" },
                new LookupItem { Id = 3, Name = "Medical" }
            };

            public static IEnumerable<LookupItem> GetSignatureTypes() => new[]
            {
                new LookupItem { Id = 1, Name = "Digital" },
                new LookupItem { Id = 2, Name = "Electronic" },
                new LookupItem { Id = 3, Name = "Wet" }
            };

            public static IEnumerable<LookupItem> GetOnlineRequirements() => new[]
            {
                new LookupItem { Id = 1, Name = "None" },
                new LookupItem { Id = 2, Name = "Required" },
                new LookupItem { Id = 3, Name = "Optional" }
            };

            public static IEnumerable<LookupItem> GetReturnTypes() => new[]
            {
                new LookupItem { Id = 1, Name = "Mail" },
                new LookupItem { Id = 2, Name = "Fax" },
                new LookupItem { Id = 3, Name = "E-File" },
                new LookupItem { Id = 4, Name = "Portal" }
            };

            public static IEnumerable<LookupItem> GetMailCenters() => new[]
            {
                new LookupItem { Id = 3,  Name = "Mail Center 3" },
                new LookupItem { Id = 5,  Name = "Mail Center 5" },
                new LookupItem { Id = 6,  Name = "Mail Center 6" },
                new LookupItem { Id = 7,  Name = "Mail Center 7" },
                new LookupItem { Id = 8,  Name = "Mail Center 8" },
                new LookupItem { Id = 9,  Name = "Mail Center 9" },
                new LookupItem { Id = 10, Name = "Mail Center 10" },
                new LookupItem { Id = 11, Name = "Mail Center 11" },
                new LookupItem { Id = 12, Name = "Mail Center 12" }
            };

            // GetStates returns the state code as Id and the state name as Name.
            public static IEnumerable<LookupItem> GetStates()
            {
                var codes = "AL,AK,AZ,AR,CA,CO,CT,DE,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY"
                            .Split(',');
                return codes.Select(c => new LookupItem { Id = c, Name = c }).ToList();
            }

            // ── Grid data ──────────────────────────────────────────────────────
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

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.ToLowerInvariant();
                    all = all.Where(r =>
                        (r.Description ?? "").ToLowerInvariant().Contains(s) ||
                        (r.State ?? "").ToLowerInvariant().Contains(s) ||
                        (r.ServiceType ?? "").ToLowerInvariant().Contains(s));
                }

                if (!string.IsNullOrWhiteSpace(filterState))
                    all = all.Where(r => r.State == filterState);

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
                    else if (sortKey == "LastUpdated")
                        all = desc ? all.OrderByDescending(r => r.LastUpdated) : all.OrderBy(r => r.LastUpdated);
                    else
                        all = all.OrderBy(r => r.Id);
                }

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
                    new PoaFormModel { Id=1,  Description="Texas Individual POA",   State="TX", Active=true,  MailCenterId=10, ServiceType="Full",    FormType="POA",  FormUse="Filing",         PoaType="Tax",       SignatureType="Digital",    OnlineRequirement="None",     ReturnType="Mail",   ExtractionStatus="Completed",  MappingStatus="Mapped",     DocumentReference="REF-TX-001", FileName="tx_poa.pdf",         FileExtension=".pdf", Notes="",                       LastUpdated=new DateTime(2025,5,10,9,30,0) },
                    new PoaFormModel { Id=2,  Description="California Corp POA",    State="CA", Active=true,  MailCenterId=12, ServiceType="Full",    FormType="2848", FormUse="Representation", PoaType="Tax",       SignatureType="Electronic", OnlineRequirement="Required", ReturnType="E-File", ExtractionStatus="Completed",  MappingStatus="Partial",    DocumentReference="REF-CA-002", FileName="ca_corp_poa.pdf",    FileExtension=".pdf", Notes="Needs review",           LastUpdated=new DateTime(2025,4,22,14,15,0) },
                    new PoaFormModel { Id=3,  Description="Ohio Tax Authority POA", State="OH", Active=true,  MailCenterId=8,  ServiceType="Partial", FormType="POA",  FormUse="Both",           PoaType="Financial", SignatureType="Wet",        OnlineRequirement="Optional", ReturnType="Fax",    ExtractionStatus="In Progress",MappingStatus="Not Mapped", DocumentReference="REF-OH-003", FileName="oh_poa.pdf",         FileExtension=".pdf", Notes="",                       LastUpdated=new DateTime(2025,5,1,11,0,0) },
                    new PoaFormModel { Id=4,  Description="Texas Business POA",     State="TX", Active=false, MailCenterId=10, ServiceType="Limited", FormType="8821", FormUse="Filing",         PoaType="Tax",       SignatureType="Digital",    OnlineRequirement="None",     ReturnType="Portal", ExtractionStatus="Not Started",MappingStatus="Not Mapped", DocumentReference="",           FileName="",                   FileExtension="",     Notes="Pending upload",         LastUpdated=null },
                    new PoaFormModel { Id=5,  Description="California Estate POA",  State="CA", Active=true,  MailCenterId=12, ServiceType="Full",    FormType="POA",  FormUse="Filing",         PoaType="Medical",   SignatureType="Wet",        OnlineRequirement="None",     ReturnType="Mail",   ExtractionStatus="Error",      MappingStatus="Not Mapped", DocumentReference="REF-CA-005", FileName="ca_estate_poa.pdf",  FileExtension=".pdf", Notes="Re-extraction required", LastUpdated=new DateTime(2025,3,18,8,45,0) },
                    new PoaFormModel { Id=6,  Description="New York IRS POA",       State="NY", Active=true,  MailCenterId=5,  ServiceType="Full",    FormType="2848", FormUse="Representation", PoaType="Tax",       SignatureType="Electronic", OnlineRequirement="Required", ReturnType="E-File", ExtractionStatus="Completed",  MappingStatus="Mapped",     DocumentReference="REF-NY-006", FileName="ny_irs_poa.pdf",     FileExtension=".pdf", Notes="",                       LastUpdated=new DateTime(2025,5,9,16,20,0) },
                    new PoaFormModel { Id=7,  Description="Florida Medicaid POA",   State="FL", Active=true,  MailCenterId=3,  ServiceType="Full",    FormType="POA",  FormUse="Both",           PoaType="Medical",   SignatureType="Digital",    OnlineRequirement="Optional", ReturnType="Mail",   ExtractionStatus="Not Started",MappingStatus="Not Mapped", DocumentReference="",           FileName="",                   FileExtension="",     Notes="",                       LastUpdated=null },
                    new PoaFormModel { Id=8,  Description="Ohio Revenue POA",       State="OH", Active=true,  MailCenterId=8,  ServiceType="Partial", FormType="POA",  FormUse="Filing",         PoaType="Tax",       SignatureType="Wet",        OnlineRequirement="None",     ReturnType="Fax",    ExtractionStatus="Completed",  MappingStatus="Partial",    DocumentReference="REF-OH-008", FileName="oh_rev_poa.pdf",     FileExtension=".pdf", Notes="",                       LastUpdated=new DateTime(2025,4,30,10,0,0) },
                    new PoaFormModel { Id=9,  Description="Georgia State Tax POA",  State="GA", Active=false, MailCenterId=7,  ServiceType="Full",    FormType="8821", FormUse="Filing",         PoaType="Tax",       SignatureType="Electronic", OnlineRequirement="None",     ReturnType="Portal", ExtractionStatus="Not Started",MappingStatus="Not Mapped", DocumentReference="",           FileName="",                   FileExtension="",     Notes="Waiting for approval",   LastUpdated=null },
                    new PoaFormModel { Id=10, Description="Michigan Business POA",  State="MI", Active=true,  MailCenterId=6,  ServiceType="Limited", FormType="POA",  FormUse="Representation", PoaType="Financial", SignatureType="Digital",    OnlineRequirement="Optional", ReturnType="Mail",   ExtractionStatus="In Progress",MappingStatus="Not Mapped", DocumentReference="REF-MI-010", FileName="mi_biz_poa.pdf",     FileExtension=".pdf", Notes="",                       LastUpdated=new DateTime(2025,5,5,13,10,0) },
                    new PoaFormModel { Id=11, Description="Washington State POA",   State="WA", Active=true,  MailCenterId=9,  ServiceType="Full",    FormType="POA",  FormUse="Filing",         PoaType="Tax",       SignatureType="Electronic", OnlineRequirement="Required", ReturnType="E-File", ExtractionStatus="Not Started",MappingStatus="Not Mapped", DocumentReference="",           FileName="",                   FileExtension="",     Notes="",                       LastUpdated=null },
                    new PoaFormModel { Id=12, Description="Illinois Corp Tax POA",  State="IL", Active=true,  MailCenterId=11, ServiceType="Full",    FormType="2848", FormUse="Both",           PoaType="Tax",       SignatureType="Digital",    OnlineRequirement="None",     ReturnType="Mail",   ExtractionStatus="Completed",  MappingStatus="Mapped",     DocumentReference="REF-IL-012", FileName="il_corp_poa.pdf",    FileExtension=".pdf", Notes="",                       LastUpdated=new DateTime(2025,5,8,7,55,0) }
                };
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // LOOKUP ITEM — matches the real service's LookupItem { Id, Name }.
        // Id is object because most lookups use int FK ids while GetStates()
        // uses the string state code. In your real LookupItem this is whatever
        // type your framework declares.
        // ─────────────────────────────────────────────────────────────────────
        public class LookupItem
        {
            public object Id { get; set; }
            public string Name { get; set; }
        }

        // ─────────────────────────────────────────────────────────────────────
        // MODEL — delete and reference your real PoaFormModel when wiring up.
        //
        // In the POC the display strings (ServiceType="Full") are kept as-is in
        // the seed data, and the FK id properties below are COMPUTED from them
        // via the same lookup maps the JS uses.  In your real EF model these
        // would already be real columns (service_type_id, etc.) and you'd drop
        // the computed getters.
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

            // ── Computed FK ids (POC only) ──────────────────────────────────
            // Map the display value → id using the same ordering as the JS
            // LOOKUPS object.  In real EF these are stored columns.
            public int? ServiceTypeId { get { return MapId(ServiceType, "Full", "Partial", "Limited"); } }
            public int? PoaFormTypeId { get { return MapId(FormType, "POA", "2848", "8821"); } }
            public int? FormUseId { get { return MapId(FormUse, "Filing", "Representation", "Both"); } }
            public int? PoaTypeId { get { return MapId(PoaType, "Tax", "Financial", "Medical"); } }
            public int? SignatureTypeId { get { return MapId(SignatureType, "Digital", "Electronic", "Wet"); } }
            public int? ReturnTypeId { get { return MapId(ReturnType, "Mail", "Fax", "E-File", "Portal"); } }
            public int? OnlineRequirementId { get { return MapId(OnlineRequirement, "None", "Required", "Optional"); } }

            private static int? MapId(string value, params string[] ordered)
            {
                if (string.IsNullOrEmpty(value)) return null;
                for (int i = 0; i < ordered.Length; i++)
                    if (string.Equals(ordered[i], value, StringComparison.OrdinalIgnoreCase))
                        return i + 1;   // ids are 1-based to match the JS LOOKUPS
                return null;
            }
        }
    }
}
