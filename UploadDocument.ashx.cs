using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace AccordionGridProject
{
    /// <summary>
    /// Generic HTTP Handler for document uploads.
    ///
    /// WHY .ashx AND NOT [WebMethod]?
    ///   [WebMethod] on an .aspx page requires Content-Type: application/json.
    ///   File uploads use multipart/form-data, which ASP.NET routes away from
    ///   WebMethods entirely — returning the full HTML page instead, which is
    ///   why the browser sees "<!DOCTYPE..." instead of JSON.
    ///   A Generic Handler (IHttpHandler) receives ALL request types natively,
    ///   including multipart, with no extra configuration.
    ///
    /// CALLED BY:
    ///   The AccordionGrid onUploadDocument callback via XHR POST (FormData).
    ///   The file field key must be "file" — matches form.append('file', ...).
    ///
    /// RETURNS:
    ///   { "guid": "xxxxxxxx-..." }   on success  (HTTP 200)
    ///   { "error": "message" }       on failure  (HTTP 400)
    ///
    /// WIRING INTO YOUR REAL C3 PAGE:
    ///   Replace the stub body below with your real service call:
    ///
    ///   var result = await BlobDocumentService.UploadAsync(
    ///       stream:        file.InputStream,       // Stream   — no temp file
    ///       fileName:      file.FileName,           // string
    ///       contentLength: (long?)file.ContentLength // long?
    ///   );
    ///   if (!result.Success) throw new Exception(result.ErrorMessage);
    ///   WriteJson(context, new { guid = result.BlobName });
    /// </summary>
    public class UploadDocument : IHttpHandler
    {
        // Allowed extensions — keep in sync with uploadAllowedExtensions in the ASPX.
        private static readonly string[] AllowedExtensions =
            { ".pdf", ".docx", ".doc", ".tiff", ".tif", ".png", ".jpg", ".jpeg" };

        public void ProcessRequest(HttpContext context)
        {
            // Only accept POST
            if (!context.Request.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = 405;
                WriteJson(context, new { error = "Method not allowed." });
                return;
            }

            try
            {
                // ── 1. Read the posted file ───────────────────────────────────
                var file = context.Request.Files["file"];

                if (file == null || file.ContentLength == 0)
                {
                    context.Response.StatusCode = 400;
                    WriteJson(context, new { error = "No file received." });
                    return;
                }

                // ── 2. Server-side extension validation ───────────────────────
                var ext = Path.GetExtension(file.FileName ?? "").ToLowerInvariant();
                if (!AllowedExtensions.Contains(ext))
                {
                    context.Response.StatusCode = 400;
                    WriteJson(context, new { error = "File type '" + ext + "' is not permitted." });
                    return;
                }

                // ── 3. Call blob storage service ──────────────────────────────
                //
                // POC STUB — replace this block with your real service call:
                //
                //   var result = BlobDocumentService.UploadAsync(
                //       file.InputStream,             // Stream  (no temp file)
                //       file.FileName,                // string
                //       (long?)file.ContentLength     // long?
                //   ).GetAwaiter().GetResult();
                //
                //   if (!result.Success)
                //       throw new Exception(result.ErrorMessage ?? "Upload failed.");
                //
                //   WriteJson(context, new { guid = result.BlobName });
                //   return;
                //
                var fakeGuid = Guid.NewGuid().ToString();
                System.Diagnostics.Trace.TraceInformation(
                    "[UploadDocument] Simulated — file={0}, size={1}, guid={2}",
                    file.FileName, file.ContentLength, fakeGuid);

                // ── 4. Return the GUID reference ──────────────────────────────
                context.Response.StatusCode = 200;
                WriteJson(context, new { guid = fakeGuid });
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 400;
                WriteJson(context, new { error = ex.Message });
            }
        }

        private static void WriteJson(HttpContext context, object value)
        {
            context.Response.ContentType = "application/json";
            context.Response.Write(JsonConvert.SerializeObject(value));
        }

        // Each request gets a fresh handler instance — stateless by design.
        public bool IsReusable => false;
    }
}