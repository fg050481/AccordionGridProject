using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace AccordionGridProject
{
    /// <summary>
    /// Generic HTTP Handler — downloads a document from blob storage
    /// and streams it to the browser as a file attachment.
    ///
    /// Mirrors the GetXMFaxReceipt pattern from your existing codebase:
    ///   1. Read blobName, fileName, fileExtension from the query string
    ///   2. Fetch the document stream from blob storage
    ///   3. Convert to byte array
    ///   4. Write to the response with the correct Content-Disposition header
    ///
    /// Called by the AccordionGrid Document section download button:
    ///   DownloadDocument.ashx?blobName=REF-TX-001&fileName=tx_poa.pdf&fileExt=.pdf
    ///
    /// WIRING INTO YOUR REAL C3 PAGE:
    ///   Replace the stub body in ProcessRequest with your real service calls:
    ///
    ///   var Documentcontainer = FaxConfiguration.GetAzureDocumentContainerName();
    ///   var result = await faxSender.GetDocumentAsync(blobName, Documentcontainer);
    ///   byte[] response = await ConvertStreamToByteArrayAsync(result);
    ///   if (response?.Length > 0)
    ///       StreamFileToResponse(context, response, fileExt, fileName);
    /// </summary>
    public class DownloadDocument : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            if (!context.Request.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = 405;
                return;
            }

            var blobName = context.Request.QueryString["blobName"];
            var fileName = context.Request.QueryString["fileName"];
            var fileExt = context.Request.QueryString["fileExt"] ?? ".pdf";

            // Validate — blobName is required
            if (string.IsNullOrWhiteSpace(blobName))
            {
                context.Response.StatusCode = 400;
                context.Response.ContentType = "application/json";
                context.Response.Write(JsonConvert.SerializeObject(
                    new { error = "Missing document reference (blobName)." }));
                return;
            }

            // Default filename if not supplied
            if (string.IsNullOrWhiteSpace(fileName))
                fileName = blobName + fileExt;

            try
            {
                // ── Real blob storage call ────────────────────────────────
                // Replace this stub with your actual service calls:
                //
                //   var Documentcontainer =
                //       FaxConfiguration.GetAzureDocumentContainerName();
                //   var result = await _faxServiceProvider.Value
                //       .GetDocumentAsync(blobName, Documentcontainer);
                //   byte[] fileBytes = await ConvertStreamToByteArrayAsync(result);
                //
                //   if (fileBytes?.Length > 0)
                //       StreamFileToResponse(context, fileBytes, fileExt, fileName);
                // ─────────────────────────────────────────────────────────

                // POC STUB: generate a minimal valid PDF so the download
                // actually works in the browser during testing.
                byte[] fileBytes = BuildStubPdf(fileName);

                System.Diagnostics.Trace.TraceInformation(
                    "[DownloadDocument] Simulated — blobName={0}, file={1}",
                    blobName, fileName);

                StreamFileToResponse(context, fileBytes, fileExt, fileName);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError(
                    "[DownloadDocument] Failed — blobName={0}, ex={1}", blobName, ex.Message);
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                context.Response.Write(JsonConvert.SerializeObject(
                    new { error = "Download failed: " + ex.Message }));
            }
        }

        // ── Stream bytes to browser as a file attachment ──────────────────────
        // Matches the returnPage() call in your existing GetXMFaxReceipt method.
        private static void StreamFileToResponse(HttpContext context,
            byte[] fileBytes, string fileExt, string fileName)
        {
            var mimeType = GetMimeType(fileExt);

            context.Response.Clear();
            context.Response.ContentType = mimeType;
            context.Response.AddHeader("Content-Disposition",
                "attachment; filename=\"" + SanitizeFileName(fileName) + "\"");
            context.Response.AddHeader("Content-Length",
                fileBytes.Length.ToString());
            context.Response.BinaryWrite(fileBytes);
            context.Response.Flush();

            // Do NOT call Response.End() — it throws ThreadAbortException which
            // ASP.NET surfaces as "Server cannot set status after HTTP headers
            // have been sent."  CompleteRequest() signals the pipeline to stop
            // processing without touching the already-sent response.
            context.ApplicationInstance.CompleteRequest();
        }

        private static string GetMimeType(string ext)
        {
            switch ((ext ?? "").ToLowerInvariant().TrimStart('.'))
            {
                case "pdf": return "application/pdf";
                case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                case "doc": return "application/msword";
                case "tiff":
                case "tif": return "image/tiff";
                case "png": return "image/png";
                case "jpg":
                case "jpeg": return "image/jpeg";
                default: return "application/octet-stream";
            }
        }

        private static string SanitizeFileName(string name)
        {
            foreach (var c in Path.GetInvalidFileNameChars())
                name = name.Replace(c, '_');
            return name;
        }

        // ── POC stub: minimal valid PDF ───────────────────────────────────────
        // Produces a real, browser-openable single-page PDF so you can verify
        // the download flow without a real blob.
        // Delete this method when you wire up the real blob service.
        private static byte[] BuildStubPdf(string title)
        {
            var content = string.Format(
                "%PDF-1.4\n" +
                "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
                "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
                "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n" +
                "4 0 obj<</Length 80>>\nstream\nBT /F1 16 Tf 72 720 Td ({0}) Tj ET\nendstream\nendobj\n" +
                "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n" +
                "xref\n0 6\n0000000000 65535 f\n" +
                "trailer<</Size 6/Root 1 0 R>>\nstartxref\n0\n%%EOF",
                (title ?? "POA Document").Replace("(", "").Replace(")", "")
            );
            return System.Text.Encoding.ASCII.GetBytes(content);
        }

        public bool IsReusable => false;
    }
}