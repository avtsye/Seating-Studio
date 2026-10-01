using System.Reflection;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace SeatingStudio.Win;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm());
    }
}

internal sealed class MainForm : Form
{
    private readonly WebView2 _webView = new()
    {
        Dock = DockStyle.Fill
    };

    public MainForm()
    {
        Text = "Seating Studio";
        Width = 1400;
        Height = 900;
        MinimumSize = new Size(900, 600);
        StartPosition = FormStartPosition.CenterScreen;
        Controls.Add(_webView);

        Shown += async (_, _) => await StartAsync();
    }

    private async Task StartAsync()
    {
        try
        {
            var htmlPath = ExtractEmbeddedHtml();
            await _webView.EnsureCoreWebView2Async();

            _webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
            _webView.Source = new Uri(htmlPath);
        }
        catch (WebView2RuntimeNotFoundException)
        {
            MessageBox.Show(
                "Microsoft Edge WebView2 Runtime אינו מותקן במחשב.\n" +
                "ב-Windows 11 הוא מותקן בדרך כלל כברירת מחדל.",
                "Seating Studio",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            Close();
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                "לא ניתן להפעיל את Seating Studio.\n\n" + ex.Message,
                "Seating Studio",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            Close();
        }
    }

    private static string ExtractEmbeddedHtml()
    {
        var assembly = Assembly.GetExecutingAssembly();
        using var input = assembly.GetManifestResourceStream("SeatingStudio.OfflineHtml")
            ?? throw new InvalidOperationException("קובץ ה-HTML המוטמע לא נמצא.");

        var version = assembly.GetName().Version?.ToString() ?? "1";
        var dir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "Seating Studio",
            "Runtime",
            version);

        Directory.CreateDirectory(dir);
        var path = Path.Combine(dir, "Seating-Studio-Offline.html");

        using var output = File.Create(path);
        input.CopyTo(output);
        return path;
    }
}
