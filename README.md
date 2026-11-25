# Super-resolution preference study — static site

The page is a static site (GitHub Pages, Netlify, any web server). Answers go to a Google Sheet that you own,
through a small Google Apps Script web app. Participants need no account. If sending fails, the page offers an
answers file to download and send to you.

## 1. Create the receiver (Google Sheet + Apps Script)

1. Create a new Google Sheet. A personal Google account works best: some institutional accounts do not allow
   web apps that "Anyone" can reach.
2. In the sheet, choose **Extensions → Apps Script**. Replace the editor's contents with `apps_script.gs` and save.
3. Choose **Deploy → New deployment**, then the gear icon → **Web app**. Set **Execute as: Me** and **Who has
   access: Anyone**, then **Deploy**. Approve the permissions; the script only appends rows to this sheet.
4. Copy the **Web app URL** (it ends in `/exec`).
5. Optional check: open that URL in a browser. It should show `{"ok":true,"service":"sr-preference-study"}`.

If you later edit the script, use **Deploy → Manage deployments → Edit → Version: New version**. That keeps
the same URL.

## 2. Point the page at it

Edit `config.js`:

```js
window.STUDY_CONFIG = {
  endpoint: "https://script.google.com/macros/s/…/exec",
  contact: "",          // optional, e.g. an address shown when someone has to email an answers file
};
```

Test locally with `python3 -m http.server 8000` in this folder, then open `http://localhost:8000/?test=1`.
The `?test=1` flag marks the record as a test; it is stored with `test = TRUE` and the analysis drops it.
Answer a few screens and check that rows appear in the sheet.

## 3. Publish on GitHub Pages

1. Create a GitHub repository and push this folder's contents to its `main` branch. On a free plan the
   repository must be public; either way, the published site is public.
2. Choose **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute the study is live at `https://<user>.github.io/<repository>/`. Share that link.

The images are 256×256 crops from RealSR, DRealSR and DIV2K, shown for academic research. Check that their
licences allow showing such crops on a public page, and whether your institute's ethics process covers an
anonymous perception study.

## 4. Collect and analyse

- **Download:** in the sheet, use **File → Download → Comma-separated values (.csv)** while the `responses` tab
  is open. Collect any answers files that participants emailed to you as well.
- **Analyse:** run, from the MUSE-SR repository,

  ```bash
  python scripts/e5/analyze_user_study.py --responses responses.csv [answers files …] --out results/user_study/analysis.md
  ```

- **Rows and sessions:** each session sends its record every 13 answers and at the end, so one participant has
  several rows. The analysis keeps the longest record per session (seed and start time), drops test records, and
  applies the rules fixed before data collection.

## Notes

- The endpoint is public, so anyone who finds it could post junk. The script accepts only well-formed records
  under 45,000 characters, and the analysis's attention-check and response-time rules drop junk that gets in.
- Each participant's anonymous id and a resumable draft are kept in their own browser (`localStorage`).
- Do not change `manifest.json` or the images after the first real response.
