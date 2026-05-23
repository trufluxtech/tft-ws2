# Release Notes

## v1.1.11
- Added Captured Whitepaper Leads Report inside `/config`.
- Report shows details collected before whitepaper download: name, email, phone, LinkedIn, industry, job title, whitepaper, and timestamp.
- Added Refresh and Export CSV actions.

## v1.1.10
- Footer/bottom-left brand logo now uses the configured logo URL instead of a static logo mark.
- Version updated to 1.1.10.


## v1.1.9
- Added clear checkbox-based Website Section Visibility controls on `/config`.
- Disabled sections are hidden from the public website.
- Disabled sections are also removed from the top navigation automatically after saving.
- Improved admin UI labels/status: Visible / Hidden.

## v1.1.8
- Removed the remaining public-facing “Config” navigation label.
- Settings page is now accessed at `/config`.
- Reworded homepage copy to avoid configuration wording on the public site.


## v1.1.6
- Changed whitepaper button label from "Capture lead & access" to "Download".
- Verified frontend production build.

## v1.1.6

- Admin configuration page moved out of the public scrollable website.
- Config screen now opens only from protected route: `/#admin`.
- Added username/password login for admin configuration.
- Protected admin save, logo upload, leads and contacts APIs with bearer token authentication.
- Added logout option in admin screen.
- Added default local credentials documented below.

Default local admin login:

```text
Username: admin
Password: ChangeMe@123
```

For production, change these environment variables:

```env
ADMIN_USERNAME=your_admin_user
ADMIN_PASSWORD=your_secure_password
ADMIN_SECRET=use-a-long-random-secret
```


## v1.1.7
- Replaced JSON editing areas with UI-based editors for services, values, whitepapers and contact text.
- Increased landing page header logo size.
- Replaced configuration wording with Website Settings and settings icon.
